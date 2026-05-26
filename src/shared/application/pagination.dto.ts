/** Pagination input options for repository queries. */
export interface PaginationOptions {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

/** Paginated result set returned from repository queries. */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Builds a PaginatedResult from raw items and a total count.
 * @param items - The items for the current page
 * @param total - Total number of matching records
 * @param options - The pagination options that produced this result
 * @returns A fully populated PaginatedResult
 */
export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  options: PaginationOptions,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / options.pageSize)
  return {
    items,
    total,
    page: options.page,
    pageSize: options.pageSize,
    totalPages,
    hasNextPage: options.page < totalPages,
    hasPreviousPage: options.page > 1,
  }
}

/** Default pagination options. */
export const DEFAULT_PAGINATION: PaginationOptions = {
  page: 1,
  pageSize: 20,
  sortOrder: 'desc',
}
