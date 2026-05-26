"use client"

import { AreaChart, Sparkline, DonutChart } from "@/components/meridian/charts"
import { Delta, Tag, SectionHeader, AvatarBadge, ProgressBar } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"

const KPIS = [
  { label: "Total customers", value: "24,182", delta: 8.41, hint: "+1,932 this month", spark: [18, 19, 19, 20, 21, 21, 22, 22, 23, 23, 24, 24], color: "#2A5CFF" },
  { label: "Assets under platform", value: "$28.4B", delta: 4.12, hint: "across 41 currencies", spark: [22, 23, 23, 24, 24, 25, 26, 26, 27, 28, 28, 28.4], color: "#0A0C12" },
  { label: "Daily payment volume", value: "$1.24B", delta: 12.8, hint: "14,820 transactions/h", spark: [0.9, 1.0, 1.05, 1.0, 1.1, 1.15, 1.2, 1.18, 1.22, 1.21, 1.23, 1.24], color: "#2A5CFF" },
  { label: "Revenue · MRR", value: "$8.92M", delta: 6.14, hint: "$107M ARR", spark: [6.8, 7.0, 7.2, 7.3, 7.5, 7.7, 7.9, 8.1, 8.3, 8.5, 8.7, 8.92], color: "#0A0C12" },
  { label: "Active risk cases", value: "12", delta: -22.0, hint: "4 high severity", spark: [22, 20, 18, 17, 16, 15, 14, 14, 13, 13, 12, 12], color: "#EF4444" },
  { label: "API p99 latency", value: "42 ms", delta: -3.4, hint: "global edge", spark: [48, 47, 46, 45, 45, 44, 44, 43, 43, 42, 42, 42], color: "#10B981" },
]

const SIGNUPS = [
  { name: "Mia Costa", org: "Aurora Defense", plan: "Scale", arr: "$2.4M", when: "2m ago", tone: "green" },
  { name: "Hassan Karim", org: "Bracket Studios", plan: "Scale", arr: "$280k", when: "18m ago", tone: "green" },
  { name: "Dana Wu", org: "Spectrum AI", plan: "Business", arr: "$58k", when: "1h ago", tone: "green" },
  { name: "Léa Bernard", org: "Prismatic", plan: "Business", arr: "—", when: "2h ago", tone: "amber" },
] as const

const INCIDENTS = [
  { title: "Elevated webhook latency · EU-WEST-1", severity: "Warning", since: "18 min", tone: "amber" },
  { title: "KYC provider · degraded", severity: "Info", since: "2h", tone: "brand" },
] as const

const REVENUE_DONUT = [
  { label: "Interchange", value: 42, color: "#2A5CFF" },
  { label: "SaaS fees", value: 31, color: "#0A0C12" },
  { label: "FX spread", value: 14, color: "#85A8FF" },
  { label: "API usage", value: 9, color: "#B7CCFF" },
  { label: "Other", value: 4, color: "#DDE1E7" },
]

const COMPLIANCE_QUEUE = [
  { name: "Léa Bernard", org: "Prismatic", type: "KYC", age: "6h", tone: "rose" },
  { name: "Jiro Tanaka", org: "Tidepool Inc.", type: "KYC", age: "12h", tone: "rose" },
  { name: "Rock & Ore", org: "Rock & Ore", type: "KYB", age: "1d", tone: "amber" },
] as const

export function AdminOverviewPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-[12px] text-gray-500">Friday, June 30 · 09:14 UTC</div>
          <h1 className="font-semibold text-3xl leading-none tracking-tight mt-1">
            Platform overview.
          </h1>
          <p className="text-[13px] text-gray-600 mt-1">
            All systems nominal — 12 active risk cases, 37 KYC reviews pending.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Tag tone="amber">37 KYC pending</Tag>
          <Tag tone="rose">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />
            12 risk cases
          </Tag>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        {KPIS.map((s) => (
          <div key={s.label} className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-[11.5px] text-gray-500">{s.label}</div>
            <div className="mt-1 flex items-baseline justify-between gap-1">
              <div className="font-semibold text-[24px] leading-none tracking-tight tabular-nums">{s.value}</div>
              <Delta value={s.delta} />
            </div>
            <div className="mt-2 h-7">
              <Sparkline data={s.spark} stroke={s.color} height={28} />
            </div>
            <div className="mt-1 text-[11px] text-gray-500">{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Platform volume chart */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Platform volume" subtitle="Daily payment volume · last 30 days" />
          <div className="mt-3">
            <AreaChart
              data={Array.from({ length: 30 }, (_, i) => 0.8 + i * 0.015 + Math.sin(i / 4) * 0.06)}
              labels={["Jun 1", "Jun 8", "Jun 15", "Jun 22", "Jun 29"]}
              height={200}
              currency={false}
            />
          </div>
        </div>

        {/* System health */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="System health" subtitle="All regions" />
          <div className="mt-3 space-y-2.5">
            {[
              { svc: "API gateway", p99: "42ms", uptime: "99.999%", tone: "green" },
              { svc: "Payment rails", p99: "118ms", uptime: "99.98%", tone: "green" },
              { svc: "KYC / AML", p99: "1.2s", uptime: "99.72%", tone: "amber" },
              { svc: "FX pricing", p99: "28ms", uptime: "99.999%", tone: "green" },
              { svc: "Data warehouse", p99: "—", uptime: "99.9%", tone: "green" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-[12.5px]">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    s.tone === "green" ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
                <span className="flex-1 font-medium">{s.svc}</span>
                <span className="text-gray-500 font-mono text-[11.5px]">{s.p99}</span>
                <Tag tone={s.tone as "green" | "amber"}>{s.uptime}</Tag>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Incidents" subtitle="Active · 2 open" />
          <div className="mt-3 space-y-2.5">
            {INCIDENTS.map((r, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[12.5px] font-medium">{r.title}</div>
                  <Tag tone={r.tone as "amber" | "brand"} className="shrink-0">{r.severity}</Tag>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Since {r.since}</div>
              </div>
            ))}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12.5px] text-emerald-700 font-medium">
              ✓ All payment rails operational
            </div>
          </div>
        </div>

        {/* Recent signups */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Recent signups" subtitle="Last 24 hours" />
          <div className="mt-3 space-y-2.5">
            {SIGNUPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <AvatarBadge name={s.name} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium truncate">{s.name}</div>
                  <div className="text-[11px] text-gray-500 truncate">{s.org} · {s.plan}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-medium">{s.arr}</div>
                  <div className="text-[11px] text-gray-500">{s.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue mix */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Revenue mix · MRR" subtitle="$8.92M" />
          <div className="mt-3 flex items-center gap-4">
            <div className="relative shrink-0">
              <DonutChart data={REVENUE_DONUT} size={120} thickness={14} />
            </div>
            <div className="flex-1 space-y-1.5 text-[12px] min-w-0">
              {REVENUE_DONUT.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: r.color }} />
                  <span className="flex-1 truncate">{r.label}</span>
                  <span className="tabular-nums shrink-0">{r.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance queue */}
        <div className="col-span-12 lg:col-span-6 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Compliance queue"
            subtitle="37 pending · 3 high priority"
            right={<Tag tone="rose">3 urgent</Tag>}
          />
          <div className="mt-3 space-y-2">
            {COMPLIANCE_QUEUE.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5 text-[12.5px]"
              >
                <AvatarBadge name={r.name} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-[11px] text-gray-500 truncate">{r.org}</div>
                </div>
                <Tag tone={r.tone as "rose" | "amber"}>{r.type}</Tag>
                <div className="text-[11px] text-gray-500 shrink-0">{r.age}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk gauge */}
        <div className="col-span-12 lg:col-span-6 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Platform risk index" subtitle="Composite score · updated hourly" />
          <div className="mt-4 flex items-center gap-6">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="38" fill="none"
                  stroke="#10B981" strokeWidth="12"
                  strokeDasharray={`${(28 / 100) * 238.76} 238.76`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center rotate-90">
                <div className="text-center">
                  <div className="font-semibold text-xl leading-none">28</div>
                  <div className="text-[10px] text-gray-500">Low</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-[12px]">
              {[
                { label: "Fraud attempts blocked", value: "1,482 today", color: "#10B981" },
                { label: "Velocity anomalies", value: "8 flagged", color: "#F59E0B" },
                { label: "Sanction hits", value: "0 today", color: "#10B981" },
                { label: "High-risk jurisdictions", value: "3 active", color: "#F59E0B" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">{r.label}</span>
                  <span className="font-medium tabular-nums" style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
