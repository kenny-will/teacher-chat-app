import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RegisterUseCase, EmailAlreadyInUseError } from '@/modules/auth/application/use-cases/register.use-case'
import { DrizzleUserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import { rateLimiter } from '@/modules/auth/infrastructure/services/rate-limiter.service'

const registerSchema = z.object({
  name:     z.string().min(1).max(100).trim(),
  email:    z.string().email().max(255),
  password: z.string().min(8).max(128),
})

const userRepo = new DrizzleUserRepository()
const registerUseCase = new RegisterUseCase(userRepo)

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const rateCheck = rateLimiter.check(`register:${ip}`)
  if (rateCheck.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
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

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const result = await registerUseCase.execute(parsed.data)

  if (!result.success) {
    if (result.error instanceof EmailAlreadyInUseError) {
      return NextResponse.json({ error: result.error.message }, { status: 409 })
    }
    return NextResponse.json({ error: result.error.message }, { status: 400 })
  }

  const user = result.data
  return NextResponse.json(
    {
      id:    user.id,
      name:  user.name,
      email: user.email.value,
      role:  user.role.value,
    },
    { status: 201 },
  )
}
