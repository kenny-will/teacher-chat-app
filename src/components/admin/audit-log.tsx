"use client"

import { Button } from "@/components/ui/button"
import { FilterIcon, DownloadIcon } from "lucide-react"
import { AreaChart } from "@/components/meridian/charts"
import { Tag, PageHeader, SectionHeader, ProgressBar } from "@/components/meridian/primitives"

const ACTORS = ["helen@northwind.co", "marcus@atlas", "system", "priya@evergreen", "owen@ops", "sara@northwind"]
const ACTIONS = ["approve.wire", "sweep.treasury", "card.freeze", "kyc.match.OFAC", "admin.role.grant", "invoice.export", "fx.execute", "login.success"]
const RESOURCES = ["wire_2pK..a4M", "sweep_T13_b7", "card_4242_0192", "case_88401", "user_dana@spectrum", "batch_2026-06", "EURUSD@0.9214", "SSO Okta"]
const REGIONS = ["us-east", "eu-west", "global", "ap-se-1"]

const EVENTS = Array.from({ length: 24 }, (_, i) => {
  const sec = String((i * 7) % 60).padStart(2, "0")
  const min = String(14 - Math.floor(i / 4)).padStart(2, "0")
  return {
    time: `09:${min}:${sec}`,
    actor: ACTORS[i % 6],
    action: ACTIONS[i % 8],
    resource: RESOURCES[i % 8],
    ip: `10.0.${i + 1}.${(i * 13) % 255}`,
    region: REGIONS[i % 4],
    result: i === 3 ? "HIT" : "OK",
    tone: i === 3 ? "rose" : "green",
  }
})

const SEVERITY_BARS = [
  { level: "INFO", count: 420412, pct: 84, color: "#2A5CFF" },
  { level: "WARN", count: 12420, pct: 14, color: "#F59E0B" },
  { level: "ERROR", count: 840, pct: 2, color: "#EF4444" },
  { level: "SECURITY", count: 24, pct: 1, color: "#0A0C12" },
]

export function AdminAuditLogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Audit log."
        subtitle="Immutable, append-only · 4.2M events / day · 7-year retention"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FilterIcon className="h-3.5 w-3.5" />Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Export SIEM
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Event rate chart */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Event rate" subtitle="last 12h · per minute" />
          <div className="mt-3">
            <AreaChart
              data={Array.from({ length: 24 }, (_, i) => 200 + 80 * Math.sin(i / 3) + Math.random() * 20)}
              labels={["-12h", "-9h", "-6h", "-3h", "now"]}
              height={150}
              currency={false}
            />
          </div>
        </div>

        {/* By severity */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="By severity" subtitle="last 24h" />
          <div className="mt-3 space-y-2.5">
            {SEVERITY_BARS.map((r) => (
              <div key={r.level}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-mono">{r.level}</span>
                  <span className="tabular-nums text-gray-500">{r.count.toLocaleString()}</span>
                </div>
                <ProgressBar value={r.pct} color={r.color} className="mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Live stream table */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200">
            <div>
              <h3 className="text-[14.5px] font-semibold tracking-tight">Live stream</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">4 events / second</p>
            </div>
            <div className="flex items-center gap-2">
              <Tag tone="green">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </Tag>
              <Button variant="outline" size="sm">Pause</Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
            <div className="col-span-1">Time</div>
            <div className="col-span-2">Actor</div>
            <div className="col-span-2">Action</div>
            <div className="col-span-3">Resource</div>
            <div className="col-span-1">IP</div>
            <div className="col-span-2">Region</div>
            <div className="col-span-1 text-right">Result</div>
          </div>

          {EVENTS.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-5 py-2 items-center text-[12px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition font-mono"
            >
              <div className="col-span-1 text-gray-500">{r.time}</div>
              <div className="col-span-2 text-gray-900 truncate">{r.actor}</div>
              <div className="col-span-2 text-gray-700">{r.action}</div>
              <div className="col-span-3 text-gray-500 truncate">{r.resource}</div>
              <div className="col-span-1 text-gray-500">{r.ip}</div>
              <div className="col-span-2 text-gray-500">{r.region}</div>
              <div className="col-span-1 text-right">
                <Tag tone={r.tone as "green" | "rose"}>{r.result}</Tag>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
