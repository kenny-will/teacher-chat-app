"use client"

import { useState } from "react"
import { SearchIcon, CheckCircleIcon, UsersIcon } from "lucide-react"
import { Tag, AvatarBadge, PageHeader } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useServerData } from "@/hooks/use-server-data"
import { adminGetUsers } from "@/modules/financial/application/mutations/financial.mutations"
import { useDashboardNav } from "@/contexts/dashboard-nav"

const TABS = ["All", "Active", "Inactive", "Suspended"] as const

function formatLastSeen(lastLoginAt: Date | null | string): string {
  if (!lastLoginAt) return "Never"
  const d = new Date(lastLoginAt)
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return `${Math.floor(diffH / 24)}d ago`
}

export function AdminStudentPickerPage() {
  const { selectedUser, setSelectedUser, setView } = useDashboardNav()
  const [search, setSearch]         = useState("")
  const [activeTab, setActiveTab]   = useState<(typeof TABS)[number]>("All")

  const { data: users, isLoading }  = useServerData(adminGetUsers)

  const filtered = (users ?? []).filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Active"    && u.status === "active") ||
      (activeTab === "Inactive"  && u.status === "inactive") ||
      (activeTab === "Suspended" && u.status === "suspended")
    return matchesSearch && matchesTab
  })

  const statusTone = { active: "green", inactive: "amber", suspended: "rose" } as const

  function handleSelect(u: { id: string; name: string; email: string; role: string }) {
    setSelectedUser({ id: u.id, name: u.name, email: u.email, role: u.role })
    setView("deposits")
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Select a student."
        subtitle={
          isLoading
            ? "Loading…"
            : `${users?.length ?? 0} registered users — select one to manage their account`
        }
      />

      {/* Currently selected indicator */}
      {selectedUser && (
        <div className="mb-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/20 px-4 py-3 flex items-center gap-3">
          <CheckCircleIcon className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="text-[12.5px] text-indigo-700 dark:text-indigo-300">
            Currently viewing: <strong>{selectedUser.name}</strong> ({selectedUser.email})
          </span>
          <button
            onClick={() => { setSelectedUser(null) }}
            className="ml-auto text-[11.5px] text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200 border border-indigo-300 dark:border-indigo-700 rounded-lg px-2.5 py-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        {/* Search + filter bar */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-white/10 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 h-9 flex-1 min-w-60">
            <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 bg-transparent text-[13px] placeholder:text-gray-400 outline-none"
              placeholder="Search students by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-white/8 p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "px-3 h-7 rounded-md text-[12px] font-medium transition whitespace-nowrap",
                  activeTab === t
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[10.5px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100 dark:border-white/8">
          <div className="col-span-4">Student</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Last seen</div>
          <div className="col-span-2 text-right">Select</div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-gray-100 dark:bg-white/8 rounded" />)}
          </div>
        ) : !filtered.length ? (
          <div className="py-14 text-center">
            <UsersIcon className="h-8 w-8 text-gray-200 dark:text-white/10 mx-auto mb-3" />
            <div className="text-[12.5px] text-gray-400">
              {search ? `No students matching "${search}"` : "No students found"}
            </div>
          </div>
        ) : (
          filtered.map((u) => {
            const isSelected = selectedUser?.id === u.id
            return (
              <div
                key={u.id}
                className={cn(
                  "grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 dark:border-white/8 last:border-0 transition",
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt={u.name} className="h-8 w-8 rounded-full shrink-0" />
                  ) : (
                    <AvatarBadge name={u.name} size={32} />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium truncate flex items-center gap-1.5">
                      {u.name}
                      {isSelected && (
                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 rounded-full px-1.5 py-0.5 font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{u.email}</div>
                  </div>
                </div>

                <div className="col-span-2 text-gray-700 dark:text-gray-300 capitalize">{u.role}</div>

                <div className="col-span-2">
                  <Tag tone={statusTone[u.status as keyof typeof statusTone] ?? "neutral"}>
                    {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </Tag>
                </div>

                <div className="col-span-2 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                  {formatLastSeen(u.lastLoginAt)}
                </div>

                <div className="col-span-2 text-right">
                  {isSelected ? (
                    <button
                      onClick={() => setView("deposits")}
                      className="inline-flex items-center gap-1.5 px-3 h-7 rounded-lg bg-indigo-600 text-white text-[11.5px] font-medium hover:bg-indigo-700 transition"
                    >
                      View account →
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelect(u)}
                      className="inline-flex items-center gap-1.5 px-3 h-7 rounded-lg border border-gray-200 dark:border-white/10 text-[11.5px] font-medium hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition"
                    >
                      Select student
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}

        <div className="px-5 py-3 flex items-center justify-between border-t border-gray-100 dark:border-white/8 text-[12px] text-gray-500">
          <span>Showing {filtered.length} of {users?.length ?? 0} students</span>
          {selectedUser && (
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              Active: {selectedUser.name}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
