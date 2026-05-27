import { requireAuth } from "@/shared/infrastructure/auth/session";
import { AuthProvider } from "@/contexts/auth-context";

/**
 * Server Component layout — the auth proxy gate.
 * requireAuth() reads the session cookie, verifies against the DB,
 * and redirects to /login if unauthenticated. Runs in Node.js runtime
 * so it has full DB access (contrast: Edge Middleware cannot hit the DB).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth();

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email.value,
    role: user.role.value as string,
    avatarUrl: user.avatarUrl,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    accountNumber: user.accountNumber,
  };

  return <AuthProvider user={serializedUser}>{children}</AuthProvider>;
}
