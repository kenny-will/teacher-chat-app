"use client"

import { Button } from "@/components/ui/button"
import { FlagIcon, DownloadIcon, SearchIcon } from "lucide-react"
import { AreaChart } from "@/components/meridian/charts"
import { Tag, PageHeader, SectionHeader, ProgressBar } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"

const TXNS = [
  { amount: "$245,000", rail: "Wire · USD", parties: "Northwind → Atlas", flag: "OFAC clear", status: "Approved", tone: "green", time: "09:14:22", id: "TXN-PLN-9241" },
  { amount: "$2,420,000", rail: "Wire · USD", parties: "Aurora Defense → Lockheed", flag: "Manual review", status: "Pending", tone: "amber", time: "09:13:42", id: "TXN-PLN-9240" },
  { amount: "$84,200", rail: "ACH · USD", parties: "Acme → Northwind", flag: "—", status: "Settled", tone: "green", time: "09:13:11", id: "TXN-PLN-9239" },
  { amount: "$50,000", rail: "Auto-sweep", parties: "Northwind → Treasury", flag: "—", status: "Settled", tone: "green", time: "09:12:58", id: "TXN-PLN-9238" },
  { amount: "$84,200", rail: "SEPA · EUR", parties: "Prismatic → Lumen", flag: "—", status: "Settled", tone: "green", time: "09:12:30", id: "TXN-PLN-9237" },
  { amount: "$8,400", rail: "Card · USD", parties: "Bracket → Adobe Inc.", flag: "—", status: "Authorized", tone: "green", time: "09:12:10", id: "TXN-PLN-9236" },
  { amount: "$120,000", rail: "FedNow", parties: "Spectrum → contractor", flag: "Velocity flag", status: "Holding", tone: "amber", time: "09:11:55", id: "TXN-PLN-9235" },
  { amount: "$2,800", rail: "Card · USD", parties: "Octavia → unknown MX merchant", flag: "High risk geo", status: "Blocked", tone: "rose", time: "09:11:32", id: "TXN-PLN-9234" },
  { amount: "$1,400,000", rail: "SWIFT · USD", parties: "Pinnacle → supplier", flag: "OFAC clear", status: "Settled", tone: "green", time: "09:11:18", id: "TXN-PLN-9233" },
  { amount: "$48,600", rail: "Wire · GBP", parties: "Hexagon → HMRC", flag: "—", status: "Settled", tone: "green", time: "09:10:55", id: "TXN-PLN-9232" },
] as const

const TABS = ["All · 12.4k/h", "Flagged · 14", "Pending · 42", "Blocked · 3"]

const RAIL_MIX = [
  { label: "ACH", pct: 64, vol: "$820M", color: "#2A5CFF" },
  { label: "Wires", pct: 18, vol: "$284M", color: "#0A0C12" },
  { label: "Cards", pct: 8, vol: "$92M", color: "#85A8FF" },
  { label: "RTP / FedNow", pct: 6, vol: "$42M", color: "#B7CCFF" },
  { label: "SWIFT / SEPA", pct: 4, vol: "$22M", color: "#DDE1E7" },
]

function flagTone(flag: string): "amber" | "neutral" {
  return flag === "Manual review" || flag === "Velocity flag" || flag === "High risk geo" ? "amber" : "neutral"
}

export function AdminTransactionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Platform transactions."
        subtitle="14,820 transactions/hour · 99.82% settled · $1.24B / day"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FlagIcon className="h-3.5 w-3.5" />Flagged · 14
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Export · CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Volume chart */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Volume & failures" subtitle="last 24h, by hour" />
          <div className="mt-3">
            <AreaChart
              data={Array.from({ length: 24 }, () => 40 + Math.floor(Math.random() * 30))}
              labels={["00:00", "06:00", "12:00", "18:00", "23:59"]}
              height={170}
              currency={false}
            />
          </div>
          <div className="mt-2 flex items-center gap-5 text-[11.5px] text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-blue-600" />Successful
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-gray-900" />Failed / rejected
            </span>
          </div>
        </div>

        {/* Rail mix */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Rail mix · 24h" />
          <div className="mt-3 space-y-2.5">
            {RAIL_MIX.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between text-[12px]">
                  <span>{r.label}</span>
                  <span className="tabular-nums text-gray-500">{r.pct}% · {r.vol}</span>
                </div>
                <ProgressBar value={r.pct} color={r.color} className="mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-200 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 h-9 flex-1 min-w-[260px]">
            <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 bg-transparent text-[13px] placeholder:text-gray-400 outline-none"
              placeholder="Search transactions by ID, amount, party…"
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
          <div className="col-span-2">Time / ID</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2">Rail</div>
          <div className="col-span-3">Parties</div>
          <div className="col-span-2">Risk flag</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {TXNS.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
          >
            <div className="col-span-2">
              <div className="font-medium tabular-nums">{r.time}</div>
              <div className="text-[11px] text-gray-500 font-mono">{r.id}</div>
            </div>
            <div className="col-span-2 text-right tabular-nums font-semibold">{r.amount}</div>
            <div className="col-span-2 text-gray-700">{r.rail}</div>
            <div className="col-span-3 text-gray-700 truncate">{r.parties}</div>
            <div className="col-span-2">
              <Tag tone={r.flag === "—" ? "neutral" : flagTone(r.flag)}>{r.flag}</Tag>
            </div>
            <div className="col-span-1 text-right">
              <Tag tone={r.tone as "green" | "amber" | "rose"}>{r.status}</Tag>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
