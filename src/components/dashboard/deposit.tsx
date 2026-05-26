"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CopyIcon, ArrowDownLeftIcon, BuildingIcon,
  SmartphoneIcon, ZapIcon, RefreshCwIcon,
  AlertTriangleIcon, CheckCircleIcon, XCircleIcon,
  PencilIcon, TrashIcon, CheckIcon, XIcon,
} from "lucide-react"
import { Tag, PageHeader, SectionHeader, AvatarBadge } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useServerData } from "@/hooks/use-server-data"
import { queryTransactions, queryBalanceOverview, queryAccounts } from "@/modules/financial/application/queries/financial.queries"
import {
  userRequestDeposit,
  userCancelDeposit,
  userEditDeposit,
} from "@/modules/financial/application/mutations/financial.mutations"

// ─── ACH static info ─────────────────────────────────────────────

const ACH_INFO = {
  fee: "Free",
  speed: "1–3 business days",
  limit: "$250,000 / day",
  routing: "026009593",
  bankName: "First Meridian Bank, N.A.",
  swift: "MRDNUS33",
}

const CRYPTO_SYMBOLS = new Set(["BTC", "ETH", "TRX", "USDT", "USDC", "SOL", "BNB"])

// ─── Crypto data ─────────────────────────────────────────────────

const CRYPTO_NETWORKS = [
  {
    id: "btc",    symbol: "BTC",  name: "Bitcoin",       badge: "₿", badgeColor: "bg-orange-500",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    minDeposit: "0.0001 BTC",  confirmations: "2 confirmations (~20 min)", fee: "Network fee only", network: "Bitcoin Network",
  },
  {
    id: "eth",    symbol: "ETH",  name: "Ethereum",      badge: "Ξ", badgeColor: "bg-indigo-500",
    address: "0x742d35Cc6634C0532925a3b8D4C9b5e2B4f3a1d",
    minDeposit: "0.001 ETH",   confirmations: "12 confirmations (~2 min)", fee: "Gas fee only", network: "Ethereum Mainnet",
  },
  {
    id: "trx",    symbol: "TRX",  name: "Tron",          badge: "T", badgeColor: "bg-red-500",
    address: "TJYeasTPa1GDdSqFmJFn9BGKwqrNW8k6eJ",
    minDeposit: "10 TRX",      confirmations: "20 confirmations (~1 min)", fee: "1 TRX", network: "Tron Network",
  },
  {
    id: "usdt_trx", symbol: "USDT", name: "USDT (TRC-20)", badge: "₮", badgeColor: "bg-teal-500",
    address: "TJYeasTPa1GDdSqFmJFn9BGKwqrNW8k6eJ",
    minDeposit: "1 USDT",      confirmations: "20 confirmations (~1 min)", fee: "1 TRX bandwidth", network: "Tron Network (TRC-20)",
  },
  {
    id: "usdt_eth", symbol: "USDT", name: "USDT (ERC-20)", badge: "₮", badgeColor: "bg-teal-700",
    address: "0x742d35Cc6634C0532925a3b8D4C9b5e2B4f3a1d",
    minDeposit: "10 USDT",     confirmations: "12 confirmations (~2 min)", fee: "Gas fee only", network: "Ethereum Mainnet (ERC-20)",
  },
] as const

// ─── Helpers ─────────────────────────────────────────────────────

function NetworkBadge({ net, size = 20 }: { net: typeof CRYPTO_NETWORKS[number]; size?: number }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full text-white font-bold shrink-0", net.badgeColor)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {net.badge}
    </span>
  )
}

// ─── Pending deposit row with inline edit / cancel ───────────────

function PendingDepositRow({
  txn,
  onRefetch,
  onFlash,
}: {
  txn: { id: string; description: string; amount: string; category: string; transactionDate: string; accountRef: string | null }
  onRefetch: () => void
  onFlash: (type: "success" | "error", msg: string) => void
}) {
  const [editing, setEditing]   = useState(false)
  const [busy, setBusy]         = useState(false)
  const [editDesc, setEditDesc] = useState(txn.description)
  const [editAmt, setEditAmt]   = useState(
    txn.amount.replace(/[^0-9.]/g, "")
  )
  const [editMemo, setEditMemo] = useState(txn.accountRef ?? "")

  async function handleSave() {
    const num = parseFloat(editAmt)
    if (!editAmt || isNaN(num) || num <= 0) return
    setBusy(true)
    try {
      await userEditDeposit(txn.id, { description: editDesc, amountUsd: num, memo: editMemo })
      onFlash("success", "Deposit updated successfully.")
      onRefetch()
      setEditing(false)
    } catch {
      onFlash("error", "Failed to update. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel this pending deposit request?")) return
    setBusy(true)
    try {
      await userCancelDeposit(txn.id)
      onFlash("success", "Deposit request cancelled.")
      onRefetch()
    } catch {
      onFlash("error", "Failed to cancel. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/10 p-3.5 space-y-2.5">
        <div className="text-[11.5px] font-semibold text-blue-700 dark:text-blue-400 mb-1">Edit deposit request</div>
        <div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Description</div>
          <input
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-9 text-[13px] outline-none focus:border-blue-400 dark:focus:border-blue-500/50 transition"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Amount (USD)</div>
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-transparent">
              <span className="px-3 text-[12px] text-gray-400 border-r border-gray-200 dark:border-white/10 h-9 flex items-center shrink-0">$</span>
              <input
                type="number" min="0" value={editAmt}
                onChange={(e) => setEditAmt(e.target.value)}
                className="flex-1 px-3 h-9 text-[13px] font-mono bg-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Reference / memo</div>
            <input
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-9 text-[13px] outline-none focus:border-blue-400 transition"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" className="gap-1.5 h-8" disabled={busy} onClick={handleSave}>
            {busy ? <RefreshCwIcon className="h-3 w-3 animate-spin" /> : <CheckIcon className="h-3 w-3" />}
            Save
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5" disabled={busy} onClick={() => setEditing(false)}>
            <XIcon className="h-3 w-3" />Discard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 px-3.5 py-3">
      <AvatarBadge name={txn.description} size={30} />
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium truncate dark:text-white">{txn.description}</div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400">{txn.accountRef} · {txn.transactionDate}</div>
      </div>
      <div className="text-right mr-1">
        <div className="text-[13px] font-semibold tabular-nums dark:text-white">{txn.amount}</div>
        <Tag tone="amber" className="mt-0.5">Pending</Tag>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setEditing(true)}
          title="Edit"
          disabled={busy}
          className="h-7 w-7 grid place-items-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition"
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleCancel}
          title="Cancel deposit"
          disabled={busy}
          className="h-7 w-7 grid place-items-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
        >
          {busy ? <RefreshCwIcon className="h-3 w-3 animate-spin" /> : <TrashIcon className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────

export function DepositPage() {
  const [transferType, setTransferType] = useState<"bank" | "crypto">("bank")
  const [cryptoNet, setCryptoNet]       = useState("btc")
  const [copied, setCopied]             = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [depositDesc, setDepositDesc]   = useState("")
  const [depositMemo, setDepositMemo]   = useState("")
  const [sending, setSending]           = useState(false)
  const [feedback, setFeedback]         = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const { data: txnsData, refetch }   = useServerData(() => queryTransactions(), [])
  const { data: balance }             = useServerData(() => queryBalanceOverview(), [])
  const { data: accounts }            = useServerData(() => queryAccounts(), [])

  const allInbound     = (txnsData ?? []).filter((t) => t.direction === "inbound")
  const pendingInbound = allInbound.filter((t) => t.statusTone === "amber")
  const settledInbound = allInbound.filter((t) => t.statusTone !== "amber")

  // Pull routing from the primary bank account if available
  const primaryAccount = (accounts ?? []).find((a) => !CRYPTO_SYMBOLS.has(a.currency))
  const routingDisplay = primaryAccount?.routing ?? ACH_INFO.routing
  const accountDisplay = primaryAccount ? `•••• ${primaryAccount.lastFour}` : "•••• ????  "
  const bankDisplay    = primaryAccount?.bankName ?? ACH_INFO.bankName

  function flash(type: "success" | "error", msg: string) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 6000)
  }

  function handleCopy(value: string, field: string) {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(field)
    setTimeout(() => setCopied(null), 1500)
  }

  async function handleInitiateDeposit() {
    const numeric = parseFloat(depositAmount)
    if (!depositAmount || isNaN(numeric) || numeric <= 0 || sending) return
    setSending(true)
    setFeedback(null)
    try {
      await userRequestDeposit({
        description: depositDesc || `ACH deposit`,
        category:    "Deposit · ACH",
        amountUsd:   numeric,
        accountRef:  depositMemo || "Operating · Primary",
      })
      flash("success", `Deposit request of $${numeric.toLocaleString("en-US", { minimumFractionDigits: 2 })} submitted — your instructor will review and approve it.`)
      setDepositAmount("")
      setDepositDesc("")
      setDepositMemo("")
      refetch()
    } catch {
      flash("error", "Failed to submit deposit request. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const activeCrypto = CRYPTO_NETWORKS.find((n) => n.id === cryptoNet)!

  const ACCOUNT_FIELDS = [
    { label: "Routing number", value: routingDisplay,  id: "routing" },
    { label: "Account number", value: accountDisplay,  id: "account" },
    { label: "Bank name",      value: bankDisplay,     id: "bank"    },
    { label: "SWIFT / BIC",   value: ACH_INFO.swift,  id: "swift"   },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Deposit"
        title="Deposit."
        subtitle="ACH bank transfers — receive funds directly into your account."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={refetch}>
              <RefreshCwIcon className="h-3.5 w-3.5" />Refresh
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => {
              setTransferType("bank")
              document.getElementById("ach-amount")?.focus()
            }}>
              <ArrowDownLeftIcon className="h-3.5 w-3.5" />New deposit
            </Button>
          </>
        }
      />

      {/* Feedback banner */}
      {feedback && (
        <div className={cn(
          "flex items-center gap-2.5 rounded-xl px-4 py-3 text-[12.5px] font-medium",
          feedback.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
        )}>
          {feedback.type === "success"
            ? <CheckCircleIcon className="h-4 w-4 shrink-0" />
            : <XCircleIcon className="h-4 w-4 shrink-0" />}
          <span className="flex-1">{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="shrink-0 opacity-60 hover:opacity-100 transition">✕</button>
        </div>
      )}

      {/* Tab toggle */}
      <div className="inline-flex rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-1 self-start">
        {(["bank", "crypto"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTransferType(t)}
            className={cn(
              "px-5 h-8 rounded-lg text-[12.5px] font-medium transition capitalize",
              transferType === t
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {t === "bank" ? "Bank / ACH" : "Crypto"}
          </button>
        ))}
      </div>

      {/* ── ACH / Bank mode ─────────────────────────────────────── */}
      {transferType === "bank" && (
        <div className="grid grid-cols-12 gap-4">

          {/* Left: ACH form */}
          <div className="col-span-12 lg:col-span-7 space-y-4">

            {/* ACH method card */}
            <div className="rounded-2xl border border-gray-900 dark:border-white bg-gray-900 dark:bg-white p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-xl bg-white/10 dark:bg-gray-900/10 grid place-items-center">
                  <BuildingIcon className="h-4.5 w-4.5 text-white dark:text-gray-900" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-white dark:text-gray-900">Bank Transfer (ACH)</div>
                  <div className="text-[11.5px] text-white/60 dark:text-gray-900/60">
                    Link an external bank and pull funds directly.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Fee",   value: ACH_INFO.fee   },
                  { label: "Speed", value: ACH_INFO.speed  },
                  { label: "Limit", value: ACH_INFO.limit  },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-white/8 dark:bg-gray-900/8 px-3 py-2.5">
                    <div className="text-[10.5px] text-white/50 dark:text-gray-900/50 font-medium uppercase tracking-wide">{s.label}</div>
                    <div className="text-[12.5px] text-white dark:text-gray-900 font-semibold mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deposit form */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
              <SectionHeader title="New deposit request" subtitle="Your instructor will review and approve." />
              <div className="mt-4 space-y-3">
                {/* Description */}
                <div>
                  <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1.5">Description</div>
                  <input
                    value={depositDesc}
                    onChange={(e) => setDepositDesc(e.target.value)}
                    placeholder="e.g. Monthly salary, Tuition payment…"
                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-10 text-[13px] placeholder:text-gray-400 outline-none focus:border-gray-400 dark:focus:border-white/30 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Amount */}
                  <div>
                    <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1.5">Amount (USD)</div>
                    <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                      <span className="px-3 text-[12.5px] text-gray-400 border-r border-gray-200 dark:border-white/10 h-10 flex items-center shrink-0">$</span>
                      <input
                        id="ach-amount"
                        type="number" min="0" step="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 px-3 h-10 text-[13px] font-mono bg-white dark:bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Reference */}
                  <div>
                    <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1.5">Reference / memo</div>
                    <input
                      value={depositMemo}
                      onChange={(e) => setDepositMemo(e.target.value)}
                      placeholder="Invoice #, wire ref…"
                      className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-10 text-[13px] placeholder:text-gray-400 outline-none focus:border-gray-400 dark:focus:border-white/30 transition"
                    />
                  </div>
                </div>

                {/* Balance hint */}
                {balance && (
                  <div className="text-[11.5px] text-gray-500 dark:text-gray-400">
                    Current balance:{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      ${parseFloat(balance.currentBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <Button
                  size="sm"
                  className="gap-1.5 w-full sm:w-auto"
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0 || sending}
                  onClick={handleInitiateDeposit}
                >
                  {sending
                    ? <><RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />Submitting…</>
                    : <><ArrowDownLeftIcon className="h-3.5 w-3.5" />Initiate ACH deposit</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Account details + Pending */}
          <div className="col-span-12 lg:col-span-5 space-y-4">

            {/* Account details */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
              <SectionHeader title="Account details" subtitle="Share these to receive ACH transfers" />
              <div className="mt-4 space-y-2.5">
                {ACCOUNT_FIELDS.map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 px-3.5 py-3">
                    <div>
                      <div className="text-[10.5px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">{f.label}</div>
                      <div className="text-[13px] font-mono font-medium mt-0.5 dark:text-white">{f.value}</div>
                    </div>
                    <button
                      onClick={() => handleCopy(f.value, f.id)}
                      className="ml-4 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition"
                    >
                      {copied === f.id
                        ? <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
                        : <CopyIcon className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending deposits */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
              <SectionHeader
                title="Pending"
                subtitle={`${pendingInbound.length} awaiting approval`}
                right={pendingInbound.length > 0 ? <Tag tone="amber">{pendingInbound.length}</Tag> : undefined}
              />
              <div className="mt-3 space-y-2">
                {pendingInbound.length === 0 ? (
                  <div className="py-6 text-center rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-[12px] text-gray-400 dark:text-gray-500">
                    No pending deposits — all clear.
                  </div>
                ) : pendingInbound.map((d) => (
                  <PendingDepositRow
                    key={d.id}
                    txn={d}
                    onRefetch={refetch}
                    onFlash={flash}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Full-width: Recent settled deposits */}
          <div className="col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader
              title="Deposit history"
              subtitle={`${settledInbound.length} settled`}
              right={
                <button
                  onClick={refetch}
                  className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline"
                >
                  <RefreshCwIcon className="h-3 w-3" />Refresh
                </button>
              }
            />
            {settledInbound.length === 0 ? (
              <div className="mt-4 py-12 text-center text-[13px] text-gray-400 dark:text-gray-500">
                No settled deposits yet. Your instructor will add funds to your account.
              </div>
            ) : (
              <div className="mt-3">
                {/* Column headers */}
                <div className="grid grid-cols-12 gap-2 px-1 pb-2 text-[10.5px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                  <div className="col-span-4">Description</div>
                  <div className="col-span-2">Method</div>
                  <div className="col-span-3">Reference</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                {settledInbound.map((d) => (
                  <div
                    key={d.id}
                    className="grid grid-cols-12 gap-2 items-center px-1 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition"
                  >
                    <div className="col-span-4 flex items-center gap-2.5">
                      <AvatarBadge name={d.description} size={28} />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium truncate dark:text-white">{d.description}</div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Tag tone="neutral">{d.category.replace("Deposit · ", "")}</Tag>
                    </div>
                    <div className="col-span-3 text-[11.5px] text-gray-500 dark:text-gray-400 truncate">{d.accountRef}</div>
                    <div className="col-span-1 text-[11.5px] text-gray-500 dark:text-gray-400">{d.transactionDate}</div>
                    <div className="col-span-2 text-right">
                      <div className="text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{d.amount}</div>
                      <Tag tone={d.statusTone as "green" | "rose" | "amber" | "neutral"} className="mt-0.5">{d.status}</Tag>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Crypto mode ─────────────────────────────────────────── */}
      {transferType === "crypto" && (
        <div className="grid grid-cols-12 gap-4">
          {/* Network selector + address */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader title="Select network" subtitle="Each network has a unique deposit address" />
            <div className="mt-4 flex flex-wrap gap-2">
              {CRYPTO_NETWORKS.map((n) => {
                const active = cryptoNet === n.id
                return (
                  <button
                    key={n.id}
                    onClick={() => setCryptoNet(n.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-medium transition",
                      active
                        ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                        : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <NetworkBadge net={n} size={18} />
                    {n.name}
                  </button>
                )
              })}
            </div>

            <div className="mt-5">
              <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-2">
                Your {activeCrypto.name} deposit address
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <NetworkBadge net={activeCrypto} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{activeCrypto.network}</div>
                    <div className="text-[12.5px] font-mono font-medium break-all leading-relaxed dark:text-white">
                      {activeCrypto.address}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(activeCrypto.address, "addr")}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 px-2.5 py-1.5 text-[11.5px] font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition"
                  >
                    {copied === "addr"
                      ? <><CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />Copied</>
                      : <><CopyIcon className="h-3.5 w-3.5" />Copy</>}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3.5 py-3">
              <AlertTriangleIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-amber-700 dark:text-amber-300 leading-relaxed">
                Only send <strong>{activeCrypto.symbol}</strong> to this address on the <strong>{activeCrypto.network}</strong>.
                Sending any other asset will result in permanent loss.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Minimum deposit", value: activeCrypto.minDeposit   },
                { label: "Confirmations",   value: activeCrypto.confirmations },
                { label: "Fee",             value: activeCrypto.fee           },
              ].map((row) => (
                <div key={row.label} className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2.5">
                  <div className="text-[10.5px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{row.label}</div>
                  <div className="text-[12px] font-medium mt-0.5 dark:text-white">{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Supported networks */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader title="Supported networks" subtitle="All networks active" />
            <div className="mt-4 space-y-2">
              {CRYPTO_NETWORKS.map((n) => (
                <div
                  key={n.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/8 hover:bg-gray-50 dark:hover:bg-white/5 transition cursor-pointer"
                  onClick={() => setCryptoNet(n.id)}
                >
                  <NetworkBadge net={n} size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium dark:text-white">{n.name}</div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">{n.network}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">{n.confirmations.split("(")[0].trim()}</div>
                    <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500 ml-auto mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
