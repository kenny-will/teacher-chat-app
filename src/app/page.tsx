import { redirect } from 'next/navigation'
import { getServerSession } from '@/shared/infrastructure/auth/session'
import { LandingPage } from '@/components/landing-page'

export default async function Home() {
  const session = await getServerSession()
  if (session) redirect('/dashboard')
  return <LandingPage />
}
