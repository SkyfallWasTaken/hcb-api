import { pgTable, serial, text, boolean, integer } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const app = pgTable("apps", {
	id: text("id").primaryKey().$default(() => `app_${nanoid(6)}`),
	appName: text("app_name").notNull(),
	apiKeyHash: text("api_key_hash").notNull(),
	allowMoneyMovement: boolean("allow_money_movement").notNull().default(false),
	allowCardAccess: boolean("allow_card_access").notNull().default(false),
})