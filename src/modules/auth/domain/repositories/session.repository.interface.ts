import type { Result } from '@/shared/domain/result'
import type { SessionEntity } from '@/modules/auth/domain/entities/session.entity'

export interface ISessionRepository {
  /**
   * Creates a new session record.
   * @param session - The session entity to persist
   */
  create(session: SessionEntity): Promise<Result<SessionEntity>>

  /**
   * Finds a session by its token hash.
   * @param tokenHash - SHA-256 hex digest of the raw cookie token
   */
  findByTokenHash(tokenHash: string): Promise<Result<SessionEntity | null>>

  /**
   * Updates a session (for sliding window expiry extension).
   * @param session - The session entity with updated timestamps
   */
  update(session: SessionEntity): Promise<Result<void>>

  /**
   * Deletes a single session (logout).
   * @param id - The session UUID
   */
  deleteById(id: string): Promise<Result<void>>

  /**
   * Deletes all sessions for a user (force logout all devices).
   * @param userId - The user's UUID
   */
  deleteAllForUser(userId: string): Promise<Result<void>>

  /**
   * Removes all expired sessions (maintenance job).
   */
  deleteExpired(): Promise<Result<number>>
}
