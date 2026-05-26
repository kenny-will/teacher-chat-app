"use client"

import { useState } from "react"
import { SearchIcon, DownloadIcon, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sparkline } from "@/components/meridian/charts"
import { Tag, PageHeader } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useServerData } from "@/hooks/use-server-data"
import { queryTransactions } from "@/modules/financial/application/queries/financial.queries"

type Txn = Awaited<ReturnType<typeof queryTransactions>>[number]

function parseAmt(s: string): number {
  return parseFloat(s.replace(/[^0-9.]/g, "")) || 0
}

function sparks(seed: number) {
  return Array.from({ length: 20 }, (_, i) => 20 + ((seed * (i + 1) * 7) % 40))
}

function TxnIcon({ txn }: { txn: Txn }) {
  const cls = cn(
    "h-8 w-8 rounded-md grid place-items-center shrink-0 text-[13px]",
    txn.direction === "inbound"
      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
      : txn.direction === "outbound"
      ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600"
      : "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  )
  return (
    <div className={cls}>
      {txn.direction === "inbound" ? "↓" : txn.direction === "outbound" ? "↑" : "⚡"}
    </div>
  )
}

export function TransactionsPage() {
  const { data: txns, isLoading, refetch } = useServerData(() => queryTransactions(), [])
  const [tab, setTab]       = useState<"all" | "in" | "out" | "pending">("all")
  const [search, setSearch] = useState("")

  const all = txns ?? []

  const inCount   = all.filter(t => t.direction === "inbound").length
  const outCount  = all.filter(t => t.direction !== "inbound").length
  const pendCount = all.filter(t => t.statusTone === "amber").length

  const totalInflow  = all.filter(t => t.direction === "inbound").reduce((s, t) => s + parseAmt(t.amount), 0)
  const totalOutflow = all.filter(t => t.direction !== "inbound").reduce((s, t) => s + parseAmt(t.amount), 0)
  const totalPending = all.filter(t => t.statusTone === "amber").reduce((s, t) => s + parseAmt(t.amount), 0)

  const SUMMARY = [
    { label: "Inflow",       value: `$${totalInflow.toLocaleString("en-US",  { minimumFractionDigits: 2 })}`, color: "#2A5CFF", seed: 1 },
    { label: "Outflow",      value: `$${totalOutflow.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "#0A0C12", seed: 2 },
    { label: "Pending",      value: `$${totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "#F59E0B", seed: 3 },
    { label: "Transactions", value: all.length.toString(),                                                    color: "#10B981", seed: 4 },
  ]

  const TABS = [
    { value: "all",     label: `All · ${all.length}` },
    { value: "in",      label: `In · ${inCount}` },
    { value: "out",     label: `Out · ${outCount}` },
    { value: "pending", label: `Pending · ${pendCount}` },
  ]

  const filtered = all.filter(t => {
    if (tab === "in")      return t.direction === "inbound"
    if (tab === "out")     return t.direction !== "inbound"
    if (tab === "pending") return t.statusTone === "amber"
    return true
  }).filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.amount.toLowerCase().includes(q) ||
      (t.accountRef ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="Transactions."
        subtitle="Every dollar in and out — across all accounts and rails."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={refetch}>
              <RefreshCwIcon className="h-3.5 w-3.5" />Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Export
            </Button>
          </>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        {SUMMARY.map((item) => (
          <div key={item.label} className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
            <div className="text-[11.5px] text-gray-500 dark:text-gray-400">{item.label}</div>
            <div className="mt-1 font-semibold text-[24px] leading-none tracking-tight tabular-nums">
              {isLoading ? <span className="text-gray-300 dark:text-white/20">—</span> : item.value}
            </div>
            <div className="mt-3 h-7">
              <Sparkline data={sparks(item.seed)} stroke={item.color} height={28} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
        {/* Toolbar */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-white/10 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-9 flex-1 min-w-[240px]">
            <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 bg-transparent text-[13px] placeholder:text-gray-400 outline-none"
              placeholder="Filter by description, vendor, amount…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-white/10 p-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value as typeof tab)}
                className={cn(
                  "px-3 h-7 rounded-md text-[12px] font-medium transition whitespace-nowrap",
                  tab === t.value
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100 dark:border-white/8">
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Account</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Amount</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-white/8 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-gray-400 dark:text-gray-500">
            {all.length === 0
              ? "No transactions yet — your instructor will fund your account."
              : "No transactions match this filter."}
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 dark:border-white/8 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              <div className="col-span-4 flex items-center gap-2.5">
                <TxnIcon txn={r} />
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.description}</div>
                </div>
              </div>
              <div className="col-span-2 text-gray-500 dark:text-gray-400 text-[11.5px] truncate">{r.category}</div>
              <div className="col-span-2 text-gray-700 dark:text-gray-300 truncate">{r.accountRef ?? "—"}</div>
              <div className="col-span-2 text-gray-500 dark:text-gray-400">{r.transactionDate}</div>
              <div className={cn(
                "col-span-1 text-right tabular-nums font-semibold",
                r.amount.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white",
              )}>
                {r.amount}
              </div>
              <div className="col-span-1 text-right">
                <Tag tone={r.statusTone as "green" | "rose" | "brand" | "amber" | "neutral"}>{r.status}</Tag>
              </div>
            </div>
          ))
        )}

        <div className="px-5 py-3 text-[12px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/8">
          {isLoading ? "Loading…" : `Showing ${filtered.length} of ${all.length} transactions`}
        </div>
      </div>
    </>
  )
}
