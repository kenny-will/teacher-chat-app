"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, DownloadIcon, MoreHorizontalIcon, SearchIcon } from "lucide-react"
import { AreaChart, DonutChart, Sparkline } from "@/components/meridian/charts"
import { Delta, Tag, PageHeader, SectionHeader, AvatarBadge } from "@/components/meridian/primitives"

const KPIS = [
  { label: "Total orgs", value: "1,402", delta: 6.2, color: "#2A5CFF" },
  { label: "Active (30d)", value: "1,184", delta: 3.8, color: "#10B981" },
  { label: "Scale plan", value: "142", delta: 14.2, color: "#2A5CFF" },
  { label: "Business plan", value: "890", delta: 4.1, color: "#0A0C12" },
  { label: "Starter plan", value: "370", delta: -2.4, color: "#8A91A0" },
  { label: "Avg ARR", value: "$76k", delta: 8.9, color: "#2A5CFF" },
]

const INDUSTRY_DONUT = [
  { label: "FinTech", value: 28, color: "#2A5CFF" },
  { label: "SaaS / Tech", value: 22, color: "#0A0C12" },
  { label: "Professional Svcs", value: 18, color: "#85A8FF" },
  { label: "E-commerce", value: 14, color: "#B7CCFF" },
  { label: "Other", value: 18, color: "#DDE1E7" },
]

const ORGS = [
  { name: "Aurora Defense", industry: "Defense / Gov't", plan: "Scale", users: 28, arr: "$2.4M", health: "green", hq: "US" },
  { name: "Northwind Inc.", industry: "SaaS", plan: "Scale", users: 8, arr: "$412k", health: "green", hq: "US" },
  { name: "Atlas Labs", industry: "FinTech", plan: "Business", users: 14, arr: "$180k", health: "green", hq: "US" },
  { name: "Bracket Studios", industry: "Media", plan: "Scale", users: 12, arr: "$280k", health: "green", hq: "UK" },
  { name: "Spectrum AI", industry: "AI / ML", plan: "Business", users: 6, arr: "$58k", health: "green", hq: "SG" },
  { name: "Prismatic", industry: "Professional Svcs", plan: "Business", users: 4, arr: "—", health: "amber", hq: "FR" },
  { name: "Octavia", industry: "E-commerce", plan: "Business", users: 9, arr: "$94k", health: "amber", hq: "MX" },
  { name: "Hexagon Labs", industry: "Biotech", plan: "Business", users: 11, arr: "$120k", health: "green", hq: "US" },
] as const

export function AdminOrgsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Identity"
        title="Organizations."
        subtitle="1,402 organizations across 41 countries · $107M platform ARR"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />Add org
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
              <span className="font-semibold text-[24px] leading-none tracking-tight tabular-nums">{k.value}</span>
              <Delta value={k.delta} />
            </div>
            <div className="mt-2 h-6">
              <Sparkline data={Array.from({ length: 12 }, () => 50 + Math.random() * 30)} stroke={k.color} height={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Growth chart */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Organization growth" subtitle="New orgs · last 12 months" />
          <div className="mt-3">
            <AreaChart
              data={[88, 96, 102, 110, 118, 124, 130, 138, 148, 156, 166, 180]}
              labels={["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
              height={180}
              currency={false}
            />
          </div>
        </div>

        {/* Industry mix */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="By industry" />
          <div className="mt-3 flex items-center gap-4">
            <div className="shrink-0">
              <DonutChart data={INDUSTRY_DONUT} size={120} thickness={14} />
            </div>
            <div className="flex-1 space-y-1.5 text-[12px] min-w-0">
              {INDUSTRY_DONUT.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: r.color }} />
                  <span className="flex-1 truncate">{r.label}</span>
                  <span className="tabular-nums shrink-0">{r.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top orgs table */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white">
          <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-200">
            <h3 className="text-[14.5px] font-semibold tracking-tight">Top organizations</h3>
            <div className="ml-auto flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 h-9 w-64">
              <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
              <input className="flex-1 bg-transparent text-[13px] placeholder:text-gray-400 outline-none" placeholder="Search organizations…" />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
            <div className="col-span-3">Organization</div>
            <div className="col-span-2">Industry</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-1 text-right">Users</div>
            <div className="col-span-1">HQ</div>
            <div className="col-span-1">Health</div>
            <div className="col-span-2 text-right">ARR</div>
          </div>
          {ORGS.map((o, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
            >
              <div className="col-span-3 flex items-center gap-2.5">
                <AvatarBadge name={o.name} size={30} />
                <span className="font-medium truncate">{o.name}</span>
              </div>
              <div className="col-span-2 text-gray-600 truncate">{o.industry}</div>
              <div className="col-span-2">
                <Tag tone={o.plan === "Scale" ? "brand" : "neutral"}>{o.plan}</Tag>
              </div>
              <div className="col-span-1 text-right tabular-nums">{o.users}</div>
              <div className="col-span-1 text-gray-500 font-mono text-[11.5px]">{o.hq}</div>
              <div className="col-span-1">
                <span className={`h-2 w-2 rounded-full inline-block ${o.health === "green" ? "bg-emerald-500" : "bg-amber-500"}`} />
              </div>
              <div className="col-span-2 text-right tabular-nums font-semibold flex items-center justify-end gap-2">
                <span>{o.arr}</span>
                <button className="text-gray-400 hover:text-gray-700">
                  <MoreHorizontalIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
