"use client"

import { Button } from "@/components/ui/button"
import { ShieldIcon, DownloadIcon, MoreHorizontalIcon } from "lucide-react"
import { Sparkline, AreaChart } from "@/components/meridian/charts"
import { Delta, Tag, PageHeader, SectionHeader, AvatarBadge, ProgressBar } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"

const KPIS = [
  { label: "KYC reviews pending", value: "37", delta: -12, color: "#F59E0B" },
  { label: "Auto-approved today", value: "184", delta: 4.2, color: "#10B981" },
  { label: "Sanction hits (30d)", value: "0", delta: 0, color: "#10B981" },
  { label: "Avg review time", value: "4.2h", delta: -18, color: "#2A5CFF" },
  { label: "Rejection rate", value: "2.1%", delta: -0.4, color: "#10B981" },
  { label: "PEP matches", value: "3", delta: 0, color: "#F59E0B" },
]

const QUEUE = [
  { name: "Léa Bernard", org: "Prismatic", country: "FR", type: "KYC", age: "6h", risk: "Medium", tone: "amber" },
  { name: "Jiro Tanaka", org: "Tidepool Inc.", country: "JP", type: "KYC", age: "12h", risk: "High", tone: "rose" },
  { name: "Rock & Ore LLC", org: "Rock & Ore", country: "US", type: "KYB", age: "1d", risk: "High", tone: "rose" },
  { name: "Adriana Costa", org: "Luminara", country: "BR", type: "KYC", age: "2d", risk: "Low", tone: "green" },
  { name: "Yusuf Bekele", org: "Harbora", country: "ET", type: "KYC", age: "3d", risk: "Medium", tone: "amber" },
] as const

export function AdminCompliancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Risk"
        title="Compliance."
        subtitle="KYC / KYB queue, sanctions screening, and regulatory reporting — all in one place."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Export report
            </Button>
            <Button size="sm" className="gap-1.5">
              <ShieldIcon className="h-3.5 w-3.5" />Review queue
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        {KPIS.map((k) => (
          <div key={k.label} className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-[11.5px] text-gray-500">{k.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-semibold text-[26px] leading-none tracking-tight tabular-nums">{k.value}</span>
              {k.delta !== 0 && <Delta value={k.delta} />}
            </div>
            <div className="mt-2 h-6">
              <Sparkline data={Array.from({ length: 14 }, () => 40 + Math.random() * 40)} stroke={k.color} height={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Compliance queue */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200">
            <div>
              <h3 className="text-[14.5px] font-semibold tracking-tight">Review queue</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">37 pending · avg age 14h</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-gray-100 p-1">
                {["All", "KYC", "KYB", "High risk", "Escalated"].map((t, i) => (
                  <button key={t} className={cn("px-3 h-7 rounded-md text-[12px] font-medium transition whitespace-nowrap", i === 0 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
            <div className="col-span-3">Applicant</div>
            <div className="col-span-2">Organization</div>
            <div className="col-span-1">Country</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1">Age</div>
            <div className="col-span-2">Risk level</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          {QUEUE.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
            >
              <div className="col-span-3 flex items-center gap-2.5">
                <AvatarBadge name={r.name} size={30} />
                <span className="font-medium truncate">{r.name}</span>
              </div>
              <div className="col-span-2 text-gray-600 truncate">{r.org}</div>
              <div className="col-span-1 text-gray-500 font-mono text-[11.5px]">{r.country}</div>
              <div className="col-span-2">
                <Tag tone="neutral">{r.type}</Tag>
              </div>
              <div className="col-span-1 text-gray-500">{r.age}</div>
              <div className="col-span-2">
                <Tag tone={r.tone as "green" | "amber" | "rose"}>{r.risk}</Tag>
              </div>
              <div className="col-span-1 text-right">
                <button className="text-gray-400 hover:text-gray-700">
                  <MoreHorizontalIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* KYC funnel */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="KYC funnel" subtitle="Last 30 days" />
          <div className="mt-4 space-y-3">
            {[
              { stage: "Submitted", count: 1248, pct: 100 },
              { stage: "Auto-approved", count: 1028, pct: 82 },
              { stage: "Manual review", count: 184, pct: 15 },
              { stage: "Escalated", count: 36, pct: 3 },
              { stage: "Rejected", count: 22, pct: 1.8 },
            ].map((r) => (
              <div key={r.stage}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span>{r.stage}</span>
                  <span className="tabular-nums font-medium">{r.count.toLocaleString()}</span>
                </div>
                <ProgressBar value={r.pct} className="mt-1.5" />
                <div className="text-[10.5px] text-gray-500 mt-1">{r.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sanctions screening */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Sanctions screening"
            subtitle="OFAC · UN · EU · UK · 14 lists · last scan 4m ago"
            right={<Tag tone="green">0 active hits</Tag>}
          />
          <div className="mt-4 grid grid-cols-4 gap-4 text-center">
            {[
              { label: "Entities screened (30d)", value: "24,182", sub: "100% coverage" },
              { label: "Matches investigated", value: "18", sub: "all resolved" },
              { label: "False positives", value: "15", sub: "83% FPR" },
              { label: "True positives", value: "0", sub: "last 90 days" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-200 p-4">
                <div className="text-[11.5px] text-gray-500">{s.label}</div>
                <div className="font-semibold text-[28px] leading-none tracking-tight mt-1 tabular-nums">{s.value}</div>
                <div className="text-[11px] text-gray-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
