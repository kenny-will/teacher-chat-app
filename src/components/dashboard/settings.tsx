"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tag, PageHeader, SectionHeader, AvatarBadge, Divider } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useServerData } from "@/hooks/use-server-data"
import { queryNotificationPrefs, mutateNotificationPref } from "@/modules/financial/application/queries/financial.queries"

const SECTIONS = [
  { key: "profile", label: "Profile", active: true },
  { key: "workspace", label: "Workspace", active: false },
  { key: "security", label: "Security & 2FA", active: false },
  { key: "notifications", label: "Notifications", active: false },
  { key: "developer", label: "Developer", active: false },
  { key: "billing", label: "Plan & billing", active: false },
  { key: "export", label: "Data export", active: false },
]

const SECURITY_ITEMS = [
  { label: "Two-factor authentication", detail: "Hardware key + TOTP", tone: "green", action: "Enrolled" },
  { label: "Single sign-on", detail: "Okta · SAML 2.0", tone: "green", action: "Connected" },
  { label: "Login history", detail: "42 sessions, 3 devices", tone: "neutral", action: "View" },
  { label: "Active devices", detail: "MacBook · iPhone · iPad", tone: "neutral", action: "Manage" },
  { label: "Trusted networks", detail: "3 IP ranges", tone: "neutral", action: "Manage" },
  { label: "Recovery codes", detail: "Last regenerated 30d ago", tone: "amber", action: "Regenerate" },
] as const

// Default notification prefs shown to new users before DB data is loaded
const DEFAULT_NOTIF_LABELS = [
  "Large transactions (≥$50k)",
  "New invoice received",
  "Approval requested",
  "Card declined",
  "Weekly cash position",
  "Treasury rebalanced",
  "Compliance alerts",
  "Product updates",
]

export function SettingsPage() {
  const user = useAuth()
  const { data: dbPrefs, isLoading } = useServerData(queryNotificationPrefs)

  // Local toggle state — initialised from DB prefs when they load
  const [notifState, setNotifState] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (dbPrefs && dbPrefs.length > 0) {
      const map: Record<string, boolean> = {}
      for (const p of dbPrefs) map[p.id] = p.enabled
      setNotifState(map)
    }
  }, [dbPrefs])

  async function handleToggle(id: string, enabled: boolean) {
    setNotifState((prev) => ({ ...prev, [id]: enabled }))
    try {
      await mutateNotificationPref(id, enabled)
    } catch {
      // Revert on failure
      setNotifState((prev) => ({ ...prev, [id]: !enabled }))
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings."
        subtitle="Profile, security, notifications, and developer tools."
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Section nav */}
        <div className="col-span-12 lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Sections" />
          <ul className="mt-3 space-y-1">
            {SECTIONS.map((s, i) => (
              <li key={i}>
                <button
                  className={cn(
                    "w-full text-left px-3 h-9 rounded-lg text-[13px] transition",
                    s.active
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content panels */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          {/* Profile — uses real auth data */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <SectionHeader title="Profile" subtitle="Personal details visible to your team" />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center gap-4">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={user.name} className="h-14 w-14 rounded-full ring-2 ring-gray-200" />
                ) : (
                  <AvatarBadge name={user.name} size={56} />
                )}
                <div>
                  <div className="text-[14px] font-semibold">{user.name}</div>
                  <div className="text-[12px] text-gray-500 capitalize">{user.email} · {user.role}</div>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">Replace</Button>
              </div>
              {[
                ["Full name", user.name],
                ["Email", user.email],
                ["Role", user.role.charAt(0).toUpperCase() + user.role.slice(1)],
                ["Time zone", "America / Los Angeles"],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="text-[11.5px] text-gray-500 mb-1">{label}</div>
                  <div className="rounded-lg border border-gray-200 px-3 h-10 flex items-center text-[13px]">
                    {val}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Save changes</Button>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <SectionHeader title="Security" subtitle="Account protection" />
            <div className="mt-3 divide-y divide-gray-100">
              {SECURITY_ITEMS.map((r, i) => (
                <div key={i} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-medium">{r.label}</div>
                    <div className="text-[11.5px] text-gray-500">{r.detail}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Tag tone={r.tone as "green" | "neutral" | "amber"}>{r.action}</Tag>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications — per-user DB prefs */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <SectionHeader title="Notifications" subtitle="When and where you hear from us" />
            {isLoading ? (
              <div className="mt-3 grid grid-cols-2 gap-3 animate-pulse">
                {DEFAULT_NOTIF_LABELS.map((label) => (
                  <div key={label} className="rounded-lg border border-gray-200 px-3 py-3 h-12 bg-gray-50" />
                ))}
              </div>
            ) : !dbPrefs?.length ? (
              <div className="mt-4 text-[12px] text-gray-400">
                No notification preferences configured. An admin can set these up for your account.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {dbPrefs.map((pref) => (
                  <div
                    key={pref.id}
                    className="rounded-lg border border-gray-200 px-3 py-3 flex items-center justify-between"
                  >
                    <span className="text-[12.5px]">{pref.label}</span>
                    <Switch
                      checked={notifState[pref.id] ?? pref.enabled}
                      onCheckedChange={(v) => handleToggle(pref.id, v)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
