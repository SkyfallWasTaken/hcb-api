import { defineConfig } from 'drizzle-kit';

const dbUrl = process.env.DATABASE_URL || './data/database.db';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: { url: dbUrl },
	verbose: true,
	strict: true
});
