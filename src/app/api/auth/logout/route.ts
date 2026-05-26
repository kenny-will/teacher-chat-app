import { NextRequest, NextResponse } from 'next/server'
import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-case'
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/persistence/session.repository'
import { getServerSession } from '@/shared/infrastructure/auth/session'
import { COOKIE_NAME } from '@/shared/infrastructure/auth/token'

const sessionRepo = new DrizzleSessionRepository()
const logoutUseCase = new LogoutUseCase(sessionRepo)

export async function POST(_req: NextRequest) {
  const serverSession = await getServerSession()

  if (serverSession) {
    await logoutUseCase.execute({
      sessionId: serverSession.session.id,
      userId:    serverSession.user.id,
    })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
