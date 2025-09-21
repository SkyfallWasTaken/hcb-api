import { createHash } from 'crypto';

/**
 * Hash an API key using SHA256
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Verify if a plain API key matches a stored hash
 */
export function verifyApiKey(apiKey: string, hash: string): boolean {
  return hashApiKey(apiKey) === hash;
}