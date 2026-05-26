'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import type { ActionResponse } from '@/shared/presentation/action-response'
import { actionSuccess, actionFailure } from '@/shared/presentation/action-response'
import { DrizzleUserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import { GetUsersListUseCase } from '@/modules/users/application/use-cases/get-users-list.use-case'
import { DeleteUserUseCase } from '@/modules/users/application/use-cases/delete-user.use-case'
import type { PaginationOptions } from '@/shared/application/pagination.dto'
import type { UserListDTO } from '@/modules/users/application/dtos/user-list.dto'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'users-actions' })
const repo = new DrizzleUserRepository()

const GetUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

/**
 * Server Action: returns a paginated user list.
 * @param options - Pagination options
 * @returns UserListDTO or throws on repository failure
 */
export async function getUsersList(options: Partial<PaginationOptions> = {}): Promise<UserListDTO> {
  const parsed = GetUsersSchema.safeParse(options)
  if (!parsed.success) throw new Error('Invalid pagination options')

  const useCase = new GetUsersListUseCase(repo)
  const result = await useCase.execute(parsed.data as PaginationOptions)
  if (!result.success) throw result.error
  return result.data
}

/**
 * Server Action: deletes a user by id.
 * Enforces last-admin guard.
 * @param _prev - Previous action state (for useActionState)
 * @param formData - FormData containing `userId`
 * @returns ActionResponse<void>
 */
export async function deleteUserAction(
  _prev: ActionResponse,
  formData: FormData,
): Promise<ActionResponse> {
  const id = formData.get('userId')
  if (typeof id !== 'string' || !id) {
    return actionFailure('User ID is required')
  }

  const useCase = new DeleteUserUseCase(repo)
  const result = await useCase.execute(id)

  if (!result.success) {
    log.warn({ error: result.error.message, userId: id }, 'deleteUser failed')
    return actionFailure(result.error.message)
  }

  revalidatePath('/dashboard')
  return actionSuccess(undefined, 'User deleted successfully')
}
