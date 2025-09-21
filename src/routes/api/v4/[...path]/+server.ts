import { json } from '@sveltejs/kit';
import { verifyApiKey } from '$lib/server/auth.js';
import { getValidTokenResponse } from '$lib/server/oauth.js';
import { db } from '$lib/server/db/index.js';
import { app, oauthToken } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

export async function GET({ request, url, params }) {
	return handleProxyRequest(request, url, 'GET');
}

export async function POST({ request, url, params }) {
	return handleProxyRequest(request, url, 'POST');
}

export async function PUT({ request, url, params }) {
	return handleProxyRequest(request, url, 'PUT');
}

export async function DELETE({ request, url, params }) {
	return handleProxyRequest(request, url, 'DELETE');
}

export async function PATCH({ request, url, params }) {
	return handleProxyRequest(request, url, 'PATCH');
}

async function handleProxyRequest(request: Request, url: URL, method: string) {
	console.log(`Intercepted ${method} request to ${url.pathname}`);

	// Get Authorization header
	const authHeader = request.headers.get('Authorization');
	const bearer = authHeader?.replace('Bearer ', '');

	if (!bearer) {
		return json({ error: 'Missing Authorization header' }, { status: 401 });
	}

	// Verify API key against database
	const apps = await db.select().from(app);
	const validApp = apps.find(a => verifyApiKey(bearer, a.apiKeyHash));

	if (!validApp) {
		return json({ error: 'Invalid API key' }, { status: 401 });
	}

	console.log(`Valid API key for app: ${validApp.appName}`);

	// Get OAuth token using the configured client ID
	try {
		if (!env.HCB_CLIENT_ID) {
			return json({ error: 'HCB_CLIENT_ID environment variable is not configured' }, { status: 500 });
		}

		const tokenResponse = await getValidTokenResponse(env.HCB_CLIENT_ID);

		// Construct target URL
		const targetPath = url.pathname.replace('/api/v4', '');
		const targetUrl = `https://hcb.hackclub.com/api/v4${targetPath}${url.search}`;
		console.log(`Proxying to: ${targetUrl}`);

		// Create headers for the proxied request
		const proxyHeaders = new Headers();
		proxyHeaders.set('Authorization', `Bearer ${tokenResponse.access_token}`);

		// Copy other headers except Authorization and Host
		for (const [key, value] of request.headers) {
			if (key.toLowerCase() !== 'authorization' && key.toLowerCase() !== 'host') {
				proxyHeaders.set(key, value);
			}
		}

		// Make the proxied request
		const proxyRequest = new Request(targetUrl, {
			method,
			headers: proxyHeaders,
			body: method !== 'GET' && method !== 'HEAD' ? request.body : null,
		});

		const response = await fetch(proxyRequest);

		// Forward the response
		const responseBody = await response.text();

		return new Response(responseBody, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		});

	} catch (error) {
		console.error('Proxy error:', error);
		return json({ error: 'Failed to proxy request' }, { status: 500 });
	}
}