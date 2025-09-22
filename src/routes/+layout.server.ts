import { db, app } from '$lib/server/db';
import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async () => {
	const apps = await db
		.select({
			id: app.id,
			name: app.appName,
			allowMoneyMovement: app.allowMoneyMovement,
			allowCardAccess: app.allowCardAccess
		})
		.from(app);

	return { apps };
});
