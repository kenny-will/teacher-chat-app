"use client";

import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonutChart } from "@/components/meridian/charts";
import { Tag, SectionHeader } from "@/components/meridian/primitives";
import { cn } from "@/lib/utils";
import { useServerData } from "@/hooks/use-server-data";
import {
  adminGetAllTransactions,
  adminGetUsers,
} from "@/modules/financial/application/mutations/financial.mutations";

function parseAmount(s: string): number {
  return parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
}

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function UserAvatar({ name }: { name: string }) {
  return (
    <div
      className="h-8 w-8 rounded-full grid place-items-center text-white text-[10px] font-semibold shrink-0"
      style={{
        background:
          "linear-gradient(135deg, hsl(235 70% 58%), hsl(280 60% 40%))",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

export function AdminOverviewPage() {
  const {
    data: txns,
    isLoading: loadingTxns,
    refetch: refetchTxns,
  } = useServerData(() => adminGetAllTransactions(), []);
  const {
    data: rawUsers,
    isLoading: loadingUsers,
    refetch: refetchUsers,
  } = useServerData(() => adminGetUsers(), []);

  const isLoading = loadingTxns || loadingUsers;
  const allTxns = txns ?? [];
  const allUsers = rawUsers ?? [];
  const users = allUsers.filter((u) => u.role !== "admin");
  const deposits = allTxns.filter((t) => t.direction === "inbound");
  const withdrawals = allTxns.filter((t) => t.direction === "outbound");
  const pending = allTxns.filter((t) => t.statusTone === "amber");
  const approved = allTxns.filter(
    (t) =>
      t.status === "Approved" || t.status === "Paid" || t.status === "Sent",
  );
  const depositVal = deposits.reduce((s, t) => s + parseAmount(t.amount), 0);
  const withdrawVal = withdrawals.reduce(
    (s, t) => s + parseAmount(t.amount),
    0,
  );
  const recentTxns = allTxns.slice(0, 6);
  const pendingItems = pending.slice(0, 5);

  const donutData = [
    { label: "Deposits", value: deposits.length || 0, color: "#10B981" },
    { label: "Withdrawals", value: withdrawals.length || 0, color: "#EF4444" },
    { label: "Pending", value: pending.length || 0, color: "#F59E0B" },
  ];
  const hasDonut = donutData.some((d) => d.value > 0);

  function refetch() {
    refetchTxns();
    refetchUsers();
  }

  const KPIS = [
    {
      label: "Users",
      value: isLoading ? "—" : users.length.toString(),
      hint: `${allUsers.length} total users`,
    },
    {
      label: "Transactions",
      value: isLoading ? "—" : allTxns.length.toString(),
      hint: "Across all users",
    },
    {
      label: "Deposits",
      value: isLoading ? "—" : deposits.length.toString(),
      hint: `$${depositVal.toLocaleString()} total`,
    },
    {
      label: "Withdrawals",
      value: isLoading ? "—" : withdrawals.length.toString(),
      hint: `$${withdrawVal.toLocaleString()} total`,
    },
    {
      label: "Pending review",
      value: isLoading ? "—" : pending.length.toString(),
      hint: "Need your action",
    },
    {
      label: "Settled",
      value: isLoading ? "—" : approved.length.toString(),
      hint: "Approved or paid",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[12px] text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            · UTC
          </div>
          <h1 className="font-semibold text-3xl leading-none tracking-tight mt-1 dark:text-white">
            Platform overview.
          </h1>
          <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1">
            {isLoading
              ? "Loading…"
              : `${users.length} user${users.length !== 1 ? "s" : ""} · ${allTxns.length} transactions · ${pending.length} pending review`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isLoading && pending.length > 0 && (
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
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        {KPIS.map((s) => (
          <div
            key={s.label}
            className="col-span-12 sm:col-span-6 lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"
          >
            <div className="text-[11.5px] text-gray-500 dark:text-gray-400">
              {s.label}
            </div>
            <div className="mt-1 font-semibold text-[28px] leading-none tracking-tight tabular-nums dark:text-white">
              {s.value}
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              {s.hint}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Recent transactions */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader
            title="Recent transactions"
            subtitle={`All users · ${allTxns.length} total`}
          />
          <div className="mt-3">
            {isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 dark:bg-white/10 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : !recentTxns.length ? (
              <div className="py-10 text-center text-[13px] text-gray-400 dark:text-gray-500">
                No transactions recorded yet. Use Simulate to add demo data.
              </div>
            ) : (
              recentTxns.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0"
                >
                  <div
                    className={cn(
                      "h-7 w-7 rounded-md grid place-items-center shrink-0 text-[12px]",
                      t.direction === "inbound"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600"
                        : t.statusTone === "amber"
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600"
                          : "bg-rose-50 dark:bg-rose-500/10 text-rose-600",
                    )}
                  >
                    {t.direction === "inbound" ? "↓" : "↑"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium truncate dark:text-white">
                      {t.description}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {t.userName} · {t.transactionDate}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={cn(
                        "text-[12.5px] font-semibold tabular-nums",
                        t.direction === "inbound"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-800 dark:text-gray-200",
                      )}
                    >
                      {t.amount}
                    </div>
                    <Tag
                      tone={
                        t.statusTone as
                          | "green"
                          | "rose"
                          | "amber"
                          | "brand"
                          | "neutral"
                      }
                    >
                      {t.status}
                    </Tag>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transaction mix */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader
            title="Transaction mix"
            subtitle={`${allTxns.length} total`}
          />
          {isLoading ? (
            <div className="mt-3 h-32 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
          ) : !hasDonut ? (
            <div className="mt-3 py-10 text-center text-[12px] text-gray-400 dark:text-gray-500">
              No data yet.
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-4">
              <DonutChart data={donutData} size={110} thickness={14} />
              <div className="flex-1 space-y-2 text-[12px] min-w-0">
                {[
                  {
                    label: "Deposits",
                    count: deposits.length,
                    color: "#10B981",
                  },
                  {
                    label: "Withdrawals",
                    count: withdrawals.length,
                    color: "#EF4444",
                  },
                  { label: "Pending", count: pending.length, color: "#F59E0B" },
                  {
                    label: "Settled",
                    count: approved.length,
                    color: "#3B82F6",
                  },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm shrink-0"
                      style={{ background: r.color }}
                    />
                    <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                      {r.label}
                    </span>
                    <span className="tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pending review */}
        <div className="col-span-12 lg:col-span-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader
            title="Pending review"
            subtitle={`${pending.length} need your action`}
            right={
              pending.length > 0 ? (
                <Tag tone="amber">{pending.length} waiting</Tag>
              ) : undefined
            }
          />
          <div className="mt-3 space-y-2">
            {isLoading ? (
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 dark:bg-white/10 rounded animate-pulse"
                />
              ))
            ) : !pendingItems.length ? (
              <div className="py-6 text-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-[12.5px] text-emerald-700 dark:text-emerald-400 font-medium">
                ✓ All transactions are settled — no action needed.
              </div>
            ) : (
              pendingItems.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 px-3 py-2.5"
                >
                  <UserAvatar name={t.userName} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium truncate dark:text-white">
                      {t.description}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {t.userName} · {t.transactionDate}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12.5px] font-semibold tabular-nums dark:text-white">
                      {t.amount}
                    </div>
                    <Tag tone="amber">{t.status}</Tag>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User roster */}
        <div className="col-span-12 lg:col-span-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <SectionHeader
            title="Users"
            subtitle={`${users.length} enrolled`}
            right={<Tag tone="neutral">{users.length}</Tag>}
          />
          <div className="mt-3 space-y-1.5">
            {isLoading ? (
              [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 dark:bg-white/10 rounded animate-pulse"
                />
              ))
            ) : !users.length ? (
              <div className="py-8 text-center text-[12px] text-gray-400 dark:text-gray-500">
                No users yet.
              </div>
            ) : (
              users.map((u) => {
                const userTxns = allTxns.filter((t) => t.userId === u.id);
                const userPending = userTxns.filter(
                  (t) => t.statusTone === "amber",
                ).length;
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-white/8 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                  >
                    <UserAvatar name={u.name} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium truncate dark:text-white">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {u.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[11px] text-gray-500 dark:text-gray-400">
                      {userTxns.length} txns
                      {userPending > 0 && (
                        <Tag tone="amber">{userPending} pending</Tag>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
