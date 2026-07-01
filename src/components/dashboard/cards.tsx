"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PlusIcon,
  Settings2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  BuildingIcon,
  ZapIcon,
} from "lucide-react";
import { DonutChart, Sparkline } from "@/components/meridian/charts";
import {
  Delta,
  Tag,
  PageHeader,
  SectionHeader,
  ProgressBar,
} from "@/components/meridian/primitives";
import {
  MastercardCard,
  VisaCard,
  VerveCard,
  GoldCard,
  BlackCard,
} from "@/components/meridian/bank-cards";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useDashboardNav } from "@/contexts/dashboard-nav";
import { useServerData } from "@/hooks/use-server-data";
import {
  queryCards,
  queryCardTransactions,
  queryCardsSpendCategories,
  queryCardProgramStats,
  queryBalanceOverview,
} from "@/modules/financial/application/queries/financial.queries";
import type React from "react";
import { toast } from "sonner";

// ─── Network → visual component map ──────────────────────────────────────────

type CardComponent = React.ComponentType<{
  number?: string;
  validThru?: string;
  cardholder?: string;
  variant?: string;
  className?: string;
}>;

const NETWORK_MAP: Record<string, CardComponent> = {
  Mastercard: MastercardCard,
  "Mastercard Gold": GoldCard,
  Visa: VisaCard,
  "Visa Infinite": BlackCard,
  Verve: VerveCard,
};

function resolveComponent(network: string): CardComponent {
  return NETWORK_MAP[network] ?? MastercardCard;
}

const STATUS_TONE = {
  active: "green",
  frozen: "rose",
  limit_hit: "amber",
} as const;
const STATUS_LABEL = {
  active: "Active",
  frozen: "Frozen",
  limit_hit: "Limit hit",
} as const;

export function CardsPage() {
  const user = useAuth();
  const { setView } = useDashboardNav();
  const [activeIdx, setActiveIdx] = useState(0);
  const [activateOpen, setActivateOpen] = useState(false);

  const { data: dbCards, isLoading: cardsLoading } = useServerData(queryCards);
  const { data: cardTxns, isLoading: txnsLoading } = useServerData(
    queryCardTransactions,
  );
  const { data: spendCats, isLoading: catsLoading } = useServerData(
    queryCardsSpendCategories,
  );
  const { data: stats, isLoading: statsLoading } = useServerData(
    queryCardProgramStats,
  );
  const { data: balanceOverview } = useServerData(queryBalanceOverview);

  const cards = dbCards ?? [];
  const safeIdx = Math.min(activeIdx, Math.max(0, cards.length - 1));
  const card = cards[safeIdx];

  function prev() {
    setActiveIdx((i) => (i - 1 + cards.length) % cards.length);
  }
  function next() {
    setActiveIdx((i) => (i + 1) % cards.length);
  }

  const activeCount = cards.filter((c) => c.status === "active").length;
  const frozenCount = cards.filter((c) => c.status === "frozen").length;

  if (cardsLoading) {
    return (
      <>
        <PageHeader eyebrow="Cards" title="Card program." subtitle="Loading…" />
        <div className="mt-6 space-y-4 animate-pulse">
          <div className="h-72 rounded-2xl bg-gray-100 dark:bg-white/5" />
          <div className="h-40 rounded-2xl bg-gray-100 dark:bg-white/5" />
        </div>
      </>
    );
  }

  if (!cards.length) {
    return (
      <>
        <PageHeader
          eyebrow="Cards"
          title="Card program."
          subtitle="No cards yet — ask your admin to issue one."
        />
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-14 text-center text-gray-400">
          <div className="text-[14px] font-medium">No cards issued</div>
          <div className="text-[12px] mt-1">
            Your administrator can issue physical or virtual cards from the
            admin panel.
          </div>
        </div>
      </>
    );
  }

  const CardComp = resolveComponent(card.network);
  const spentNum = parseFloat(card.spentAmount);
  const limitNum = parseFloat(card.limitAmount);
  const spentPct = limitNum > 0 ? Math.round((spentNum / limitNum) * 100) : 0;
  const activationFee = parseFloat(card.activationFee ?? "0");

  return (
    <>
      <PageHeader
        eyebrow="Cards"
        title="Card program."
        subtitle={`${activeCount} active · ${frozenCount} frozen — issue physical or virtual in 60 seconds.`}
        actions={
          <>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setActivateOpen(true)}
            >
              <PlusIcon className="h-3.5 w-3.5" /> Activate new card
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* ── Card viewer (left) + details (right) ── */}
        <div className="col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader
            title="My cards"
            subtitle="Click a card below to switch"
            right={
              <Tag tone={STATUS_TONE[card.status]}>
                {STATUS_LABEL[card.status]}
              </Tag>
            }
          />

          <div className="mt-4 flex flex-col lg:flex-row gap-5">
            {/* ── Stacked card display ── */}
            <div className="flex-1 min-w-0">
              <div
                className="relative w-full"
                style={{ paddingBottom: "calc(63% + 52px)" }}
              >
                {cards.map((c, i) => {
                  const Comp = resolveComponent(c.network);
                  const offset = i - safeIdx;
                  if (offset < 0 || offset > 3) return null;
                  const peekPx = [0, 20, 36, 48][offset];
                  const scale = [1, 0.97, 0.94, 0.91][offset];
                  const zIndex = [40, 30, 20, 10][offset];
                  const blur = offset > 0;
                  return (
                    <div
                      key={c.id}
                      className="absolute inset-x-0 top-0 transition-all duration-300 origin-top"
                      style={{
                        transform: `translateY(${peekPx}px) scale(${scale})`,
                        zIndex,
                        filter: blur ? "brightness(0.7)" : "none",
                      }}
                    >
                      <Comp
                        number={c.number}
                        validThru={c.validThru}
                        cardholder={
                          i === safeIdx
                            ? user.name.toUpperCase()
                            : `•••• ${c.lastFour}`
                        }
                        variant={c.cardVariant}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Prev / next + dots */}
              <div className="mt-3 flex items-center justify-center gap-4">
                <button
                  onClick={prev}
                  className="h-8 w-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  {cards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={cn(
                        "rounded-full transition-all",
                        i === safeIdx
                          ? "h-2 w-6 bg-gray-900 dark:bg-white"
                          : "h-2 w-2 bg-gray-200 dark:bg-white/20",
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="h-8 w-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Active card details ── */}
            <div className="w-full lg:w-55 shrink-0 space-y-3">
              {/* Activation banner */}
              {!card.isActivated && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3.5">
                  <AlertCircleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">
                      Activation required
                    </div>
                    {activationFee > 0 && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">
                        One-time fee: ${activationFee.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Card meta */}
              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-2.5 text-[12.5px]">
                {[
                  { label: "Network", value: card.network },
                  {
                    label: "Type",
                    value: card.cardType === "virtual" ? "Virtual" : "Physical",
                  },
                  { label: "Label", value: card.label },
                  { label: "Ends in", value: `•••• ${card.lastFour}` },
                  { label: "Expires", value: card.validThru },
                  ...(activationFee > 0
                    ? [
                        {
                          label: "Activation fee",
                          value: `$${activationFee.toFixed(2)}`,
                        },
                      ]
                    : []),
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      {row.label}
                    </span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Spend limit */}
              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
                <div className="flex items-center justify-between text-[12.5px] mb-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    Monthly limit
                  </span>
                  <span className="font-semibold tabular-nums">
                    ${limitNum.toLocaleString()}
                  </span>
                </div>
                <ProgressBar value={spentPct} />
                <div className="mt-1.5 flex justify-between text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                  <span>${spentNum.toLocaleString()} spent</span>
                  <span>{spentPct}%</span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2">
                <button className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 py-3 text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <EyeOffIcon className="h-4 w-4" />
                  Hide
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
            {cards.map((c, i) => {
              const ThumbComp = resolveComponent(c.network);
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveIdx(i)}
                  className={cn(
                    "shrink-0 w-35 rounded-xl overflow-hidden transition ring-2",
                    i === safeIdx
                      ? "ring-gray-900 dark:ring-white"
                      : "ring-transparent opacity-60 hover:opacity-90",
                  )}
                >
                  <ThumbComp
                    number={c.number}
                    validThru={c.validThru}
                    cardholder={
                      i === safeIdx
                        ? user.name.toUpperCase()
                        : `•••• ${c.lastFour}`
                    }
                    variant={c.cardVariant}
                  />
                  <div className="mt-1 px-0.5 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate">
                      {c.label}
                    </span>
                    <MoreHorizontalIcon className="h-3 w-3 text-gray-400 shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Recent card transactions ── */}
        <div className="col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader title="Recent card transactions" />
          {txnsLoading ? (
            <div className="mt-3 space-y-2 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 dark:bg-white/10 rounded"
                />
              ))}
            </div>
          ) : !cardTxns?.length ? (
            <div className="mt-6 text-center text-[12px] text-gray-400">
              No card transactions yet
            </div>
          ) : (
            <div className="mt-3">
              {cardTxns.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-12 gap-2 items-center px-1 py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition text-[12.5px]"
                >
                  <div className="col-span-4 font-medium truncate">
                    {r.merchant}
                  </div>
                  <div className="col-span-3 text-gray-600 dark:text-gray-400 truncate">
                    {r.cardLabel}
                  </div>
                  <div className="col-span-2 text-gray-500 dark:text-gray-400">
                    {r.spentBy}
                  </div>
                  <div className="col-span-2 text-gray-500 dark:text-gray-400">
                    {r.transactionDate}
                  </div>
                  <div className="col-span-1 text-right tabular-nums font-semibold">
                    {r.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Activate card dialog ── */}
      <Dialog open={activateOpen} onOpenChange={setActivateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activate Your Card</DialogTitle>
            <DialogDescription>
              Review your card details and confirm activation below.
            </DialogDescription>
          </DialogHeader>

          {card && (
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Card visual */}
              <div className="w-full sm:w-64 shrink-0 pointer-events-none">
                <CardComp
                  number={card.number}
                  validThru={card.validThru}
                  cardholder={user.name.toUpperCase()}
                  variant={card.cardVariant}
                />
              </div>

              {/* Right column: details + fee + CTA */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Card details */}
                <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-2.5 text-[12.5px]">
                  {[
                    { label: "Network", value: card.network },
                    {
                      label: "Type",
                      value: card.cardType === "virtual" ? "Virtual" : "Physical",
                    },
                    { label: "Card label", value: card.label },
                    { label: "Ends in", value: `•••• ${card.lastFour}` },
                    { label: "Expires", value: card.validThru },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        {row.label}
                      </span>
                      <span className="font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Balance + fee summary */}
                {(() => {
                  const balance = parseFloat(balanceOverview?.currentBalance ?? "0");
                  const hasFunds = balance >= activationFee;

                  return (
                    <>
                      {/* Balance row */}
                      <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 text-[12.5px]">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Available balance</span>
                          <span className="font-semibold tabular-nums">
                            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {activationFee > 0 && (
                          <>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
                              <span className="text-gray-500 dark:text-gray-400">Activation fee</span>
                              <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                                −${activationFee.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
                              <span className="text-gray-500 dark:text-gray-400">Balance after activation</span>
                              <span className={`font-semibold tabular-nums ${hasFunds ? "" : "text-rose-500"}`}>
                                ${Math.max(0, balance - activationFee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Status banner */}
                      {activationFee === 0 ? (
                        <div className="rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 p-3.5 text-[12px] font-medium text-green-700 dark:text-green-400">
                          No activation fee — this card activates for free.
                        </div>
                      ) : !hasFunds ? (
                        <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3.5 space-y-3">
                          <div className="flex items-start gap-2.5">
                            <AlertCircleIcon className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                            <div className="text-[12px]">
                              <div className="font-semibold text-rose-700 dark:text-rose-400">Insufficient balance</div>
                              <div className="text-rose-600 dark:text-rose-500 mt-0.5">
                                Top up at least ${(activationFee - balance).toFixed(2)} to activate this card.
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {/* <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-[12px]"
                              onClick={() => {
                                setActivateOpen(false);
                                setView("deposit");
                              }}
                            >
                              <BuildingIcon className="h-3.5 w-3.5" />
                              Bank transfer
                            </Button> */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-[12px]"
                              onClick={() => {
                                setActivateOpen(false);
                                setView("deposit");
                              }}
                            >
                              <ZapIcon className="h-3.5 w-3.5" />
                              Top up instantly
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3.5">
                          <AlertCircleIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-[12px]">
                            <div className="font-semibold text-amber-700 dark:text-amber-400">One-time activation fee</div>
                            <div className="text-amber-600 dark:text-amber-500 mt-0.5">
                              ${activationFee.toFixed(2)} will be deducted from your balance upon activation.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <Button
                        className="w-full mt-auto"
                        disabled={activationFee > 0 && !hasFunds}
                        onClick={() => {
                          setActivateOpen(false);
                          toast.success("Activation request submitted successfully.");
                        }}
                      >
                        Confirm &amp; Activate
                      </Button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
