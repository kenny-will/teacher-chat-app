/**
 * In-memory sliding-window rate limiter for auth endpoints.
 * In production, replace the store with Redis to work across replicas.
 *
 * Limits: 5 login attempts per IP per 15-minute window.
 */

interface WindowEntry {
  count: number
  windowStart: number
}

const WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const MAX_ATTEMPTS = 5

/** Module-level singleton store — survives across requests within a single process. */
const store = new Map<string, WindowEntry>()

/** Periodic cleanup to prevent unbounded memory growth. */
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > WINDOW_MS) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export const rateLimiter = {
  /**
   * Checks whether the given key is currently rate-limited.
   * Increments the counter on every call.
   * @param key - Usually the client IP address
   * @returns Object with `limited` boolean and `retryAfterMs`
   */
  check(key: string): { limited: boolean; retryAfterMs: number; remaining: number } {
    const now = Date.now()
    const existing = store.get(key)

    if (!existing || now - existing.windowStart > WINDOW_MS) {
      store.set(key, { count: 1, windowStart: now })
      return { limited: false, retryAfterMs: 0, remaining: MAX_ATTEMPTS - 1 }
    }

    existing.count += 1

    if (existing.count > MAX_ATTEMPTS) {
      const retryAfterMs = WINDOW_MS - (now - existing.windowStart)
      return { limited: true, retryAfterMs, remaining: 0 }
    }

    return { limited: false, retryAfterMs: 0, remaining: MAX_ATTEMPTS - existing.count }
  },

  /**
   * Resets the counter for a key (call on successful login to clear lockout).
   * @param key - The key to reset
   */
  reset(key: string): void {
    store.delete(key)
  },
}
