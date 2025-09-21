import { db, app } from '$lib/server/db';

export const load = async () => {
  const apps = await db.select({
    id: app.id,
    name: app.appName
  }).from(app);

  return { apps };
};