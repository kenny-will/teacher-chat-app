import { requireGuest } from '@/shared/infrastructure/auth/session'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Bounce already-authenticated users to the dashboard
  await requireGuest()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
