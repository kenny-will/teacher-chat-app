import { randomBytes, createHash, timingSafeEqual } from 'crypto'

const SESSION_DURATION_DAYS = 7

/**
 * Generates a cryptographically random 256-bit session token.
 * @returns A URL-safe base64 string (43 chars)
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * Hashes a session token with SHA-256.
 * Only the hash is stored in the DB — the raw token lives in the cookie.
 * @param token - The raw token from the cookie
 * @returns Hex-encoded SHA-256 digest (64 chars)
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Timing-safe comparison of two token hashes.
 * Prevents timing side-channel attacks on session lookups.
 * @param a - First hex hash string
 * @param b - Second hex hash string
 * @returns true if equal
 */
export function safeCompareTokens(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
}

/**
 * Returns the session expiry Date (now + SESSION_DURATION_DAYS).
 */
export function getSessionExpiry(): Date {
  const expires = new Date()
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS)
  return expires
}

export const COOKIE_NAME = 'meridian_session'
export const SESSION_DURATION_DAYS_EXPORT = SESSION_DURATION_DAYS
