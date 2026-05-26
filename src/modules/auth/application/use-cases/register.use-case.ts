import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'
import { Email } from '@/modules/users/domain/value-objects/email.vo'
import { UserRole } from '@/modules/users/domain/value-objects/user-role.vo'
import { UserStatus } from '@/modules/users/domain/value-objects/user-status.vo'
import { UserEntity } from '@/modules/users/domain/entities/user.entity'
import type { IUserRepository } from '@/modules/users/domain/repositories/user.repository.interface'
import { passwordService } from '@/modules/auth/infrastructure/services/password.service'
import { db } from '@/shared/infrastructure/database/client'
import { userCredentialsTable } from '@/modules/auth/infrastructure/persistence/schema'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'register-use-case' })

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export class EmailAlreadyInUseError extends Error {
  constructor(email: string) {
    super(`An account with email "${email}" already exists`)
    this.name = 'EmailAlreadyInUseError'
  }
}

/** Registers a new user with email + password. */
export class RegisterUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  /**
   * Creates a new user account with hashed credentials.
   * @param input - Name, email, and plaintext password
   * @returns Result<UserEntity> — the newly created user
   */
  async execute(input: RegisterInput): Promise<Result<UserEntity>> {
    // 1. Validate and normalize email
    const emailResult = Email.create(input.email)
    if (!emailResult.success) return err(emailResult.error)

    // 2. Check for existing account
    const existingResult = await this.userRepo.findByEmail(emailResult.data.value)
    if (!existingResult.success) return err(existingResult.error)
    if (existingResult.data) {
      return err(new EmailAlreadyInUseError(emailResult.data.value))
    }

    // 3. Hash password (validates strength inside)
    const hashResult = await passwordService.hash(input.password)
    if (!hashResult.success) return err(hashResult.error)

    // 4. Build user aggregate
    const roleResult = UserRole.create('viewer')
    const statusResult = UserStatus.create('active')
    if (!roleResult.success) return err(roleResult.error)
    if (!statusResult.success) return err(statusResult.error)

    const userId = UserEntity.generateId()
    const user = UserEntity.create({
      id: userId,
      email: emailResult.data,
      name: input.name.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(input.name)}`,
      role: roleResult.data,
      status: statusResult.data,
      lastLoginAt: null,
    })

    // 5. Persist user first, then credentials (FK constraint order)
    const saveResult = await this.userRepo.save(user)
    if (!saveResult.success) return err(saveResult.error)

    // 6. Persist credentials in auth module's table
    try {
      await db.insert(userCredentialsTable).values({
        userId: saveResult.data.id,
        passwordHash: hashResult.data,
      })
    } catch (error) {
      // Compensate: remove the user so we don't leave a dangling record
      await this.userRepo.delete(saveResult.data.id)
      log.error({ error, userId }, 'Failed to persist credentials — user creation rolled back')
      return err(new Error('Failed to create account', { cause: error }))
    }

    log.info({ userId: saveResult.data.id }, 'User registered')
    return ok(saveResult.data)
  }
}
