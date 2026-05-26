/** Typed Server Action response — all server actions return this shape. */
export type ActionResponse<T = undefined> =
  | ActionSuccess<T>
  | ActionFailure

export interface ActionSuccess<T = undefined> {
  success: true
  data?: T
  message?: string
}

export interface ActionFailure {
  success: false
  message?: string
  errors?: Record<string, string[] | undefined>
}

/**
 * Creates a successful action response.
 * @param data - Optional payload to return to the client
 * @param message - Optional success message
 */
export function actionSuccess<T>(data?: T, message?: string): ActionSuccess<T> {
  return { success: true, data, message }
}

/**
 * Creates a failed action response.
 * @param message - Human-readable error message
 * @param errors - Optional field-level validation errors
 */
export function actionFailure(
  message: string,
  errors?: Record<string, string[] | undefined>,
): ActionFailure {
  return { success: false, message, errors }
}
