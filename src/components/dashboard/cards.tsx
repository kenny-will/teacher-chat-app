"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon, Settings2Icon, ChevronLeftIcon, ChevronRightIcon, LockIcon, EyeOffIcon, MoreHorizontalIcon } from "lucide-react"
import { DonutChart, Sparkline } from "@/components/meridian/charts"
import { Delta, Tag, PageHeader, SectionHeader, ProgressBar } from "@/components/meridian/primitives"
import { MastercardCard, VisaCard, VerveCard, GoldCard, BlackCard } from "@/components/meridian/bank-cards"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useServerData } from "@/hooks/use-server-data"
import {
  queryCardTransactions,
  queryCardsSpendCategories,
  queryCardProgramStats,
} from "@/modules/financial/application/queries/financial.queries"

// ─── Static card definitions ──────────────────────────────────────
// cardholder is injected from useAuth() at render time

const CARD_DEFS = [
  {
    Component: MastercardCard,
    number: "5412 7512 3412 3456",
    validThru: "12/27",
    variant: "debit",
    label: "Primary",
    network: "Mastercard",
    type: "Physical",
    status: "active" as const,
    limit: 50000,
    spent: 18420,
    lastFour: "3456",
  },
  {
    Component: VisaCard,
    number: "4111 0000 1234 5678",
    validThru: "09/28",
    variant: "credit",
    label: "Travel",
    network: "Visa",
    type: "Virtual",
    status: "active" as const,
    limit: 25000,
    spent: 9840,
    lastFour: "5678",
  },
  {
    Component: VerveCard,
    number: "6500 1234 5678 9012",
    validThru: "06/27",
    variant: "debit",
    label: "Operations",
    network: "Verve",
    type: "Physical",
    status: "active" as const,
    limit: 15000,
    spent: 4210,
    lastFour: "9012",
  },
  {
    Component: GoldCard,
    number: "5500 9876 5432 1098",
    validThru: "03/29",
    variant: "credit",
    label: "Gold",
    network: "Mastercard Gold",
    type: "Physical",
    status: "active" as const,
    limit: 100000,
    spent: 62300,
    lastFour: "1098",
  },
  {
    Component: BlackCard,
    number: "4000 0000 0000 0002",
    validThru: "11/30",
    variant: "infinite",
    label: "Infinite",
    network: "Visa Infinite",
    type: "Virtual",
    status: "frozen" as const,
    limit: 200000,
    spent: 0,
    lastFour: "0002",
  },
] as const

const statusTone = { active: "green", frozen: "rose" } as const
const statusLabel = { active: "Active", frozen: "Frozen" } as const

export function CardsPage() {
  const user = useAuth()
  const [activeIdx, setActiveIdx] = useState(0)

  const { data: cardTxns,  isLoading: txnsLoading  } = useServerData(queryCardTransactions)
  const { data: spendCats, isLoading: catsLoading  } = useServerData(queryCardsSpendCategories)
  const { data: stats,     isLoading: statsLoading } = useServerData(queryCardProgramStats)

  const card = CARD_DEFS[activeIdx]
  const { Component: ActiveCard } = card
  const spentPct = Math.round((card.spent / card.limit) * 100)

  function prev() { setActiveIdx((i) => (i - 1 + CARD_DEFS.length) % CARD_DEFS.length) }
  function next() { setActiveIdx((i) => (i + 1) % CARD_DEFS.length) }

  return (
    <>
      <PageHeader
        eyebrow="Cards"
        title="Card program."
        subtitle={`${CARD_DEFS.filter(c => c.status === "active").length} active · ${CARD_DEFS.filter(c => c.status === "frozen").length} frozen — issue physical or virtual in 60 seconds.`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings2Icon className="h-3.5 w-3.5" />Program rules
            </Button>
            <Button size="sm" className="gap-1.5">
              <PlusIcon className="h-3.5 w-3.5" />Issue card
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
  
        {/* ── Card viewer (left) + details (right) ── */}
        <div className="col-span-12 lg:col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader
            title="My cards"
            subtitle="Click a card below to switch"
            right={<Tag tone={statusTone[card.status]}>{statusLabel[card.status]}</Tag>}
          />

          <div className="mt-4 flex flex-col lg:flex-row gap-5">
            {/* ── Stacked card display ── */}
            <div className="flex-1 min-w-0">
              {/* Card stack */}
              <div className="relative w-full" style={{ paddingBottom: "calc(63% + 52px)" }}>
                {CARD_DEFS.map((def, i) => {
                  const { Component: CardComp } = def
                  const offset = i - activeIdx
                  // Only render active + next 3 peeking cards
                  if (offset < 0 || offset > 3) return null
                  const peekPx = [0, 20, 36, 48][offset]
                  const scale  = [1, 0.97, 0.94, 0.91][offset]
                  const zIndex = [40, 30, 20, 10][offset]
                  const blur   = offset > 0
                  return (
                    <div
                      key={def.label}
                      className="absolute inset-x-0 top-0 transition-all duration-300 origin-top"
                      style={{ transform: `translateY(${peekPx}px) scale(${scale})`, zIndex, filter: blur ? "brightness(0.7)" : "none" }}
                    >
                      <CardComp
                        number={def.number}
                        validThru={def.validThru}
                        cardholder={i === 0 ? user.name.toUpperCase() : def.lastFour !== CARD_DEFS[activeIdx].lastFour ? "•••• " + def.lastFour : user.name.toUpperCase()}
                        variant={def.variant}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Prev / next + dots */}
              <div className="mt-3 flex items-center justify-center gap-4">
                <button onClick={prev} className="h-8 w-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  {CARD_DEFS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={cn(
                        "rounded-full transition-all",
                        i === activeIdx ? "h-2 w-6 bg-gray-900 dark:bg-white" : "h-2 w-2 bg-gray-200 dark:bg-white/20"
                      )}
                    />
                  ))}
                </div>
                <button onClick={next} className="h-8 w-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Active card details ── */}
            <div className="w-full lg:w-55 shrink-0 space-y-3">
              {/* Card meta */}
              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-2.5 text-[12.5px]">
                {[
                  { label: "Network",   value: card.network },
                  { label: "Type",      value: card.type },
                  { label: "Label",     value: card.label },
                  { label: "Ends in",   value: `•••• ${card.lastFour}` },
                  { label: "Expires",   value: card.validThru },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Spend limit */}
              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                <div className="flex items-center justify-between text-[12.5px] mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Monthly limit</span>
                  <span className="font-semibold tabular-nums">${card.limit.toLocaleString()}</span>
                </div>
                <ProgressBar value={spentPct} />
                <div className="mt-1.5 flex justify-between text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                  <span>${card.spent.toLocaleString()} spent</span>
                  <span>{spentPct}%</span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <button className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 py-3 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <EyeOffIcon className="h-4 w-4" />Hide
                </button>
                <button className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 py-3 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <LockIcon className="h-4 w-4" />
                  {card.status === "frozen" ? "Unfreeze" : "Freeze"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Card thumbnail strip ── */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {CARD_DEFS.map((def, i) => {
              const { Component: ThumbComp } = def
              return (
                <button
                  key={def.label}
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "shrink-0 w-35 rounded-xl overflow-hidden transition ring-2",
                    i === activeIdx ? "ring-gray-900 dark:ring-white" : "ring-transparent opacity-60 hover:opacity-90"
                  )}
                >
                  <ThumbComp
                    number={def.number}
                    validThru={def.validThru}
                    cardholder={i === activeIdx ? user.name.toUpperCase() : "•••• " + def.lastFour}
                    variant={def.variant}
                  />
                  <div className="mt-1 px-0.5 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate">{def.label}</span>
                    <MoreHorizontalIcon className="h-3 w-3 text-gray-400 shrink-0" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Recent card transactions ── */}
        <div className="col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader title="Recent card transactions" />
          {txnsLoading ? (
            <div className="mt-3 space-y-2 animate-pulse">
              {[0,1,2].map((i) => <div key={i} className="h-10 bg-gray-100 dark:bg-white/10 rounded" />)}
            </div>
          ) : !cardTxns?.length ? (
            <div className="mt-6 text-center text-[12px] text-gray-400">No card transactions yet</div>
          ) : (
            <div className="mt-3">
              {cardTxns.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-12 gap-2 items-center px-1 py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition text-[12.5px]"
                >
                  <div className="col-span-4 font-medium truncate">{r.merchant}</div>
                  <div className="col-span-3 text-gray-600 dark:text-gray-400 truncate">{r.cardLabel}</div>
                  <div className="col-span-2 text-gray-500 dark:text-gray-400">{r.spentBy}</div>
                  <div className="col-span-2 text-gray-500 dark:text-gray-400">{r.transactionDate}</div>
                  <div className="col-span-1 text-right tabular-nums font-semibold">{r.amount}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
