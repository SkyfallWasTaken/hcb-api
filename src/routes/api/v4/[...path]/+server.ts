import { json } from '@sveltejs/kit';
import { getValidTokenResponse } from '$lib/server/oauth';
import { db } from '$lib/server/db/index';
import { app, auditLog, type AuditLog } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import micromatch from 'micromatch';
import type { RequestEvent } from './$types';
import { and, eq } from 'drizzle-orm';
import { sha256 } from '$lib/utils';

const moneyMovementRoutes = [
	'POST /organizations/*/grants',
	'POST /organizations/*/card_grants',
	'POST /grants/*/topup',
	'POST /grants/*/withdraw',
	'POST /grants/*/cancel',
	'POST /organizations/*/transfers',
	'POST /organizations/*/donations'
];

const cardAccessRoutes = [
	'GET /user/cards',
	'GET /organizations/*/cards',
	'GET /cards/*',
	'PUT /cards/*',
	'PATCH /cards/*',
	'POST /cards',
	'POST /cards/*/cancel',
	'GET /cards/*/transactions',
	'GET /cards/*/ephemeral_keys',
	'GET /user/grants',
	'GET /organizations/*/grants',
	'GET /grants/*',
	'PUT /grants/*',
	'PATCH /grants/*'
];

const dataMutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

function checkPermissions(method: string, path: string, appData: any) {
	const route = `${method} ${path}`;

	if (!appData.allowMoneyMovement && micromatch.isMatch(route, moneyMovementRoutes)) {
		return { allowed: false, required: 'allowMoneyMovement' };
	}

	if (!appData.allowCardAccess && micromatch.isMatch(route, cardAccessRoutes)) {
		return { allowed: false, required: 'allowCardAccess' };
	}

	return { allowed: true };
}

export const GET = handleProxyRequest;
export const POST = handleProxyRequest;
export const PUT = handleProxyRequest;
export const DELETE = handleProxyRequest;
export const PATCH = handleProxyRequest;

async function handleProxyRequest({ request, url, getClientAddress }: RequestEvent) {
	const authHeader = request.headers.get('Authorization');
	const bearer = authHeader?.replace('Bearer ', '');
	const method = request.method;
	const userIp = getClientAddress();

	if (!bearer) {
		return json({ error: 'Missing Authorization header' }, { status: 401 });
	}

	const [validApp] = await db
		.select()
		.from(app)
		.where(eq(app.apiKeyHash, await sha256(bearer)));

	if (!validApp) {
		return json({ error: 'Invalid API key' }, { status: 401 });
	}

	const targetPath = url.pathname.replace('/api/v4', '');
	const permissionCheck = checkPermissions(method, targetPath, validApp);
	if (!permissionCheck.allowed) {
		return json(
			{ error: 'Insufficient permissions', required: permissionCheck.required },
			{ status: 403 }
		);
	}

	// Audit logging!
	const filteredRequestHeaders = replaceHeaders(request.headers, ["authorization"], "[REDACTED]");

	let requestBody: string | null = null;
	try {
		const bodyText = await request.text();
		if (bodyText && bodyText.trim() !== '') {
			requestBody = bodyText;
		}
	} catch (error) {
		console.warn('Could not read request body for audit logging:', error);
	}

	const idempotencyKey = request.headers.get('X-Idempotency-Key');

	let auditLogEntry: AuditLog | null = null;
	if (idempotencyKey && dataMutationMethods.includes(method)) {
		// We have a unique index on (appId, idempotencyKey) so this is safe
		auditLogEntry = (await createAuditLog(
			validApp.id,
			request,
			requestBody || '',
			filteredRequestHeaders,
			null,
			null,
			targetPath,
			userIp
		))[0];
	}

	if (!env.HCB_CLIENT_ID) {
		return json({ error: 'HCB_CLIENT_ID not configured' }, { status: 500 });
	}

	const tokenResponse = await getValidTokenResponse(env.HCB_CLIENT_ID);
	const targetUrl = `https://hcb.hackclub.com/api/v4${targetPath}${url.search}`;

	const proxyHeaders = excludeHeaders(request.headers, [
		"authorization", // we're setting our own!
		"host", // results in SSL errors
		"accept-encoding", // prevent compressed upstream responses (otherwise you get ZLibErrors)
		"x-idempotency-key"
	]);
	proxyHeaders.set('Authorization', `Bearer ${tokenResponse.access_token}`);

	const response = await fetch(targetUrl, {
		method,
		headers: proxyHeaders,
		body: method !== 'GET' && method !== 'HEAD' ? requestBody : null
	});

	const responseClone = response.clone();
	let responseText: string | null = null;
	try {
		responseText = await responseClone.text();
	} catch (error) {
		console.warn('Could not read response body for audit logging:', error);
	}

	if (auditLogEntry) {
		await updateAuditLog(auditLogEntry.id, response, responseText);
	} else {
		createAuditLog(validApp.id, request, requestBody || '', filteredRequestHeaders, response, responseText, targetPath, userIp)
			.catch((error) => {
				// log the error, but don't fail the request
				console.error('Failed to insert audit log:', error);
			});
	}

	// This can cause issues if someone is using a reverse proxy like Traefik or Cloudflare
	// in front of the service
	const forwardHeaders = excludeHeaders(response.headers, ["content-type"])

	return new Response(responseText, {
		status: response.status,
		statusText: response.statusText,
		headers: forwardHeaders
	});
}

async function createAuditLog(appId: string, request: Request, requestBody: string, filteredRequestHeaders: Headers, response: Response | null, responseText: string | null, targetPath: string, userIp: string) {
	return await db.insert(auditLog)
		.values({
			appId,
			method: request.method,
			path: targetPath,
			userIp,
			requestHeaders: JSON.stringify(filteredRequestHeaders),
			requestBody,
			responseStatus: response?.status || 0,
			responseHeaders: response ? JSON.stringify(response.headers) : "{}",
			responseBody: responseText,
			idempotencyKey: request.headers.get('X-Idempotency-Key') || undefined
		})
		.returning();
}

async function updateAuditLog(id: string, response: Response, responseText: string | null) {
	await db
		.update(auditLog)
		.set({
			responseStatus: response.status,
			responseHeaders: JSON.stringify(response.headers),
			responseBody: responseText
		})
		.where(eq(auditLog.id, id));
}

function excludeHeaders(headers: Headers, exclusions: string[]): Headers {
	const result = new Headers();
	headers.forEach((value, key) => {
		if (!exclusions.includes(key.toLowerCase())) {
			result.set(key, value);
		}
	});
	return result;
}

function replaceHeaders(headers: Headers, toBeReplaced: string[], replaceWith: string): Headers {
	const result = new Headers();
	headers.forEach((value, key) => {
		result.set(key, toBeReplaced.includes(key.toLowerCase()) ? replaceWith : value);
	});
	return result;
}