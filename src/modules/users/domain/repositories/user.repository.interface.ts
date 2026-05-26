import type { Result } from '@/shared/domain/result'
import type { UserEntity } from '@/modules/users/domain/entities/user.entity'
import type { PaginationOptions, PaginatedResult } from '@/shared/application/pagination.dto'

export interface IUserRepository {
  findById(id: string): Promise<Result<UserEntity | null>>
  findByEmail(email: string): Promise<Result<UserEntity | null>>
  findAll(options: PaginationOptions): Promise<Result<PaginatedResult<UserEntity>>>
  countAdmins(): Promise<Result<number>>
  save(user: UserEntity): Promise<Result<UserEntity>>
  delete(id: string): Promise<Result<void>>
}
