'use client'

import { createContext, useContext } from 'react'

export interface AuthUser {
  id:          string
  name:        string
  email:       string
  role:        string
  avatarUrl:   string | null
  lastLoginAt: string | null
}

const AuthContext = createContext<AuthUser | null>(null)

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser
  children: React.ReactNode
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

/** Returns the authenticated user from the nearest AuthProvider. */
export function useAuth(): AuthUser {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/** Returns the user or null — safe to call outside a guarded layout. */
export function useAuthOptional(): AuthUser | null {
  return useContext(AuthContext)
}
