import type { IUserRepository } from '@/modules/users/domain/repositories/user.repository.interface'
import type { Result } from '@/shared/domain/result'
import { err, ok } from '@/shared/domain/result'

export class LastAdminDeletionError extends Error {
  constructor() {
    super('Cannot delete the last admin user')
    this.name = 'LastAdminDeletionError'
  }
}

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User not found: ${id}`)
    this.name = 'UserNotFoundError'
  }
}

/**
 * Deletes a user, enforcing the last-admin guard.
 */
export class DeleteUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  /**
   * Executes the use case.
   * @param id - The UUID of the user to delete
   * @returns Result<void>
   */
  async execute(id: string): Promise<Result<void>> {
    const userResult = await this.userRepo.findById(id)
    if (!userResult.success) return err(userResult.error)
    if (!userResult.data) return err(new UserNotFoundError(id))

    if (userResult.data.role.isAdmin) {
      const adminCountResult = await this.userRepo.countAdmins()
      if (!adminCountResult.success) return err(adminCountResult.error)
      if (adminCountResult.data <= 1) {
        return err(new LastAdminDeletionError())
      }
    }

    return this.userRepo.delete(id)
  }
}
