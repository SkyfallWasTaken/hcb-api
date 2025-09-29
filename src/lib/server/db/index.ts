import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import type { Logger } from 'drizzle-orm/logger';

class ConsoleLogger implements Logger {
	logQuery(query: string, params: unknown[]): void {
		console.log({ query, params });
	}
}

const dbUrl = env.DATABASE_URL || './data/database.db';

const sqlite = new Database(dbUrl);

export const db = drizzle({ client: sqlite, schema, logger: new ConsoleLogger() });
export * from './schema';

migrate(db, { migrationsFolder: './drizzle' });
