import { pgTable, serial, text, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const app = pgTable("apps", {
	id: text("id").primaryKey().$default(() => `app_${nanoid(6)}`),
	appName: text("app_name").notNull(),
	apiKeyHash: text("api_key_hash").notNull(),
	allowMoneyMovement: boolean("allow_money_movement").notNull().default(false),
	allowCardAccess: boolean("allow_card_access").notNull().default(false),
})

export const oauthToken = pgTable("oauth_tokens", {
	id: text("id").primaryKey().$default(() => `token_${nanoid(6)}`),
	oauthClientId: text("oauth_client_id").notNull().unique(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token").notNull(),
	createdAt: integer("created_at").notNull(),
	expiresIn: integer("expires_in").notNull(),
	expiresAt: integer("expires_at").notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ([
	index("oauth_tokens_expires_at_idx").on(table.expiresAt),
	index("oauth_tokens_updated_at_idx").on(table.updatedAt),
]))

export const auditLog = pgTable("audit_logs", {
	id: text("id").primaryKey().$default(() => `log_${nanoid(8)}`),
	appId: text("app_id").notNull().references(() => app.id, { onDelete: 'cascade' }),
	method: text("method").notNull(),
	path: text("path").notNull(),
	userIp: text("user_ip").notNull(),
	requestHeaders: text("request_headers").notNull(),
	requestBody: text("request_body"),
	responseStatus: integer("response_status").notNull(),
	responseHeaders: text("response_headers").notNull(),
	responseBody: text("response_body"),
	timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ([
	index("audit_logs_app_id_timestamp_idx").on(table.appId, table.timestamp),
	index("audit_logs_timestamp_idx").on(table.timestamp),
	index("audit_logs_method_idx").on(table.method),
	index("audit_logs_response_status_idx").on(table.responseStatus),
]))