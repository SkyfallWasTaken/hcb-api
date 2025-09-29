import { json } from '@sveltejs/kit';
import { getValidTokenResponse } from '$lib/server/oauth';
import { db } from '$lib/server/db/index';
import { app, auditLog } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import micromatch from 'micromatch';
import type { RequestEvent } from './$types';
import { eq } from 'drizzle-orm';
import { sha256 } from '$lib/utils';

const moneyMovementRoutes = [
	'POST /organizations/*/grants',
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

	if (!env.HCB_CLIENT_ID) {
		return json({ error: 'HCB_CLIENT_ID not configured' }, { status: 500 });
	}

	const tokenResponse = await getValidTokenResponse(env.HCB_CLIENT_ID);
	const targetUrl = `https://hcb.hackclub.com/api/v4${targetPath}${url.search}`;

	const proxyHeaders = new Headers();
	proxyHeaders.set('Authorization', `Bearer ${tokenResponse.access_token}`);

	for (const [key, value] of request.headers) {
		if (
			key.toLowerCase() !== 'authorization' && // we're setting our own!
			key.toLowerCase() !== 'host' && // results in SSL errors
			key.toLowerCase() !== 'accept-encoding' // prevent compressed upstream responses (otherwise you get ZLibErrors)
		) {
			proxyHeaders.set(key, value);
		}
	}

	let requestBody: string | null = null;
	try {
		const bodyText = await request.text();
		if (bodyText && bodyText.trim() !== '') {
			requestBody = bodyText;
		}
	} catch (error) {
		console.warn('Could not read request body for audit logging:', error);
	}

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

	const responseHeaders: Record<string, string> = {};
	response.headers.forEach((value, key) => {
		responseHeaders[key] = value;
	});

	const filteredRequestHeaders: Record<string, string> = {};
	request.headers.forEach((value, key) => {
		if (key.toLowerCase() === 'authorization') {
			filteredRequestHeaders[key] = '[FILTERED]';
		} else {
			filteredRequestHeaders[key] = value;
		}
	});

	db.insert(auditLog)
		.values({
			appId: validApp.id,
			method,
			path: targetPath,
			userIp,
			requestHeaders: JSON.stringify(filteredRequestHeaders),
			requestBody,
			responseStatus: response.status,
			responseHeaders: JSON.stringify(responseHeaders),
			responseBody: responseText
		})
		.catch((error) => {
			// log the error, but don't fail the request
			console.error('Failed to insert audit log:', error);
		});

	return response;
}
