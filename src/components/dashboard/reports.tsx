"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, DownloadIcon, BarChart3Icon, MoreHorizontalIcon } from "lucide-react"
import { Tag, PageHeader, SectionHeader, Divider } from "@/components/meridian/primitives"

const TEMPLATES = [
  { name: "Balance sheet", period: "Period · Jun 2026", formats: "PDF · XLSX", updated: "Updated 4h ago" },
  { name: "Income statement", period: "Period · Jun 2026", formats: "PDF · XLSX", updated: "Updated 4h ago" },
  { name: "Cash flow statement", period: "Period · Jun 2026", formats: "PDF · XLSX", updated: "Updated 4h ago" },
  { name: "Aging · receivables", period: "Period · 30 / 60 / 90", formats: "PDF · CSV", updated: "Updated 1h ago" },
  { name: "Aging · payables", period: "Period · 30 / 60 / 90", formats: "PDF · CSV", updated: "Updated 1h ago" },
  { name: "Card statement", period: "All cards · Jun", formats: "PDF", updated: "Available" },
  { name: "Treasury statement", period: "Sweep · Jun", formats: "PDF", updated: "Available" },
  { name: "FX activity", period: "All conversions", formats: "CSV", updated: "Updated 2h ago" },
]

const SCHEDULED = [
  { name: "Monthly close pack", dest: "QuickBooks Online", freq: "1st of month, 06:00 PT", status: "green" },
  { name: "Daily card statement", dest: "Slack #finance", freq: "Daily at 09:00 PT", status: "green" },
  { name: "Weekly cash position", dest: "PDF email", freq: "Mondays at 08:00 PT", status: "green" },
  { name: "Aging report", dest: "Netsuite", freq: "Fridays at 17:00 PT", status: "amber" },
  { name: "Treasury yield report", dest: "PDF email", freq: "1st of month", status: "green" },
  { name: "Audit log archive", dest: "S3 bucket", freq: "Daily at 23:59", status: "green" },
] as const

const RECON = [
  { label: "Matched", value: "9,841", color: "#10B981" },
  { label: "Pending", value: "164", color: "#F59E0B" },
  { label: "Unmatched", value: "17", color: "#EF4444" },
]

export function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Reports & exports."
        subtitle="GL-ready statements and reconciliations. Connected to QuickBooks, Netsuite, and Xero."
        actions={
          <>
            <Button variant="outline" size="sm">Schedule</Button>
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />New report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Report library */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Library" subtitle="12 templates · 4 custom" />
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TEMPLATES.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition"
              >
                <div className="h-9 w-9 rounded-md bg-gray-100 grid place-items-center text-gray-700">
                  <BarChart3Icon className="h-4 w-4" />
                </div>
                <div className="mt-3 text-[13.5px] font-semibold">{r.name}</div>
                <div className="text-[11.5px] text-gray-500 mt-0.5">{r.period}</div>
                <Divider className="my-3" />
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>{r.formats}</span>
                  <span>{r.updated}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" className="flex-1 justify-center gap-1.5">
                    <DownloadIcon className="h-3.5 w-3.5" />Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontalIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled exports */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Scheduled exports" subtitle="6 active" />
          <div className="mt-3 space-y-1">
            {SCHEDULED.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center gap-2 px-1 py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="col-span-5 font-medium text-[12.5px] truncate">{r.name}</div>
                <div className="col-span-3 text-[12px] text-gray-600 truncate">{r.dest}</div>
                <div className="col-span-3 text-[12px] text-gray-500 truncate">{r.freq}</div>
                <div className="col-span-1 text-right">
                  <Tag tone={r.status as "green" | "amber"}>{r.status === "green" ? "On" : "Paused"}</Tag>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reconciliation */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Reconciliation"
            subtitle="QuickBooks · last sync 4m ago"
            right={<Tag tone="green">98.2% matched</Tag>}
          />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {RECON.map((r) => (
              <div key={r.label} className="rounded-xl border border-gray-200 p-3 text-center">
                <div className="text-[11.5px] text-gray-500">{r.label}</div>
                <div
                  className="font-semibold text-[28px] leading-none tracking-tight mt-1 tabular-nums"
                  style={{ color: r.color }}
                >
                  {r.value}
                </div>
              </div>
            ))}
          </div>
          <Divider className="my-4" />
          <Button variant="outline" size="sm" className="w-full justify-center">
            Resolve 17 unmatched
          </Button>
        </div>
      </div>
    </>
  )
}
