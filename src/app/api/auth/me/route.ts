import { NextResponse } from 'next/server'
import { getServerSession } from '@/shared/infrastructure/auth/session'

export async function GET() {
  const serverSession = await getServerSession()

  if (!serverSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user } = serverSession
  return NextResponse.json({
    id:          user.id,
    name:        user.name,
    email:       user.email.value,
    role:        user.role.value,
    status:      user.status.value,
    avatarUrl:   user.avatarUrl,
    lastLoginAt: user.lastLoginAt,
  })
}
