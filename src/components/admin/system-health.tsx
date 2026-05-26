"use client"

import { AreaChart, Sparkline } from "@/components/meridian/charts"
import { Delta, Tag, PageHeader, SectionHeader } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"

const SERVICES = [
  { name: "API Gateway", region: "global", p50: "12ms", p99: "42ms", uptime: "99.999%", status: "green", spark: [12, 11, 13, 14, 12, 13, 11, 12, 13, 14, 12, 42] },
  { name: "Payment rails", region: "us-east-1", p50: "48ms", p99: "118ms", uptime: "99.98%", status: "green", spark: [48, 46, 50, 52, 48, 49, 47, 48, 50, 51, 49, 118] },
  { name: "KYC / AML", region: "us-east-1", p50: "420ms", p99: "1.2s", uptime: "99.72%", status: "amber", spark: [380, 400, 420, 440, 800, 1200, 420, 400, 380, 360, 380, 420] },
  { name: "FX Pricing Engine", region: "global", p50: "8ms", p99: "28ms", uptime: "99.999%", status: "green", spark: [8, 9, 8, 10, 8, 9, 8, 9, 10, 8, 9, 28] },
  { name: "Data Warehouse", region: "us-east-1", p50: "—", p99: "—", uptime: "99.9%", status: "green", spark: [100, 102, 98, 100, 104, 100, 98, 100, 102, 100, 100, 100] },
  { name: "Notification Service", region: "global", p50: "22ms", p99: "84ms", uptime: "99.995%", status: "green", spark: [22, 24, 20, 22, 24, 22, 20, 21, 22, 23, 22, 84] },
  { name: "Auth / SSO", region: "global", p50: "18ms", p99: "62ms", uptime: "99.999%", status: "green", spark: [18, 19, 18, 20, 18, 19, 17, 18, 19, 20, 18, 62] },
  { name: "Webhook Delivery", region: "us-east-1", p50: "140ms", p99: "820ms", uptime: "99.94%", status: "amber", spark: [140, 150, 160, 200, 820, 400, 200, 180, 160, 150, 145, 140] },
  { name: "Search / Index", region: "us-east-1", p50: "28ms", p99: "96ms", uptime: "99.97%", status: "green", spark: [28, 30, 28, 32, 28, 30, 28, 29, 30, 31, 28, 96] },
]

const KPIS = [
  { label: "Overall uptime · 30d", value: "99.989%", delta: 0.002, color: "#10B981" },
  { label: "API p99 latency", value: "42ms", delta: -3.4, color: "#2A5CFF" },
  { label: "Error rate · 24h", value: "0.018%", delta: -12, color: "#10B981" },
  { label: "Deployments today", value: "4", delta: 0, color: "#0A0C12" },
  { label: "Alerts fired · 24h", value: "12", delta: -28, color: "#10B981" },
  { label: "Active incidents", value: "2", delta: 0, color: "#F59E0B" },
]

const REGIONS = [
  { name: "us-east-1", status: "green", p99: "42ms", traffic: "68%" },
  { name: "eu-west-1", status: "amber", p99: "64ms", traffic: "22%" },
  { name: "ap-southeast-1", status: "green", p99: "88ms", traffic: "10%" },
] as const

export function AdminSystemPage() {
  return (
    <>
      <PageHeader
        eyebrow="Infrastructure"
        title="System health."
        subtitle="Real-time service map, per-region latency, and incident management."
      />

      {/* KPIs */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        {KPIS.map((k) => (
          <div key={k.label} className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-[11.5px] text-gray-500">{k.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-semibold text-[22px] leading-none tracking-tight tabular-nums">{k.value}</span>
              {k.delta !== 0 && <Delta value={k.delta} />}
            </div>
            <div className="mt-2 h-6">
              <Sparkline data={Array.from({ length: 12 }, () => 50 + Math.random() * 30)} stroke={k.color} height={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Request volume chart */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Request volume" subtitle="API calls · last 24 hours" />
          <div className="mt-3">
            <AreaChart
              data={Array.from({ length: 24 }, (_, i) => 800 + Math.sin(i / 4) * 200 + Math.random() * 100)}
              labels={["00:00", "06:00", "12:00", "18:00", "23:59"]}
              height={200}
              currency={false}
            />
          </div>
        </div>

        {/* Regions */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Regions" />
          <div className="mt-3 space-y-3">
            {REGIONS.map((r) => (
              <div key={r.name} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", r.status === "green" ? "bg-emerald-500" : "bg-amber-500")} />
                    <span className="font-mono text-[13px] font-semibold">{r.name}</span>
                  </div>
                  <Tag tone={r.status as "green" | "amber"}>
                    {r.status === "green" ? "Healthy" : "Degraded"}
                  </Tag>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-gray-500">
                  <span>p99: {r.p99}</span>
                  <span>Traffic: {r.traffic}</span>
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-[12px] text-gray-500 text-center">
              + 6 more regions healthy
            </div>
          </div>
        </div>

        {/* Service map */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-[14.5px] font-semibold tracking-tight">Service map</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">9 services · 2 degraded</p>
          </div>
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
            <div className="col-span-3">Service</div>
            <div className="col-span-2">Region</div>
            <div className="col-span-1 text-right">p50</div>
            <div className="col-span-1 text-right">p99</div>
            <div className="col-span-2">Uptime</div>
            <div className="col-span-3">Latency trend</div>
          </div>
          {SERVICES.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
            >
              <div className="col-span-3 flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full shrink-0", s.status === "green" ? "bg-emerald-500" : "bg-amber-500")} />
                <span className="font-medium">{s.name}</span>
              </div>
              <div className="col-span-2 font-mono text-[11.5px] text-gray-500">{s.region}</div>
              <div className="col-span-1 text-right tabular-nums text-gray-700">{s.p50}</div>
              <div className="col-span-1 text-right tabular-nums font-medium">{s.p99}</div>
              <div className="col-span-2">
                <Tag tone={s.status as "green" | "amber"}>{s.uptime}</Tag>
              </div>
              <div className="col-span-3 h-6">
                <Sparkline
                  data={s.spark}
                  stroke={s.status === "green" ? "#10B981" : "#F59E0B"}
                  height={24}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
