import { eq, lt, sql } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/client'
import { sessionsTable } from './schema'
import type { ISessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface'
import { SessionEntity } from '@/modules/auth/domain/entities/session.entity'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'session-repository' })

export class DrizzleSessionRepository implements ISessionRepository {
  /**
   * Persists a new session to the database.
   * @param session - The SessionEntity to create
   * @returns Result<SessionEntity>
   */
  async create(session: SessionEntity): Promise<Result<SessionEntity>> {
    try {
      const [row] = await db
        .insert(sessionsTable)
        .values({
          id: session.id,
          userId: session.userId,
          tokenHash: session.tokenHash,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          expiresAt: session.expiresAt,
          lastActiveAt: session.lastActiveAt,
        })
        .returning()
      return ok(this.toDomain(row))
    } catch (error) {
      log.error({ error, userId: session.userId }, 'Failed to create session')
      return err(new Error('Failed to create session', { cause: error }))
    }
  }

  /**
   * Looks up a session by its hashed token.
   * Returns null if not found or expired.
   * @param tokenHash - SHA-256 hex digest of the raw cookie token
   * @returns Result<SessionEntity | null>
   */
  async findByTokenHash(tokenHash: string): Promise<Result<SessionEntity | null>> {
    try {
      const [row] = await db
        .select()
        .from(sessionsTable)
        .where(eq(sessionsTable.tokenHash, tokenHash))
        .limit(1)

      if (!row) return ok(null)

      const session = this.toDomain(row)
      if (!session.isActive) {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, row.id))
        return ok(null)
      }

      return ok(session)
    } catch (error) {
      log.error({ error }, 'Failed to find session by token hash')
      return err(new Error('Failed to look up session', { cause: error }))
    }
  }

  /**
   * Updates session timestamps (sliding window extension).
   * @param session - Session entity with updated expiresAt / lastActiveAt
   * @returns Result<void>
   */
  async update(session: SessionEntity): Promise<Result<void>> {
    try {
      await db
        .update(sessionsTable)
        .set({ expiresAt: session.expiresAt, lastActiveAt: session.lastActiveAt })
        .where(eq(sessionsTable.id, session.id))
      return ok(undefined)
    } catch (error) {
      log.error({ error, sessionId: session.id }, 'Failed to update session')
      return err(new Error('Failed to update session', { cause: error }))
    }
  }

  /**
   * Deletes a specific session (single-device logout).
   * @param id - Session UUID
   * @returns Result<void>
   */
  async deleteById(id: string): Promise<Result<void>> {
    try {
      await db.delete(sessionsTable).where(eq(sessionsTable.id, id))
      return ok(undefined)
    } catch (error) {
      log.error({ error, id }, 'Failed to delete session')
      return err(new Error('Failed to delete session', { cause: error }))
    }
  }

  /**
   * Deletes all sessions for a user (all-device logout / account compromise).
   * @param userId - User UUID
   * @returns Result<void>
   */
  async deleteAllForUser(userId: string): Promise<Result<void>> {
    try {
      await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId))
      return ok(undefined)
    } catch (error) {
      log.error({ error, userId }, 'Failed to delete user sessions')
      return err(new Error('Failed to delete user sessions', { cause: error }))
    }
  }

  /**
   * Removes all sessions where expiresAt is in the past.
   * @returns Result<number> — number of deleted rows
   */
  async deleteExpired(): Promise<Result<number>> {
    try {
      const result = await db
        .delete(sessionsTable)
        .where(lt(sessionsTable.expiresAt, new Date()))
        .returning({ id: sessionsTable.id })
      return ok(result.length)
    } catch (error) {
      log.error({ error }, 'Failed to delete expired sessions')
      return err(new Error('Failed to purge expired sessions', { cause: error }))
    }
  }

  private toDomain(row: typeof sessionsTable.$inferSelect): SessionEntity {
    return SessionEntity.create({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      ipAddress: row.ipAddress ?? null,
      userAgent: row.userAgent ?? null,
      expiresAt: row.expiresAt,
      lastActiveAt: row.lastActiveAt,
      createdAt: row.createdAt,
    })
  }
}
