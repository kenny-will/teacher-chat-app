'use server'

import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { db } from '@/shared/infrastructure/database/client'
import { userCredentialsTable } from '@/modules/auth/infrastructure/persistence/schema'
import { passwordService } from '@/modules/auth/infrastructure/services/password.service'
import { getServerSession } from '@/shared/infrastructure/auth/session'
import { COOKIE_NAME } from '@/shared/infrastructure/auth/token'
import { DrizzleUserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import { DeleteUserUseCase } from '@/modules/users/application/use-cases/delete-user.use-case'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'account-actions' })

/** Returns whether the current user has an email/password credential and when it was last changed. */
export async function getAuthMethod(): Promise<{
  method: 'email' | 'google'
  passwordChangedAt: string | null
} | null> {
  const session = await getServerSession()
  if (!session) return null

  const [cred] = await db
    .select({ passwordChangedAt: userCredentialsTable.passwordChangedAt })
    .from(userCredentialsTable)
    .where(eq(userCredentialsTable.userId, session.user.id))
    .limit(1)

  return {
    method: cred ? 'email' : 'google',
    passwordChangedAt: cred?.passwordChangedAt?.toISOString() ?? null,
  }
}

/** Changes the current user's password after verifying the existing one. */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession()
  if (!session) return { success: false, error: 'Not authenticated' }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'New passwords do not match' }
  }

  const [cred] = await db
    .select()
    .from(userCredentialsTable)
    .where(eq(userCredentialsTable.userId, session.user.id))
    .limit(1)

  if (!cred) return { success: false, error: 'No password credential found for this account' }

  const valid = await passwordService.verify(currentPassword, cred.passwordHash)
  if (!valid) return { success: false, error: 'Current password is incorrect' }

  const violations = passwordService.getViolations(newPassword)
  if (violations.length > 0) return { success: false, error: violations.join(', ') }

  const hashResult = await passwordService.hash(newPassword)
  if (!hashResult.success) return { success: false, error: 'Failed to process new password' }

  await db
    .update(userCredentialsTable)
    .set({
      passwordHash:      hashResult.data,
      passwordChangedAt: new Date(),
      updatedAt:         new Date(),
    })
    .where(eq(userCredentialsTable.userId, session.user.id))

  log.info({ userId: session.user.id }, 'Password changed')
  return { success: true }
}

/**
 * Deletes the current user's account and all related data (cascade via FK).
 * Clears the session cookie so the client is unauthenticated immediately.
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession()
  if (!session) return { success: false, error: 'Not authenticated' }

  const userRepo = new DrizzleUserRepository()
  const useCase  = new DeleteUserUseCase(userRepo)
  const result   = await useCase.execute(session.user.id)

  if (!result.success) {
    log.warn({ error: result.error.message, userId: session.user.id }, 'deleteAccount failed')
    return { success: false, error: result.error.message }
  }

  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)

  log.info({ userId: session.user.id }, 'Account deleted by user')
  return { success: true }
}
