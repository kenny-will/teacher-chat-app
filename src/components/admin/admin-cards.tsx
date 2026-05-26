"use client"

import { CreditCardIcon } from "lucide-react"
import { PageHeader, Tag, SectionHeader } from "@/components/meridian/primitives"
import { useDashboardNav } from "@/contexts/dashboard-nav"
import { cn } from "@/lib/utils"
import { useAdminUserData, NoStudentSelected, StudentPageHeader, PageSkeleton, Section, DataRow } from "./admin-shared"

export function AdminCardsPage() {
  const { selectedUser } = useDashboardNav()
  const { data, isLoading, refetch } = useAdminUserData(selectedUser?.id)

  if (!selectedUser) return <NoStudentSelected message="Select a student to view their cards." />

  const cards     = data?.cards ?? []
  const stats     = data?.cardStats
  const catCards  = data?.cardsSpend ?? []

  return (
    <>
      <PageHeader
        eyebrow="Student · Cards"
        title="Cards & Spend."
        subtitle={`Card program overview for ${selectedUser.name}`}
        actions={<Tag tone="neutral">{cards.length} cards</Tag>}
      />

      {!isLoading && data && (
        <StudentPageHeader user={selectedUser} data={data} isLoading={isLoading} refetch={refetch} />
      )}

      {isLoading ? (
        <PageSkeleton />
      ) : !data?.hasData ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-12 text-center text-gray-400">
          <CreditCardIcon className="h-8 w-8 mx-auto mb-3 text-gray-200 dark:text-white/15" />
          <div className="text-[14px] font-medium">No data for this student</div>
          <div className="text-[12px] mt-1">Load demo data to populate cards.</div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-5">
          {/* Cards list */}
          <div className="col-span-12 lg:col-span-8">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden mb-5">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-white/8">
                <SectionHeader title={`Cards (${cards.length})`} subtitle="All issued cards for this student" />
              </div>
              {cards.length === 0 ? (
                <div className="p-8 text-center text-[12.5px] text-gray-400">No cards issued.</div>
              ) : (
                cards.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-white/8 last:border-0">
                    <div className="h-10 w-16 rounded-lg bg-gray-900 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <CreditCardIcon className="h-4 w-4 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold">{c.label}</span>
                        {c.isOwnerCard && <Tag tone="brand">Owner</Tag>}
                        <Tag tone={c.status === "active" ? "green" : c.status === "frozen" ? "rose" : "amber"}>
                          {c.status}
                        </Tag>
                      </div>
                      <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {c.cardUser} · {c.cardType} · ••••&nbsp;{c.lastFour}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-semibold tabular-nums">
                        ${parseFloat(c.spentAmount).toLocaleString()}
                        <span className="text-gray-400 font-normal"> / ${parseFloat(c.limitAmount).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {Math.round((parseFloat(c.spentAmount) / parseFloat(c.limitAmount)) * 100)}% used
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Spend categories */}
            {catCards.length > 0 && (
              <Section title="Spend by category">
                {catCards.map((s) => (
                  <div key={s.id} className="py-2 border-b border-gray-100 dark:border-white/8 last:border-0 flex items-center justify-between text-[12.5px]">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: s.color }} />
                      <span>{s.label}</span>
                    </div>
                    <span className="tabular-nums text-gray-600 dark:text-gray-300">{s.amountDisplay} ({s.percentage}%)</span>
                  </div>
                ))}
              </Section>
            )}
          </div>

          {/* Card program stats */}
          <div className="col-span-12 lg:col-span-4">
            {stats && (
              <Section title="Program stats">
                <DataRow label="Card spend MTD"      value={`$${parseFloat(stats.cardSpendMtd).toLocaleString()}`} />
                <DataRow label="Spend Δ%"            value={`${stats.cardSpendDelta}%`} />
                <DataRow label="Rebate YTD"          value={`$${parseFloat(stats.rebateEarnedYtd).toLocaleString()}`} />
                <DataRow label="Rebate %"            value={`${stats.rebatePercent}%`} />
                <DataRow label="Top merchant"        value={stats.topMerchantName} />
                <DataRow label="Top amount"          value={stats.topMerchantAmount} />
                <DataRow label="Declines (total)"    value={stats.declinedThisMonth} />
                <DataRow label="Declines (policy)"   value={stats.declinedByPolicy} />
                <DataRow label="Declines (network)"  value={stats.declinedByNetwork} />
              </Section>
            )}
          </div>
        </div>
      )}
    </>
  )
}
