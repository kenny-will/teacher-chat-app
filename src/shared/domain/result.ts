/** Discriminated union for operation results — no thrown errors in domain/application layers. */

type Success<T> = { success: true; data: T }
type Failure<E extends Error> = { success: false; error: E }

export type Result<T, E extends Error = Error> = Success<T> | Failure<E>

/**
 * Wraps a successful value in a Result.
 * @param data - The value to wrap
 * @returns A successful Result containing the data
 */
export const ok = <T>(data: T): Result<T, never> => ({ success: true, data })

/**
 * Wraps an error in a Result.
 * @param error - The typed error to wrap
 * @returns A failed Result containing the error
 */
export const err = <E extends Error>(error: E): Result<never, E> => ({ success: false, error })

/**
 * Narrows a Result to its success branch.
 * @param result - The Result to check
 */
export function isOk<T>(result: Result<T>): result is Success<T> {
  return result.success === true
}

/**
 * Narrows a Result to its failure branch.
 * @param result - The Result to check
 */
export function isErr<E extends Error>(result: Result<unknown, E>): result is Failure<E> {
  return result.success === false
}

/**
 * Maps the success value of a Result.
 * @param result - The Result to transform
 * @param fn - The mapping function
 * @returns A new Result with the mapped value
 */
export function mapResult<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (data: T) => U,
): Result<U, E> {
  if (result.success) return ok(fn(result.data))
  return result
}
