import type { IUserRepository } from '@/modules/users/domain/repositories/user.repository.interface'
import type { Result } from '@/shared/domain/result'
import { err } from '@/shared/domain/result'
import { ok } from '@/shared/domain/result'
import type { PaginationOptions } from '@/shared/application/pagination.dto'
import type { UserListDTO, UserDTO } from '@/modules/users/application/dtos/user-list.dto'
import { UserMapper } from '@/modules/users/infrastructure/mappers/user.mapper'
import { buildPaginatedResult } from '@/shared/application/pagination.dto'

/**
 * Returns a paginated list of users for the admin users table.
 */
export class GetUsersListUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  /**
   * Executes the use case.
   * @param options - Pagination and search options
   * @returns Result<UserListDTO>
   */
  async execute(options: PaginationOptions): Promise<Result<UserListDTO>> {
    const result = await this.userRepo.findAll(options)
    if (!result.success) return err(result.error)

    const dtos: UserDTO[] = result.data.items.map(UserMapper.toDTO)
    return ok(buildPaginatedResult(dtos, result.data.total, options))
  }
}
