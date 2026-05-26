import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  LoginUseCase,
  InvalidCredentialsError,
  AccountSuspendedError,
} from '@/modules/auth/application/use-cases/login.use-case'
import { DrizzleUserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/persistence/session.repository'
import { rateLimiter } from '@/modules/auth/infrastructure/services/rate-limiter.service'
import { COOKIE_NAME, SESSION_DURATION_DAYS_EXPORT } from '@/shared/infrastructure/auth/token'

const loginSchema = z.object({
  email:    z.string().email().max(255),
  password: z.string().min(1).max(128),
})

const userRepo    = new DrizzleUserRepository()
const sessionRepo = new DrizzleSessionRepository()
const loginUseCase = new LoginUseCase(userRepo, sessionRepo)

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const rateCheck = rateLimiter.check(`login:${ip}`)
  if (rateCheck.limited) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) },
      },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 422 })
  }

  const result = await loginUseCase.execute({
    email:     parsed.data.email,
    password:  parsed.data.password,
    ipAddress: ip,
    userAgent: req.headers.get('user-agent') ?? undefined,
  })

  if (!result.success) {
    if (result.error instanceof AccountSuspendedError) {
      return NextResponse.json({ error: result.error.message }, { status: 403 })
    }
    if (result.error instanceof InvalidCredentialsError) {
      return NextResponse.json({ error: result.error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }

  const { user, rawToken } = result.data

  rateLimiter.reset(`login:${ip}`)

  const res = NextResponse.json({
    id:    user.id,
    name:  user.name,
    email: user.email.value,
    role:  user.role.value,
  })

  res.cookies.set(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   SESSION_DURATION_DAYS_EXPORT * 24 * 60 * 60,
  })

  return res
}
