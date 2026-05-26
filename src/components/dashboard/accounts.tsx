"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DownloadIcon, RefreshCwIcon, WalletIcon, MoreHorizontalIcon } from "lucide-react"
import { AreaChart } from "@/components/meridian/charts"
import { Tag, PageHeader, SectionHeader, Divider, ProgressBar } from "@/components/meridian/primitives"
import { useServerData } from "@/hooks/use-server-data"
import { queryAccounts, queryBalanceOverview } from "@/modules/financial/application/queries/financial.queries"

type Account = Awaited<ReturnType<typeof queryAccounts>>[number]

const CRYPTO_SYMBOLS = new Set(["BTC", "ETH", "TRX", "USDT", "USDC", "SOL", "BNB"])
const CRYPTO_USD_RATES: Record<string, number> = {
  BTC: 70000, ETH: 3500, TRX: 0.152, USDT: 1, USDC: 1, SOL: 180, BNB: 600,
}

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", SGD: "🇸🇬", JPY: "🇯🇵", AUD: "🇦🇺",
  BTC: "₿", ETH: "Ξ", TRX: "♦", USDT: "₮", USDC: "₵", SOL: "◎",
}

const STATUS_TONE = { active: "green", earning: "brand", pending: "amber" } as const

function fmtBalance(account: Account): string {
  const n = parseFloat(account.balance) || 0
  if (CRYPTO_SYMBOLS.has(account.currency)) {
    return `${account.currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 8 })}`
  }
  return `${account.currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function toUSD(account: Account): number {
  const n = parseFloat(account.balance) || 0
  if (CRYPTO_SYMBOLS.has(account.currency)) {
    return n * (CRYPTO_USD_RATES[account.currency] ?? 0)
  }
  // Approximate FX rates for demo
  const FX: Record<string, number> = { USD: 1, EUR: 1.08, GBP: 1.27, SGD: 0.74 }
  return n * (FX[account.currency] ?? 1)
}

function buildFxBars(accounts: Account[]) {
  const totals: Record<string, number> = {}
  for (const a of accounts) {
    const usd = toUSD(a)
    const group = CRYPTO_SYMBOLS.has(a.currency) ? a.currency : a.currency
    totals[group] = (totals[group] ?? 0) + usd
  }
  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0) || 1
  const COLORS = ["#2A5CFF", "#0A0C12", "#85A8FF", "#B7CCFF", "#DDE1E7", "#10B981", "#F59E0B"]
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cur, usdAmt], i) => ({
      label: `${CURRENCY_FLAGS[cur] ?? ""} ${cur}`,
      value: `$${usdAmt.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      pct: Math.round((usdAmt / grandTotal) * 100),
      color: COLORS[i] ?? "#DDE1E7",
    }))
}

export function AccountsPage() {
  const { data: accounts, isLoading: accsLoading, refetch } = useServerData(() => queryAccounts(), [])
  const { data: balance, isLoading: balLoading } = useServerData(() => queryBalanceOverview(), [])
  const [chartPeriod, setChartPeriod] = useState<"1W" | "1M" | "3M">("1M")

  const isLoading = accsLoading || balLoading
  const allAccounts = accounts ?? []

  const combinedUsd = allAccounts.reduce((s, a) => s + toUSD(a), 0)
  const fxBars = buildFxBars(allAccounts)

  const chartData = balance?.balanceChartData?.[chartPeriod] ?? []
  const apy = balance?.yieldApy ? parseFloat(balance.yieldApy) : 0

  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="All accounts."
        subtitle={
          isLoading
            ? "Loading accounts…"
            : `${allAccounts.length} account${allAccounts.length !== 1 ? "s" : ""} across ${new Set(allAccounts.map(a => a.currency)).size} currencies.`
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={refetch}>
              <RefreshCwIcon className="h-3.5 w-3.5" />Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Statements
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Combined balance + chart */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11.5px] text-gray-500 dark:text-gray-400">Combined balance · USD equiv.</div>
              <div className="font-semibold text-[44px] leading-none tracking-tight tabular-nums mt-1 dark:text-white">
                {isLoading
                  ? <span className="text-gray-300 dark:text-white/20">—</span>
                  : `$${combinedUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
              {apy > 0 && (
                <div className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
                  Sweep generating{" "}
                  <span className="text-gray-900 dark:text-white font-semibold">
                    ${((combinedUsd * apy / 100) / 365).toFixed(2)} / day
                  </span>{" "}
                  at {apy.toFixed(2)}% APY
                </div>
              )}
            </div>
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent p-1 shrink-0">
              {(["1W", "1M", "3M"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`h-8 px-3 rounded-md text-[12.5px] font-medium transition ${
                    chartPeriod === p
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            {chartData.length > 0 ? (
              <AreaChart data={chartData} labels={[]} height={180} />
            ) : (
              <div className="h-[180px] flex items-end justify-center text-[12px] text-gray-400 dark:text-gray-600">
                {isLoading ? "Loading chart…" : "No chart data yet — seed demo data from the admin panel."}
              </div>
            )}
          </div>
        </div>

        {/* Currency exposure */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader title="Currency exposure" subtitle="Notional in USD equiv." />
          {isLoading ? (
            <div className="mt-3 space-y-3 animate-pulse">
              {[0, 1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-100 dark:bg-white/10 rounded" />)}
            </div>
          ) : fxBars.length === 0 ? (
            <div className="mt-6 text-center text-[12px] text-gray-400 dark:text-gray-600">No accounts yet.</div>
          ) : (
            <div className="mt-3 space-y-2.5">
              {fxBars.map((r, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="dark:text-gray-300">{r.label}</span>
                    <span className="tabular-nums font-medium dark:text-white">{r.value}</span>
                  </div>
                  <ProgressBar value={r.pct} color={r.color} className="mt-1.5" />
                </div>
              ))}
            </div>
          )}
          <Divider className="my-4" />
          <div className="text-[11.5px] text-gray-400 dark:text-gray-500 text-center">
            {allAccounts.length} active accounts
          </div>
        </div>

        {/* Account list */}
        <div className="col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
            <h3 className="text-[14.5px] font-semibold tracking-tight dark:text-white">Account list</h3>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100 dark:border-white/8">
            <div className="col-span-3">Account</div>
            <div className="col-span-2">Bank / Network</div>
            <div className="col-span-2">Routing / Address</div>
            <div className="col-span-2 text-right">Balance</div>
            <div className="col-span-1 text-right">APY</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-white/8 rounded-lg" />
              ))}
            </div>
          ) : allAccounts.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-gray-400 dark:text-gray-500">
              No accounts yet — your instructor will set up your accounts.
            </div>
          ) : (
            allAccounts.map((a) => {
              const apyVal = parseFloat(a.apy ?? "0")
              const isCrypto = CRYPTO_SYMBOLS.has(a.currency)
              return (
                <div
                  key={a.id}
                  className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 dark:border-white/8 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  <div className="col-span-3 flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-md grid place-items-center text-[13px] shrink-0 ${
                      isCrypto
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                    }`}>
                      {isCrypto ? CURRENCY_FLAGS[a.currency] ?? "₿" : <WalletIcon className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate dark:text-white">{a.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">•••• {a.lastFour}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-gray-700 dark:text-gray-300 truncate">{a.bankName}</div>
                  <div className="col-span-2 text-gray-500 dark:text-gray-400 font-mono text-[11px] truncate">
                    {a.routing ?? "—"}
                  </div>
                  <div className="col-span-2 text-right tabular-nums font-semibold dark:text-white">
                    {fmtBalance(a)}
                  </div>
                  <div className="col-span-1 text-right tabular-nums text-gray-600 dark:text-gray-400">
                    {apyVal > 0 ? `${apyVal.toFixed(2)}%` : "—"}
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-2">
                    <Tag tone={STATUS_TONE[a.status as keyof typeof STATUS_TONE] ?? "neutral"}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Tag>
                    <button className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
                      <MoreHorizontalIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}

          <div className="px-5 py-3 text-[12px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/8">
            {isLoading ? "Loading…" : `${allAccounts.length} account${allAccounts.length !== 1 ? "s" : ""} total`}
          </div>
        </div>
      </div>
    </>
  )
}
