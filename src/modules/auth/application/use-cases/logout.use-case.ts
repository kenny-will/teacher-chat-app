import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'
import type { ISessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'logout-use-case' })

export interface LogoutInput {
  sessionId: string
  userId: string
}

/** Terminates a single session (single-device logout). */
export class LogoutUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(input: LogoutInput): Promise<Result<void>> {
    const result = await this.sessionRepo.deleteById(input.sessionId)
    if (!result.success) {
      log.error({ sessionId: input.sessionId }, 'Failed to delete session during logout')
      return err(result.error)
    }
    log.info({ userId: input.userId, sessionId: input.sessionId }, 'User logged out')
    return ok(undefined)
  }
}

/** Terminates all sessions for a user (all-device logout). */
export class LogoutAllDevicesUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(userId: string): Promise<Result<void>> {
    const result = await this.sessionRepo.deleteAllForUser(userId)
    if (!result.success) {
      log.error({ userId }, 'Failed to delete all sessions during logout')
      return err(result.error)
    }
    log.info({ userId }, 'User logged out from all devices')
    return ok(undefined)
  }
}
