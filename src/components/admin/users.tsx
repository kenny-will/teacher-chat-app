"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DownloadIcon, PlusIcon, MailIcon, SearchIcon, Settings2Icon, UserCheckIcon, LoaderIcon } from "lucide-react"
import { Tag, PageHeader, AvatarBadge } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useServerData } from "@/hooks/use-server-data"
import { adminGetUsers } from "@/modules/financial/application/mutations/financial.mutations"
import { AdminUserDataPage } from "@/components/admin/user-data"

const TABS = ["All", "Active", "Inactive", "Suspended"] as const

interface SelectedUser {
  id: string
  name: string
  email: string
  role: string
}

function formatLastSeen(lastLoginAt: Date | null | string): string {
  if (!lastLoginAt) return "Never"
  const d = new Date(lastLoginAt)
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d`
}

export function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All")
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null)
  const [impersonating, setImpersonating] = useState<string | null>(null)
  const router = useRouter()

  const { data: users, isLoading } = useServerData(adminGetUsers)

  async function handleImpersonate(userId: string, userName: string) {
    if (!confirm(`Sign in as ${userName}? You will be logged out of your admin account.`)) return
    setImpersonating(userId)
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      })
      if (!res.ok) {
        const { error } = await res.json()
        alert(`Impersonation failed: ${error}`)
        return
      }
      // Full page reload so auth context picks up the new session cookie
      window.location.href = '/dashboard'
    } catch {
      alert('Impersonation failed — network error')
    } finally {
      setImpersonating(null)
    }
  }

  if (selectedUser) {
    return (
      <AdminUserDataPage
        userId={selectedUser.id}
        userName={selectedUser.name}
        userEmail={selectedUser.email}
        userRole={selectedUser.role}
        onBack={() => setSelectedUser(null)}
      />
    )
  }

  const filtered = (users ?? []).filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())

    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Active" && u.status === "active") ||
      (activeTab === "Inactive" && u.status === "inactive") ||
      (activeTab === "Suspended" && u.status === "suspended")

    return matchesSearch && matchesTab
  })

  const statusTone = { active: "green", inactive: "amber", suspended: "rose" } as const

  return (
    <>
      <PageHeader
        eyebrow="Identity"
        title="Users."
        subtitle={
          isLoading
            ? "Loading…"
            : `${users?.length ?? 0} registered users`
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Export
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <MailIcon className="h-3.5 w-3.5" />Email all
            </Button>
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />Invite user
            </Button>
          </>
        }
      />

      {/* Users table */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-200 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 h-9 flex-1 min-w-65">
            <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 bg-transparent text-[13px] placeholder:text-gray-400 outline-none"
              placeholder="Search users by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "px-3 h-7 rounded-md text-[12px] font-medium transition whitespace-nowrap",
                  activeTab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Last seen</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="py-12 text-center text-[12px] text-gray-400">
            {search ? `No users matching "${search}"` : "No users found"}
          </div>
        ) : (
          filtered.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
            >
              <div className="col-span-4 flex items-center gap-2.5">
                {u.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatarUrl} alt={u.name} className="h-7 w-7 rounded-full" />
                ) : (
                  <AvatarBadge name={u.name} size={30} />
                )}
                <div className="min-w-0">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-[11px] text-gray-500 truncate">{u.email}</div>
                </div>
              </div>
              <div className="col-span-2 text-gray-700 capitalize">{u.role}</div>
              <div className="col-span-2">
                <Tag tone={statusTone[u.status as keyof typeof statusTone] ?? "neutral"}>
                  {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                </Tag>
              </div>
              <div className="col-span-1 text-right text-gray-500">
                {formatLastSeen(u.lastLoginAt)}
              </div>
              <div className="col-span-3 text-right flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 dark:text-indigo-400 dark:border-indigo-500/30 dark:hover:bg-indigo-500/10"
                  disabled={impersonating === u.id}
                  onClick={() => handleImpersonate(u.id, u.name)}
                >
                  {impersonating === u.id ? (
                    <LoaderIcon className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserCheckIcon className="h-3.5 w-3.5" />
                  )}
                  Impersonate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    setSelectedUser({
                      id: u.id,
                      name: u.name,
                      email: u.email,
                      role: u.role,
                    })
                  }
                >
                  <Settings2Icon className="h-3.5 w-3.5" />Configure
                </Button>
              </div>
            </div>
          ))
        )}

        <div className="px-5 py-3 flex items-center justify-between border-t border-gray-100 text-[12px] text-gray-500">
          <span>Showing {filtered.length} of {users?.length ?? 0} users</span>
        </div>
      </div>
    </>
  )
}
