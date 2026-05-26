"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, LockIcon, MoreHorizontalIcon } from "lucide-react"
import { Tag, PageHeader, SectionHeader, AvatarBadge, Divider } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useServerData } from "@/hooks/use-server-data"
import { adminGetUsers } from "@/modules/financial/application/mutations/financial.mutations"

const POLICY = [
  { range: "Under $5,000", approvers: "1 approver", who: "Any admin", tone: "green" },
  { range: "$5k – $50k", approvers: "1 approver", who: "Admin or Treasurer", tone: "green" },
  { range: "$50k – $200k", approvers: "2 approvers", who: "Admin + CFO", tone: "amber" },
  { range: "$200k – $1M", approvers: "2 approvers", who: "CFO + Treasurer", tone: "amber" },
  { range: "Over $1M", approvers: "3 approvers", who: "CFO + Treasurer + Board", tone: "rose" },
] as const

const MATRIX_ROWS = [
  ["View balances and statements", ["✓", "✓", "✓", "✓", "✓", "✓"]],
  ["Send payments", ["✓", "✓", "✓", "—", "—", "—"]],
  ["Approve payments", ["✓", "✓", "✓", "✓", "—", "—"]],
  ["Issue & freeze cards", ["✓", "✓", "—", "—", "—", "—"]],
  ["Manage members & roles", ["✓", "✓", "—", "—", "—", "—"]],
  ["Edit treasury policy", ["✓", "—", "✓", "—", "—", "—"]],
  ["Export reports", ["✓", "✓", "✓", "✓", "✓", "✓"]],
  ["Access audit log", ["✓", "✓", "—", "—", "—", "—"]],
] as const

const permTone = {
  admin: "brand",
  editor: "neutral",
  viewer: "neutral",
} as const

function roleToPermLabel(role: string) {
  if (role === "admin") return "Admin"
  if (role === "editor") return "Editor"
  return "Viewer"
}

function formatLastSeen(lastLoginAt: Date | null | string): string {
  if (!lastLoginAt) return "Never"
  const d = new Date(lastLoginAt)
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d ago`
}

// Team page fetches all workspace users from DB — only admins can see this, but
// for non-admins we still show the list (just read-only).
// adminGetUsers requires admin role server-side; for non-admins we show a limited view.
async function fetchTeamMembers() {
  try {
    return await adminGetUsers()
  } catch {
    // Non-admin: return empty so the page shows only the current user row
    return []
  }
}

export function TeamPage() {
  const user = useAuth()
  const { data: members, isLoading } = useServerData(fetchTeamMembers)

  const allMembers = members ?? []

  const activeCount = allMembers.filter((m) => m.status === "active").length
  const pendingCount = allMembers.filter((m) => m.status === "inactive").length

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Team & permissions."
        subtitle={
          allMembers.length
            ? `${activeCount} active · ${pendingCount} inactive`
            : "Loading team…"
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <LockIcon className="h-3.5 w-3.5" />Permission matrix
            </Button>
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />Invite member
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Members table */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Members"
            subtitle={allMembers.length ? `${allMembers.length} total` : "Loading…"}
          />
          <div className="mt-3">
            <div className="grid grid-cols-12 gap-2 px-1 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
              <div className="col-span-4">Member</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Permission</div>
              <div className="col-span-2 text-right">Status</div>
              <div className="col-span-2 text-right">Last seen</div>
            </div>

            {isLoading ? (
              <div className="space-y-3 mt-3 animate-pulse">
                {[0, 1, 2].map((i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}
              </div>
            ) : allMembers.length === 0 ? (
              /* Fallback: show just the current user */
              <div className="grid grid-cols-12 gap-2 items-center px-1 py-3 border-b border-gray-100 text-[12.5px]">
                <div className="col-span-4 flex items-center gap-2.5">
                  <AvatarBadge name={user.name} size={30} />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
                  </div>
                </div>
                <div className="col-span-2 text-gray-700 capitalize">{user.role}</div>
                <div className="col-span-2">
                  <Tag tone={permTone[user.role as keyof typeof permTone] ?? "neutral"}>
                    {roleToPermLabel(user.role)}
                  </Tag>
                </div>
                <div className="col-span-2 text-right">
                  <Tag tone="green">Active</Tag>
                </div>
                <div className="col-span-2 text-right text-gray-500">Just now</div>
              </div>
            ) : (
              allMembers.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-12 gap-2 items-center px-1 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition text-[12.5px]"
                >
                  <div className="col-span-4 flex items-center gap-2.5">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatarUrl} alt={m.name} className="h-7 w-7 rounded-full" />
                    ) : (
                      <AvatarBadge name={m.name} size={30} />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{m.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{m.email}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-gray-700 capitalize">{m.role}</div>
                  <div className="col-span-2">
                    <Tag tone={permTone[m.role as keyof typeof permTone] ?? "neutral"}>
                      {roleToPermLabel(m.role)}
                    </Tag>
                  </div>
                  <div className="col-span-2 text-right">
                    <Tag
                      tone={
                        m.status === "active" ? "green" :
                        m.status === "suspended" ? "rose" : "amber"
                      }
                    >
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </Tag>
                  </div>
                  <div className="col-span-2 text-right text-gray-500 flex items-center justify-end gap-2">
                    <span>{formatLastSeen(m.lastLoginAt)}</span>
                    <button className="text-gray-400 hover:text-gray-700">
                      <MoreHorizontalIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Approval policy */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Approval policy" subtitle="Threshold-based signoff" />
          <div className="mt-3 space-y-2.5">
            {POLICY.map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2.5">
                <div className="text-[12.5px] font-mono text-gray-700">{r.range}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] font-medium">{r.approvers}</div>
                  <div className="text-[10.5px] text-gray-500">{r.who}</div>
                </div>
                <Tag tone={r.tone as "green" | "amber" | "rose"}>Active</Tag>
              </div>
            ))}
          </div>
          <Divider className="my-4" />
          <Button variant="outline" size="sm" className="w-full justify-center">
            Edit policy
          </Button>
        </div>

        {/* Permission matrix */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Permission matrix" subtitle="Read · Write · Approve" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.12em] text-gray-400">
                  <th className="text-left py-2 pr-3">Capability</th>
                  {["Owner", "Admin", "Treasurer", "Reviewer", "AP only", "Read-only"].map((r) => (
                    <th key={r} className="text-center py-2 px-3 whitespace-nowrap">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX_ROWS.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2.5 pr-3 font-medium">{row[0]}</td>
                    {row[1].map((c, j) => (
                      <td key={j} className="text-center py-2.5 px-3">
                        <span className={cn("inline-block", c === "✓" ? "text-blue-600 font-bold" : "text-gray-300")}>
                          {c}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
