"use client"

import { Button } from "@/components/ui/button"
import { DownloadIcon, PlusIcon, WalletIcon, MoreHorizontalIcon } from "lucide-react"
import { AreaChart } from "@/components/meridian/charts"
import { Tag, PageHeader, SectionHeader, Divider, ProgressBar } from "@/components/meridian/primitives"

const ACCOUNTS = [
  { name: "Operating · USD", no: "•••• 4910", bank: "JPMorgan Chase", balance: 398420.11, currency: "USD", earnings: 0, status: "Active", routing: "021000021" },
  { name: "Treasury Sweep", no: "•••• 7823", bank: "Meridian + BNY", balance: 542180.0, currency: "USD", earnings: 5.21, status: "Earning", routing: "meridian-internal" },
  { name: "Payroll · USD", no: "•••• 1042", bank: "Mercury · partner", balance: 118402.91, currency: "USD", earnings: 0, status: "Active", routing: "084009519" },
  { name: "EUR Operating", no: "•••• 0091", bank: "BNP Paribas", balance: 84219.4, currency: "EUR", earnings: 0, status: "Active", routing: "IBAN FR76" },
  { name: "GBP Trade", no: "•••• 7711", bank: "HSBC", balance: 41180.0, currency: "GBP", earnings: 0, status: "Pending", routing: "40-05-30" },
  { name: "SGD Reserve", no: "•••• 2245", bank: "DBS Bank", balance: 18204.55, currency: "SGD", earnings: 3.42, status: "Earning", routing: "7171-001" },
]

const FX_BARS = [
  ["🇺🇸 USD", "$1,059,002", 82, "#2A5CFF"],
  ["🇪🇺 EUR", "$91,398", 7, "#0A0C12"],
  ["🇬🇧 GBP", "$52,298", 4, "#85A8FF"],
  ["🇸🇬 SGD", "$13,471", 1, "#B7CCFF"],
] as const

const STATUS_TONE = { Active: "green", Earning: "brand", Pending: "amber" } as const

export function AccountsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="All accounts."
        subtitle="12 active across 6 currencies. Open new accounts with local rails — ACH, SEPA, FPS, FedNow — in minutes."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Statements
            </Button>
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />Open account
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Combined balance + chart */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-[11.5px] text-gray-500">Combined balance · USD</div>
              <div className="font-semibold text-[44px] leading-none tracking-tight tabular-nums mt-1">
                $1,216,169
              </div>
              <div className="mt-1 text-[12px] text-gray-500">
                Sweep generating{" "}
                <span className="text-gray-900 font-semibold">$182.40 / day</span> at 5.21% APY
              </div>
            </div>
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shrink-0">
              {["1W", "1M", "3M"].map((p) => (
                <button key={p} className="h-8 px-3 rounded-md text-[12.5px] font-medium text-gray-600 hover:text-gray-900 transition">
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <AreaChart
              data={[1180, 1188, 1200, 1190, 1215, 1232, 1244, 1268, 1255, 1290, 1284]}
              labels={["Jun 1", "Jun 8", "Jun 15", "Jun 22", "Jun 29"]}
              height={180}
            />
          </div>
        </div>

        {/* Currency exposure */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Currency exposure" subtitle="Notional in USD" />
          <div className="mt-3 space-y-2.5">
            {FX_BARS.map((r, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span>{r[0]}</span>
                  <span className="tabular-nums font-medium">{r[1]}</span>
                </div>
                <ProgressBar value={r[2]} color={r[3]} className="mt-1.5" />
              </div>
            ))}
          </div>
          <Divider className="my-4" />
          <Button variant="outline" size="sm" className="w-full justify-center">
            Hedge FX exposure
          </Button>
        </div>

        {/* Account list table */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200">
            <h3 className="text-[14.5px] font-semibold tracking-tight">Account list</h3>
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              {["All", "USD", "Multi-currency", "Sweep"].map((t, i) => (
                <button
                  key={t}
                  className={`px-3 h-7 rounded-md text-[12px] font-medium transition ${i === 0 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
            <div className="col-span-3">Account</div>
            <div className="col-span-2">Partner bank</div>
            <div className="col-span-2">Routing / IBAN</div>
            <div className="col-span-2 text-right">Balance</div>
            <div className="col-span-1 text-right">APY</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          {ACCOUNTS.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
            >
              <div className="col-span-3 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-md bg-gray-100 grid place-items-center text-gray-600 shrink-0">
                  <WalletIcon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.name}</div>
                  <div className="text-[11px] text-gray-500 font-mono">{a.no}</div>
                </div>
              </div>
              <div className="col-span-2 text-gray-700 truncate">{a.bank}</div>
              <div className="col-span-2 text-gray-500 font-mono text-[11.5px] truncate">{a.routing}</div>
              <div className="col-span-2 text-right tabular-nums font-semibold">
                {a.currency} {a.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="col-span-1 text-right tabular-nums text-gray-600">
                {a.earnings ? a.earnings.toFixed(2) + "%" : "—"}
              </div>
              <div className="col-span-2 text-right flex items-center justify-end gap-2">
                <Tag tone={STATUS_TONE[a.status as keyof typeof STATUS_TONE]}>{a.status}</Tag>
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
