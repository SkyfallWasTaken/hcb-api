import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const app = pgTable("apps", {
	id: text("id").primaryKey().$default(() => `app_${nanoid(6)}`),
	appName: text("app_name").notNull(),
	apiKeyHash: text("api_key_hash").notNull(),
})