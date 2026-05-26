"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  DownloadIcon, FilterIcon, PlusIcon, RefreshCwIcon, GlobeIcon, WalletIcon,
  ArrowDownLeftIcon, ArrowUpRightIcon, BarChart3Icon, CreditCardIcon,
  TrendingUpIcon, ReceiptIcon, ZapIcon, UsersIcon, ShieldCheckIcon,
  ArrowRightIcon, CheckCircleIcon,
} from "lucide-react"
import { AreaChart, StackedBarChart, DonutChart, Sparkline } from "@/components/meridian/charts"
import { Delta, Tag, AvatarBadge, SectionHeader, Divider, ProgressBar, fmtCurrency, fmtNumber } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useServerData } from "@/hooks/use-server-data"
import { getKpiSummary } from "@/modules/analytics/application/queries/analytics.queries"
import type { KpiSummaryDTO } from "@/modules/analytics/application/dtos/dashboard-metrics.dto"
import { useAuth } from "@/contexts/auth-context"
import { useDashboardNav } from "@/contexts/dashboard-nav"
import {
  queryBalanceOverview,
  queryAccounts,
  queryTransactions,
  queryCards,
  queryOverviewSpendCategories,
  queryUpcomingPayments,
  queryActivityLogs,
  queryKpiEntries,
} from "@/modules/financial/application/queries/financial.queries"
import { useCryptoPrices } from "@/hooks/use-crypto-prices"
import { CRYPTO_SYMBOLS, CRYPTO_META } from "@/lib/crypto-config"

// ─── Utility hooks ────────────────────────────────────────────────

function useGreeting() {
  return useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }, [])
}

function useFormattedDate() {
  return useMemo(() => new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  }), [])
}

const PERIODS = ["1W", "1M", "3M", "1Y"] as const
type Period = (typeof PERIODS)[number]

// ─── Static fallback data ─────────────────────────────────────────

const FALLBACK_CHART: Record<Period, number[]> = {
  "1W": [810000, 820000, 815000, 835000, 840000, 844000, 847234],
  "1M": [620000, 670000, 695000, 710000, 720000, 748000, 778000, 800000, 820000, 835000, 847234],
  "3M": [510000, 540000, 580000, 610000, 650000, 680000, 720000, 755000, 790000, 820000, 847234],
  "1Y": [300000, 370000, 420000, 480000, 530000, 580000, 630000, 690000, 740000, 790000, 830000, 847234],
}

const FALLBACK_BALANCE = {
  currentBalance: "847234.00", balanceDelta: "8.40", balanceChangeAmount: "66201.00",
  inflowAmount: "1420500.00", inflowDelta: "12.30",
  outflowAmount: "573266.00", outflowDelta: "-4.10",
  netAmount: "847234.00",    netDelta: "21.20",
  burnRatePerDay: "19109.00", burnRateDelta: "-2.10",
  totalAccounts: 3,
  allocationData: [
    { label: "Operating", value: 45, color: "#3b82f6" },
    { label: "Savings",   value: 30, color: "#10b981" },
    { label: "Treasury",  value: 25, color: "#8b5cf6" },
  ],
  yieldApy: "5.21",
  lastRebalancedAt: "2026-05-20",
}

// CRYPTO_SYMBOLS and CRYPTO_META are imported from @/lib/crypto-config

// ─── Page nav static config (stats filled at runtime) ─────────────

const PAGE_NAV_CONFIG = [
  { view: "accounts",     label: "Accounts",     icon: WalletIcon,        iconBg: "bg-blue-50 dark:bg-blue-500/10",       iconColor: "text-blue-600 dark:text-blue-400"       },
  { view: "transactions", label: "Transactions", icon: ReceiptIcon,       iconBg: "bg-gray-100 dark:bg-white/10",         iconColor: "text-gray-700 dark:text-gray-300"       },
  { view: "deposit",      label: "Deposit",      icon: ArrowDownLeftIcon, iconBg: "bg-emerald-50 dark:bg-emerald-500/10", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { view: "withdrawal",   label: "Withdrawal",   icon: ArrowUpRightIcon,  iconBg: "bg-rose-50 dark:bg-rose-500/10",       iconColor: "text-rose-600 dark:text-rose-400"       },
  { view: "cards",        label: "Cards",        icon: CreditCardIcon,    iconBg: "bg-violet-50 dark:bg-violet-500/10",   iconColor: "text-violet-600 dark:text-violet-400"   },
  { view: "invest",       label: "Invest",       icon: TrendingUpIcon,    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",   iconColor: "text-indigo-600 dark:text-indigo-400"   },
  { view: "treasury",     label: "Treasury",     icon: ZapIcon,           iconBg: "bg-amber-50 dark:bg-amber-500/10",     iconColor: "text-amber-600 dark:text-amber-400"     },
  { view: "reports",      label: "Reports",      icon: BarChart3Icon,     iconBg: "bg-pink-50 dark:bg-pink-500/10",       iconColor: "text-pink-600 dark:text-pink-400"       },
] as const

// ─── BalanceCard ──────────────────────────────────────────────────

function BalanceCard() {
  const [period, setPeriod] = useState<Period>("1M")
  const { data: overview, isLoading } = useServerData(queryBalanceOverview)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 col-span-12 lg:col-span-8 animate-pulse">
        <div className="h-6 bg-gray-100 dark:bg-white/10 rounded w-48 mb-4" />
        <div className="h-12 bg-gray-100 dark:bg-white/10 rounded w-64 mb-2" />
        <div className="h-48 bg-gray-100 dark:bg-white/10 rounded mt-4" />
      </div>
    )
  }

  const data = overview ?? (FALLBACK_BALANCE as NonNullable<typeof overview>)
  const chartData = (overview?.balanceChartData?.[period] ?? FALLBACK_CHART[period]) as number[]
  const balanceNum  = parseFloat(data!.currentBalance)
  const balanceInt  = Math.floor(balanceNum).toLocaleString()
  const balanceDec  = (balanceNum % 1).toFixed(2).slice(1)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 col-span-12 lg:col-span-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-gray-500 dark:text-gray-400">
            <WalletIcon className="h-3.5 w-3.5" />
            Total balance · all accounts · USD
          </div>
          <div className="mt-1.5 flex items-baseline gap-3">
            <div className="font-semibold text-[48px] leading-none tracking-tight tabular-nums">
              ${balanceInt}.<span className="text-gray-400 dark:text-gray-500">{balanceDec.slice(1)}</span>
            </div>
            <Delta value={parseFloat(data!.balanceDelta)} />
          </div>
          <div className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
            + ${parseFloat(data!.balanceChangeAmount).toLocaleString()} over the last 30 days
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "h-8 px-3 rounded-md text-[12.5px] font-medium transition",
                  period === p
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <DownloadIcon className="h-3.5 w-3.5" />Export
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <AreaChart data={chartData} labels={["", "", "", "", ""]} height={200} />
      </div>

      <div className="mt-2 grid grid-cols-4 divide-x divide-gray-200 dark:divide-white/10 border-t border-gray-200 dark:border-white/10 pt-4">
        {([
          ["Inflow",     `$${parseFloat(data!.inflowAmount).toLocaleString()}`,    parseFloat(data!.inflowDelta)],
          ["Outflow",    `$${parseFloat(data!.outflowAmount).toLocaleString()}`,   parseFloat(data!.outflowDelta)],
          ["Net",        `+$${parseFloat(data!.netAmount).toLocaleString()}`,      parseFloat(data!.netDelta)],
          ["Burn / day", `$${parseFloat(data!.burnRatePerDay).toLocaleString()}`,  parseFloat(data!.burnRateDelta)],
        ] as [string, string, number][]).map(([l, v, d], i) => (
          <div key={l} className={cn("px-4", i === 0 && "pl-0")}>
            <div className="text-[11.5px] text-gray-500 dark:text-gray-400">{l}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-semibold text-[18px] tabular-nums tracking-tight">{v}</span>
              <Delta value={d} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── AllocationCard ───────────────────────────────────────────────

function AllocationCard() {
  const { data: overview, isLoading } = useServerData(queryBalanceOverview)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 col-span-12 lg:col-span-4 animate-pulse">
        <div className="h-5 bg-gray-100 dark:bg-white/10 rounded w-32 mb-4" />
        <div className="h-36 bg-gray-100 dark:bg-white/10 rounded" />
      </div>
    )
  }

  const alloc = overview?.allocationData ?? FALLBACK_BALANCE.allocationData
  const apy   = overview?.yieldApy ?? FALLBACK_BALANCE.yieldApy
  const total = overview?.totalAccounts ?? FALLBACK_BALANCE.totalAccounts
  const lastReb = overview?.lastRebalancedAt ?? FALLBACK_BALANCE.lastRebalancedAt

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 col-span-12 lg:col-span-4">
      <SectionHeader
        title="Allocation"
        subtitle={`Across ${total} accounts`}
        right={<Tag tone="brand">Auto-balance</Tag>}
      />
      <div className="mt-4 flex items-center gap-5">
        <div className="relative shrink-0">
          <DonutChart data={alloc} size={140} thickness={16} />
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Yield</div>
              <div className="text-[22px] font-semibold leading-none">{parseFloat(apy).toFixed(2)}%</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          {alloc.map((d) => (
            <div key={d.label} className="flex items-center gap-2 text-[12px]">
              <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
              <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">{d.label}</span>
              <span className="tabular-nums text-gray-500 dark:text-gray-400 shrink-0">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <Divider className="my-4" />
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-gray-500 dark:text-gray-400">
          Last rebalance ·{" "}
          {new Date(lastReb).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Rebalance now</button>
      </div>
    </div>
  )
}

// ─── LiveKPIStrip ─────────────────────────────────────────────────

function LiveKPIStrip() {
  const { data: kpi, isLoading } = useServerData<KpiSummaryDTO>(getKpiSummary)
  if (isLoading || !kpi) return null

  const stats = [
    { label: "Total Revenue", value: fmtCurrency(kpi.totalRevenue), delta: kpi.revenueChange },
    { label: "Active Users",  value: fmtNumber(kpi.activeUsers),    delta: kpi.usersChange   },
    { label: "New Signups",   value: fmtNumber(kpi.newSignups),     delta: kpi.signupsChange  },
    { label: "Churn Rate",    value: `${kpi.churnRate.toFixed(1)}%`,delta: kpi.churnChange    },
  ]

  return (
    <div className="col-span-12 grid grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[11.5px] text-gray-500 dark:text-gray-400">{s.label}</div>
            <div className="mt-0.5 font-semibold text-[17px] tabular-nums tracking-tight">{s.value}</div>
          </div>
          <Delta value={s.delta} />
        </div>
      ))}
    </div>
  )
}

// ─── PageNavStrip ─────────────────────────────────────────────────

function PageNavStrip() {
  const { setView } = useDashboardNav()
  const { data: accounts } = useServerData(queryAccounts)
  const { data: txns }     = useServerData(queryTransactions)
  const { data: cards }    = useServerData(queryCards)
  const { data: overview } = useServerData(queryBalanceOverview)

  const acctCount    = accounts?.length ?? 0
  const currencies   = accounts ? new Set(accounts.map((a) => a.currency)).size : 0
  const txnCount     = txns?.length ?? 0
  const depositStat  = overview ? `+$${parseFloat(overview.inflowAmount).toLocaleString()}` : "—"
  const withdrawStat = overview ? `-$${parseFloat(overview.outflowAmount).toLocaleString()}` : "—"
  const cardCount    = cards?.length ?? 0
  const activeCards  = cards?.filter((c) => c.status === "active").length ?? 0
  const frozenCards  = cards?.filter((c) => c.status === "frozen").length ?? 0
  const apyStat      = overview ? `${parseFloat(overview.yieldApy).toFixed(2)}% APY` : "—"

  const stats: Record<string, { stat: string; hint: string }> = {
    accounts:     { stat: acctCount ? `${acctCount} active`       : "—", hint: `${currencies} currencies enabled` },
    transactions: { stat: txnCount  ? `${txnCount} this month`    : "—", hint: "All transactions"                },
    deposit:      { stat: depositStat,                                     hint: "Received this month"            },
    withdrawal:   { stat: withdrawStat,                                    hint: "Sent this month"                },
    cards:        { stat: cardCount  ? `${cardCount} cards`        : "—", hint: `${activeCards} active · ${frozenCards} frozen` },
    invest:       { stat: apyStat,                                         hint: overview ? `$${parseFloat(overview.currentBalance).toLocaleString()} swept` : "—" },
    treasury:     { stat: "$2.1M",                                         hint: "Under management"               },
    reports:      { stat: "12 reports",                                    hint: "Last updated today"             },
  }

  return (
    <div className="col-span-12">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Navigate to</h2>
        <span className="text-[11.5px] text-gray-400 dark:text-gray-500">Click any card to open</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {PAGE_NAV_CONFIG.map((p) => {
          const Icon = p.icon
          const s = stats[p.view]
          return (
            <button
              key={p.view}
              onClick={() => setView(p.view)}
              className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 text-left hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md transition"
            >
              <div className={cn("h-9 w-9 rounded-xl grid place-items-center mb-3", p.iconBg)}>
                <Icon className={cn("h-4 w-4", p.iconColor)} />
              </div>
              <div className="text-[10.5px] text-gray-500 dark:text-gray-400">{p.label}</div>
              <div className="text-[14px] font-semibold tabular-nums mt-0.5 leading-snug">{s.stat}</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-snug truncate">{s.hint}</div>
              <ArrowRightIcon className="h-3 w-3 text-gray-300 dark:text-gray-600 mt-2 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── KPIRow ───────────────────────────────────────────────────────

function KPIRow() {
  const { data: kpis, isLoading } = useServerData(queryKpiEntries)

  if (isLoading || !kpis?.length) {
    return (
      <div className="col-span-12 grid grid-cols-12 gap-4">
        {[0,1,2,3].map((i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 animate-pulse">
            <div className="h-4 bg-gray-100 dark:bg-white/10 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-100 dark:bg-white/10 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="col-span-12 grid grid-cols-12 gap-4">
      {kpis.map((k) => (
        <div key={k.id} className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[12px] text-gray-500 dark:text-gray-400">{k.label}</div>
            <Delta value={parseFloat(k.delta)} />
          </div>
          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="font-semibold text-[26px] leading-none tracking-tight tabular-nums">{k.value}</div>
            <div className="shrink-0 w-20 h-8">
              {k.sparkData && <Sparkline data={k.sparkData} stroke={k.color} height={32} />}
            </div>
          </div>
          <div className="mt-1 text-[11.5px] text-gray-500 dark:text-gray-400">{k.hint}</div>
        </div>
      ))}
    </div>
  )
}

// ─── AccountsList ─────────────────────────────────────────────────

const accountStatusTone = { active: "green", earning: "brand", pending: "amber" } as const

function AccountsList() {
  const { setView } = useDashboardNav()
  const { data: accounts, isLoading } = useServerData(queryAccounts)
  const { data: overview } = useServerData(queryBalanceOverview)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 col-span-12 lg:col-span-7">
      <SectionHeader
        title="Accounts"
        subtitle={`${overview?.totalAccounts ?? FALLBACK_BALANCE.totalAccounts} active · 41 currencies enabled`}
        right={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />New account
            </Button>
            <button onClick={() => setView("accounts")} className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              View all<ArrowRightIcon className="h-3 w-3" />
            </button>
          </div>
        }
      />
      {isLoading ? (
        <div className="mt-4 space-y-3 animate-pulse">
          {[0,1,2].map((i) => <div key={i} className="h-10 bg-gray-100 dark:bg-white/10 rounded" />)}
        </div>
      ) : !accounts?.length ? (
        /* Static fallback accounts */
        <div className="mt-4">
          <div className="grid grid-cols-12 gap-2 px-1 text-[11px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 pb-2">
            <div className="col-span-4">Account</div>
            <div className="col-span-3">Partner bank</div>
            <div className="col-span-3 text-right">Balance</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          {[
            { name: "Operating",  lastFour: "4910", bank: "First Meridian",  balance: "$484,920.00", status: "active"  },
            { name: "Savings",    lastFour: "7823", bank: "First Meridian",  balance: "$253,970.00", status: "earning" },
            { name: "Treasury",   lastFour: "1102", bank: "Meridian Capital",balance: "$108,344.00", status: "earning" },
          ].map((a) => (
            <div key={a.name} className="grid grid-cols-12 gap-2 px-1 py-2.5 items-center text-[12.5px] rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer">
              <div className="col-span-4 flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-gray-100 dark:bg-white/10 grid place-items-center text-gray-600 dark:text-gray-400 shrink-0">
                  <WalletIcon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.name}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">••• {a.lastFour}</div>
                </div>
              </div>
              <div className="col-span-3 text-gray-600 dark:text-gray-400 truncate">{a.bank}</div>
              <div className="col-span-3 text-right tabular-nums font-semibold">{a.balance}</div>
              <div className="col-span-2 text-right">
                <Tag tone={accountStatusTone[a.status as keyof typeof accountStatusTone]}>
                  {a.status === "earning" ? "Earning" : "Active"}
                </Tag>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-12 gap-2 px-1 text-[11px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 pb-2">
            <div className="col-span-4">Account</div>
            <div className="col-span-3">Partner bank</div>
            <div className="col-span-3 text-right">Balance</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          {accounts.map((a) => {
            const isCrypto = CRYPTO_SYMBOLS.has(a.currency)
            const balDisplay = isCrypto
              ? `${parseFloat(a.balance).toLocaleString()} ${a.currency}`
              : `$${parseFloat(a.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            return (
              <div key={a.id} className="grid grid-cols-12 gap-2 px-1 py-2.5 items-center text-[12.5px] rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition">
                <div className="col-span-4 flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-gray-100 dark:bg-white/10 grid place-items-center text-gray-600 dark:text-gray-400 shrink-0">
                    {isCrypto ? <span className="text-[11px] font-bold">{CRYPTO_META[a.currency]?.badge ?? a.currency[0]}</span> : <WalletIcon className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{a.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">••• {a.lastFour}</div>
                  </div>
                </div>
                <div className="col-span-3 text-gray-600 dark:text-gray-400 truncate">{a.bankName}</div>
                <div className="col-span-3 text-right tabular-nums font-semibold">{balDisplay}</div>
                <div className="col-span-2 text-right">
                  <Tag tone={accountStatusTone[a.status]}>{a.status === "earning" ? "Earning" : a.status === "active" ? "Active" : "Pending"}</Tag>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── CashFlowCard ─────────────────────────────────────────────────

function CashFlowCard() {
  const [view, setView] = useState<"weeks" | "months">("weeks")
  const { data: overview, isLoading } = useServerData(queryBalanceOverview)

  const FALLBACK_CF = {
    weeks:  { inflow: [142,165,138,190,175,158,182,210,195,178,204,188], outflow: [98,120,95,135,110,102,128,145,138,115,142,130], labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] },
    months: { inflow: [1240,1380,1290,1560,1420,1680,1820,1950,1780,1640,1890,2100], outflow: [820,950,880,1050,930,1100,1180,1250,1060,980,1140,1320], labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] },
  }

  const series = overview?.cashFlowData?.[view] ?? FALLBACK_CF[view]

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 col-span-12 lg:col-span-5">
      <SectionHeader
        title="Cash flow"
        subtitle="Operating, last 12 weeks"
        right={
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-white/10 p-1">
            {(["weeks","months"] as const).map((t) => (
              <button key={t} onClick={() => setView(t)}
                className={cn("px-3 h-7 rounded-md text-[12px] font-medium transition capitalize",
                  view === t ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"
                )}>{t === "weeks" ? "Weekly" : "Monthly"}</button>
            ))}
          </div>
        }
      />
      {isLoading ? (
        <div className="mt-4 h-[180px] bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
      ) : (
        <>
          <div className="mt-4">
            <StackedBarChart data={series.inflow} stack={series.outflow} labels={series.labels} height={180} />
          </div>
          <div className="mt-3 flex items-center gap-5 text-[11.5px] text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-600" />Inflow</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-gray-900 dark:bg-white" />Outflow</span>
          </div>
        </>
      )}
    </div>
  )
}

// ─── RecentTransactions ───────────────────────────────────────────

function RecentTransactions() {
  const { setView } = useDashboardNav()
  const { data: txns, isLoading } = useServerData(queryTransactions)
  const recent = txns?.slice(0, 5) ?? []

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 col-span-12">
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/10">
        <div>
          <h3 className="text-[14.5px] font-semibold tracking-tight">Recent transactions</h3>
          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
            {isLoading ? "Loading…" : txns?.length ? `Showing ${recent.length} of ${txns.length}` : "No transactions yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5"><FilterIcon className="h-3.5 w-3.5" />Filter</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><DownloadIcon className="h-3.5 w-3.5" />Export</Button>
          <Button size="sm" onClick={() => setView("transactions")} className="gap-1.5">View all<ArrowRightIcon className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5 space-y-3 animate-pulse">{[0,1,2].map((i) => <div key={i} className="h-12 bg-gray-100 dark:bg-white/10 rounded" />)}</div>
      ) : !recent.length ? (
        <div className="py-16 text-center text-[13px] text-gray-400 dark:text-gray-500">
          <ReceiptIcon className="h-8 w-8 mx-auto mb-3 text-gray-200 dark:text-white/10" />
          No transactions yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
            <div className="col-span-4">Description</div><div className="col-span-3">Account</div>
            <div className="col-span-2">Date</div><div className="col-span-2 text-right">Amount</div><div className="col-span-1 text-right">Status</div>
          </div>
          {recent.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              <div className="col-span-4 flex items-center gap-2.5">
                <div className={cn("h-8 w-8 rounded-md grid place-items-center shrink-0",
                  r.statusTone==="green" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" :
                  r.statusTone==="rose"  ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600"
                )}>{r.direction==="inbound" ? "↓" : r.direction==="auto" ? "⚡" : "↑"}</div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.description}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{r.category}</div>
                </div>
              </div>
              <div className="col-span-3 text-gray-600 dark:text-gray-400 font-mono text-[11.5px] truncate">{r.accountRef}</div>
              <div className="col-span-2 text-gray-500 dark:text-gray-400">{r.transactionDate}</div>
              <div className={cn("col-span-2 text-right tabular-nums font-semibold", r.amount.startsWith("+") ? "text-emerald-600" : "text-gray-900 dark:text-white")}>{r.amount}</div>
              <div className="col-span-1 text-right"><Tag tone={r.statusTone as "green"|"rose"|"brand"|"amber"}>{r.status}</Tag></div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ─── DepositWithdrawalPreview ─────────────────────────────────────

function DepositWithdrawalPreview() {
  const { setView }                       = useDashboardNav()
  const { data: txns, isLoading }         = useServerData(queryTransactions)
  const { data: overview }                = useServerData(queryBalanceOverview)

  const deposits    = (txns ?? []).filter((t) => t.direction === "inbound").slice(0, 4)
  const withdrawals = (txns ?? []).filter((t) => t.direction === "outbound").slice(0, 4)
  const depositTotal    = overview ? `+$${parseFloat(overview.inflowAmount).toLocaleString()}` : "…"
  const withdrawalTotal = overview ? `-$${parseFloat(overview.outflowAmount).toLocaleString()}` : "…"

  return (
    <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-4">
      {/* Deposit summary */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
        <SectionHeader
          title="Recent deposits"
          subtitle={`${depositTotal} this month`}
          right={
            <button onClick={() => setView("deposit")} className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              View all<ArrowRightIcon className="h-3 w-3" />
            </button>
          }
        />
        <div className="mt-3 space-y-2">
          {isLoading ? (
            [0,1,2].map((i) => <div key={i} className="h-9 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />)
          ) : !deposits.length ? (
            <div className="py-6 text-center text-[12px] text-gray-400">No deposits yet.</div>
          ) : deposits.map((d) => (
            <div key={d.id} className="flex items-center gap-2.5 py-1.5 border-b border-gray-100 dark:border-white/5 last:border-0">
              <div className="h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-500/10 grid place-items-center shrink-0 text-emerald-600">
                <ArrowDownLeftIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium truncate">{d.description}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{d.category} · {d.transactionDate}</div>
              </div>
              <div className="text-[12.5px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 shrink-0">{d.amount}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setView("deposit")}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-2.5 text-[12px] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition"
        >
          <ArrowDownLeftIcon className="h-3.5 w-3.5 text-emerald-500" />Add funds
        </button>
      </div>

      {/* Withdrawal summary */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
        <SectionHeader
          title="Recent withdrawals"
          subtitle={`${withdrawalTotal} this month`}
          right={
            <button onClick={() => setView("withdrawal")} className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              View all<ArrowRightIcon className="h-3 w-3" />
            </button>
          }
        />
        <div className="mt-3 space-y-2">
          {isLoading ? (
            [0,1,2].map((i) => <div key={i} className="h-9 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />)
          ) : !withdrawals.length ? (
            <div className="py-6 text-center text-[12px] text-gray-400">No withdrawals yet.</div>
          ) : withdrawals.map((d) => (
            <div key={d.id} className="flex items-center gap-2.5 py-1.5 border-b border-gray-100 dark:border-white/5 last:border-0">
              <div className="h-7 w-7 rounded-full bg-rose-50 dark:bg-rose-500/10 grid place-items-center shrink-0 text-rose-600">
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium truncate">{d.description}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{d.category} · {d.transactionDate}</div>
              </div>
              <div className="text-[12.5px] font-semibold tabular-nums text-rose-600 dark:text-rose-400 shrink-0">{d.amount}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setView("withdrawal")}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-2.5 text-[12px] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition"
        >
          <ArrowUpRightIcon className="h-3.5 w-3.5 text-rose-500" />New withdrawal
        </button>
      </div>
    </div>
  )
}

// ─── CryptoBalances ───────────────────────────────────────────────

function CryptoBalances() {
  const { setView }                    = useDashboardNav()
  const { data: accounts, isLoading }  = useServerData(queryAccounts)
  const { prices, changes }            = useCryptoPrices()

  const cryptoAccounts = (accounts ?? []).filter((a) => CRYPTO_SYMBOLS.has(a.currency))
  const totalUsd = cryptoAccounts.reduce((sum, a) => {
    return sum + parseFloat(a.balance) * (prices[a.currency] ?? 0)
  }, 0)

  return (
    <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
      <SectionHeader
        title="Crypto balances"
        subtitle={isLoading ? "…" : `$${totalUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })} · ${cryptoAccounts.length} assets`}
        right={
          <button onClick={() => setView("deposit")} className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            Manage<ArrowRightIcon className="h-3 w-3" />
          </button>
        }
      />
      <div className="mt-3 space-y-2.5">
        {isLoading ? (
          [0,1,2].map((i) => <div key={i} className="h-9 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />)
        ) : !cryptoAccounts.length ? (
          <div className="py-8 text-center text-[12px] text-gray-400">No crypto accounts yet.</div>
        ) : cryptoAccounts.map((a) => {
          const meta     = CRYPTO_META[a.currency] ?? { name: a.currency, badge: a.currency[0], color: "bg-gray-500" }
          const rate     = prices[a.currency] ?? 0
          const change   = changes[a.currency] ?? 0
          const changeUp = change >= 0
          const usdVal   = parseFloat(a.balance) * rate
          const balFmt   = `${parseFloat(a.balance).toLocaleString()} ${a.currency}`
          return (
            <div key={a.id} className="flex items-center gap-3">
              <span className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0", meta.color)}>
                {meta.badge}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12.5px] font-medium">{meta.name}</span>
                  <span className={`text-[10px] font-medium tabular-nums ${changeUp ? "text-emerald-500" : "text-rose-500"}`}>
                    {changeUp ? "▲" : "▼"}{Math.abs(change).toFixed(2)}%
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">{balFmt}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-semibold tabular-nums">
                  ${usdVal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10.5px] text-gray-400 dark:text-gray-500 tabular-nums">
                  @ ${rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: rate < 1 ? 6 : 2 })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <Divider className="my-3" />
      <div className="flex gap-2">
        <button onClick={() => setView("deposit")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 py-2 text-[12px] font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition">
          <ArrowDownLeftIcon className="h-3.5 w-3.5 text-emerald-500" />Receive
        </button>
        <button onClick={() => setView("withdrawal")}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 py-2 text-[12px] font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition">
          <ArrowUpRightIcon className="h-3.5 w-3.5 text-rose-500" />Send
        </button>
      </div>
    </div>
  )
}

// ─── QuickActions ─────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Deposit",    icon: ArrowDownLeftIcon, view: "deposit",     color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
  { label: "Withdraw",   icon: ArrowUpRightIcon,  view: "withdrawal",  color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10"         },
  { label: "Cards",      icon: CreditCardIcon,    view: "cards",       color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10"   },
  { label: "Convert FX", icon: GlobeIcon,         view: "treasury",    color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10"      },
  { label: "Invest",     icon: TrendingUpIcon,    view: "invest",      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10"   },
  { label: "Reports",    icon: BarChart3Icon,     view: "reports",     color: "text-pink-600 bg-pink-50 dark:bg-pink-500/10"         },
] as const

function QuickActions() {
  const { setView } = useDashboardNav()

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 col-span-12 lg:col-span-4">
      <SectionHeader title="Quick actions" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map(({ label, icon: Icon, view, color }) => (
          <button
            key={label}
            onClick={() => setView(view)}
            className="rounded-xl border border-gray-200 dark:border-white/10 p-3 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-sm transition flex flex-col items-start gap-2"
          >
            <span className={cn("h-8 w-8 rounded-md grid place-items-center", color)}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[12px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── TopSpend ─────────────────────────────────────────────────────

function TopSpend() {
  const { setView } = useDashboardNav()
  const { data: cats, isLoading } = useServerData(queryOverviewSpendCategories)

  const FALLBACK_CATS = [
    { id: "1", label: "Payroll",       amountDisplay: "$412,800", percentage: 78, color: "#3b82f6" },
    { id: "2", label: "Cloud/SaaS",    amountDisplay: "$37,620",  percentage: 52, color: "#8b5cf6" },
    { id: "3", label: "Vendor/Ops",    amountDisplay: "$28,000",  percentage: 38, color: "#f59e0b" },
    { id: "4", label: "Card spend",    amountDisplay: "$18,420",  percentage: 24, color: "#10b981" },
  ]

  const items = cats?.length ? cats : FALLBACK_CATS

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 col-span-12 lg:col-span-4">
      <SectionHeader title="Top spend categories" subtitle="This month"
        right={<button onClick={() => setView("reports")} className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">Reports<ArrowRightIcon className="h-3 w-3" /></button>}
      />
      {isLoading ? (
        <div className="mt-3 space-y-3 animate-pulse">{[0,1,2].map((i) => <div key={i} className="h-8 bg-gray-100 dark:bg-white/10 rounded" />)}</div>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((c) => (
            <div key={c.id}>
              <div className="flex items-center justify-between text-[12.5px]">
                <span>{c.label}</span>
                <span className="tabular-nums font-medium">{c.amountDisplay}</span>
              </div>
              <ProgressBar value={c.percentage} color={c.color} className="mt-1.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── UpcomingPayments ─────────────────────────────────────────────

function UpcomingPayments() {
  const { setView } = useDashboardNav()
  const { data: upcoming, isLoading } = useServerData(queryUpcomingPayments)

  const FALLBACK_UP = [
    { id: "1", payee: "Atlas Components",  description: "Wire · $245,000",   dueDateDisplay: "Jul 1",  statusLabel: "Awaiting",  tone: "amber" as const },
    { id: "2", payee: "Payroll · 84 staff",description: "ACH · $412,800",    dueDateDisplay: "Jul 1",  statusLabel: "Scheduled", tone: "green" as const },
    { id: "3", payee: "AWS",               description: "ACH · $34,200",     dueDateDisplay: "Jul 3",  statusLabel: "Scheduled", tone: "green" as const },
    { id: "4", payee: "Office lease",      description: "ACH · $28,000",     dueDateDisplay: "Jul 5",  statusLabel: "Scheduled", tone: "green" as const },
  ]

  const items = upcoming?.length ? upcoming : FALLBACK_UP

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 col-span-12 lg:col-span-4">
      <SectionHeader title="Upcoming" subtitle="Next 7 days"
        right={<button onClick={() => setView("withdrawal")} className="text-[12px] text-blue-600 dark:text-blue-400 font-medium">Schedule</button>}
      />
      {isLoading ? (
        <div className="mt-3 space-y-2.5 animate-pulse">{[0,1,2].map((i) => <div key={i} className="h-12 bg-gray-100 dark:bg-white/10 rounded" />)}</div>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <AvatarBadge name={p.payee} size={32} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium truncate">{p.payee}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{p.description}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[12px] font-medium">{p.dueDateDisplay}</div>
                <Tag tone={p.tone}>{p.statusLabel}</Tag>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── TeamActivity ─────────────────────────────────────────────────

function TeamActivity() {
  const { data: logs, isLoading } = useServerData(queryActivityLogs)

  const FALLBACK_LOGS = [
    { id: "1", actorName: "Marcus Lee",  action: "approved a $24,800 transfer to Pinpoint LLC",  timeAgo: "2m ago"   },
    { id: "2", actorName: "Owen Park",   action: "issued a new virtual card for SaaS spend",     timeAgo: "14m ago"  },
    { id: "3", actorName: "Avery Chen",  action: "exported card transactions to CSV",            timeAgo: "1h ago"   },
    { id: "4", actorName: "Marcus Lee",  action: "scheduled payroll ACH for Jul 1",              timeAgo: "3h ago"   },
  ]

  const items = logs?.length ? logs : FALLBACK_LOGS

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 col-span-12 lg:col-span-4">
      <SectionHeader title="Team activity" subtitle="Last 24 hours"
        right={<button className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">Team<ArrowRightIcon className="h-3 w-3" /></button>}
      />
      {isLoading ? (
        <div className="mt-3 space-y-3 animate-pulse">{[0,1,2].map((i) => <div key={i} className="h-10 bg-gray-100 dark:bg-white/10 rounded" />)}</div>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((r) => (
            <li key={r.id} className="flex items-start gap-2.5">
              <AvatarBadge name={r.actorName} size={28} />
              <div className="flex-1 text-[12.5px]">
                <span className="font-medium">{r.actorName}</span>{" "}
                <span className="text-gray-600 dark:text-gray-400">{r.action}</span>
                <div className="text-[11px] text-gray-500 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                  <CheckCircleIcon className="h-3 w-3 text-emerald-500" />{r.timeAgo}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── SecurityStatus ───────────────────────────────────────────────

function SecurityStatus() {
  const { setView } = useDashboardNav()

  const checks = [
    { label: "2FA enabled",          ok: true  },
    { label: "API keys rotated",      ok: true  },
    { label: "Audit log active",      ok: true  },
    { label: "IP allowlist set",      ok: false },
  ]

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 col-span-12 lg:col-span-4">
      <SectionHeader
        title="Security"
        subtitle="Account protection status"
        right={<Tag tone={checks.every(c => c.ok) ? "green" : "amber"}>{checks.filter(c=>c.ok).length}/{checks.length} checks</Tag>}
      />
      <div className="mt-3 space-y-2.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-2.5">
            <div className={cn("h-5 w-5 rounded-full grid place-items-center shrink-0",
              c.ok ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600"
            )}>
              {c.ok
                ? <CheckCircleIcon className="h-3.5 w-3.5" />
                : <ShieldCheckIcon className="h-3.5 w-3.5" />
              }
            </div>
            <span className="text-[12.5px] flex-1">{c.label}</span>
            <span className={cn("text-[11px] font-medium", c.ok ? "text-emerald-600" : "text-amber-600")}>
              {c.ok ? "OK" : "Review"}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setView("settings")}
        className="mt-4 w-full text-center text-[12px] text-blue-600 dark:text-blue-400 font-medium py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition"
      >
        Security settings
      </button>
    </div>
  )
}

// ─── Page assembly ────────────────────────────────────────────────

export function OverviewPage() {
  const user     = useAuth()
  const { setView } = useDashboardNav()
  const greeting = useGreeting()
  const date     = useFormattedDate()
  const firstName = user.name.split(" ")[0]

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="text-[12px] text-gray-500 dark:text-gray-400">{date}</div>
          <h1 className="font-semibold text-[36px] leading-none tracking-tight mt-1">
            {greeting}, {firstName}.
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-2">
            Here's what's happening with your finances today.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setView("deposit")} className="gap-1.5">
            <ArrowDownLeftIcon className="h-3.5 w-3.5" />Add money
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView("withdrawal")} className="gap-1.5">
            <ArrowUpRightIcon className="h-3.5 w-3.5" />Send
          </Button>
          <Button size="sm" onClick={() => setView("reports")} className="gap-1.5">
            <BarChart3Icon className="h-3.5 w-3.5" />Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <LiveKPIStrip />
        <PageNavStrip />
        <BalanceCard />
        <AllocationCard />
        <KPIRow />
        <AccountsList />
        <CashFlowCard />
        <RecentTransactions />
        <DepositWithdrawalPreview />
        <CryptoBalances />
        <QuickActions />
        <UpcomingPayments />
        <TeamActivity />
        <TopSpend />
        <SecurityStatus />
      </div>
    </>
  )
}
