"use client";

import { ActivityIcon } from "lucide-react";
import { PageHeader, Tag } from "@/components/meridian/primitives";
import { useDashboardNav } from "@/contexts/dashboard-nav";
import {
  useAdminUserData,
  InlineUserPicker,
  UserPageHeader,
  PageSkeleton,
  Section,
} from "./admin-shared";

export function AdminActivityPage() {
  const { selectedUser } = useDashboardNav();
  const { data, isLoading, refetch } = useAdminUserData(selectedUser?.id);

  if (!selectedUser) {
    return (
      <>
        <PageHeader
          eyebrow="Admin · Activity"
          title="Activity log."
          subtitle="Select a user to view their account activity and history."
        />
        <InlineUserPicker hint="Click a user to view their activity log and transaction history." />
      </>
    );
  }

  const activity = data?.activity ?? [];
  const txns = data?.transactions ?? [];
  const pending = txns.filter(
    (t) => t.status === "Pending" || t.status === "On Hold",
  );

  return (
    <>
      <PageHeader
        eyebrow="User · Activity"
        title="Activity log."
        subtitle={`All account actions for ${selectedUser.name}`}
        actions={<Tag tone="neutral">{activity.length} entries</Tag>}
      />

      {!isLoading && data && (
        <UserPageHeader
          user={selectedUser}
          data={data}
          isLoading={isLoading}
          refetch={refetch}
        />
      )}

      {isLoading ? (
        <PageSkeleton />
      ) : !data?.hasData ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-12 text-center text-gray-400">
          <ActivityIcon className="h-8 w-8 mx-auto mb-3 text-gray-200 dark:text-white/15" />
          <div className="text-[14px] font-medium">No activity data</div>
          <div className="text-[12px] mt-1">
            Load demo data to see activity logs.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-5">
          {/* Activity log */}
          <div className="col-span-12 lg:col-span-8">
            <Section title={`Activity log · ${activity.length} entries`}>
              {activity.length === 0 ? (
                <div className="text-[12px] text-gray-400 py-4 text-center">
                  No activity recorded.
                </div>
              ) : (
                activity.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/8 last:border-0"
                  >
                    <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-white/10 grid place-items-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px]">
                        <span className="font-semibold">{a.actorName}</span>{" "}
                        <span className="text-gray-600 dark:text-gray-400">
                          {a.action}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">
                      {a.timeAgo}
                    </span>
                  </div>
                ))
              )}
            </Section>

            {/* Transaction history summary */}
            <Section title={`Transactions overview · ${txns.length} total`}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Deposits",
                    count: txns.filter((t) => t.direction === "inbound").length,
                    cls: "text-emerald-600 dark:text-emerald-400",
                  },
                  {
                    label: "Withdrawals",
                    count: txns.filter((t) => t.direction === "outbound")
                      .length,
                    cls: "text-violet-600 dark:text-violet-400",
                  },
                  {
                    label: "Pending",
                    count: pending.length,
                    cls: "text-amber-600 dark:text-amber-400",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl bg-gray-50 dark:bg-white/5 p-3 text-center"
                  >
                    <div
                      className={`text-[24px] font-semibold leading-none tabular-nums ${s.cls}`}
                    >
                      {s.count}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar: pending transactions needing attention */}
          <div className="col-span-12 lg:col-span-4">
            <Section title={`Pending attention · ${pending.length}`}>
              {pending.length === 0 ? (
                <div className="text-[12px] text-gray-400 text-center py-4">
                  All transactions are settled. No action needed.
                </div>
              ) : (
                pending.map((t) => (
                  <div
                    key={t.id}
                    className="py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[12.5px] font-medium truncate">
                          {t.description}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {t.transactionDate}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[12.5px] font-semibold tabular-nums">
                          {t.amount}
                        </div>
                        <Tag tone="amber">{t.status}</Tag>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Section>
          </div>
        </div>
      )}
    </>
  );
}
