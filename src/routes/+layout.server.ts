import { db, app } from '$lib/server/db';
import { loadFlash } from 'sveltekit-flash-message/server';
import {
	hasSetupPassword,
	isAuthenticatedRoute,
	isAuthenticated as checkAuth
} from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load = loadFlash(async ({ url, cookies }) => {
	const hasPassword = await hasSetupPassword();
	const isAuthenticated = await checkAuth(cookies);

	if (!hasPassword && url.pathname !== '/setup') {
		throw redirect(302, '/setup');
	}

	if (hasPassword && !isAuthenticated && isAuthenticatedRoute(url)) {
		throw redirect(302, '/login');
	}

	if (hasPassword && isAuthenticated && (url.pathname === '/login' || url.pathname === '/setup')) {
		throw redirect(302, '/');
	}

	const apps = await db
		.select({
			id: app.id,
			name: app.appName,
			allowMoneyMovement: app.allowMoneyMovement,
			allowCardAccess: app.allowCardAccess
		})
		.from(app);

	return {
		apps,
		hasPassword,
		isAuthenticated
	};
});
