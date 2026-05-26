"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, SearchIcon, MoreHorizontalIcon } from "lucide-react"
import { Tag, PageHeader, AvatarBadge } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"

const KPIS = [
  { label: "Open tickets", value: "186", color: "#2A5CFF" },
  { label: "Breaching SLA", value: "14", color: "#EF4444" },
  { label: "First response · avg", value: "14m", color: "#10B981" },
  { label: "Resolution · avg", value: "2.4h", color: "#10B981" },
  { label: "CSAT (30d)", value: "4.8 / 5", color: "#2A5CFF" },
  { label: "Backlog (P3 / P4)", value: "42", color: "#F59E0B" },
]

const TICKETS = [
  { id: "T-12042", org: "Atlas Labs", subject: "Wire delayed — beneficiary asking", priority: "High", priorityTone: "rose", assignee: "D. Cho", age: "9m", status: "In progress" },
  { id: "T-12041", org: "Lumen Labs", subject: "Cannot issue card · KYB pending", priority: "Medium", priorityTone: "amber", assignee: "M. Singh", age: "22m", status: "Waiting on customer" },
  { id: "T-12040", org: "Octavia", subject: "Statement reconciliation mismatch", priority: "Medium", priorityTone: "amber", assignee: "J. Kim", age: "41m", status: "Investigating" },
  { id: "T-12039", org: "Pinpoint", subject: "API webhook returning 500s", priority: "High", priorityTone: "rose", assignee: "—", age: "1h", status: "Unassigned" },
  { id: "T-12038", org: "Wavefront", subject: "Question about FX margin", priority: "Low", priorityTone: "neutral", assignee: "D. Cho", age: "2h", status: "In progress" },
  { id: "T-12037", org: "Spectrum AI", subject: "Add second-factor for $1M wires", priority: "Medium", priorityTone: "amber", assignee: "M. Singh", age: "3h", status: "Resolved" },
  { id: "T-12036", org: "Aurora Defense", subject: "Increase wire limit", priority: "Low", priorityTone: "neutral", assignee: "J. Kim", age: "4h", status: "Approved" },
  { id: "T-12035", org: "Bracket Studios", subject: "Export Q2 statement", priority: "Low", priorityTone: "neutral", assignee: "D. Cho", age: "6h", status: "Resolved" },
] as const

const TABS = ["All · 186", "Unassigned · 22", "Mine · 14", "SLA breach · 14"]

export function AdminSupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Support inbox."
        subtitle="186 open · 14 SLA breach · avg first response 14m"
        actions={
          <>
            <Button variant="outline" size="sm">Macros</Button>
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />New ticket
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        {KPIS.map((k) => (
          <div key={k.label} className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-[11.5px] text-gray-500">{k.label}</div>
            <div
              className="mt-1 font-semibold text-[24px] leading-none tracking-tight tabular-nums"
              style={{ color: k.color }}
            >
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tickets table */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-200 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 h-9 flex-1 min-w-[260px]">
            <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 bg-transparent text-[13px] placeholder:text-gray-400 outline-none"
              placeholder="Search tickets by customer, ID, content…"
            />
          </div>
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            {TABS.map((t, i) => (
              <button
                key={t}
                className={cn(
                  "px-3 h-7 rounded-md text-[12px] font-medium transition whitespace-nowrap",
                  i === 0 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
          <div className="col-span-1">ID</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-4">Subject</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-1">Age</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {TICKETS.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
          >
            <div className="col-span-1 font-mono text-[11.5px] text-gray-500">{r.id}</div>
            <div className="col-span-2 flex items-center gap-2">
              <AvatarBadge name={r.org} size={24} />
              <span className="font-medium truncate">{r.org}</span>
            </div>
            <div className="col-span-4 text-gray-700 truncate">{r.subject}</div>
            <div className="col-span-1">
              <Tag tone={r.priorityTone as "rose" | "amber" | "neutral"}>{r.priority}</Tag>
            </div>
            <div className="col-span-2 text-gray-600">{r.assignee}</div>
            <div className="col-span-1 text-gray-500">{r.age}</div>
            <div className="col-span-1 text-right">
              <span className="text-[12px] text-gray-700">{r.status}</span>
            </div>
          </div>
        ))}

        <div className="px-5 py-3 border-t border-gray-100 text-[12px] text-gray-500 text-center">
          Showing 1–8 of 186 tickets · sorted by SLA urgency
        </div>
      </div>
    </>
  )
}
