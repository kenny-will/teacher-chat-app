import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/shared/infrastructure/auth/session'
import { DrizzleUserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/persistence/session.repository'
import { SessionEntity } from '@/modules/auth/domain/entities/session.entity'
import { Entity } from '@/shared/domain/base-entity'
import {
  generateSessionToken,
  hashToken,
  getSessionExpiry,
  COOKIE_NAME,
  SESSION_DURATION_DAYS_EXPORT,
} from '@/shared/infrastructure/auth/token'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'impersonate' })
const userRepo    = new DrizzleUserRepository()
const sessionRepo = new DrizzleSessionRepository()

export async function POST(req: NextRequest) {
  // 1. Verify caller is an admin
  const serverSession = await getServerSession()
  if (!serverSession) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }
  if (serverSession.user.role.value !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  // 2. Parse target
  const body = await req.json().catch(() => ({})) as { targetUserId?: string }
  const { targetUserId } = body
  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 })
  }
  if (targetUserId === serverSession.user.id) {
    return NextResponse.json({ error: 'Cannot impersonate yourself' }, { status: 400 })
  }

  // 3. Look up target user
  const userResult = await userRepo.findById(targetUserId)
  if (!userResult.success || !userResult.data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  const targetUser = userResult.data
  if (targetUser.status.value === 'suspended') {
    return NextResponse.json({ error: 'Cannot impersonate a suspended user' }, { status: 400 })
  }

  // 4. Create a new session for the target user
  const rawToken  = generateSessionToken()
  const tokenHash = hashToken(rawToken)
  const ip        = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const session = SessionEntity.create({
    id:           Entity.generateId(),
    userId:       targetUser.id,
    tokenHash,
    ipAddress:    ip,
    userAgent:    req.headers.get('user-agent') ?? null,
    expiresAt:    getSessionExpiry(),
    lastActiveAt: new Date(),
  })

  const sessionResult = await sessionRepo.create(session)
  if (!sessionResult.success) {
    return NextResponse.json({ error: 'Failed to create impersonation session' }, { status: 500 })
  }

  log.info(
    { adminId: serverSession.user.id, adminName: serverSession.user.name, targetUserId: targetUser.id, targetUserName: targetUser.name },
    'Admin impersonating user'
  )

  // 5. Overwrite the admin's session cookie with the target user's session token
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   SESSION_DURATION_DAYS_EXPORT * 24 * 60 * 60,
  })

  return res
}
