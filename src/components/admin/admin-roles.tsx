"use client"

import { useState, useTransition } from "react"
import { ShieldCheckIcon, LoaderIcon, RefreshCwIcon, ChevronDownIcon } from "lucide-react"
import { Tag, PageHeader, AvatarBadge } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useServerData } from "@/hooks/use-server-data"
import {
  adminGetUsers,
  adminChangeUserRole,
} from "@/modules/financial/application/mutations/financial.mutations"
import { useAuth } from "@/contexts/auth-context"

type Role = "viewer" | "editor" | "admin"

const ROLE_LABEL: Record<Role, string> = {
  viewer: "Viewer",
  editor: "Editor",
  admin: "Admin",
}

const ROLE_TONE: Record<Role, "neutral" | "brand" | "dark"> = {
  viewer: "neutral",
  editor: "brand",
  admin: "dark",
}

const ALL_ROLES: Role[] = ["viewer", "editor", "admin"]

function RoleDropdown({
  userId,
  currentRole,
  selfId,
  onChanged,
}: {
  userId: string
  currentRole: string
  selfId: string
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isSelf = userId === selfId

  function handleSelect(role: Role) {
    if (role === currentRole) { setOpen(false); return }
    setOpen(false)
    setError(null)
    startTransition(async () => {
      try {
        await adminChangeUserRole(userId, role)
        onChanged()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update role")
      }
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => { if (!isSelf) setOpen((o) => !o) }}
        disabled={isSelf || isPending}
        title={isSelf ? "You cannot change your own role" : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-medium transition",
          isSelf
            ? "opacity-40 cursor-not-allowed border-gray-200 dark:border-white/10 text-gray-500"
            : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-700 dark:text-gray-200 bg-white dark:bg-white/5 cursor-pointer",
        )}
      >
        {isPending ? (
          <LoaderIcon className="h-3 w-3 animate-spin shrink-0" />
        ) : (
          <ShieldCheckIcon className="h-3 w-3 shrink-0 text-gray-400" />
        )}
        {ROLE_LABEL[(currentRole as Role) ?? "viewer"]}
        {!isSelf && <ChevronDownIcon className="h-3 w-3 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 min-w-[130px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
            {ALL_ROLES.map((role) => (
              <button
                key={role}
                onClick={() => handleSelect(role)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-[12.5px] text-left transition",
                  role === currentRole
                    ? "bg-gray-50 dark:bg-white/5 text-gray-400 cursor-default"
                    : "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 cursor-pointer",
                )}
              >
                <Tag tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</Tag>
              </button>
            ))}
          </div>
        </>
      )}

      {error && (
        <p className="absolute left-0 top-full mt-1 z-20 text-[11px] text-rose-600 bg-white dark:bg-gray-900 border border-rose-200 rounded-lg px-2 py-1 shadow whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  )
}

export function AdminRolesPage() {
  const self = useAuth()
  const [refetchKey, setRefetchKey] = useState(0)

  const { data: users, isLoading, error, refetch } = useServerData(
    adminGetUsers,
    [refetchKey],
  )

  function handleRoleChanged() {
    setRefetchKey((k) => k + 1)
  }

  const adminCount = (users ?? []).filter((u) => u.role === "admin").length

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Roles & Permissions"
        subtitle="Promote or demote users. At least one admin must remain at all times."
        actions={
          <button
            onClick={refetch}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 px-3 py-1.5 text-[12.5px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-50"
          >
            <RefreshCwIcon className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Refresh
          </button>
        }
      />

      {/* Stats strip */}
      <div className="flex flex-wrap gap-3">
        {(["admin", "editor", "viewer"] as Role[]).map((role) => {
          const c = (users ?? []).filter((u) => u.role === role).length
          return (
            <div
              key={role}
              className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5"
            >
              <Tag tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</Tag>
              <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-100">{c}</span>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoaderIcon className="h-6 w-6 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading users…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-rose-600">Failed to load users</p>
            <button onClick={refetch} className="text-xs underline text-gray-500">Retry</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_180px_120px] gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
              <span>User</span>
              <span>Current Role</span>
              <span className="text-right">Change Role</span>
            </div>

            {(users ?? []).map((u) => {
              const role = (u.role ?? "viewer") as Role
              return (
                <div
                  key={u.id}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_180px_120px] gap-3 sm:gap-4 items-start sm:items-center px-5 py-4"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarBadge name={u.name} size={36} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {u.name}
                        </span>
                        {u.id === self.id && (
                          <span className="text-[10px] font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full px-1.5 py-0.5">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-gray-500 dark:text-gray-400 truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Current role badge */}
                  <div className="sm:pl-0 pl-12">
                    <Tag tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</Tag>
                    {role === "admin" && adminCount === 1 && (
                      <span className="ml-2 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Last admin
                      </span>
                    )}
                  </div>

                  {/* Dropdown */}
                  <div className="sm:flex sm:justify-end pl-12 sm:pl-0">
                    <RoleDropdown
                      userId={u.id}
                      currentRole={role}
                      selfId={self.id}
                      onChanged={handleRoleChanged}
                    />
                  </div>
                </div>
              )
            })}

            {(users ?? []).length === 0 && (
              <div className="py-16 text-center text-sm text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
