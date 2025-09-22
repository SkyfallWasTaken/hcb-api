import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const dbUrl = env.DATABASE_URL || './data/database.db';

const sqlite = new Database(dbUrl);

export const db = drizzle(sqlite, { schema });
export * from './schema';
