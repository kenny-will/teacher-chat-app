"use client"

import { useState } from "react"
import { CheckIcon, XIcon, PauseIcon, UsersIcon, RefreshCwIcon } from "lucide-react"
import { Tag, AvatarBadge, SectionHeader } from "@/components/meridian/primitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  adminApproveTransaction,
  adminRejectTransaction,
  adminHoldTransaction,
  adminGetUserFinancialData,
} from "@/modules/financial/application/mutations/financial.mutations"
import { useServerData } from "@/hooks/use-server-data"
import { useDashboardNav } from "@/contexts/dashboard-nav"
import type { SelectedAdminUser } from "@/contexts/dashboard-nav"

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserFinData = Awaited<ReturnType<typeof adminGetUserFinancialData>>
export type Txn = UserFinData["transactions"][number]

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminUserData(userId: string | undefined) {
  return useServerData(
    () => (userId ? adminGetUserFinancialData(userId) : Promise.resolve(null)),
    [userId],
  )
}

// ─── No student selected ──────────────────────────────────────────────────────

export function NoStudentSelected({ message }: { message?: string }) {
  const { setView } = useDashboardNav()
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/15 bg-white dark:bg-white/3 p-14 text-center">
      <UsersIcon className="h-10 w-10 text-gray-200 dark:text-white/15 mx-auto mb-4" />
      <div className="text-[15px] font-semibold text-gray-500 dark:text-gray-400">No student selected</div>
      <div className="text-[12.5px] text-gray-400 dark:text-gray-500 mt-1.5 max-w-xs mx-auto">
        {message ?? "Select a student from the list to view and manage their account."}
      </div>
      <button
        onClick={() => setView("users")}
        className="mt-5 inline-flex items-center gap-2 px-5 h-9 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[12.5px] font-semibold hover:opacity-90 transition"
      >
        Select a student →
      </button>
    </div>
  )
}

// ─── Student page header ──────────────────────────────────────────────────────

export function StudentPageHeader({
  user,
  data,
  isLoading,
  refetch,
}: {
  user: SelectedAdminUser
  data: UserFinData | null
  isLoading: boolean
  refetch: () => void
}) {
  const balance = data?.balance ? parseFloat(data.balance.currentBalance).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "—"
  const txnCount = data?.transactions?.length ?? 0
  const deposits = data?.transactions?.filter((t) => t.direction === "inbound").length ?? 0
  const withdrawals = data?.transactions?.filter((t) => t.direction === "outbound").length ?? 0

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 mb-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <AvatarBadge name={user.name} size={44} />
          <div>
            <div className="text-[16px] font-semibold leading-tight">{user.name}</div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
              {user.email} · <span className="capitalize">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] text-gray-400 uppercase tracking-wide">Balance</div>
            <div className="text-[18px] font-semibold tabular-nums">{balance}</div>
          </div>
          <div className="h-10 w-px bg-gray-200 dark:bg-white/10" />
          <div className="flex gap-3 text-center">
            <div>
              <div className="text-[18px] font-semibold">{txnCount}</div>
              <div className="text-[10.5px] text-gray-400">Total txns</div>
            </div>
            <div>
              <div className="text-[18px] font-semibold text-emerald-600 dark:text-emerald-400">{deposits}</div>
              <div className="text-[10.5px] text-gray-400">Deposits</div>
            </div>
            <div>
              <div className="text-[18px] font-semibold text-violet-600 dark:text-violet-400">{withdrawals}</div>
              <div className="text-[10.5px] text-gray-400">Withdrawals</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
            <RefreshCwIcon className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Status tone map ──────────────────────────────────────────────────────────

export const STATUS_TONE: Record<string, "green" | "amber" | "rose" | "brand" | "neutral"> = {
  green: "green", amber: "amber", rose: "rose", brand: "brand", neutral: "neutral",
}

// ─── Transaction action buttons ───────────────────────────────────────────────

export function TxnActionButtons({
  txnId,
  currentStatus,
  onDone,
  onFlash,
}: {
  txnId: string
  currentStatus: string
  onDone: () => void
  onFlash: (msg: string) => void
}) {
  const [busy, setBusy] = useState<string | null>(null)

  async function act(label: string, fn: () => Promise<void>) {
    setBusy(label)
    try {
      await fn()
      onFlash(`Transaction ${label.toLowerCase()}d.`)
      onDone()
    } catch (e) {
      onFlash(`Error: ${e instanceof Error ? e.message : "Unknown"}`)
    } finally {
      setBusy(null)
    }
  }

  const isApproved = currentStatus === "Approved" || currentStatus === "Paid" || currentStatus === "Sent"
  const isRejected = currentStatus === "Rejected"
  const isHeld     = currentStatus === "On Hold"

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        disabled={!!busy || isApproved}
        onClick={() => act("Approve", () => adminApproveTransaction(txnId))}
        className={cn(
          "flex items-center gap-1 px-2.5 h-7 rounded-lg text-[11px] font-medium transition",
          isApproved
            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 cursor-default"
            : "bg-white dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
        )}
      >
        <CheckIcon className="h-3 w-3" />
        {busy === "Approve" ? "…" : isApproved ? "Approved" : "Approve"}
      </button>
      <button
        disabled={!!busy || isHeld}
        onClick={() => act("Hold", () => adminHoldTransaction(txnId))}
        className={cn(
          "flex items-center gap-1 px-2.5 h-7 rounded-lg text-[11px] font-medium transition",
          isHeld
            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 cursor-default"
            : "bg-white dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60"
        )}
      >
        <PauseIcon className="h-3 w-3" />
        {busy === "Hold" ? "…" : isHeld ? "Held" : "Hold"}
      </button>
      <button
        disabled={!!busy || isRejected}
        onClick={() => act("Reject", () => adminRejectTransaction(txnId))}
        className={cn(
          "flex items-center gap-1 px-2.5 h-7 rounded-lg text-[11px] font-medium transition",
          isRejected
            ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 cursor-default"
            : "bg-white dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60"
        )}
      >
        <XIcon className="h-3 w-3" />
        {busy === "Reject" ? "…" : isRejected ? "Rejected" : "Reject"}
      </button>
    </div>
  )
}

// ─── Transaction table header ─────────────────────────────────────────────────

export function TxnTableHeader() {
  return (
    <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[10.5px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100 dark:border-white/8">
      <div className="col-span-4">Description / Date</div>
      <div className="col-span-2">Category</div>
      <div className="col-span-2 text-right">Amount</div>
      <div className="col-span-1">Status</div>
      <div className="col-span-3 text-right">Admin actions</div>
    </div>
  )
}

// ─── Transaction row ──────────────────────────────────────────────────────────

export function TxnRow({
  txn,
  onDone,
  onFlash,
  highlight,
}: {
  txn: Txn
  onDone: () => void
  onFlash: (msg: string) => void
  highlight?: boolean
}) {
  const tone = STATUS_TONE[txn.statusTone as keyof typeof STATUS_TONE] ?? "neutral"
  return (
    <div className={cn(
      "grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-[12.5px] border-b border-gray-100 dark:border-white/8 last:border-0 transition",
      highlight
        ? "bg-amber-50/60 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20"
        : "hover:bg-gray-50 dark:hover:bg-white/5"
    )}>
      <div className="col-span-4 min-w-0">
        <div className="font-medium truncate">{txn.description}</div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500">{txn.transactionDate}</div>
      </div>
      <div className="col-span-2 text-gray-500 dark:text-gray-400 text-[11.5px] truncate">{txn.category}</div>
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
        <TxnActionButtons txnId={txn.id} currentStatus={txn.status} onDone={onDone} onFlash={onFlash} />
      </div>
    </div>
  )
}

// ─── Pending alert banner ─────────────────────────────────────────────────────

export function PendingBanner({ count, label }: { count: number; label: string }) {
  if (!count) return null
  return (
    <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/50">
      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
      <span className="text-[12px] font-semibold text-amber-800 dark:text-amber-300">
        {count} {label} need{count === 1 ? "s" : ""} admin action
      </span>
    </div>
  )
}

// ─── Feedback toast ───────────────────────────────────────────────────────────

export function Feedback({ msg }: { msg: string | null }) {
  if (!msg) return null
  const isError = msg.startsWith("Error")
  return (
    <div className={cn(
      "mb-4 px-4 py-3 rounded-xl text-[12.5px] border",
      isError
        ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300"
        : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
    )}>
      {msg}
    </div>
  )
}

// ─── Page skeleton ────────────────────────────────────────────────────────────

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-gray-100 dark:bg-white/8 rounded-xl" />
      ))}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 mb-4">
      <SectionHeader title={title} />
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function DataRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 text-[12.5px]">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium tabular-nums">{value ?? "—"}</span>
    </div>
  )
}
