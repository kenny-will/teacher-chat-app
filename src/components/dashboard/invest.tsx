"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, RefreshCwIcon } from "lucide-react"
import { CandleChart } from "@/components/meridian/charts"
import { Delta, Tag, PageHeader, SectionHeader, Divider, ProgressBar } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"

function makeCandleData(length: number) {
  return Array.from({ length }, (_, i) => {
    const base = 100 + i * 0.6 + Math.sin(i / 4) * 5
    const o = base + (Math.random() - 0.5) * 2.5
    const c = base + (Math.random() - 0.3) * 3
    const h = Math.max(o, c) + Math.random() * 1.8
    const l = Math.min(o, c) - Math.random() * 1.8
    return { o, c, h, l }
  })
}

const ASSET_MIX = [
  { label: "Treasuries", actual: "52%", target: "target 50%", color: "#2A5CFF", trend: "green", diff: "+2%" },
  { label: "Equities", actual: "22%", target: "target 25%", color: "#0A0C12", trend: "rose", diff: "-3%" },
  { label: "Credit / MMF", actual: "17%", target: "target 15%", color: "#85A8FF", trend: "green", diff: "+2%" },
  { label: "FX reserves", actual: "9%", target: "target 10%", color: "#B7CCFF", trend: "rose", diff: "-1%" },
] as const

const HOLDINGS = [
  { name: "US T-Bill 13-week", sym: "TB13W", price: "$99.42", qty: "2,800", value: "$278,376", cost: "$278,000", pl: "+0.14%", alloc: 51.4 },
  { name: "US T-Bill 4-week", sym: "TB4W", price: "$99.84", qty: "120", value: "$11,981", cost: "$11,980", pl: "+0.01%", alloc: 2.2 },
  { name: "Vanguard S&P 500", sym: "VOO", price: "$542.40", qty: "220", value: "$119,328", cost: "$110,000", pl: "+8.48%", alloc: 22.0 },
  { name: "Apple Inc.", sym: "AAPL", price: "$214.50", qty: "40", value: "$8,580", cost: "$8,000", pl: "+7.25%", alloc: 1.6 },
  { name: "Microsoft", sym: "MSFT", price: "$418.21", qty: "12", value: "$5,018", cost: "$4,800", pl: "+4.54%", alloc: 0.9 },
  { name: "Investment-Grade Bond ETF", sym: "LQD", price: "$108.40", qty: "780", value: "$84,552", cost: "$83,200", pl: "+1.62%", alloc: 15.6 },
  { name: "EUR/USD reserve", sym: "FX", price: "1.0850", qty: "—", value: "$32,580", cost: "$32,640", pl: "-0.18%", alloc: 6.0 },
  { name: "GBP/USD reserve", sym: "FX", price: "1.2710", qty: "—", value: "$1,765", cost: "$1,772", pl: "-0.39%", alloc: 0.3 },
]

export function InvestPage() {
  return (
    <>
      <PageHeader
        eyebrow="Markets"
        title="Investments."
        subtitle="Treasuries, equities, credit. Auto-rebalanced to your policy."
        actions={
          <>
            <Button variant="outline" size="sm">Policy</Button>
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />New trade
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Portfolio chart */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-[11.5px] text-gray-500">Portfolio value · USD</div>
              <div className="font-semibold text-[44px] leading-none tracking-tight mt-1 tabular-nums">
                $542,180.<span className="text-gray-400">00</span>
              </div>
              <div className="mt-1 text-[12px] flex items-center gap-1.5">
                <Delta value={4.84} /><span className="text-gray-500">total return · YTD</span>
              </div>
            </div>
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shrink-0">
              {["1D", "1W", "1M", "1Y", "All"].map((p) => (
                <button key={p} className="h-8 px-3 rounded-md text-[12.5px] font-medium text-gray-600 hover:text-gray-900 transition">
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <CandleChart data={makeCandleData(40)} height={220} />
          </div>
        </div>

        {/* Asset mix */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Asset mix" subtitle="vs. policy target" />
          <div className="mt-4 space-y-3">
            {ASSET_MIX.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span>{r.label}</span>
                  <span className="flex items-center gap-2 tabular-nums">
                    <span className="font-medium">{r.actual}</span>
                    <Tag tone={r.trend as "green" | "rose"}>{r.diff}</Tag>
                  </span>
                </div>
                <ProgressBar
                  value={parseInt(r.actual)}
                  color={r.color}
                  className="mt-1.5"
                />
                <div className="text-[10.5px] text-gray-500 mt-1">{r.target}</div>
              </div>
            ))}
          </div>
          <Divider className="my-4" />
          <Button variant="outline" size="sm" className="w-full justify-center gap-1.5">
            <RefreshCwIcon className="h-3.5 w-3.5" />Rebalance now
          </Button>
        </div>

        {/* Holdings table */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader
            title="Holdings"
            subtitle="14 positions"
            right={
              <div className="inline-flex rounded-lg bg-gray-100 p-1">
                {["All", "Equities", "Fixed income", "FX"].map((t, i) => (
                  <button key={t} className={cn("px-3 h-7 rounded-md text-[12px] font-medium transition", i === 0 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500")}>
                    {t}
                  </button>
                ))}
              </div>
            }
          />
          <div className="mt-3">
            <div className="grid grid-cols-12 gap-2 px-1 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
              <div className="col-span-3">Instrument</div>
              <div className="col-span-1">Symbol</div>
              <div className="col-span-1 text-right">Price</div>
              <div className="col-span-1 text-right">Qty</div>
              <div className="col-span-2 text-right">Value</div>
              <div className="col-span-1 text-right">Cost basis</div>
              <div className="col-span-1 text-right">P/L</div>
              <div className="col-span-2 text-right">Allocation</div>
            </div>
            {HOLDINGS.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 px-1 py-2.5 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
              >
                <div className="col-span-3 font-medium truncate">{r.name}</div>
                <div className="col-span-1 font-mono text-[11.5px] text-gray-500">{r.sym}</div>
                <div className="col-span-1 text-right tabular-nums">{r.price}</div>
                <div className="col-span-1 text-right tabular-nums text-gray-500">{r.qty}</div>
                <div className="col-span-2 text-right tabular-nums font-semibold">{r.value}</div>
                <div className="col-span-1 text-right tabular-nums text-gray-500">{r.cost}</div>
                <div className="col-span-1 text-right">
                  <span className={cn("tabular-nums font-medium", r.pl.startsWith("+") ? "text-emerald-600" : "text-rose-600")}>
                    {r.pl}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <ProgressBar value={r.alloc} className="ml-auto w-24" />
                  <div className="text-[10.5px] text-gray-500 mt-1 tabular-nums">{r.alloc}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
