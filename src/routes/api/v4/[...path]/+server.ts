import { json } from '@sveltejs/kit';
import { verifyApiKey } from '$lib/server/auth.js';
import { getValidTokenResponse } from '$lib/server/oauth.js';
import { db } from '$lib/server/db/index.js';
import { app } from '$lib/server/db/schema.js';
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

async function handleProxyRequest({ request, url }: RequestEvent) {
	const authHeader = request.headers.get('Authorization');
	const bearer = authHeader?.replace('Bearer ', '');
	const method = request.method;

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

	const response = await fetch(targetUrl, {
		method,
		headers: proxyHeaders,
		body: method !== 'GET' && method !== 'HEAD' ? request.body : null,
	});

	return response;
}