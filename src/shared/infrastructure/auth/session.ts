import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hashToken, COOKIE_NAME, SESSION_DURATION_DAYS_EXPORT } from './token'
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/persistence/session.repository'
import { DrizzleUserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import type { UserEntity } from '@/modules/users/domain/entities/user.entity'
import type { SessionEntity } from '@/modules/auth/domain/entities/session.entity'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'session' })

const sessionRepo = new DrizzleSessionRepository()
const userRepo = new DrizzleUserRepository()

/** Extend the session when fewer than this many days remain. */
const EXTEND_THRESHOLD_DAYS = Math.floor(SESSION_DURATION_DAYS_EXPORT / 2)

export interface ServerSession {
  user: UserEntity
  session: SessionEntity
}

/**
 * Reads the session cookie, verifies the token hash against the DB,
 * and returns the authenticated user + session — or null if unauthenticated.
 *
 * Called from Server Component layouts (Node.js runtime — has DB access).
 * This is the "proxy" pattern: auth check lives in the layout tree, not
 * Edge Middleware, so it runs with full Node.js capabilities.
 */
export async function getServerSession(): Promise<ServerSession | null> {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(COOKIE_NAME)?.value
  if (!rawToken) return null

  const tokenHash = hashToken(rawToken)

  const sessionResult = await sessionRepo.findByTokenHash(tokenHash)
  if (!sessionResult.success || !sessionResult.data) return null

  const session = sessionResult.data

  const userResult = await userRepo.findById(session.userId)
  if (!userResult.success || !userResult.data) return null

  const user = userResult.data
  if (user.status.value === 'suspended') return null

  // Sliding window: extend if less than half the session lifetime remains
  const msRemaining = session.expiresAt.getTime() - Date.now()
  const thresholdMs = EXTEND_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  if (msRemaining < thresholdMs) {
    session.extend(SESSION_DURATION_DAYS_EXPORT)
    const updateResult = await sessionRepo.update(session)
    if (!updateResult.success) {
      log.warn({ sessionId: session.id }, 'Failed to extend session')
    }
  }

  return { user, session }
}

/**
 * Requires an authenticated session. Redirects to /login if none exists.
 * Drop this call at the top of any Server Component layout that should be gated.
 *
 * @returns The authenticated user + session (never null — redirects instead)
 */
export async function requireAuth(): Promise<ServerSession> {
  const serverSession = await getServerSession()
  if (!serverSession) redirect('/login')
  return serverSession
}

/**
 * Requires that NO session exists. Redirects to /dashboard if logged in.
 * Use in (auth) layouts to bounce already-authenticated users away from login/register.
 */
export async function requireGuest(): Promise<void> {
  const serverSession = await getServerSession()
  if (serverSession) redirect('/dashboard')
}
