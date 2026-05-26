"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CopyIcon, ArrowDownLeftIcon, BuildingIcon, SmartphoneIcon,
  ZapIcon, RefreshCwIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon,
} from "lucide-react"
import { Tag, PageHeader, SectionHeader, AvatarBadge } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useServerData } from "@/hooks/use-server-data"
import { queryTransactions, queryBalanceOverview } from "@/modules/financial/application/queries/financial.queries"
import { userRequestDeposit } from "@/modules/financial/application/mutations/financial.mutations"

// ─── Bank data ───────────────────────────────────────────────────

const DEPOSIT_METHODS = [
  {
    id: "ach",
    icon: BuildingIcon,
    label: "Bank Transfer (ACH)",
    description: "Link an external bank and pull funds directly.",
    fee: "Free",
    time: "1–3 business days",
    limit: "$250,000 / day",
  },
  {
    id: "wire",
    icon: ArrowDownLeftIcon,
    label: "Wire Transfer",
    description: "Receive domestic or international wire to your account.",
    fee: "$15 incoming",
    time: "Same day",
    limit: "Unlimited",
  },
  {
    id: "rtp",
    icon: ZapIcon,
    label: "Instant (RTP / FedNow)",
    description: "Real-time push from any RTP-enabled institution.",
    fee: "$0.50",
    time: "< 30 seconds",
    limit: "$1,000,000",
  },
  {
    id: "check",
    icon: SmartphoneIcon,
    label: "Mobile Check Deposit",
    description: "Photograph a check with the Meridian mobile app.",
    fee: "Free",
    time: "2–5 business days",
    limit: "$50,000 / day",
  },
] as const

const RECENT_DEPOSITS = [
  ["Northwind Inc.", "Wire",    142500.0,  "Today, 09:14"],
  ["Payroll return", "ACH",      3420.0,  "Yesterday"],
  ["Client retainer","Wire",    85000.0,  "May 24"],
  ["Reimbursement",  "ACH",      1840.92, "May 23"],
  ["Security deposit","ACH",   28000.0,  "May 20"],
  ["Atlas Components","RTP",    9800.0,  "May 19"],
] as const

const PENDING_DEPOSITS = [
  ["Acme Corp.",  "ACH pull",      "$24,800.00", "Arrives Jun 3",  "amber"],
  ["Lumen Labs",  "Wire incoming", "$48,600.00", "Arrives today",  "brand"],
] as const

const ACCOUNT_INFO = {
  routing: "026009593",
  account: "•••• 4910",
  bank: "First Meridian Bank, N.A.",
  swift: "MRDNUS33",
}

// ─── Crypto data ─────────────────────────────────────────────────

const CRYPTO_NETWORKS = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    badge: "₿",
    badgeColor: "bg-orange-500",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    minDeposit: "0.0001 BTC",
    confirmations: "2 confirmations (~20 min)",
    fee: "Network fee only",
    network: "Bitcoin Network",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    badge: "Ξ",
    badgeColor: "bg-indigo-500",
    address: "0x742d35Cc6634C0532925a3b8D4C9b5e2B4f3a1d",
    minDeposit: "0.001 ETH",
    confirmations: "12 confirmations (~2 min)",
    fee: "Gas fee only",
    network: "Ethereum Mainnet",
  },
  {
    id: "trx",
    symbol: "TRX",
    name: "Tron",
    badge: "T",
    badgeColor: "bg-red-500",
    address: "TJYeasTPa1GDdSqFmJFn9BGKwqrNW8k6eJ",
    minDeposit: "10 TRX",
    confirmations: "20 confirmations (~1 min)",
    fee: "1 TRX",
    network: "Tron Network",
  },
  {
    id: "usdt_trx",
    symbol: "USDT",
    name: "USDT (TRC-20)",
    badge: "₮",
    badgeColor: "bg-teal-500",
    address: "TJYeasTPa1GDdSqFmJFn9BGKwqrNW8k6eJ",
    minDeposit: "1 USDT",
    confirmations: "20 confirmations (~1 min)",
    fee: "1 TRX bandwidth",
    network: "Tron Network (TRC-20)",
  },
  {
    id: "usdt_eth",
    symbol: "USDT",
    name: "USDT (ERC-20)",
    badge: "₮",
    badgeColor: "bg-teal-700",
    address: "0x742d35Cc6634C0532925a3b8D4C9b5e2B4f3a1d",
    minDeposit: "10 USDT",
    confirmations: "12 confirmations (~2 min)",
    fee: "Gas fee only",
    network: "Ethereum Mainnet (ERC-20)",
  },
] as const

const RECENT_CRYPTO_DEPOSITS = [
  { from: "External wallet", network: "BTC",      amount: "2.0182 BTC",      usd: "$141,200", date: "Today, 14:22" },
  { from: "Binance",         network: "USDT_ETH", amount: "50,000 USDT",     usd: "$50,000",  date: "May 25" },
  { from: "Coinbase",        network: "ETH",      amount: "12.5 ETH",        usd: "$43,750",  date: "May 24" },
  { from: "OKX",             network: "TRX",      amount: "85,000 TRX",      usd: "$12,920",  date: "May 22" },
  { from: "External wallet", network: "USDT_TRX", amount: "28,000 USDT",     usd: "$28,000",  date: "May 20" },
] as const

const PENDING_CRYPTO = [
  { from: "Binance",   network: "BTC",  amount: "0.5 BTC",    usd: "$35,100", confs: "1 / 2 conf." },
  { from: "Kraken",    network: "ETH",  amount: "4.2 ETH",    usd: "$14,700", confs: "8 / 12 conf." },
] as const

// ─── Helpers ─────────────────────────────────────────────────────

const CRYPTO_IMG: Record<string, string> = {
  btc:      "/img/bitcoin.png",
  eth:      "/img/ethereum.png",
  trx:      "/img/trx.png",
  usdt_trx: "/img/usdt-trx.png",
  usdt_eth: "/img/usdt-eth.png",
}

function NetworkBadge({ net, size = 20 }: { net: typeof CRYPTO_NETWORKS[number]; size?: number }) {
  const src = CRYPTO_IMG[net.id]
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={net.symbol} width={size} height={size}
        style={{ borderRadius: "50%", objectFit: "contain", flexShrink: 0 }} />
    )
  }
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full text-white font-bold shrink-0", net.badgeColor)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {net.badge}
    </span>
  )
}

function networkLabel(id: string) {
  return CRYPTO_NETWORKS.find(n => n.id === id.toLowerCase())?.name ?? id
}

// ─── Component ───────────────────────────────────────────────────

export function DepositPage() {
  const [transferType, setTransferType]     = useState<"bank" | "crypto">("bank")
  const [selectedMethod, setSelectedMethod] = useState("ach")
  const [cryptoNet, setCryptoNet]           = useState("btc")
  const [copied, setCopied]                 = useState<string | null>(null)
  const [depositAmount, setDepositAmount]   = useState("")
  const [depositMemo, setDepositMemo]       = useState("")
  const [sending, setSending]               = useState(false)
  const [feedback, setFeedback]             = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const { data: txnsData, refetch }              = useServerData(() => queryTransactions(), [])
  const { data: balance }                        = useServerData(() => queryBalanceOverview(), [])
  const allInbound     = (txnsData ?? []).filter(t => t.direction === "inbound")
  const pendingInbound = allInbound.filter(t => t.statusTone === "amber")
  const settledInbound = allInbound.filter(t => t.statusTone !== "amber")

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
      const method = DEPOSIT_METHODS.find(m => m.id === selectedMethod)!
      await userRequestDeposit({
        description: depositMemo || `Deposit via ${method.label}`,
        category:    `Deposit · ${selectedMethod.toUpperCase()}`,
        amountUsd:   numeric,
        accountRef:  `Operating · Primary`,
      })
      setFeedback({ type: "success", msg: `Deposit request of $${numeric.toLocaleString("en-US", { minimumFractionDigits: 2 })} submitted. Admin will review and approve.` })
      setDepositAmount("")
      setDepositMemo("")
      refetch()
    } catch {
      setFeedback({ type: "error", msg: "Failed to submit deposit request. Please try again." })
    } finally {
      setSending(false)
    }
  }

  const activeCrypto = CRYPTO_NETWORKS.find(n => n.id === cryptoNet)!

  return (
    <>
      <PageHeader
        eyebrow="Deposit"
        title="Deposit."
        subtitle="Bank transfers, wires, RTP and crypto — receive funds into your operating account."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCwIcon className="h-3.5 w-3.5" />Refresh
            </Button>
            <Button size="sm" className="gap-1.5">
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

      {/* Transfer type toggle */}
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
            {t === "bank" ? "Bank / Wire" : "Crypto"}
          </button>
        ))}
      </div>

      {/* ── Bank mode ── */}
      {transferType === "bank" && (
        <div className="grid grid-cols-12 gap-4">
          {/* Deposit methods */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader title="Deposit method" subtitle="Choose how funds will arrive" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {DEPOSIT_METHODS.map((m) => {
                const Icon = m.icon
                const active = selectedMethod === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={cn(
                      "text-left rounded-xl border p-3.5 transition",
                      active
                        ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                        : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 mb-2", active ? "text-white dark:text-gray-900" : "text-gray-500 dark:text-gray-400")} />
                    <div className="text-[12.5px] font-semibold leading-snug">{m.label}</div>
                    <div className={cn("text-[11px] mt-0.5 leading-snug", active ? "text-white/70 dark:text-gray-900/60" : "text-gray-500 dark:text-gray-400")}>
                      {m.description}
                    </div>
                    <div className={cn("mt-3 grid grid-cols-3 gap-1 text-[10.5px]", active ? "text-white/60 dark:text-gray-900/50" : "text-gray-400 dark:text-gray-500")}>
                      <div><div className="font-medium">Fee</div><div>{m.fee}</div></div>
                      <div><div className="font-medium">Speed</div><div>{m.time}</div></div>
                      <div><div className="font-medium">Limit</div><div>{m.limit}</div></div>
                    </div>
                  </button>
                )
              })}
            </div>
            {/* Amount input + initiate */}
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">Amount (USD)</div>
                  <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                    <span className="px-3 text-[12.5px] text-gray-400 border-r border-gray-200 dark:border-white/10 h-10 flex items-center shrink-0">$</span>
                    <input
                      type="number"
                      min="0"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-3 h-10 text-[13px] font-mono bg-white dark:bg-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">Reference / memo</div>
                  <input
                    value={depositMemo}
                    onChange={e => setDepositMemo(e.target.value)}
                    placeholder="Invoice, wire ref…"
                    className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-10 text-[13px] placeholder:text-gray-400 outline-none focus:border-gray-400 dark:focus:border-white/30 transition"
                  />
                </div>
              </div>
              {balance && (
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400">
                  Current balance: <span className="font-semibold text-gray-700 dark:text-gray-300">
                    ${parseFloat(balance.currentBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0 || sending}
                  onClick={handleInitiateDeposit}
                >
                  {sending
                    ? <><RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />Submitting…</>
                    : <><ArrowDownLeftIcon className="h-3.5 w-3.5" />Initiate deposit</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Account info + pending */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader title="Account details" subtitle="Share these to receive wire or ACH" />
            <div className="mt-4 space-y-3">
              {[
                { label: "Routing number", value: ACCOUNT_INFO.routing, id: "routing" },
                { label: "Account number", value: ACCOUNT_INFO.account, id: "account" },
                { label: "Bank name",      value: ACCOUNT_INFO.bank,    id: "bank" },
                { label: "SWIFT / BIC",   value: ACCOUNT_INFO.swift,   id: "swift" },
              ].map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2.5">
                  <div>
                    <div className="text-[10.5px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{f.label}</div>
                    <div className="text-[13px] font-mono font-medium mt-0.5">{f.value}</div>
                  </div>
                  <button
                    onClick={() => handleCopy(f.value, f.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition"
                  >
                    {copied === f.id
                      ? <span className="text-[10.5px] text-green-600 dark:text-green-400 font-medium">Copied</span>
                      : <CopyIcon className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <SectionHeader title="Pending" subtitle={`${pendingInbound.length} incoming`} />
              <div className="mt-3 space-y-2">
                {pendingInbound.length === 0 ? (
                  <div className="text-[12px] text-gray-400 dark:text-gray-500 py-4 text-center">No pending deposits</div>
                ) : pendingInbound.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-white/10 p-3">
                    <AvatarBadge name={d.description} size={30} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium truncate">{d.description}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{d.category} · {d.transactionDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-semibold tabular-nums">{d.amount}</div>
                      <Tag tone="amber" className="mt-0.5">Pending</Tag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent bank deposits */}
          <div className="col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader
              title="Recent deposits"
              subtitle={`${settledInbound.length} settled`}
              right={<button className="text-[12px] text-blue-600 dark:text-blue-400 font-medium" onClick={refetch}>Refresh</button>}
            />
            <div className="mt-3 space-y-1">
              {settledInbound.length === 0 ? (
                <div className="py-10 text-center text-[12.5px] text-gray-400 dark:text-gray-500">
                  No deposits yet. Your instructor will add funds to your account.
                </div>
              ) : settledInbound.map((d) => (
                <div key={d.id} className="grid grid-cols-12 gap-2 items-center px-1 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <div className="col-span-5 flex items-center gap-2.5">
                    <AvatarBadge name={d.description} size={28} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium truncate">{d.description}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{d.transactionDate}</div>
                    </div>
                  </div>
                  <div className="col-span-2"><Tag tone="neutral">{d.category.replace("Deposit · ", "")}</Tag></div>
                  <div className="col-span-3 text-[11.5px] text-gray-500 dark:text-gray-400 truncate">{d.accountRef}</div>
                  <div className="col-span-2 text-right">
                    <div className="text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{d.amount}</div>
                    <Tag tone={d.statusTone as "green" | "rose" | "amber" | "neutral"} className="mt-0.5">{d.status}</Tag>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Crypto mode ── */}
      {transferType === "crypto" && (
        <div className="grid grid-cols-12 gap-4">
          {/* Network selector + address */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader title="Select network" subtitle="Each network has a unique deposit address" />

            {/* Network pills */}
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

            {/* Address display */}
            <div className="mt-5">
              <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-2">
                Your {activeCrypto.name} deposit address
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <NetworkBadge net={activeCrypto} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{activeCrypto.network}</div>
                    <div className="text-[12.5px] font-mono font-medium break-all leading-relaxed">
                      {activeCrypto.address}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(activeCrypto.address, "addr")}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 px-2.5 py-1.5 text-[11.5px] font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition"
                  >
                    {copied === "addr"
                      ? <><CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />Copied</>
                      : <><CopyIcon className="h-3.5 w-3.5" />Copy</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3.5 py-3">
              <AlertTriangleIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-amber-700 dark:text-amber-300 leading-relaxed">
                Only send <strong>{activeCrypto.symbol}</strong> to this address on the <strong>{activeCrypto.network}</strong>.
                Sending any other asset or using the wrong network will result in permanent loss.
              </p>
            </div>

            {/* Deposit details */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Minimum deposit", value: activeCrypto.minDeposit },
                { label: "Confirmations",   value: activeCrypto.confirmations },
                { label: "Fee",             value: activeCrypto.fee },
              ].map((row) => (
                <div key={row.label} className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2.5">
                  <div className="text-[10.5px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{row.label}</div>
                  <div className="text-[12px] font-medium mt-0.5">{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending crypto + network status */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader title="Pending confirmations" subtitle={`${PENDING_CRYPTO.length} in progress`} />
            <div className="mt-4 space-y-3">
              {PENDING_CRYPTO.map((p, i) => {
                const net = CRYPTO_NETWORKS.find(n => n.id === p.network.toLowerCase()) ?? CRYPTO_NETWORKS[0]
                return (
                  <div key={i} className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <NetworkBadge net={net} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-medium">{p.from}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{net.name} · {p.confs}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-semibold tabular-nums">{p.amount}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{p.usd}</div>
                      </div>
                    </div>
                    {/* Confirmation progress bar */}
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all"
                          style={{ width: p.network === "BTC" ? "50%" : "67%" }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{p.confs}</span>
                        <Tag tone="amber" className="text-[10px]">Confirming</Tag>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Supported networks quick ref */}
            <div className="mt-5">
              <SectionHeader title="Supported networks" />
              <div className="mt-3 space-y-2">
                {CRYPTO_NETWORKS.map((n) => (
                  <div key={n.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <NetworkBadge net={n} size={22} />
                    <span className="text-[12px] font-medium flex-1">{n.name}</span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{n.confirmations.split(" ")[0]} conf.</span>
                    <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent crypto deposits */}
          <div className="col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader
              title="Recent crypto deposits"
              subtitle="$275,870 received across all networks"
              right={<button className="text-[12px] text-blue-600 dark:text-blue-400 font-medium">View all</button>}
            />
            <div className="mt-3 space-y-1">
              {RECENT_CRYPTO_DEPOSITS.map((d, i) => {
                const net = CRYPTO_NETWORKS.find(n => n.id === d.network.toLowerCase()) ?? CRYPTO_NETWORKS[0]
                return (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center px-1 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <div className="col-span-5 flex items-center gap-2.5">
                      <NetworkBadge net={net} size={28} />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium truncate">{d.from}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{d.date}</div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Tag tone="neutral">{net.symbol}</Tag>
                    </div>
                    <div className="col-span-3 text-[12px] font-mono text-gray-600 dark:text-gray-300 truncate">{d.amount}</div>
                    <div className="col-span-2 text-right">
                      <div className="text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">+{d.usd}</div>
                      <Tag tone="green" className="mt-0.5">Settled</Tag>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
