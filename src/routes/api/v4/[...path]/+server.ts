import { json } from '@sveltejs/kit';
import { verifyApiKey } from '$lib/server/auth';
import { getValidTokenResponse } from '$lib/server/oauth';
import { db } from '$lib/server/db/index';
import { app, auditLog } from '$lib/server/db/schema';
import { env } from '$env/dynamic/private';
import micromatch from 'micromatch';
import type { RequestEvent } from './$types';

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

	const apps = await db.select().from(app);
	const validApp = apps.find(a => verifyApiKey(bearer, a.apiKeyHash));

	if (!validApp) {
		return json({ error: 'Invalid API key' }, { status: 401 });
	}

	const targetPath = url.pathname.replace('/api/v4', '');
	const permissionCheck = checkPermissions(method, targetPath, validApp);
	if (!permissionCheck.allowed) {
		return json({ error: 'Insufficient permissions', required: permissionCheck.required }, { status: 403 });
	}

	if (!env.HCB_CLIENT_ID) {
		return json({ error: 'HCB_CLIENT_ID not configured' }, { status: 500 });
	}

	const tokenResponse = await getValidTokenResponse(env.HCB_CLIENT_ID);
	const targetUrl = `https://hcb.hackclub.com/api/v4${targetPath}${url.search}`;

	const proxyHeaders = new Headers();
	proxyHeaders.set('Authorization', `Bearer ${tokenResponse.access_token}`);

	for (const [key, value] of request.headers) {
		if (key.toLowerCase() !== 'authorization' && key.toLowerCase() !== 'host') {
			proxyHeaders.set(key, value);
		}
	}

	// Read request body once for audit logging (always check if body exists)
	let requestBody: string | null = null;
	try {
		// Always attempt to read request body for audit logging, even for GET requests
		const bodyText = await request.text();
		if (bodyText && bodyText.trim() !== '') {
			requestBody = bodyText;
		}
	} catch (error) {
		// If we can't read the body, continue without it
		console.warn('Could not read request body for audit logging:', error);
	}

	// Make the proxied request
	const response = await fetch(targetUrl, {
		method,
		headers: proxyHeaders,
		body: method !== 'GET' && method !== 'HEAD' ? requestBody : null,
	});

	// Clone the response so we can read it for audit logging while still returning it
	const responseClone = response.clone();
	let responseText: string | null = null;
	try {
		// Always read and store response body for audit logging, even for GET requests
		responseText = await responseClone.text();
	} catch (error) {
		console.warn('Could not read response body for audit logging:', error);
	}

	const responseHeaders: Record<string, string> = {};
	response.headers.forEach((value, key) => {
		responseHeaders[key] = value;
	});

	// Filter sensitive headers from request headers for audit logging
	const filteredRequestHeaders: Record<string, string> = {};
	request.headers.forEach((value, key) => {
		if (key.toLowerCase() === 'authorization') {
			filteredRequestHeaders[key] = '[FILTERED]';
		} else {
			filteredRequestHeaders[key] = value;
		}
	});

	// Insert audit log in parallel (don't await)
	// Always store both request body (if provided) and response body (if available)
	db.insert(auditLog).values({
		appId: validApp.id,
		method,
		path: targetPath,
		userIp,
		requestHeaders: JSON.stringify(filteredRequestHeaders),
		requestBody, // Always store request body if it was provided
		responseStatus: response.status,
		responseHeaders: JSON.stringify(responseHeaders),
		responseBody: responseText, // Always store response body if available
	}).catch(error => {
		// Log the error but don't fail the request
		console.error('Failed to insert audit log:', error);
	});

	return response;
}