"use client"

import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import { AreaChart, DonutChart } from "@/components/meridian/charts"
import { Delta, Tag, PageHeader, SectionHeader, AvatarBadge } from "@/components/meridian/primitives"

const KPIS = [
  { label: "MRR", value: "$8.92M", delta: 6.14, color: "#2A5CFF" },
  { label: "ARR", value: "$107M", delta: 6.14, color: "#2A5CFF" },
  { label: "Active subs", value: "1,402", delta: 8.2, color: "#2A5CFF" },
  { label: "Avg revenue / org", value: "$6.4k", delta: -0.4, color: "#0A0C12" },
  { label: "Churn (30d)", value: "0.42%", delta: -0.12, color: "#10B981" },
  { label: "Net expansion", value: "118%", delta: 2.4, color: "#10B981" },
]

const REVENUE_DONUT = [
  { label: "Subscriptions", value: 48, amount: "$4.28M", color: "#2A5CFF" },
  { label: "Interchange", value: 24, amount: "$2.14M", color: "#0A0C12" },
  { label: "FX spread", value: 14, amount: "$1.24M", color: "#85A8FF" },
  { label: "Treasury margin", value: 8, amount: "$714k", color: "#B7CCFF" },
  { label: "Capital interest", value: 6, amount: "$540k", color: "#DDE1E7" },
]

const INVOICES = [
  { id: "INV-2026-04-1042", org: "Northwind Inc.", period: "Jun 1 – Jun 30", plan: "Scale", amount: "$48,420", due: "Jul 30", status: "Paid", tone: "green" },
  { id: "INV-2026-04-1041", org: "Atlas Labs", period: "Jun 1 – Jun 30", plan: "Business", amount: "$8,240", due: "Jul 30", status: "Paid", tone: "green" },
  { id: "INV-2026-04-1040", org: "Aurora Defense", period: "Jun 1 – Jun 30", plan: "Scale", amount: "$84,420", due: "Jul 30", status: "Paid", tone: "green" },
  { id: "INV-2026-04-1039", org: "Prismatic SAS", period: "Jun 1 – Jun 30", plan: "Business", amount: "$12,420", due: "Jul 30", status: "Pending", tone: "amber" },
  { id: "INV-2026-04-1038", org: "Evergreen", period: "Jun 1 – Jun 30", plan: "Starter", amount: "$1,420", due: "Jul 30", status: "Paid", tone: "green" },
  { id: "INV-2026-04-1037", org: "Octavia", period: "May 1 – May 31", plan: "Business", amount: "$9,840", due: "Jun 30", status: "Overdue 4d", tone: "rose" },
  { id: "INV-2026-04-1036", org: "Bracket Studios", period: "Jun 1 – Jun 30", plan: "Scale", amount: "$24,820", due: "Jul 30", status: "Paid", tone: "green" },
  { id: "INV-2026-04-1035", org: "Spectrum AI", period: "Jun 1 – Jun 30", plan: "Business", amount: "$5,840", due: "Jul 30", status: "Paid", tone: "green" },
] as const

export function AdminBillingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Revenue"
        title="Platform billing."
        subtitle="Customer invoicing, dunning, revenue recognition"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Revenue export
            </Button>
            <Button size="sm">Run billing</Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        {KPIS.map((k) => (
          <div key={k.label} className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-[11.5px] text-gray-500">{k.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className="font-semibold text-[24px] leading-none tracking-tight tabular-nums"
                style={{ color: k.color }}
              >
                {k.value}
              </span>
            </div>
            <div className="mt-1">
              <Delta value={k.delta} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* MRR chart */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="MRR over time" subtitle="last 12 months" />
          <div className="mt-3">
            <AreaChart
              data={[4.2, 4.6, 5.0, 5.4, 5.8, 6.2, 6.6, 7.0, 7.4, 7.8, 8.4, 8.92]}
              labels={["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
              height={200}
              currency={false}
            />
          </div>
        </div>

        {/* Revenue by stream */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Revenue by stream" />
          <div className="mt-3 flex items-center gap-4">
            <div className="shrink-0">
              <DonutChart data={REVENUE_DONUT} size={140} thickness={14} />
            </div>
            <div className="flex-1 space-y-1.5 text-[12px] min-w-0">
              {REVENUE_DONUT.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: r.color }} />
                  <span className="flex-1 truncate">{r.label}</span>
                  <span className="tabular-nums shrink-0 text-gray-600">{r.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices table */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-[14.5px] font-semibold tracking-tight">Recent customer invoices</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">142 invoiced this cycle · $8.92M billed</p>
          </div>

          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
            <div className="col-span-2">Invoice</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Period</div>
            <div className="col-span-1">Plan</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1 text-right">Due</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          {INVOICES.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
            >
              <div className="col-span-2 font-mono text-[11.5px] text-gray-500 truncate">{r.id}</div>
              <div className="col-span-3 flex items-center gap-2">
                <AvatarBadge name={r.org} size={24} />
                <span className="font-medium truncate">{r.org}</span>
              </div>
              <div className="col-span-2 text-gray-700">{r.period}</div>
              <div className="col-span-1">
                <Tag tone={r.plan === "Scale" ? "brand" : "neutral"}>{r.plan}</Tag>
              </div>
              <div className="col-span-2 text-right tabular-nums font-semibold">{r.amount}</div>
              <div className="col-span-1 text-right text-gray-500">{r.due}</div>
              <div className="col-span-1 text-right">
                <Tag tone={r.tone as "green" | "amber" | "rose"}>{r.status}</Tag>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
