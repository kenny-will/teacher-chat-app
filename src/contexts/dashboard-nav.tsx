"use client"

import React, { createContext, useContext, useState } from "react"

const STORAGE_KEY = "meridian_nav"

function readStorage(): { mode: DashboardMode; view: string } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as { mode: DashboardMode; view: string }) : null
  } catch {
    return null
  }
}

function writeStorage(mode: DashboardMode, view: string) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, view })) } catch { /* ignore */ }
}

export type DashboardMode = "user" | "admin"

export type UserView =
  | "overview"
  | "accounts"
  | "transactions"
  | "deposit"
  | "withdrawal"
  | "cards"
  | "invest"
  | "treasury"
  | "reports"
  | "team"
  | "integrations"
  | "settings"

export type AdminView =
  | "overview"
  | "users"
  | "accounts"
  | "transactions"
  | "deposits"
  | "withdrawals"
  | "simulate"
  | "cards"
  | "activity"
  | "support"
  | "notifications"
  | "audit"
  | "chat"
  | "locations"
  | "roles"

export interface SelectedAdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface DashboardNavContextValue {
  mode: DashboardMode
  view: string
  isAdmin: boolean
  selectedUser: SelectedAdminUser | null
  setMode: (mode: DashboardMode) => void
  setView: (view: string) => void
  setSelectedUser: (user: SelectedAdminUser | null) => void
}

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null)

export function DashboardNavProvider({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode
  isAdmin?: boolean
}) {
  const saved = readStorage()

  const [mode, setModeRaw] = useState<DashboardMode>(
    saved?.mode === "admin" && isAdmin ? "admin" : "user",
  )
  const [view, setViewRaw] = useState<string>(saved?.view ?? "overview")
  const [selectedUser, setSelectedUser] = useState<SelectedAdminUser | null>(null)

  function setView(newView: string) {
    setViewRaw(newView)
    writeStorage(mode, newView)
  }

  function handleSetMode(newMode: DashboardMode) {
    if (newMode === "admin" && !isAdmin) return
    setModeRaw(newMode)
    setViewRaw("overview")
    writeStorage(newMode, "overview")
  }

  return (
    <DashboardNavContext.Provider
      value={{ mode, view, isAdmin, selectedUser, setMode: handleSetMode, setView, setSelectedUser }}
    >
      {children}
    </DashboardNavContext.Provider>
  )
}

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext)
  if (!ctx)
    throw new Error("useDashboardNav must be used within DashboardNavProvider")
  return ctx
}
