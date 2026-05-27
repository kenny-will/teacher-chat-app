import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!clientId) {
    return NextResponse.redirect(new URL('/login?error=oauth_not_configured', req.url))
  }

  const state       = randomBytes(16).toString('hex')
  const redirectUri = `${appUrl}/api/auth/oauth/google/callback`

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    state,
    access_type:   'online',
    prompt:        'select_account',
  })

  const res = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)

  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 10, // 10 minutes
  })

  return res
}
