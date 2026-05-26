import bcrypt from 'bcryptjs'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'

/** bcrypt work factor — 12 rounds ≈ 250ms on modern hardware. */
const COST_FACTOR = 12

export class WeakPasswordError extends Error {
  constructor(reason: string) {
    super(`Password does not meet requirements: ${reason}`)
    this.name = 'WeakPasswordError'
  }
}

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8,         msg: 'at least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p),       msg: 'at least one uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p),       msg: 'at least one lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p),       msg: 'at least one number' },
  { test: (p: string) => p.length <= 128,       msg: 'at most 128 characters' },
]

/** Cryptographic password service — wraps bcrypt with validation. */
export const passwordService = {
  /**
   * Validates password strength and hashes it with bcrypt (cost=12).
   * @param plaintext - The raw password from the user
   * @returns Result<string> containing the bcrypt hash
   */
  async hash(plaintext: string): Promise<Result<string>> {
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(plaintext)) {
        return err(new WeakPasswordError(rule.msg))
      }
    }
    try {
      const hash = await bcrypt.hash(plaintext, COST_FACTOR)
      return ok(hash)
    } catch (error) {
      return err(new Error('Password hashing failed', { cause: error }))
    }
  },

  /**
   * Compares a plaintext password against a stored bcrypt hash.
   * Uses bcrypt's built-in timing-safe comparison.
   * @param plaintext - The raw password from the login form
   * @param hash - The stored bcrypt hash
   * @returns true if the password matches
   */
  async verify(plaintext: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plaintext, hash)
    } catch {
      return false
    }
  },

  /**
   * Returns all failed password validation messages for a given input.
   * Used for client-side validation feedback.
   * @param plaintext - The candidate password
   * @returns Array of failed rule messages (empty = valid)
   */
  getViolations(plaintext: string): string[] {
    return PASSWORD_RULES.filter((r) => !r.test(plaintext)).map((r) => r.msg)
  },
}
