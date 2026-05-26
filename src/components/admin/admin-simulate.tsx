"use client"

import { useState } from "react"
import { ArrowDownLeftIcon, ArrowUpRightIcon, FlaskConicalIcon, SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader, SectionHeader, Tag } from "@/components/meridian/primitives"
import { useDashboardNav } from "@/contexts/dashboard-nav"
import { cn } from "@/lib/utils"
import {
  adminInjectDeposit,
  adminInjectWithdrawal,
} from "@/modules/financial/application/mutations/financial.mutations"
import { NoStudentSelected, Feedback } from "./admin-shared"

const DEPOSIT_RAILS  = ["ACH", "Wire", "RTP / FedNow", "Check", "BTC", "ETH", "TRX", "USDT (TRC-20)", "USDT (ERC-20)"]
const WITHDRAW_RAILS = ["ACH", "Wire", "RTP / FedNow", "BTC", "ETH", "TRX", "USDT (TRC-20)", "USDT (ERC-20)"]

const QUICK_SCENARIOS = [
  { type: "deposit"    as const, label: "ACH · $25,000",       rail: "ACH",           amount: "25000",  desc: "ACH from Acme Corp.", recipient: "", memo: "" },
  { type: "deposit"    as const, label: "Wire · $120,000",      rail: "Wire",          amount: "120000", desc: "Wire · Client invoice #INV-2048", recipient: "", memo: "" },
  { type: "deposit"    as const, label: "RTP · $4,800",         rail: "RTP / FedNow",  amount: "4800",   desc: "RTP instant transfer", recipient: "", memo: "" },
  { type: "deposit"    as const, label: "BTC · $8,400",         rail: "BTC",           amount: "8400",   desc: "BTC transfer · 0.12 BTC", recipient: "", memo: "" },
  { type: "deposit"    as const, label: "USDT · $50,000",       rail: "USDT (TRC-20)", amount: "50000",  desc: "USDT stablecoin deposit", recipient: "", memo: "" },
  { type: "withdrawal" as const, label: "Wire · $245,000",      rail: "Wire",          amount: "245000", desc: "", recipient: "Atlas Components Ltd.", memo: "Vendor payment INV-9042" },
  { type: "withdrawal" as const, label: "ACH · $412,800",       rail: "ACH",           amount: "412800", desc: "", recipient: "Payroll · 84 staff", memo: "Jun payroll run" },
  { type: "withdrawal" as const, label: "USDT · $50,000",       rail: "USDT (TRC-20)", amount: "50000",  desc: "", recipient: "TRX wallet T9d4a…Kz8", memo: "Crypto transfer" },
  { type: "withdrawal" as const, label: "BTC · $12,000",        rail: "BTC",           amount: "12000",  desc: "", recipient: "bc1qxy2k…gfp2", memo: "BTC withdrawal" },
]

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[11.5px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export function AdminSimulatePage() {
  const { selectedUser, setView } = useDashboardNav()
  const [type, setType]           = useState<"deposit" | "withdrawal">("deposit")
  const [amount, setAmount]       = useState("")
  const [rail, setRail]           = useState(DEPOSIT_RAILS[0])
  const [description, setDesc]    = useState("")
  const [recipient, setRecipient] = useState("")
  const [memo, setMemo]           = useState("")
  const [busy, setBusy]           = useState(false)
  const [feedback, setFeedback]   = useState<string | null>(null)

  if (!selectedUser) return <NoStudentSelected message="Select a student to simulate transactions for their account." />

  const rails = type === "deposit" ? DEPOSIT_RAILS : WITHDRAW_RAILS

  function flash(msg: string) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 5000)
  }

  function applyScenario(s: typeof QUICK_SCENARIOS[number]) {
    setType(s.type)
    setRail(s.rail)
    setAmount(s.amount)
    setDesc(s.desc)
    setRecipient(s.recipient)
    setMemo(s.memo)
  }

  async function handleInject() {
    if (!selectedUser) return
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { flash("Error: Enter a valid amount."); return }
    setBusy(true)
    try {
      if (type === "deposit") {
        await adminInjectDeposit(selectedUser.id, {
          amount,
          rail,
          description: description || `${rail} Deposit`,
          reference: "",
        })
        flash(`Deposit of $${amt.toLocaleString()} injected as Pending for ${selectedUser.name}. Go to Deposits to approve it.`)
        setTimeout(() => setView("deposits"), 1800)
      } else {
        await adminInjectWithdrawal(selectedUser.id, {
          amount,
          rail,
          recipient: recipient || `${rail} Withdrawal`,
          memo,
        })
        flash(`Withdrawal of $${amt.toLocaleString()} injected as Pending for ${selectedUser.name}. Go to Withdrawals to approve/reject.`)
        setTimeout(() => setView("withdrawals"), 1800)
      }
      setAmount(""); setDesc(""); setRecipient(""); setMemo("")
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : "Unknown"}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Simulate"
        title="Simulate transactions."
        subtitle={`Inject demo deposits or withdrawals into ${selectedUser.name}'s account`}
      />

      <Feedback msg={feedback} />

      {/* How it works */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 p-5 mb-5">
        <div className="flex items-start gap-3">
          <FlaskConicalIcon className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-blue-800 dark:text-blue-300">How the simulation works</div>
            <ol className="text-[12px] text-blue-700 dark:text-blue-400 mt-1.5 space-y-1 list-decimal list-inside">
              <li>Choose Deposit or Withdrawal, fill in the form, and click <strong>Inject</strong>.</li>
              <li>The transaction appears as <strong>Pending</strong> in the student&apos;s account immediately.</li>
              <li>Navigate to <strong>Deposits</strong> or <strong>Withdrawals</strong> to <strong>Approve</strong>, <strong>Hold</strong>, or <strong>Reject</strong> it.</li>
              <li>The student sees the status update in real-time — illustrating the full banking lifecycle.</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Inject form */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader
            title={`Inject for ${selectedUser.name}`}
            subtitle="Creates a Pending transaction on their account"
          />

          {/* Type toggle */}
          <div className="flex gap-2 mt-4 mb-5">
            {(["deposit", "withdrawal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setRail(t === "deposit" ? DEPOSIT_RAILS[0] : WITHDRAW_RAILS[0]) }}
                className={cn(
                  "flex items-center gap-2 px-5 h-10 rounded-xl text-[13px] font-semibold transition border-2",
                  type === t
                    ? t === "deposit"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-violet-600 text-white border-violet-600"
                    : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/8"
                )}
              >
                {t === "deposit"
                  ? <ArrowDownLeftIcon className="h-4 w-4" />
                  : <ArrowUpRightIcon className="h-4 w-4" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount (USD)">
              <input
                type="number" min="0.01" step="0.01"
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

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/8 flex items-center justify-between gap-4">
            <p className="text-[11.5px] text-gray-400 dark:text-gray-500">
              Status will be <strong>Pending</strong>. Approve, hold, or reject it from the{" "}
              {type === "deposit" ? "Deposits" : "Withdrawals"} tab.
            </p>
            <Button
              size="sm"
              className={cn(
                "gap-2 shrink-0",
                type === "deposit" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-violet-600 hover:bg-violet-700"
              )}
              onClick={handleInject}
              disabled={busy || !amount}
            >
              <SendIcon className="h-3.5 w-3.5" />
              {busy ? "Injecting…" : `Inject ${type}`}
            </Button>
          </div>
        </div>

        {/* Quick scenarios */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader title="Quick scenarios" subtitle="Click to pre-fill the form" />
          <div className="mt-3 space-y-2">
            {QUICK_SCENARIOS.map((s) => (
              <button
                key={s.label}
                onClick={() => applyScenario(s)}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/8 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  {s.type === "deposit"
                    ? <ArrowDownLeftIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                    : <ArrowUpRightIcon  className="h-4 w-4 text-violet-500 shrink-0" />}
                  <div>
                    <div className="text-[12.5px] font-medium">{s.label}</div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">{s.rail}</div>
                  </div>
                </div>
                <Tag tone={s.type === "deposit" ? "green" : "brand"}>
                  {s.type === "deposit" ? "Deposit" : "Withdraw"}
                </Tag>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
