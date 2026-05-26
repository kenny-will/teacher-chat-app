"use client"

import { useState } from "react"
import { ArrowDownLeftIcon } from "lucide-react"
import { PageHeader } from "@/components/meridian/primitives"
import { useDashboardNav } from "@/contexts/dashboard-nav"
import { cn } from "@/lib/utils"
import {
  useAdminUserData,
  NoStudentSelected,
  StudentPageHeader,
  TxnTableHeader,
  TxnRow,
  PendingBanner,
  Feedback,
  PageSkeleton,
  STATUS_TONE,
  type Txn,
} from "./admin-shared"
import { Tag } from "@/components/meridian/primitives"

function DepositStats({ deposits }: { deposits: Txn[] }) {
  const approved = deposits.filter((t) => t.status === "Approved" || t.status === "Paid").length
  const pending  = deposits.filter((t) => t.status === "Pending").length
  const held     = deposits.filter((t) => t.status === "On Hold").length
  const rejected = deposits.filter((t) => t.status === "Rejected").length

  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      {[
        { label: "Approved / Paid", count: approved, cls: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
        { label: "Pending",         count: pending,  cls: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
        { label: "On Hold",         count: held,     cls: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
        { label: "Rejected",        count: rejected, cls: "text-rose-600 dark:text-rose-400",     bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800" },
      ].map((s) => (
        <div key={s.label} className={cn("rounded-xl border p-4", s.bg)}>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</div>
          <div className={cn("text-[28px] font-semibold leading-none mt-1.5 tabular-nums", s.cls)}>{s.count}</div>
        </div>
      ))}
    </div>
  )
}

export function AdminDepositsPage() {
  const { selectedUser } = useDashboardNav()
  const { data, isLoading, refetch } = useAdminUserData(selectedUser?.id)
  const [feedback, setFeedback] = useState<string | null>(null)

  function flash(msg: string) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 4000)
  }

  if (!selectedUser) return <NoStudentSelected message="Select a student to manage their deposits." />

  const deposits = (data?.transactions ?? []).filter((t) => t.direction === "inbound")
  const pending  = deposits.filter((t) => t.status === "Pending" || t.status === "On Hold")

  return (
    <>
      <PageHeader
        eyebrow="Student · Deposits"
        title="Deposits."
        subtitle={`Inbound transactions for ${selectedUser.name}`}
        actions={
          <div className="flex items-center gap-2">
            {pending.length > 0 && (
              <Tag tone="amber">{pending.length} pending</Tag>
            )}
            <Tag tone="green">{deposits.length} total</Tag>
          </div>
        }
      />

      {!isLoading && data && (
        <StudentPageHeader user={selectedUser} data={data} isLoading={isLoading} refetch={refetch} />
      )}

      <Feedback msg={feedback} />

      {isLoading ? (
        <PageSkeleton />
      ) : !data?.hasData ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-12 text-center text-gray-400">
          <ArrowDownLeftIcon className="h-8 w-8 mx-auto mb-3 text-gray-200 dark:text-white/15" />
          <div className="text-[14px] font-medium">No data for this student</div>
          <div className="text-[12px] mt-1">Go to the Simulate tab to inject a deposit, or load demo data.</div>
        </div>
      ) : (
        <>
          <DepositStats deposits={deposits} />

          {/* Pending — needs action */}
          {pending.length > 0 && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-white/5 overflow-hidden mb-5">
              <PendingBanner count={pending.length} label="deposit(s)" />
              <TxnTableHeader />
              {pending.map((t) => (
                <TxnRow key={t.id} txn={t} onDone={refetch} onFlash={flash} highlight />
              ))}
            </div>
          )}

          {/* All deposits */}
          {deposits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-10 text-center text-[12.5px] text-gray-400">
              No deposits recorded yet for {selectedUser.name}. Use Simulate to inject one.
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/8 text-[12px] font-semibold text-gray-600 dark:text-gray-300">
                All deposits · {deposits.length}
              </div>
              <TxnTableHeader />
              {deposits.map((t) => (
                <TxnRow key={t.id} txn={t} onDone={refetch} onFlash={flash} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
