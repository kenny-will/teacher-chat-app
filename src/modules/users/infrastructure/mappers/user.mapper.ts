import { UserEntity } from '@/modules/users/domain/entities/user.entity'
import { Email } from '@/modules/users/domain/value-objects/email.vo'
import { UserRole } from '@/modules/users/domain/value-objects/user-role.vo'
import { UserStatus } from '@/modules/users/domain/value-objects/user-status.vo'
import type { UserRow } from '@/modules/users/infrastructure/persistence/schema'

/** Maps between Drizzle row types and UserEntity domain objects. */
export class UserMapper {
  /**
   * Maps a raw database row to a UserEntity.
   * @param row - The Drizzle row from usersTable
   * @returns A fully hydrated UserEntity
   * @throws If email/role/status contain invalid persisted values (data corruption)
   */
  static toDomain(row: UserRow): UserEntity {
    const emailResult = Email.create(row.email)
    const roleResult = UserRole.create(row.role)
    const statusResult = UserStatus.create(row.status)

    if (!emailResult.success) throw emailResult.error
    if (!roleResult.success) throw roleResult.error
    if (!statusResult.success) throw statusResult.error

    return UserEntity.create({
      id: row.id,
      email: emailResult.data,
      name: row.name,
      avatarUrl: row.avatarUrl ?? null,
      role: roleResult.data,
      status: statusResult.data,
      lastLoginAt: row.lastLoginAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }

  /** Maps a UserEntity to a DTO safe for serialization to the client. */
  static toDTO(user: UserEntity) {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role.value,
      status: user.status.value,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt?.toISOString() ?? null,
    }
  }
}
