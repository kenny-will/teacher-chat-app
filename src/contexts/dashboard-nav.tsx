"use client"

import React, { createContext, useContext, useState } from "react"

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
  const [mode, setMode]               = useState<DashboardMode>("user")
  const [view, setView]               = useState("overview")
  const [selectedUser, setSelectedUser] = useState<SelectedAdminUser | null>(null)

  const handleSetMode = (newMode: DashboardMode) => {
    if (newMode === "admin" && !isAdmin) return
    setMode(newMode)
    setView("overview")
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
