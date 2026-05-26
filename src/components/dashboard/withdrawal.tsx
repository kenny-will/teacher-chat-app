"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRightIcon, CalendarIcon, MoreHorizontalIcon, ChevronDownIcon,
  AlertTriangleIcon, ClipboardPasteIcon, CheckCircleIcon, RefreshCwIcon,
  XCircleIcon,
} from "lucide-react"
import { Tag, PageHeader, SectionHeader, AvatarBadge, Divider } from "@/components/meridian/primitives"
import { cn } from "@/lib/utils"
import { useServerData } from "@/hooks/use-server-data"
import { queryTransactions, queryBalanceOverview } from "@/modules/financial/application/queries/financial.queries"
import { userRequestWithdrawal } from "@/modules/financial/application/mutations/financial.mutations"

// ─── Static UI data ──────────────────────────────────────────────

const RECENTS = [
  { name: "Atlas Components", email: "atlas@components.io",   type: "Wire" },
  { name: "Marcus Lee",       email: "marcus@northwind.co",   type: "ACH" },
  { name: "Acme Corp.",       email: "accounts@acmecorp.com", type: "Wire" },
  { name: "Lumen Labs",       email: "ar@lumenlabs.eu",       type: "Wire" },
  { name: "Stripe Inc.",      email: "—",                     type: "ACH" },
  { name: "Pinpoint LLC",     email: "billing@pinpoint.co",   type: "ACH" },
] as const

const RAILS = ["ACH", "Wire", "RTP"] as const

const CRYPTO_NETWORKS = [
  { id: "btc",      symbol: "BTC",  name: "Bitcoin",       badge: "₿", badgeColor: "bg-orange-500", fee: "~0.00012 BTC", feeUsd: "~$8.40",  time: "~20 min", placeholder: "bc1q…",  usdRate: 70000 },
  { id: "eth",      symbol: "ETH",  name: "Ethereum",      badge: "Ξ", badgeColor: "bg-indigo-500", fee: "~0.0024 ETH",  feeUsd: "~$8.40",  time: "~2 min",  placeholder: "0x…",   usdRate: 3500  },
  { id: "trx",      symbol: "TRX",  name: "Tron",          badge: "T", badgeColor: "bg-red-500",    fee: "1 TRX",        feeUsd: "~$0.15",  time: "~1 min",  placeholder: "T…",    usdRate: 0.152 },
  { id: "usdt_trx", symbol: "USDT", name: "USDT (TRC-20)", badge: "₮", badgeColor: "bg-teal-500",   fee: "1 TRX bw",     feeUsd: "~$0.15",  time: "~1 min",  placeholder: "T…",    usdRate: 1     },
  { id: "usdt_eth", symbol: "USDT", name: "USDT (ERC-20)", badge: "₮", badgeColor: "bg-teal-700",   fee: "~12 USDT gas", feeUsd: "~$12.00", time: "~2 min",  placeholder: "0x…",   usdRate: 1     },
] as const

const SAVED_WALLETS = [
  { label: "Cold storage",    network: "btc",      address: "bc1qxy2kgd…x0wlh" },
  { label: "Trading account", network: "eth",      address: "0x742d35Cc…3a1d" },
  { label: "Ops wallet",      network: "trx",      address: "TJYeasTPa1…k6eJ" },
  { label: "Treasury USDT",   network: "usdt_trx", address: "TN7BH9as4b…mJ2K" },
] as const

// ─── Helpers ─────────────────────────────────────────────────────

const CRYPTO_IMG: Record<string, string> = {
  btc: "/img/bitcoin.png", eth: "/img/ethereum.png", trx: "/img/trx.png",
  usdt_trx: "/img/usdt-trx.png", usdt_eth: "/img/usdt-eth.png",
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
    <span className={cn("inline-flex items-center justify-center rounded-full text-white font-bold shrink-0", net.badgeColor)}
      style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {net.badge}
    </span>
  )
}

function Feedback({ type, msg, onDismiss }: { type: "success" | "error"; msg: string; onDismiss: () => void }) {
  return (
    <div className={cn(
      "flex items-center gap-2.5 rounded-xl px-4 py-3 text-[12.5px] font-medium",
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
        : "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
    )}>
      {type === "success"
        ? <CheckCircleIcon className="h-4 w-4 shrink-0" />
        : <XCircleIcon className="h-4 w-4 shrink-0" />}
      <span className="flex-1">{msg}</span>
      <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 transition">✕</button>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────

export function WithdrawalPage() {
  const [transferType, setTransferType] = useState<"bank" | "crypto">("bank")

  // Bank form state
  const [recipientIdx, setRecipientIdx] = useState(0)
  const [rail, setRail]                 = useState<typeof RAILS[number]>("Wire")
  const [bankAmount, setBankAmount]     = useState("")
  const [bankMemo, setBankMemo]         = useState("")

  // Crypto form state
  const [cryptoNet, setCryptoNet] = useState("btc")
  const [toAddress, setToAddress] = useState("")
  const [cryptoAmt, setCryptoAmt] = useState("")

  // Shared state
  const [sending, setSending]   = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  // Data
  const { data: txnsData, refetch }       = useServerData(() => queryTransactions(), [])
  const { data: balance, isLoading: balLoading } = useServerData(() => queryBalanceOverview(), [])

  const allOutbound = (txnsData ?? []).filter(t => t.direction === "outbound")
  const pendingOut  = allOutbound.filter(t => t.statusTone === "amber")

  const availableUsd = parseFloat(balance?.currentBalance ?? "0")
  const activeCrypto = CRYPTO_NETWORKS.find(n => n.id === cryptoNet) ?? CRYPTO_NETWORKS[0]

  const bankUsdAmount = parseFloat(bankAmount) || 0
  const cryptoUsdAmount = (parseFloat(cryptoAmt) || 0) * activeCrypto.usdRate

  // ── Handlers ──

  async function handleBankSend() {
    if (!bankAmount || bankUsdAmount <= 0 || sending) return
    setSending(true)
    setFeedback(null)
    try {
      await userRequestWithdrawal({
        description: RECENTS[recipientIdx].name,
        category: `Withdrawal · ${rail}`,
        amountUsd: bankUsdAmount,
        accountRef: bankMemo || `Operating · Primary`,
      })
      setFeedback({ type: "success", msg: `$${bankUsdAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} withdrawal to ${RECENTS[recipientIdx].name} submitted for approval.` })
      setBankAmount("")
      setBankMemo("")
      refetch()
    } catch {
      setFeedback({ type: "error", msg: "Failed to submit withdrawal. Please try again." })
    } finally {
      setSending(false)
    }
  }

  async function handleCryptoSend() {
    if (!cryptoAmt || !toAddress || parseFloat(cryptoAmt) <= 0 || sending) return
    setSending(true)
    setFeedback(null)
    try {
      await userRequestWithdrawal({
        description: `${cryptoAmt} ${activeCrypto.symbol} → ${toAddress.slice(0, 14)}…`,
        category: `Withdrawal · ${activeCrypto.symbol}`,
        amountUsd: cryptoUsdAmount,
        accountRef: toAddress,
      })
      setFeedback({ type: "success", msg: `${cryptoAmt} ${activeCrypto.symbol} withdrawal submitted for approval.` })
      setCryptoAmt("")
      setToAddress("")
      refetch()
    } catch {
      setFeedback({ type: "error", msg: "Failed to submit withdrawal. Please try again." })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Withdraw"
        title="Withdrawal."
        subtitle="ACH, wires, RTP and crypto — move funds out of your operating account."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { refetch(); setFeedback(null) }}>
            <RefreshCwIcon className="h-3.5 w-3.5" />Refresh
          </Button>
        }
      />

      {/* Feedback banner */}
      {feedback && (
        <Feedback type={feedback.type} msg={feedback.msg} onDismiss={() => setFeedback(null)} />
      )}

      {/* Transfer type toggle */}
      <div className="inline-flex rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-1 self-start">
        {(["bank", "crypto"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTransferType(t); setFeedback(null) }}
            className={cn(
              "px-5 h-8 rounded-lg text-[12.5px] font-medium transition capitalize",
              transferType === t
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
            )}
          >
            {t === "bank" ? "Bank / Wire" : "Crypto"}
          </button>
        ))}
      </div>

      {/* ── Bank mode ── */}
      {transferType === "bank" && (
        <div className="grid grid-cols-12 gap-4">
          {/* Payment composer */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader title="New withdrawal" subtitle="Fill in details and send for admin approval" />

            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* Recipient display */}
              <div className="col-span-2">
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">Recipient</div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-white/10 p-3">
                  <AvatarBadge name={RECENTS[recipientIdx].name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium">{RECENTS[recipientIdx].name}</div>
                    <div className="text-[11.5px] text-gray-500 dark:text-gray-400">{RECENTS[recipientIdx].email}</div>
                  </div>
                  <Tag tone="green">Verified</Tag>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">Amount (USD)</div>
                <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                  <span className="px-3 text-[12.5px] text-gray-400 border-r border-gray-200 dark:border-white/10 h-10 flex items-center shrink-0">$</span>
                  <input
                    type="number"
                    min="0"
                    value={bankAmount}
                    onChange={e => setBankAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-3 h-10 text-[13px] font-mono bg-white dark:bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* From account */}
              <div>
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">From</div>
                <div className="rounded-lg border border-gray-200 dark:border-white/10 px-3 h-10 flex items-center text-[13px] justify-between">
                  <span className="text-[12.5px]">Operating · USD</span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Rail */}
              <div className="col-span-2">
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">Rail</div>
                <div className="inline-flex rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent p-1 w-full">
                  {RAILS.map((r) => (
                    <button key={r} onClick={() => setRail(r)} className={cn(
                      "flex-1 h-8 rounded-md text-[12px] font-medium transition",
                      rail === r
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                    )}>{r}</button>
                  ))}
                </div>
              </div>

              {/* Settle */}
              <div>
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">Settle</div>
                <div className="rounded-lg border border-gray-200 dark:border-white/10 px-3 h-10 flex items-center text-[13px] justify-between">
                  <span className="text-[12.5px]">Today · {rail === "RTP" ? "Instant" : rail === "Wire" ? "Same day" : "1–3 days"}</span>
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Memo */}
              <div className="col-span-2">
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">Memo</div>
                <input
                  value={bankMemo}
                  onChange={e => setBankMemo(e.target.value)}
                  placeholder={`Invoice / reference for ${RECENTS[recipientIdx].name}…`}
                  className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-10 text-[13px] placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-gray-400 dark:focus:border-white/30 transition"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 grid grid-cols-3 gap-3 text-[12px]">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Recipient gets</div>
                <div className="font-semibold tabular-nums text-[14px]">
                  {bankAmount ? `$${bankUsdAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Your balance</div>
                <div className="font-semibold tabular-nums text-[14px]">
                  {balLoading ? "…" : `$${availableUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Rail fee</div>
                <div className="font-semibold tabular-nums text-[14px]">
                  {rail === "ACH" ? "$0.01" : rail === "Wire" ? "$15.00" : "$0.50"}
                </div>
              </div>
            </div>

            <Divider className="my-4" />
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-gray-500 dark:text-gray-400">
                Pending admin review before funds move
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={!bankAmount || bankUsdAmount <= 0 || sending}
                  onClick={handleBankSend}
                  className="gap-1.5"
                >
                  {sending
                    ? <><RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />Sending…</>
                    : <><ArrowUpRightIcon className="h-3.5 w-3.5" />Send for approval</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Recent recipients */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader
              title="Recent recipients"
              right={<button className="text-[12px] text-blue-600 dark:text-blue-400 font-medium">Manage</button>}
            />
            <div className="mt-3 space-y-1">
              {RECENTS.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setRecipientIdx(i)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg p-2.5 transition text-left",
                    recipientIdx === i
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "hover:bg-gray-50 dark:hover:bg-white/8",
                  )}
                >
                  <AvatarBadge name={r.name} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium truncate">{r.name}</div>
                    <div className={cn("text-[11px] truncate", recipientIdx === i ? "text-white/60 dark:text-gray-900/60" : "text-gray-500 dark:text-gray-400")}>
                      {r.email}
                    </div>
                  </div>
                  <Tag tone="neutral">{r.type}</Tag>
                </button>
              ))}
            </div>
          </div>

          {/* Recent withdrawals */}
          <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader
              title="Recent withdrawals"
              subtitle={`${allOutbound.length} total`}
              right={<button className="text-[12px] text-blue-600 dark:text-blue-400 font-medium" onClick={refetch}>Refresh</button>}
            />
            <div className="mt-3 space-y-1">
              {allOutbound.length === 0 ? (
                <div className="py-8 text-center text-[12.5px] text-gray-400 dark:text-gray-500">No withdrawals yet.</div>
              ) : allOutbound.map((r) => (
                <div key={r.id} className="grid grid-cols-12 gap-2 items-center px-1 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <div className="col-span-5 flex items-center gap-2.5">
                    <AvatarBadge name={r.description} size={28} />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium truncate">{r.description}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{r.category}</div>
                    </div>
                  </div>
                  <div className="col-span-3"><Tag tone={r.statusTone as "amber" | "green" | "rose" | "neutral"}>{r.status}</Tag></div>
                  <div className="col-span-3 text-[12px] text-gray-700 dark:text-gray-300">{r.transactionDate}</div>
                  <div className="col-span-1 text-right font-semibold tabular-nums text-[12.5px] text-rose-600 dark:text-rose-400">{r.amount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending */}
          <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader title="Pending" subtitle={`${pendingOut.length} awaiting`} right={pendingOut.length > 0 ? <Tag tone="amber">{pendingOut.length}</Tag> : undefined} />
            <div className="mt-3 space-y-3">
              {pendingOut.length === 0 ? (
                <div className="py-8 text-center text-[12.5px] text-gray-400 dark:text-gray-500">No pending withdrawals.</div>
              ) : pendingOut.map((r) => (
                <div key={r.id} className="rounded-xl border border-gray-200 dark:border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium truncate">{r.description}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{r.transactionDate}</div>
                    </div>
                    <div className="text-right tabular-nums font-semibold text-[12.5px] ml-2">{r.amount}</div>
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
          {/* Crypto withdrawal form */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader title="Crypto withdrawal" subtitle="Funds leave within one confirmation" />

            {/* Network selector */}
            <div className="mt-4">
              <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-2">Network</div>
              <div className="flex flex-wrap gap-2">
                {CRYPTO_NETWORKS.map((n) => {
                  const active = cryptoNet === n.id
                  return (
                    <button
                      key={n.id}
                      onClick={() => { setCryptoNet(n.id); setCryptoAmt("") }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-medium transition",
                        active
                          ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                          : "border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5",
                      )}
                    >
                      <NetworkBadge net={n} size={18} />
                      {n.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* Available balance — real from DB */}
              <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-2.5">
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400">Available balance</div>
                <div className="text-right">
                  {balLoading ? (
                    <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  ) : (
                    <>
                      <div className="text-[13px] font-semibold tabular-nums">
                        ${availableUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        ≈ {(availableUsd / activeCrypto.usdRate).toFixed(activeCrypto.id === "btc" ? 6 : 4)} {activeCrypto.symbol}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Recipient address */}
              <div>
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">Recipient address</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={toAddress}
                    onChange={e => setToAddress(e.target.value)}
                    placeholder={activeCrypto.placeholder}
                    className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-10 text-[13px] font-mono placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-gray-400 dark:focus:border-white/30 transition"
                  />
                  <button
                    onClick={() => navigator.clipboard.readText().then(setToAddress).catch(() => {})}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 px-3 h-10 text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition shrink-0"
                  >
                    <ClipboardPasteIcon className="h-3.5 w-3.5" />Paste
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">Amount</div>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                    <span className="px-3 text-[12.5px] font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-white/10 h-10 flex items-center shrink-0">
                      {activeCrypto.symbol}
                    </span>
                    <input
                      type="number"
                      value={cryptoAmt}
                      onChange={e => setCryptoAmt(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-3 h-10 text-[13px] font-mono bg-white dark:bg-transparent outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setCryptoAmt((availableUsd / activeCrypto.usdRate).toFixed(activeCrypto.id === "btc" ? 6 : 4))}
                    className="shrink-0 rounded-lg border border-gray-200 dark:border-white/10 px-3 h-10 text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                  >
                    Max
                  </button>
                </div>
                {cryptoAmt && (
                  <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    ≈ ${cryptoUsdAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </div>
                )}
              </div>
            </div>

            {/* Fee summary */}
            <div className="mt-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 grid grid-cols-3 gap-3 text-[12px]">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Network fee</div>
                <div className="font-semibold text-[13px]">{activeCrypto.fee}</div>
                <div className="text-[10.5px] text-gray-400 dark:text-gray-500">{activeCrypto.feeUsd}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Est. arrival</div>
                <div className="font-semibold text-[13px]">{activeCrypto.time}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Recipient gets</div>
                <div className="font-semibold text-[13px]">
                  {cryptoAmt ? `${cryptoAmt} ${activeCrypto.symbol}` : "—"}
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3.5 py-3">
              <AlertTriangleIcon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-amber-700 dark:text-amber-300 leading-relaxed">
                Double-check the address before sending. Crypto transactions are irreversible and cannot be recalled.
              </p>
            </div>

            <Divider className="my-4" />
            <div className="flex items-center justify-between">
              <div className="text-[12px] text-gray-500 dark:text-gray-400">
                Pending admin review before funds move
              </div>
              <Button
                size="sm"
                className="gap-1.5"
                disabled={!cryptoAmt || !toAddress || parseFloat(cryptoAmt) <= 0 || sending}
                onClick={handleCryptoSend}
              >
                {sending
                  ? <><RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />Sending…</>
                  : <><ArrowUpRightIcon className="h-3.5 w-3.5" />Send for approval</>}
              </Button>
            </div>
          </div>

          {/* Saved wallets */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader
              title="Saved wallets"
              right={<button className="text-[12px] text-blue-600 dark:text-blue-400 font-medium">Manage</button>}
            />
            <div className="mt-3 space-y-1">
              {SAVED_WALLETS.map((w, i) => {
                const net = CRYPTO_NETWORKS.find(n => n.id === w.network) ?? CRYPTO_NETWORKS[0]
                return (
                  <button
                    key={i}
                    onClick={() => { setCryptoNet(w.network); setToAddress(w.address) }}
                    className="w-full flex items-center gap-3 rounded-lg p-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left"
                  >
                    <NetworkBadge net={net} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium">{w.label}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">{w.address}</div>
                    </div>
                    <Tag tone="neutral">{net.symbol}</Tag>
                  </button>
                )
              })}
            </div>

            {/* 30-day activity from real data */}
            <div className="mt-5">
              <SectionHeader title="30-day activity" />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { label: "Total sent",    value: allOutbound.length === 0 ? "$0.00" : `$${allOutbound.reduce((s, t) => s + (parseFloat(t.amount.replace(/[^0-9.]/g, "")) || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                  { label: "Transactions",  value: allOutbound.length.toString() },
                  { label: "Pending",       value: pendingOut.length.toString() },
                  { label: "Networks used", value: new Set(allOutbound.map(t => t.category.replace("Withdrawal · ", ""))).size.toString() },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2.5">
                    <div className="text-[10.5px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</div>
                    <div className="text-[15px] font-semibold tabular-nums mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent crypto withdrawals */}
          <div className="col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <SectionHeader
              title="Recent withdrawals"
              subtitle={`${allOutbound.length} total`}
              right={<button className="text-[12px] text-blue-600 dark:text-blue-400 font-medium" onClick={refetch}>Refresh</button>}
            />
            <div className="mt-3 space-y-1">
              {allOutbound.length === 0 ? (
                <div className="py-10 text-center text-[12.5px] text-gray-400 dark:text-gray-500">No withdrawals yet.</div>
              ) : allOutbound.map((d) => {
                const railKey = d.category.toLowerCase().replace("withdrawal · ", "")
                const net = CRYPTO_NETWORKS.find(n => n.id === railKey || n.symbol.toLowerCase() === railKey)
                return (
                  <div key={d.id} className="grid grid-cols-12 gap-2 items-center px-1 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <div className="col-span-5 flex items-center gap-2.5">
                      {net
                        ? <NetworkBadge net={net} size={28} />
                        : <AvatarBadge name={d.description} size={28} />}
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-medium truncate">{d.description}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{d.transactionDate}</div>
                      </div>
                    </div>
                    <div className="col-span-2"><Tag tone="neutral">{d.category.replace("Withdrawal · ", "")}</Tag></div>
                    <div className="col-span-3 text-[12px] text-gray-600 dark:text-gray-300 truncate">{d.accountRef ?? "—"}</div>
                    <div className="col-span-2 text-right">
                      <div className="text-[13px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">{d.amount}</div>
                      <Tag tone={d.statusTone as "green" | "rose" | "amber" | "neutral"} className="mt-0.5">{d.status}</Tag>
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
