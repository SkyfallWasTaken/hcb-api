import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { db } from './db';
import { authConfig } from './db/schema';
import { eq } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';

export async function hasSetupPassword(): Promise<boolean> {
	const config = await db.select().from(authConfig).where(eq(authConfig.id, 'default')).limit(1);
	return config.length > 0;
}

export async function setupPassword(password: string): Promise<string> {
	const hashedPassword = await bcrypt.hash(password, 12);
	const jwtSecret = nanoid(64);

	await db
		.insert(authConfig)
		.values({
			id: 'default',
			passwordHash: hashedPassword,
			jwtSecret
		})
		.onConflictDoUpdate({
			target: authConfig.id,
			set: {
				passwordHash: hashedPassword,
				jwtSecret,
				updatedAt: new Date().toISOString()
			}
		});

	return generateJWT(jwtSecret);
}

export async function verifyPassword(password: string): Promise<string | null> {
	const config = await db.select().from(authConfig).where(eq(authConfig.id, 'default')).limit(1);

	if (config.length === 0) {
		return null;
	}

	const isValid = await bcrypt.compare(password, config[0].passwordHash);
	if (!isValid) {
		return null;
	}

	let { jwtSecret } = config[0];

	if (!jwtSecret) {
		jwtSecret = nanoid(64);
		await db
			.update(authConfig)
			.set({ jwtSecret, updatedAt: new Date().toISOString() })
			.where(eq(authConfig.id, 'default'));
	}

	return generateJWT(jwtSecret);
}

function generateJWT(secret: string): string {
	return jwt.sign(
		{
			authenticated: true,
			iat: Math.floor(Date.now() / 1000)
		},
		secret,
		{
			expiresIn: '30d'
		}
	);
}

export async function verifyJWT(token: string): Promise<boolean> {
	try {
		const config = await db.select().from(authConfig).where(eq(authConfig.id, 'default')).limit(1);

		if (config.length === 0 || !config[0].jwtSecret) {
			return false;
		}

		jwt.verify(token, config[0].jwtSecret);
		return true;
	} catch {
		return false;
	}
}

export async function isAuthenticated(cookies: Cookies): Promise<boolean> {
	const token = cookies.get('auth_token');
	if (!token) {
		return false;
	}

	return await verifyJWT(token);
}

export function setAuthCookie(cookies: Cookies, token: string): void {
	cookies.set('auth_token', token, {
		path: '/',
		maxAge: 60 * 60 * 24 * 30, // 30 days
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	});
}

export function clearAuthCookie(cookies: Cookies): void {
	cookies.delete('auth_token', { path: '/' });
}

export function isAuthenticatedRoute(url: URL): boolean {
	const pathname = url.pathname;
	return pathname !== '/setup' && pathname !== '/login';
}
