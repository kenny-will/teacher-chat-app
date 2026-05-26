import { eq } from 'drizzle-orm'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'
import type { IUserRepository } from '@/modules/users/domain/repositories/user.repository.interface'
import type { ISessionRepository } from '@/modules/auth/domain/repositories/session.repository.interface'
import { SessionEntity } from '@/modules/auth/domain/entities/session.entity'
import { passwordService } from '@/modules/auth/infrastructure/services/password.service'
import { db } from '@/shared/infrastructure/database/client'
import { userCredentialsTable } from '@/modules/auth/infrastructure/persistence/schema'
import { generateSessionToken, hashToken, getSessionExpiry } from '@/shared/infrastructure/auth/token'
import { Email } from '@/modules/users/domain/value-objects/email.vo'
import type { UserEntity } from '@/modules/users/domain/entities/user.entity'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'login-use-case' })

export interface LoginInput {
  email: string
  password: string
  ipAddress?: string
  userAgent?: string
}

export interface LoginOutput {
  user: UserEntity
  rawToken: string   // Stored in cookie — never touches DB
  sessionId: string
}

export class InvalidCredentialsError extends Error {
  constructor() {
    // Intentionally generic — do not leak whether email or password is wrong
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

export class AccountSuspendedError extends Error {
  constructor() {
    super('Your account has been suspended. Contact support.')
    this.name = 'AccountSuspendedError'
  }
}

/** Authenticates a user and issues a new session. */
export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly sessionRepo: ISessionRepository,
  ) {}

  /**
   * Validates credentials and creates a session.
   * Errors are deliberately generic to prevent user enumeration.
   * @param input - Email, password, and optional request metadata
   * @returns Result<LoginOutput> containing the raw token and user
   */
  async execute(input: LoginInput): Promise<Result<LoginOutput>> {
    // 1. Normalize email
    const emailResult = Email.create(input.email)
    if (!emailResult.success) return err(new InvalidCredentialsError())

    // 2. Look up user — same error for not-found vs wrong password
    const userResult = await this.userRepo.findByEmail(emailResult.data.value)
    if (!userResult.success) return err(userResult.error)
    if (!userResult.data) return err(new InvalidCredentialsError())

    const user = userResult.data

    // 3. Block suspended accounts
    if (user.status.value === 'suspended') {
      return err(new AccountSuspendedError())
    }

    // 4. Fetch stored password hash from credentials table
    const [cred] = await db
      .select()
      .from(userCredentialsTable)
      .where(eq(userCredentialsTable.userId, user.id))
      .limit(1)

    if (!cred) return err(new InvalidCredentialsError())

    // 5. Verify password — bcrypt timing-safe internally
    const valid = await passwordService.verify(input.password, cred.passwordHash)
    if (!valid) return err(new InvalidCredentialsError())

    // 6. Generate split-token session
    const rawToken = generateSessionToken()         // Sent in cookie
    const tokenHash = hashToken(rawToken)           // Stored in DB

    const sessionId = SessionEntity.generateId()
    const session = SessionEntity.create({
      id: sessionId,
      userId: user.id,
      tokenHash,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt: getSessionExpiry(),
      lastActiveAt: new Date(),
    })

    const sessionResult = await this.sessionRepo.create(session)
    if (!sessionResult.success) return err(sessionResult.error)

    // 7. Record last login on the user entity
    user.recordLogin()
    await this.userRepo.save(user)

    log.info({ userId: user.id, sessionId }, 'User logged in')
    return ok({ user, rawToken, sessionId })
  }
}
