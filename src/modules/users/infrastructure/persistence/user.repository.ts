import { eq, ilike, count, or, sql } from 'drizzle-orm'
import { db } from '@/shared/infrastructure/database/client'
import { usersTable } from './schema'
import type { IUserRepository } from '@/modules/users/domain/repositories/user.repository.interface'
import type { UserEntity } from '@/modules/users/domain/entities/user.entity'
import type { PaginationOptions, PaginatedResult } from '@/shared/application/pagination.dto'
import { buildPaginatedResult } from '@/shared/application/pagination.dto'
import { UserMapper } from '../mappers/user.mapper'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'
import { logger } from '@/shared/infrastructure/logger/logger'
import { eventBus } from '@/shared/infrastructure/event-bus/in-memory-event-bus'

const log = logger.child({ module: 'user-repository' })

export class DrizzleUserRepository implements IUserRepository {
  /**
   * Finds a user by their UUID.
   * @param id - The user's UUID
   * @returns Result<UserEntity | null>
   */
  async findById(id: string): Promise<Result<UserEntity | null>> {
    try {
      const [row] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1)
      return ok(row ? UserMapper.toDomain(row) : null)
    } catch (error) {
      log.error({ error, id }, 'findById failed')
      return err(new Error(`Failed to find user by id: ${id}`, { cause: error }))
    }
  }

  /**
   * Finds a user by their email address.
   * @param email - The normalized email string
   * @returns Result<UserEntity | null>
   */
  async findByEmail(email: string): Promise<Result<UserEntity | null>> {
    try {
      const [row] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase()))
        .limit(1)
      return ok(row ? UserMapper.toDomain(row) : null)
    } catch (error) {
      log.error({ error, email }, 'findByEmail failed')
      return err(new Error(`Failed to find user by email`, { cause: error }))
    }
  }

  /**
   * Returns a paginated list of users with optional text search.
   * @param options - Pagination and search options
   * @returns Result<PaginatedResult<UserEntity>>
   */
  async findAll(options: PaginationOptions): Promise<Result<PaginatedResult<UserEntity>>> {
    try {
      const { page, pageSize, search } = options
      const offset = (page - 1) * pageSize

      const whereClause = search
        ? or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`))
        : undefined

      const [rows, [{ total }]] = await Promise.all([
        db
          .select()
          .from(usersTable)
          .where(whereClause)
          .orderBy(usersTable.createdAt)
          .limit(pageSize)
          .offset(offset),
        db
          .select({ total: count() })
          .from(usersTable)
          .where(whereClause),
      ])

      const users = rows.map(UserMapper.toDomain)
      return ok(buildPaginatedResult(users, Number(total), options))
    } catch (error) {
      log.error({ error, options }, 'findAll failed')
      return err(new Error('Failed to list users', { cause: error }))
    }
  }

  /**
   * Counts the number of admin users (used to enforce last-admin guard).
   * @returns Result<number>
   */
  async countAdmins(): Promise<Result<number>> {
    try {
      const [{ total }] = await db
        .select({ total: count() })
        .from(usersTable)
        .where(eq(usersTable.role, 'admin'))
      return ok(Number(total))
    } catch (error) {
      log.error({ error }, 'countAdmins failed')
      return err(new Error('Failed to count admin users', { cause: error }))
    }
  }

  /**
   * Inserts or updates a user record.
   * Dispatches domain events after successful persistence.
   * @param user - The UserEntity to persist
   * @returns Result<UserEntity>
   */
  async save(user: UserEntity): Promise<Result<UserEntity>> {
    try {
      const plain = user.toPlainObject()
      const [row] = await db
        .insert(usersTable)
        .values({
          id: plain.id,
          email: plain.email,
          name: plain.name,
          avatarUrl: plain.avatarUrl,
          role: plain.role,
          status: plain.status,
          lastLoginAt: plain.lastLoginAt,
        })
        .onConflictDoUpdate({
          target: usersTable.id,
          set: {
            name: plain.name,
            avatarUrl: plain.avatarUrl,
            role: plain.role,
            status: plain.status,
            lastLoginAt: plain.lastLoginAt,
            updatedAt: sql`now()`,
          },
        })
        .returning()

      const events = user.flushEvents()
      await eventBus.publishAll(events)

      return ok(UserMapper.toDomain(row))
    } catch (error) {
      log.error({ error, userId: user.id }, 'save failed')
      return err(new Error('Failed to save user', { cause: error }))
    }
  }

  /**
   * Deletes a user by their UUID.
   * @param id - The user's UUID
   * @returns Result<void>
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      await db.delete(usersTable).where(eq(usersTable.id, id))
      return ok(undefined)
    } catch (error) {
      log.error({ error, id }, 'delete failed')
      return err(new Error(`Failed to delete user: ${id}`, { cause: error }))
    }
  }
}
