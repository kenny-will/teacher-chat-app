"use client"

import { Button } from "@/components/ui/button"
import { Settings2Icon, RefreshCwIcon } from "lucide-react"
import { AreaChart, Sparkline } from "@/components/meridian/charts"
import { Delta, Tag, PageHeader, SectionHeader, Divider, ProgressBar } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"

const KPI_STRIP = [
  { label: "Swept balance", value: "$842,180", delta: 5.21, color: "#2A5CFF" },
  { label: "Blended APY", value: "5.21%", delta: 0.08, color: "#10B981" },
  { label: "Earned · MTD", value: "$3,628.40", delta: 6.4, color: "#2A5CFF" },
  { label: "Liquidity available", value: "$842k", delta: null, color: "#0A0C12" },
] as const

const LADDER = [
  { name: "4-week T-bill", sym: "TB4W", amount: "$200,000", maturity: "Jul 28, 2026", apy: "5.42%", pct: 60 },
  { name: "8-week T-bill", sym: "TB8W", amount: "$180,000", maturity: "Aug 25, 2026", apy: "5.32%", pct: 48 },
  { name: "13-week T-bill", sym: "TB13W", amount: "$280,000", maturity: "Sep 29, 2026", apy: "5.21%", pct: 35 },
  { name: "26-week T-bill", sym: "TB26W", amount: "$120,000", maturity: "Dec 29, 2026", apy: "5.04%", pct: 12 },
  { name: "Partner bank · MMF", sym: "—", amount: "$62,180", maturity: "Open", apy: "4.86%", pct: 100 },
]

const ACTIVITY = [
  { label: "Auto-sweep", detail: "+$120,000 → 4w T-bill", date: "Today 04:00", tone: "brand" },
  { label: "Auto-roll", detail: "$200,000 13w → 13w", date: "Today 04:00", tone: "brand" },
  { label: "Withdrawal", detail: "−$50,000 → operating", date: "Jun 29 16:42", tone: "neutral" },
  { label: "Yield credit", detail: "+$182.40 interest", date: "Jun 29 23:59", tone: "green" },
  { label: "Auto-sweep", detail: "+$84,200 → 13w T-bill", date: "Jun 28 04:00", tone: "brand" },
  { label: "Maturity", detail: "$120,000 4w → cash", date: "Jun 28 04:00", tone: "green" },
] as const

export function TreasuryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Treasury"
        title="Cash, working overnight."
        subtitle="Set a target operating balance. Sweep the rest into T-bills, MMF, or partner banks. Liquidity stays one click away."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings2Icon className="h-3.5 w-3.5" />Sweep rules
            </Button>
            <Button size="sm" className="gap-1.5">
              <RefreshCwIcon className="h-3.5 w-3.5" />Rebalance
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* KPI strip */}
        {KPI_STRIP.map((k) => (
          <div key={k.label} className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-[11.5px] text-gray-500">{k.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-semibold text-[26px] leading-none tracking-tight tabular-nums">{k.value}</span>
              {k.delta !== null && <Delta value={k.delta} />}
            </div>
            <div className="mt-3 h-7">
              <Sparkline
                data={Array.from({ length: 16 }, (_, i) => 100 + i * 4 + Math.random() * 3)}
                stroke={k.color}
                height={28}
              />
            </div>
          </div>
        ))}

        {/* Yield ladder */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Yield ladder"
            subtitle="T-bill rungs, auto-rolling"
            right={<Tag tone="brand">Auto-roll on</Tag>}
          />
          <div className="mt-4 space-y-2.5">
            {LADDER.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-[12.5px]"
              >
                <div className="col-span-3 font-medium">{r.name}</div>
                <div className="col-span-1 font-mono text-[11.5px] text-gray-500">{r.sym}</div>
                <div className="col-span-2 tabular-nums">{r.amount}</div>
                <div className="col-span-2 text-gray-500">Matures {r.maturity}</div>
                <div className="col-span-1 tabular-nums font-semibold text-blue-600">{r.apy}</div>
                <div className="col-span-3">
                  <ProgressBar value={r.pct} />
                  <div className="text-[10.5px] text-gray-500 mt-1">{r.pct}% to maturity</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sweep policy */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Sweep policy" />
          <div className="mt-3 space-y-3">
            <div>
              <div className="text-[11.5px] text-gray-500">Target operating balance</div>
              <div className="font-semibold text-[28px] leading-none tracking-tight mt-1 tabular-nums">
                $200,000
              </div>
            </div>
            <div>
              <div className="text-[12px] text-gray-500 mb-2">Sweep above target into</div>
              <div className="rounded-lg border border-gray-200 p-3 text-[12.5px] space-y-1">
                {[
                  ["4-week T-bill ladder", "40%"],
                  ["13-week T-bill ladder", "35%"],
                  ["Partner bank MMF", "25%"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span>{k}</span>
                    <span className="tabular-nums font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[12px]">
                <span>Liquidity buffer · same-day</span>
                <span className="font-medium text-gray-900 tabular-nums">15%</span>
              </div>
              <ProgressBar value={15} className="mt-1.5" />
            </div>
            <Button variant="outline" size="sm" className="w-full justify-center">
              Edit policy
            </Button>
          </div>
        </div>

        {/* Yield over time */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Yield over time" subtitle="Daily, last 90 days" />
          <div className="mt-3">
            <AreaChart
              data={Array.from({ length: 30 }, (_, i) => 5.0 + Math.sin(i / 4) * 0.05 + i * 0.007)}
              labels={["90d", "60d", "30d", "today"]}
              height={180}
              currency={false}
            />
          </div>
        </div>

        {/* Sweep activity */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Sweep activity" subtitle="Last 7 days" />
          <div className="mt-3">
            {ACTIVITY.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 text-[12.5px]"
              >
                <div className="flex items-center gap-2.5">
                  <Tag tone={r.tone as "brand" | "neutral" | "green"}>{r.label}</Tag>
                  <span className="text-gray-700">{r.detail}</span>
                </div>
                <span className="text-gray-500 shrink-0 ml-2">{r.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
