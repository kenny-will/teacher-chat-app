"use client"

import { useState } from "react"
import { PageHeader, Tag } from "@/components/meridian/primitives"
import { useDashboardNav } from "@/contexts/dashboard-nav"
import {
  useAdminUserData,
  NoStudentSelected,
  StudentPageHeader,
  TxnTableHeader,
  TxnRow,
  PendingBanner,
  Feedback,
  PageSkeleton,
} from "./admin-shared"

export function AdminUserTransactionsPage() {
  const { selectedUser } = useDashboardNav()
  const { data, isLoading, refetch } = useAdminUserData(selectedUser?.id)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [filter, setFilter]     = useState<"all" | "inbound" | "outbound">("all")

  function flash(msg: string) {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 4000)
  }

  if (!selectedUser) return <NoStudentSelected message="Select a student to view their transactions." />

  const all      = data?.transactions ?? []
  const filtered = filter === "all" ? all : all.filter((t) => t.direction === filter)
  const pending  = filtered.filter((t) => t.status === "Pending" || t.status === "On Hold")

  const FILTERS = [
    { key: "all"      as const, label: `All (${all.length})` },
    { key: "inbound"  as const, label: `Deposits (${all.filter(t => t.direction === "inbound").length})` },
    { key: "outbound" as const, label: `Withdrawals (${all.filter(t => t.direction === "outbound").length})` },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Student · Transactions"
        title="Transactions."
        subtitle={`Full transaction ledger for ${selectedUser.name}`}
        actions={
          <div className="flex items-center gap-2">
            {pending.length > 0 && <Tag tone="amber">{pending.length} pending</Tag>}
            <Tag tone="neutral">{all.length} total</Tag>
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
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-12 text-center text-[12.5px] text-gray-400">
          No financial data for {selectedUser.name} yet. Load demo data or use Simulate.
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          <div className="inline-flex rounded-xl bg-gray-100 dark:bg-white/8 p-1 mb-5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={
                  filter === f.key
                    ? "px-4 h-8 rounded-lg text-[12px] font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "px-4 h-8 rounded-lg text-[12px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {pending.length > 0 && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-white/5 overflow-hidden mb-5">
              <PendingBanner count={pending.length} label="transaction(s)" />
              <TxnTableHeader />
              {pending.map((t) => (
                <TxnRow key={t.id} txn={t} onDone={refetch} onFlash={flash} highlight />
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-10 text-center text-[12.5px] text-gray-400">
              No transactions to show for this filter.
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/8 text-[12px] font-semibold text-gray-600 dark:text-gray-300">
                {filter === "all" ? "All transactions" : filter === "inbound" ? "Deposits" : "Withdrawals"} · {filtered.length}
              </div>
              <TxnTableHeader />
              {filtered.map((t) => (
                <TxnRow key={t.id} txn={t} onDone={refetch} onFlash={flash} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
