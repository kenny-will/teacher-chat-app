import type { Result } from '@/shared/domain/result'
import type { PaginationOptions, PaginatedResult } from '@/shared/application/pagination.dto'

/**
 * Generic repository interface.
 * All domain repositories must extend this interface.
 * @typeParam T - The aggregate/entity type
 */
export interface IBaseRepository<T> {
  /**
   * Finds an entity by its unique identifier.
   * @param id - The entity's UUID
   * @returns Result containing the entity or null if not found
   */
  findById(id: string): Promise<Result<T | null>>

  /**
   * Returns a paginated list of entities.
   * @param options - Pagination and filtering options
   * @returns Result containing the paginated result set
   */
  findAll(options: PaginationOptions): Promise<Result<PaginatedResult<T>>>

  /**
   * Persists an entity (insert or update).
   * @param entity - The entity to save
   * @returns Result containing the saved entity
   */
  save(entity: T): Promise<Result<T>>

  /**
   * Deletes an entity by its unique identifier.
   * @param id - The entity's UUID
   * @returns Result indicating success or failure
   */
  delete(id: string): Promise<Result<void>>
}
