"use client";

import { useState } from "react";
import { RefreshCwIcon, SearchIcon, ArrowUpRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag, PageHeader } from "@/components/meridian/primitives";
import { cn } from "@/lib/utils";
import { useServerData } from "@/hooks/use-server-data";
import { adminGetAllTransactions } from "@/modules/financial/application/mutations/financial.mutations";
import {
  TxnActionButtons,
  STATUS_TONE,
  Feedback,
  PageSkeleton,
} from "./admin-shared";

type AllTxn = Awaited<ReturnType<typeof adminGetAllTransactions>>[number];

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function UserChip({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className="h-7 w-7 rounded-full grid place-items-center text-white text-[10px] font-semibold shrink-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(235 70% 58%), hsl(280 60% 40%))",
        }}
      >
        {getInitials(name)}
      </div>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold truncate dark:text-white">
          {name}
        </div>
        <div className="text-[10.5px] text-gray-400 dark:text-gray-500 truncate">
          {email}
        </div>
      </div>
    </div>
  );
}

function WithdrawalRow({
  txn,
  onDone,
  onFlash,
  highlight,
}: {
  txn: AllTxn;
  onDone: () => void;
  onFlash: (msg: string) => void;
  highlight?: boolean;
}) {
  const tone =
    STATUS_TONE[txn.statusTone as keyof typeof STATUS_TONE] ?? "neutral";
  return (
    <div
      className={cn(
        "grid grid-cols-12 gap-2 px-5 py-3.5 items-center text-[12.5px] border-b border-gray-100 dark:border-white/8 last:border-0 transition",
        highlight
          ? "bg-amber-50/60 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20"
          : "hover:bg-gray-50 dark:hover:bg-white/5",
      )}
    >
      <div className="col-span-2">
        <UserChip name={txn.userName} email={txn.userEmail} />
      </div>
      <div className="col-span-3 min-w-0">
        <div className="font-medium truncate dark:text-white">
          {txn.description}
        </div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500">
          {txn.transactionDate}
        </div>
      </div>
      <div className="col-span-2 text-gray-500 dark:text-gray-400 text-[11.5px] truncate">
        {txn.category}
      </div>
      <div className="col-span-1 text-right font-semibold tabular-nums text-[12px] text-gray-800 dark:text-gray-200">
        {txn.amount}
      </div>
      <div className="col-span-1">
        <Tag tone={tone}>{txn.status}</Tag>
      </div>
      <div className="col-span-3 flex justify-end">
        <TxnActionButtons
          txnId={txn.id}
          currentStatus={txn.status}
          onDone={onDone}
          onFlash={onFlash}
        />
      </div>
    </div>
  );
}

function StatusStats({ withdrawals }: { withdrawals: AllTxn[] }) {
  const approved = withdrawals.filter(
    (t) => t.status === "Approved" || t.status === "Sent",
  ).length;
  const pending = withdrawals.filter((t) => t.status === "Pending").length;
  const held = withdrawals.filter((t) => t.status === "On Hold").length;
  const rejected = withdrawals.filter((t) => t.status === "Rejected").length;
  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        {
          label: "Approved / Sent",
          count: approved,
          cls: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
        },
        {
          label: "Pending",
          count: pending,
          cls: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
        },
        {
          label: "On Hold",
          count: held,
          cls: "text-amber-700 dark:text-amber-300",
          bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
        },
        {
          label: "Rejected",
          count: rejected,
          cls: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
        },
      ].map((s) => (
        <div key={s.label} className={cn("rounded-xl border p-4", s.bg)}>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            {s.label}
          </div>
          <div
            className={cn(
              "text-[28px] font-semibold leading-none mt-1.5 tabular-nums",
              s.cls,
            )}
          >
            {s.count}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminWithdrawalsPage() {
  const {
    data: all,
    isLoading,
    refetch,
  } = useServerData(() => adminGetAllTransactions(), []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [feedback, setFeedback] = useState<string | null>(null);

  function flash(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  }

  const withdrawals = (all ?? []).filter((t) => t.direction === "outbound");
  const pending = withdrawals.filter((t) => t.statusTone === "amber");

  const filtered = withdrawals
    .filter((t) => {
      if (statusFilter === "pending") return t.statusTone === "amber";
      if (statusFilter === "approved")
        return t.status === "Approved" || t.status === "Sent";
      if (statusFilter === "rejected") return t.status === "Rejected";
      return true;
    })
    .filter((t) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.userName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.amount.toLowerCase().includes(q)
      );
    });

  const TABS = [
    { key: "all" as const, label: `All · ${withdrawals.length}` },
    { key: "pending" as const, label: `Pending · ${pending.length}` },
    {
      key: "approved" as const,
      label: `Approved · ${withdrawals.filter((t) => t.status === "Approved" || t.status === "Sent").length}`,
    },
    {
      key: "rejected" as const,
      label: `Rejected · ${withdrawals.filter((t) => t.status === "Rejected").length}`,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admin · Withdrawals"
        title="All Withdrawals."
        subtitle="Outbound requests across every user — approve, hold, or reject pending withdrawals."
        actions={
          <>
            {pending.length > 0 && (
              <Tag tone="amber">{pending.length} need action</Tag>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={refetch}
            >
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </>
        }
      />

      <Feedback msg={feedback} />

      {!isLoading && withdrawals.length > 0 && (
        <StatusStats withdrawals={withdrawals} />
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
        {/* Toolbar */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-white/10 flex-wrap">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-9 flex-1 min-w-55">
            <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              className="flex-1 bg-transparent text-[13px] placeholder:text-gray-400 outline-none dark:text-white"
              placeholder="Filter by user or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-white/10 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={cn(
                  "px-3 h-7 rounded-md text-[12px] font-medium transition whitespace-nowrap",
                  statusFilter === t.key
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[10.5px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100 dark:border-white/8">
          <div className="col-span-2">User</div>
          <div className="col-span-3">Description / Date</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1 text-right">Amount</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-3 text-right">Admin actions</div>
        </div>

        {isLoading ? (
          <PageSkeleton />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-gray-400 dark:text-gray-500">
            <ArrowUpRightIcon className="h-8 w-8 mx-auto mb-3 text-gray-200 dark:text-white/10" />
            {withdrawals.length === 0
              ? "No withdrawal requests from any user yet."
              : "No withdrawals match this filter."}
          </div>
        ) : (
          filtered.map((t) => (
            <WithdrawalRow
              key={t.id}
              txn={t}
              onDone={refetch}
              onFlash={flash}
              highlight={t.statusTone === "amber"}
            />
          ))
        )}

        <div className="px-5 py-3 text-[12px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/8">
          {isLoading
            ? "Loading…"
            : `Showing ${filtered.length} of ${withdrawals.length} withdrawals`}
        </div>
      </div>
    </>
  );
}
