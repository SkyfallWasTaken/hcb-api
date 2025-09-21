import { db } from "$lib/server/db"
import { app, auditLog } from "$lib/server/db/schema"
import { eq, desc } from "drizzle-orm"
import { error } from "@sveltejs/kit"
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { params, parent } = event;

  if (!params.id.startsWith("app_")) throw error(404, 'App not found');

  const { apps } = await parent();
  const selectedApp = apps.find((a: any) => a.id === params.id);

  if (!selectedApp) {
    throw error(404, 'App not found')
  }

  const logs = await db.select({
    id: auditLog.id,
    method: auditLog.method,
    path: auditLog.path,
    userIp: auditLog.userIp,
    requestHeaders: auditLog.requestHeaders,
    requestBody: auditLog.requestBody,
    responseStatus: auditLog.responseStatus,
    responseHeaders: auditLog.responseHeaders,
    responseBody: auditLog.responseBody,
    timestamp: auditLog.timestamp,
  }).from(auditLog)
    .where(eq(auditLog.appId, params.id))
    .orderBy(desc(auditLog.timestamp))
    .limit(100);

  return {
    app: {
      id: selectedApp.id,
      name: selectedApp.name,
    },
    logs: logs.map(log => ({
      ...log,
      requestHeaders: JSON.parse(log.requestHeaders),
      responseHeaders: JSON.parse(log.responseHeaders),
    }))
  }
}