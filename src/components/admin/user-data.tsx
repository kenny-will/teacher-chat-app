"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeftIcon,
  DatabaseIcon,
  Trash2Icon,
  RefreshCwIcon,
  CheckCircleIcon,
  CheckIcon,
  XIcon,
  PauseIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  FlaskConicalIcon,
  SendIcon,
  ClipboardListIcon,
} from "lucide-react"
import { Tag, SectionHeader, AvatarBadge, ProgressBar } from "@/components/meridian/primitives"
import { useServerData } from "@/hooks/use-server-data"
import {
  adminGetUserFinancialData,
  adminSeedDemoData,
  adminClearUserData,
  adminInjectDeposit,
  adminInjectWithdrawal,
  adminApproveTransaction,
  adminRejectTransaction,
  adminHoldTransaction,
} from "@/modules/financial/application/mutations/financial.mutations"
import { cn } from "@/lib/utils"

interface AdminUserDataPageProps {
  userId: string
  userName: string
  userEmail: string
  userRole: string
  onBack: () => void
}

type Tab = "overview" | "deposits" | "withdrawals" | "simulate" | "cards" | "kpis" | "activity" | "notifications"

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview",      label: "Overview",     icon: <ClipboardListIcon className="h-3.5 w-3.5" /> },
  { key: "deposits",      label: "Deposits",     icon: <ArrowDownLeftIcon className="h-3.5 w-3.5" /> },
  { key: "withdrawals",   label: "Withdrawals",  icon: <ArrowUpRightIcon className="h-3.5 w-3.5" /> },
  { key: "simulate",      label: "Simulate",     icon: <FlaskConicalIcon className="h-3.5 w-3.5" /> },
  { key: "cards",         label: "Cards",        icon: null },
  { key: "kpis",          label: "KPIs",         icon: null },
  { key: "activity",      label: "Activity",     icon: null },
  { key: "notifications", label: "Notifications",icon: null },
]

const DEPOSIT_RAILS  = ["ACH", "Wire", "RTP / FedNow", "Check", "BTC", "ETH", "TRX", "USDT (TRC-20)", "USDT (ERC-20)"]
const WITHDRAW_RAILS = ["ACH", "Wire", "RTP / FedNow", "BTC", "ETH", "TRX", "USDT (TRC-20)", "USDT (ERC-20)"]

function useUserData(userId: string) {
  return useServerData(() => adminGetUserFinancialData(userId), [userId])
}

export function AdminUserDataPage({ userId, userName, userEmail, userRole, onBack }: AdminUserDataPageProps) {
  const [tab, setTab] = useState<Tab>("overview")
  const [seeding, setSeeding]   = useState(false)
  const [clearing, setClearing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const { data, isLoading, refetch } = useUserData(userId)

  function flash(msg: string) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 4000)
  }

  async function handleSeedDemo() {
    setSeeding(true)
    setFeedback(null)
    try {
      await adminSeedDemoData(userId)
      flash("Demo data loaded successfully.")
      refetch()
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : "Unknown error"}`)
    } finally {
      setSeeding(false)
    }
  }

  async function handleClear() {
    if (!confirm(`Clear ALL financial data for ${userName}? This cannot be undone.`)) return
    setClearing(true)
    setFeedback(null)
    try {
      await adminClearUserData(userId)
      flash("All financial data cleared.")
      refetch()
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : "Unknown error"}`)
    } finally {
      setClearing(false)
    }
  }

  const deposits    = (data?.transactions ?? []).filter((t) => t.direction === "inbound")
  const withdrawals = (data?.transactions ?? []).filter((t) => t.direction === "outbound")

  return (
    <div>
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />Back to users
        </button>
      </div>

      {/* User header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <AvatarBadge name={userName} size={48} />
          <div>
            <div className="text-[18px] font-semibold">{userName}</div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400">
              {userEmail} · <span className="capitalize">{userRole}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {data?.hasData ? (
            <Tag tone="green" className="flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" />Data configured
            </Tag>
          ) : (
            <Tag tone="amber">No data yet</Tag>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleClear} disabled={clearing || !data?.hasData}>
            <Trash2Icon className="h-3.5 w-3.5" />
            {clearing ? "Clearing…" : "Clear data"}
          </Button>
          <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={handleSeedDemo} disabled={seeding}>
            <DatabaseIcon className="h-3.5 w-3.5" />
            {seeding ? "Loading…" : "Load demo data"}
          </Button>
          <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
            <RefreshCwIcon className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Stats strip (always visible when data exists) */}
      {data?.hasData && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatChip label="Balance" value={`$${parseFloat(data.balance?.currentBalance ?? "0").toLocaleString()}`} color="emerald" />
          <StatChip label="Deposits (total)" value={deposits.length.toString()} color="blue" />
          <StatChip label="Withdrawals (total)" value={withdrawals.length.toString()} color="violet" />
          <StatChip
            label="Pending"
            value={[...deposits, ...withdrawals].filter((t) => t.status === "Pending" || t.status === "On Hold").length.toString()}
            color="amber"
          />
        </div>
      )}

      {feedback && (
        <div className={cn(
          "mb-4 px-4 py-3 rounded-xl text-[12.5px] border",
          feedback.startsWith("Error")
            ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300"
            : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
        )}>
          {feedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 bg-gray-100 dark:bg-white/8 rounded-xl">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-lg text-[12px] font-medium transition whitespace-nowrap",
              tab === t.key
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            )}
          >
            {t.icon}
            {t.label}
            {t.key === "deposits" && deposits.length > 0 && (
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full px-1.5 py-0.5 font-semibold">
                {deposits.length}
              </span>
            )}
            {t.key === "withdrawals" && withdrawals.length > 0 && (
              <span className="text-[10px] bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-full px-1.5 py-0.5 font-semibold">
                {withdrawals.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 dark:bg-white/8 rounded-xl" />)}
        </div>
      ) : !data?.hasData && tab !== "notifications" && tab !== "simulate" ? (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-10 text-center">
          <DatabaseIcon className="h-10 w-10 text-gray-200 dark:text-white/15 mx-auto mb-3" />
          <div className="text-[14px] font-medium text-gray-400">No financial data for this user</div>
          <div className="text-[12px] text-gray-400 mt-1">
            Click <strong>"Load demo data"</strong> to populate with sample data, or use the{" "}
            <button onClick={() => setTab("simulate")} className="underline text-blue-500">Simulate</button>{" "}
            tab to inject individual transactions.
          </div>
        </div>
      ) : (
        <>
          {tab === "overview"      && <OverviewTab data={data} />}
          {tab === "deposits"      && (
            <DepositsTab
              transactions={deposits}
              userId={userId}
              onAction={async (fn) => { await fn(); refetch() }}
              onFlash={flash}
            />
          )}
          {tab === "withdrawals"   && (
            <WithdrawalsTab
              transactions={withdrawals}
              userId={userId}
              onAction={async (fn) => { await fn(); refetch() }}
              onFlash={flash}
            />
          )}
          {tab === "simulate"      && (
            <SimulateTab
              userId={userId}
              hasData={!!data?.hasData}
              onDone={() => { refetch(); setTab("deposits") }}
              onFlash={flash}
            />
          )}
          {tab === "cards"         && <CardsTab data={data} />}
          {tab === "kpis"          && <KpisTab data={data} />}
          {tab === "activity"      && <ActivityTab data={data} />}
          {tab === "notifications" && <NotificationsTab data={data} />}
        </>
      )}
    </div>
  )
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ label, value, color }: { label: string; value: string; color: "emerald" | "blue" | "violet" | "amber" }) {
  const colors = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    blue:    "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    violet:  "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800",
    amber:   "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  }
  const vals = {
    emerald: "text-emerald-700 dark:text-emerald-300",
    blue:    "text-blue-700 dark:text-blue-300",
    violet:  "text-violet-700 dark:text-violet-300",
    amber:   "text-amber-700 dark:text-amber-300",
  }
  return (
    <div className={cn("rounded-xl border p-3", colors[color])}>
      <div className="text-[11px] text-gray-500 dark:text-gray-400">{label}</div>
      <div className={cn("text-[22px] font-semibold leading-none mt-1 tabular-nums", vals[color])}>{value}</div>
    </div>
  )
}

// ─── Admin action buttons ─────────────────────────────────────────────────────

interface ActionRowProps {
  txnId: string
  currentStatus: string
  onAction: (fn: () => Promise<void>) => Promise<void>
  onFlash: (msg: string) => void
}

function TxnActionButtons({ txnId, currentStatus, onAction, onFlash }: ActionRowProps) {
  const [busy, setBusy] = useState<string | null>(null)

  async function act(label: string, fn: () => Promise<void>) {
    setBusy(label)
    try {
      await onAction(fn)
      onFlash(`Transaction ${label.toLowerCase()}d.`)
    } catch (e) {
      onFlash(`Error: ${e instanceof Error ? e.message : "Unknown"}`)
    } finally {
      setBusy(null)
    }
  }

  const isApproved = currentStatus === "Approved"
  const isRejected = currentStatus === "Rejected"
  const isHeld     = currentStatus === "On Hold"

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        disabled={!!busy || isApproved}
        onClick={() => act("Approve", () => adminApproveTransaction(txnId))}
        className={cn(
          "flex items-center gap-1 px-2.5 h-7 rounded-lg text-[11.5px] font-medium transition",
          isApproved
            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 cursor-default"
            : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800"
        )}
      >
        <CheckIcon className="h-3 w-3" />
        {busy === "Approve" ? "…" : isApproved ? "Approved" : "Approve"}
      </button>
      <button
        disabled={!!busy || isHeld}
        onClick={() => act("Hold", () => adminHoldTransaction(txnId))}
        className={cn(
          "flex items-center gap-1 px-2.5 h-7 rounded-lg text-[11.5px] font-medium transition",
          isHeld
            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 cursor-default"
            : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800"
        )}
      >
        <PauseIcon className="h-3 w-3" />
        {busy === "Hold" ? "…" : isHeld ? "Held" : "Hold"}
      </button>
      <button
        disabled={!!busy || isRejected}
        onClick={() => act("Reject", () => adminRejectTransaction(txnId))}
        className={cn(
          "flex items-center gap-1 px-2.5 h-7 rounded-lg text-[11.5px] font-medium transition",
          isRejected
            ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 cursor-default"
            : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800"
        )}
      >
        <XIcon className="h-3 w-3" />
        {busy === "Reject" ? "…" : isRejected ? "Rejected" : "Reject"}
      </button>
    </div>
  )
}

// ─── Deposits tab ─────────────────────────────────────────────────────────────

type Txn = Awaited<ReturnType<typeof adminGetUserFinancialData>>["transactions"][number]

interface TxnTabProps {
  transactions: Txn[]
  userId: string
  onAction: (fn: () => Promise<void>) => Promise<void>
  onFlash: (msg: string) => void
}

function DepositsTab({ transactions, onAction, onFlash }: TxnTabProps) {
  if (!transactions.length) {
    return (
      <EmptyState
        icon={<ArrowDownLeftIcon className="h-8 w-8 text-gray-300" />}
        title="No deposits recorded"
        description="Use the Simulate tab to inject a demo deposit, or load demo data."
      />
    )
  }

  const pending  = transactions.filter((t) => t.status === "Pending" || t.status === "On Hold")
  const settled  = transactions.filter((t) => t.status !== "Pending" && t.status !== "On Hold")

  return (
    <div className="space-y-4">
      {/* Pending / needs action */}
      {pending.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 dark:border-amber-800/50 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[12px] font-semibold text-amber-800 dark:text-amber-300">
              Needs Action · {pending.length} pending
            </span>
          </div>
          <div>
            {pending.map((t) => (
              <TxnRow key={t.id} txn={t} onAction={onAction} onFlash={onFlash} highlight />
            ))}
          </div>
        </div>
      )}

      {/* All deposits */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/8">
          <div className="text-[12px] font-semibold text-gray-600 dark:text-gray-300">
            All Deposits · {transactions.length} total
          </div>
        </div>
        <TxnHeader direction="inbound" />
        {transactions.map((t) => (
          <TxnRow key={t.id} txn={t} onAction={onAction} onFlash={onFlash} />
        ))}
      </div>

      {/* Summary */}
      <DepositSummary transactions={transactions} />
    </div>
  )
}

function DepositSummary({ transactions }: { transactions: Txn[] }) {
  const approved = transactions.filter((t) => t.status === "Approved" || t.status === "Paid").length
  const pending  = transactions.filter((t) => t.status === "Pending").length
  const held     = transactions.filter((t) => t.status === "On Hold").length
  const rejected = transactions.filter((t) => t.status === "Rejected").length

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Approved / Paid", count: approved, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
        { label: "Pending",         count: pending,  color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
        { label: "On Hold",         count: held,     color: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
        { label: "Rejected",        count: rejected, color: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800" },
      ].map((s) => (
        <div key={s.label} className={cn("rounded-xl border p-3", s.bg)}>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</div>
          <div className={cn("text-[22px] font-semibold leading-none mt-1", s.color)}>{s.count}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Withdrawals tab ──────────────────────────────────────────────────────────

function WithdrawalsTab({ transactions, onAction, onFlash }: TxnTabProps) {
  if (!transactions.length) {
    return (
      <EmptyState
        icon={<ArrowUpRightIcon className="h-8 w-8 text-gray-300" />}
        title="No withdrawals recorded"
        description="Use the Simulate tab to inject a demo withdrawal, or load demo data."
      />
    )
  }

  const pending = transactions.filter((t) => t.status === "Pending" || t.status === "On Hold")

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200 dark:border-amber-800/50 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[12px] font-semibold text-amber-800 dark:text-amber-300">
              Needs Action · {pending.length} pending withdrawal{pending.length !== 1 ? "s" : ""}
            </span>
          </div>
          {pending.map((t) => (
            <TxnRow key={t.id} txn={t} onAction={onAction} onFlash={onFlash} highlight />
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/8">
          <div className="text-[12px] font-semibold text-gray-600 dark:text-gray-300">
            All Withdrawals · {transactions.length} total
          </div>
        </div>
        <TxnHeader direction="outbound" />
        {transactions.map((t) => (
          <TxnRow key={t.id} txn={t} onAction={onAction} onFlash={onFlash} />
        ))}
      </div>

      <WithdrawalSummary transactions={transactions} />
    </div>
  )
}

function WithdrawalSummary({ transactions }: { transactions: Txn[] }) {
  const approved = transactions.filter((t) => t.status === "Approved" || t.status === "Sent").length
  const pending  = transactions.filter((t) => t.status === "Pending").length
  const held     = transactions.filter((t) => t.status === "On Hold").length
  const rejected = transactions.filter((t) => t.status === "Rejected").length

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Approved / Sent", count: approved, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
        { label: "Pending",         count: pending,  color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
        { label: "On Hold",         count: held,     color: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
        { label: "Rejected",        count: rejected, color: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800" },
      ].map((s) => (
        <div key={s.label} className={cn("rounded-xl border p-3", s.bg)}>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</div>
          <div className={cn("text-[22px] font-semibold leading-none mt-1", s.color)}>{s.count}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Shared transaction row ───────────────────────────────────────────────────

const STATUS_TONE: Record<string, "green" | "amber" | "rose" | "brand" | "neutral"> = {
  green:   "green",
  amber:   "amber",
  rose:    "rose",
  brand:   "brand",
  neutral: "neutral",
}

function TxnHeader({ direction }: { direction: "inbound" | "outbound" }) {
  return (
    <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[10.5px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100 dark:border-white/8">
      <div className="col-span-4">Description</div>
      <div className="col-span-2">{direction === "inbound" ? "Source / Rail" : "Recipient / Rail"}</div>
      <div className="col-span-2 text-right">Amount</div>
      <div className="col-span-1">Status</div>
      <div className="col-span-3 text-right">Admin actions</div>
    </div>
  )
}

function TxnRow({ txn, onAction, onFlash, highlight }: {
  txn: Txn
  onAction: (fn: () => Promise<void>) => Promise<void>
  onFlash: (msg: string) => void
  highlight?: boolean
}) {
  const tone = STATUS_TONE[txn.statusTone as keyof typeof STATUS_TONE] ?? "neutral"
  return (
    <div className={cn(
      "grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-[12.5px] border-b border-gray-100 dark:border-white/8 last:border-0 transition",
      highlight ? "bg-amber-50/60 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20" : "hover:bg-gray-50 dark:hover:bg-white/5"
    )}>
      <div className="col-span-4 min-w-0">
        <div className="font-medium truncate">{txn.description}</div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{txn.transactionDate}</div>
      </div>
      <div className="col-span-2 text-gray-600 dark:text-gray-400 text-[11.5px] truncate">
        {txn.category}
      </div>
      <div className={cn(
        "col-span-2 text-right font-semibold tabular-nums",
        txn.direction === "inbound" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-800 dark:text-gray-200"
      )}>
        {txn.amount}
      </div>
      <div className="col-span-1">
        <Tag tone={tone}>{txn.status}</Tag>
      </div>
      <div className="col-span-3 flex justify-end">
        <TxnActionButtons
          txnId={txn.id}
          currentStatus={txn.status}
          onAction={onAction}
          onFlash={onFlash}
        />
      </div>
    </div>
  )
}

// ─── Simulate tab ─────────────────────────────────────────────────────────────

function SimulateTab({
  userId,
  hasData,
  onDone,
  onFlash,
}: {
  userId: string
  hasData: boolean
  onDone: () => void
  onFlash: (msg: string) => void
}) {
  const [type, setType]           = useState<"deposit" | "withdrawal">("deposit")
  const [amount, setAmount]       = useState("")
  const [rail, setRail]           = useState(DEPOSIT_RAILS[0])
  const [description, setDesc]    = useState("")
  const [recipient, setRecipient] = useState("")
  const [memo, setMemo]           = useState("")
  const [busy, setBusy]           = useState(false)

  const rails = type === "deposit" ? DEPOSIT_RAILS : WITHDRAW_RAILS

  async function handleInject() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { onFlash("Error: Enter a valid amount."); return }

    setBusy(true)
    try {
      if (type === "deposit") {
        await adminInjectDeposit(userId, { amount, rail, description: description || `${rail} Deposit`, reference: "" })
        onFlash(`Deposit of $${amt.toLocaleString()} injected as Pending. Switch to the Deposits tab to approve.`)
      } else {
        await adminInjectWithdrawal(userId, { amount, rail, recipient: recipient || `${rail} Withdrawal`, memo })
        onFlash(`Withdrawal of $${amt.toLocaleString()} injected as Pending. Switch to the Withdrawals tab to approve/reject.`)
      }
      setAmount(""); setDesc(""); setRecipient(""); setMemo("")
      onDone()
    } catch (e) {
      onFlash(`Error: ${e instanceof Error ? e.message : "Unknown"}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 p-5">
        <div className="flex items-start gap-3">
          <FlaskConicalIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-blue-800 dark:text-blue-300">How this works</div>
            <div className="text-[12px] text-blue-700 dark:text-blue-400 mt-1 space-y-1">
              <p>Use this panel to <strong>inject demo transactions</strong> into the user&apos;s account to illustrate the deposit and withdrawal lifecycle.</p>
              <p>1. Inject a deposit or withdrawal — it appears as <strong>Pending</strong> in the user&apos;s account.</p>
              <p>2. Go to the <strong>Deposits</strong> or <strong>Withdrawals</strong> tab and click Approve, Hold, or Reject.</p>
              <p>3. The status updates in real-time for the user, demonstrating the full admin-to-user flow.</p>
            </div>
          </div>
        </div>
      </div>

      {!hasData && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-[12.5px] text-amber-700 dark:text-amber-300">
          Tip: User has no data yet. Load demo data first, or inject a transaction here to start fresh.
        </div>
      )}

      {/* Type toggle */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
        <div className="text-[12.5px] font-semibold mb-4">Inject a transaction</div>

        <div className="flex gap-2 mb-5">
          {(["deposit", "withdrawal"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setRail(t === "deposit" ? DEPOSIT_RAILS[0] : WITHDRAW_RAILS[0]) }}
              className={cn(
                "flex items-center gap-2 px-4 h-9 rounded-xl text-[13px] font-medium transition border",
                type === t
                  ? t === "deposit"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-violet-600 text-white border-violet-600"
                  : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/8"
              )}
            >
              {t === "deposit" ? <ArrowDownLeftIcon className="h-4 w-4" /> : <ArrowUpRightIcon className="h-4 w-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Amount (USD)">
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </FormField>

          <FormField label="Rail / Network">
            <select
              value={rail}
              onChange={(e) => setRail(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {rails.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>

          {type === "deposit" ? (
            <FormField label="Description / Source" className="col-span-2">
              <input
                placeholder="e.g. ACH from Acme Corp., Invoice #1042"
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </FormField>
          ) : (
            <>
              <FormField label="Recipient / Payee">
                <input
                  placeholder="e.g. Atlas Components Ltd."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </FormField>
              <FormField label="Memo (optional)">
                <input
                  placeholder="e.g. Invoice INV-2048"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </FormField>
            </>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="text-[11.5px] text-gray-400 dark:text-gray-500">
            Transaction will be created with status <strong>Pending</strong> — then approve, hold, or reject it from the{" "}
            {type === "deposit" ? "Deposits" : "Withdrawals"} tab.
          </div>
          <Button
            size="sm"
            className={cn("gap-2 ml-4", type === "deposit" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-violet-600 hover:bg-violet-700")}
            onClick={handleInject}
            disabled={busy || !amount}
          >
            <SendIcon className="h-3.5 w-3.5" />
            {busy ? "Injecting…" : `Inject ${type}`}
          </Button>
        </div>
      </div>

      {/* Demo scenarios */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
        <SectionHeader title="Quick demo scenarios" subtitle="Pre-filled examples to demonstrate the flow" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { type: "deposit" as const, label: "ACH · $25,000", rail: "ACH", amount: "25000", desc: "ACH from Acme Corp." },
            { type: "deposit" as const, label: "Wire · $120,000", rail: "Wire", amount: "120000", desc: "Wire · Client invoice #INV-2048" },
            { type: "deposit" as const, label: "BTC · $8,400", rail: "BTC", amount: "8400", desc: "BTC transfer · 0.12 BTC" },
            { type: "withdrawal" as const, label: "Wire · $245,000", rail: "Wire", amount: "245000", recipient: "Atlas Components Ltd.", memo: "Vendor payment" },
            { type: "withdrawal" as const, label: "ACH · $412,800", rail: "ACH", amount: "412800", recipient: "Payroll · 84 staff", memo: "Jun payroll" },
            { type: "withdrawal" as const, label: "USDT · $50,000", rail: "USDT (TRC-20)", amount: "50000", recipient: "TRX wallet 0xd4a…", memo: "Crypto transfer" },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => {
                setType(s.type)
                setRail(s.rail)
                setAmount(s.amount)
                if (s.type === "deposit") { setDesc(s.desc ?? ""); setRecipient(""); setMemo("") }
                else { setRecipient(s.recipient ?? ""); setMemo(s.memo ?? ""); setDesc("") }
              }}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/8 transition text-left"
            >
              <div className="flex items-center gap-2">
                {s.type === "deposit"
                  ? <ArrowDownLeftIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  : <ArrowUpRightIcon className="h-3.5 w-3.5 text-violet-500 shrink-0" />}
                <span className="text-[12px] font-medium">{s.label}</span>
              </div>
              <Tag tone={s.type === "deposit" ? "green" : "brand"}>
                {s.type === "deposit" ? "Deposit" : "Withdrawal"}
              </Tag>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[11.5px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-12 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-[14px] font-medium text-gray-400">{title}</div>
      <div className="text-[12px] text-gray-400 mt-1">{description}</div>
    </div>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

function DataRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 text-[12.5px]">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium tabular-nums">{value ?? "—"}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 mb-4">
      <SectionHeader title={title} />
      <div className="mt-3">{children}</div>
    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: Awaited<ReturnType<typeof adminGetUserFinancialData>> | null }) {
  const b = data?.balance
  return (
    <>
      <Section title="Balance Overview">
        {!b ? <div className="text-[12px] text-gray-400">No balance data</div> : (
          <>
            <DataRow label="Current balance"  value={`$${parseFloat(b.currentBalance).toLocaleString()}`} />
            <DataRow label="Balance Δ%"        value={`${b.balanceDelta}%`} />
            <DataRow label="Inflow"            value={`$${parseFloat(b.inflowAmount).toLocaleString()}`} />
            <DataRow label="Outflow"           value={`$${parseFloat(b.outflowAmount).toLocaleString()}`} />
            <DataRow label="Net"               value={`$${parseFloat(b.netAmount).toLocaleString()}`} />
            <DataRow label="Burn rate / day"   value={`$${parseFloat(b.burnRatePerDay).toLocaleString()}`} />
            <DataRow label="Yield APY"         value={`${b.yieldApy}%`} />
            <DataRow label="Total accounts"    value={b.totalAccounts} />
          </>
        )}
      </Section>

      <Section title={`Bank Accounts (${data?.accounts?.length ?? 0})`}>
        {!data?.accounts?.length ? <div className="text-[12px] text-gray-400">No accounts</div> : (
          data.accounts.map((a) => (
            <div key={a.id} className="py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 flex items-center justify-between text-[12.5px]">
              <div>
                <div className="font-medium">{a.name} <span className="text-gray-400 font-mono text-[11px]">••• {a.lastFour}</span></div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{a.bankName} · {a.currency}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{a.balance}</div>
                <Tag tone={a.status === "active" ? "green" : a.status === "earning" ? "brand" : "amber"}>{a.status}</Tag>
              </div>
            </div>
          ))
        )}
      </Section>

      <Section title={`All Transactions (${data?.transactions?.length ?? 0})`}>
        {!data?.transactions?.length ? <div className="text-[12px] text-gray-400">No transactions</div> : (
          data.transactions.map((t) => (
            <div key={t.id} className="py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 flex items-center justify-between text-[12.5px]">
              <div>
                <div className="font-medium">{t.description}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{t.category} · {t.transactionDate}</div>
              </div>
              <div className="text-right">
                <div className={cn("font-semibold", t.direction === "inbound" ? "text-emerald-600 dark:text-emerald-400" : "")}>{t.amount}</div>
                <Tag tone={STATUS_TONE[t.statusTone] ?? "neutral"}>{t.status}</Tag>
              </div>
            </div>
          ))
        )}
      </Section>
    </>
  )
}

// ─── Cards tab ────────────────────────────────────────────────────────────────

function CardsTab({ data }: { data: Awaited<ReturnType<typeof adminGetUserFinancialData>> | null }) {
  const stats = data?.cardStats
  return (
    <>
      {stats && (
        <Section title="Card Program Stats">
          <DataRow label="Card spend MTD"     value={`$${parseFloat(stats.cardSpendMtd).toLocaleString()}`} />
          <DataRow label="Card spend Δ%"      value={`${stats.cardSpendDelta}%`} />
          <DataRow label="Rebate YTD"         value={`$${parseFloat(stats.rebateEarnedYtd).toLocaleString()}`} />
          <DataRow label="Rebate %"           value={`${stats.rebatePercent}%`} />
          <DataRow label="Top merchant"       value={stats.topMerchantName} />
          <DataRow label="Top merchant amount" value={stats.topMerchantAmount} />
          <DataRow label="Declines (total)"   value={stats.declinedThisMonth} />
          <DataRow label="Declines (policy)"  value={stats.declinedByPolicy} />
          <DataRow label="Declines (network)" value={stats.declinedByNetwork} />
        </Section>
      )}

      <Section title={`Cards (${data?.cards?.length ?? 0})`}>
        {!data?.cards?.length ? <div className="text-[12px] text-gray-400">No cards</div> : (
          data.cards.map((c) => (
            <div key={c.id} className="py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 flex items-center justify-between text-[12.5px]">
              <div>
                <div className="font-medium">{c.label} {c.isOwnerCard && <Tag tone="brand">Owner</Tag>}</div>
                <div className="text-[11px] text-gray-500">{c.cardUser} · {c.cardType} · ••• {c.lastFour}</div>
              </div>
              <div className="text-right">
                <div className="text-[11.5px]">${parseFloat(c.spentAmount).toLocaleString()} / ${parseFloat(c.limitAmount).toLocaleString()}</div>
                <Tag tone={c.status === "active" ? "green" : c.status === "frozen" ? "rose" : "amber"}>{c.status}</Tag>
              </div>
            </div>
          ))
        )}
      </Section>

      <Section title={`Spend Categories — Overview (${data?.overviewSpend?.length ?? 0})`}>
        {!data?.overviewSpend?.length ? <div className="text-[12px] text-gray-400">No spend categories</div> : (
          data.overviewSpend.map((s) => (
            <div key={s.id} className="py-2 border-b border-gray-100 dark:border-white/8 last:border-0 flex items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
                <span>{s.label}</span>
              </div>
              <span className="tabular-nums">{s.amountDisplay} ({s.percentage}%)</span>
            </div>
          ))
        )}
      </Section>
    </>
  )
}

// ─── KPIs tab ─────────────────────────────────────────────────────────────────

function KpisTab({ data }: { data: Awaited<ReturnType<typeof adminGetUserFinancialData>> | null }) {
  return (
    <>
      <Section title={`KPI Entries (${data?.kpis?.length ?? 0})`}>
        {!data?.kpis?.length ? <div className="text-[12px] text-gray-400">No KPI entries</div> : (
          data.kpis.map((k) => (
            <div key={k.id} className="py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 flex items-center justify-between text-[12.5px]">
              <div>
                <div className="font-medium">{k.label}</div>
                <div className="text-[11px] text-gray-500">{k.hint}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{k.value}</div>
                <div className="text-[11px] text-gray-500">Δ {k.delta}%</div>
              </div>
            </div>
          ))
        )}
      </Section>

      <Section title={`Upcoming Payments (${data?.upcoming?.length ?? 0})`}>
        {!data?.upcoming?.length ? <div className="text-[12px] text-gray-400">No upcoming payments</div> : (
          data.upcoming.map((u) => (
            <div key={u.id} className="py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 flex items-center justify-between text-[12.5px]">
              <div>
                <div className="font-medium">{u.payee}</div>
                <div className="text-[11px] text-gray-500">{u.description}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{u.dueDateDisplay}</div>
                <Tag tone={u.tone}>{u.statusLabel}</Tag>
              </div>
            </div>
          ))
        )}
      </Section>
    </>
  )
}

// ─── Activity tab ─────────────────────────────────────────────────────────────

function ActivityTab({ data }: { data: Awaited<ReturnType<typeof adminGetUserFinancialData>> | null }) {
  return (
    <Section title={`Activity Log (${data?.activity?.length ?? 0})`}>
      {!data?.activity?.length ? <div className="text-[12px] text-gray-400">No activity</div> : (
        data.activity.map((a) => (
          <div key={a.id} className="py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 flex items-center justify-between text-[12.5px]">
            <div>
              <span className="font-medium">{a.actorName}</span>{" "}
              <span className="text-gray-600 dark:text-gray-400">{a.action}</span>
            </div>
            <span className="text-gray-500 shrink-0 ml-4">{a.timeAgo}</span>
          </div>
        ))
      )}
    </Section>
  )
}

// ─── Notifications tab ────────────────────────────────────────────────────────

function NotificationsTab({ data }: { data: Awaited<ReturnType<typeof adminGetUserFinancialData>> | null }) {
  return (
    <Section title={`Notification Preferences (${data?.notifPrefs?.length ?? 0})`}>
      {!data?.notifPrefs?.length ? <div className="text-[12px] text-gray-400">No notification prefs — will appear after demo data is loaded</div> : (
        data.notifPrefs.map((p) => (
          <div key={p.id} className="py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 flex items-center justify-between text-[12.5px]">
            <span>{p.label}</span>
            <Tag tone={p.enabled ? "green" : "neutral"}>{p.enabled ? "Enabled" : "Disabled"}</Tag>
          </div>
        ))
      )}
    </Section>
  )
}
