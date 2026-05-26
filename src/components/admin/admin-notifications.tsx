"use client";

import { BellIcon } from "lucide-react";
import { PageHeader, Tag } from "@/components/meridian/primitives";
import { useDashboardNav } from "@/contexts/dashboard-nav";
import {
  useAdminUserData,
  NoUserSelected,
  UserPageHeader,
  PageSkeleton,
  Section,
} from "./admin-shared";

export function AdminNotificationsPage() {
  const { selectedUser } = useDashboardNav();
  const { data, isLoading, refetch } = useAdminUserData(selectedUser?.id);

  if (!selectedUser)
    return (
      <NoUserSelected message="Select a user to view their notification preferences." />
    );

  const prefs = data?.notifPrefs ?? [];
  const enabled = prefs.filter((p) => p.enabled).length;
  const disabled = prefs.filter((p) => !p.enabled).length;

  return (
    <>
      <PageHeader
        eyebrow="User · Notifications"
        title="Notification prefs."
        subtitle={`Preferences set for ${selectedUser.name}`}
        actions={
          <div className="flex items-center gap-2">
            <Tag tone="green">{enabled} on</Tag>
            <Tag tone="neutral">{disabled} off</Tag>
          </div>
        }
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
          <BellIcon className="h-8 w-8 mx-auto mb-3 text-gray-200 dark:text-white/15" />
          <div className="text-[14px] font-medium">No notification data</div>
          <div className="text-[12px] mt-1">
            Notification prefs appear after demo data is loaded.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-7">
            <Section title={`Notification preferences · ${prefs.length}`}>
              {prefs.length === 0 ? (
                <div className="text-[12px] text-gray-400 py-4 text-center">
                  No preferences configured.
                </div>
              ) : (
                prefs.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/8 last:border-0"
                  >
                    <div>
                      <div className="text-[12.5px] font-medium">{p.label}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {p.key}
                      </div>
                    </div>
                    <Tag tone={p.enabled ? "green" : "neutral"}>
                      {p.enabled ? "Enabled" : "Disabled"}
                    </Tag>
                  </div>
                ))
              )}
            </Section>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <Section title="Summary">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-gray-500">Total preferences</span>
                  <span className="font-semibold">{prefs.length}</span>
                </div>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-gray-500">Enabled</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {enabled}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-gray-500">Disabled</span>
                  <span className="font-semibold text-gray-500">
                    {disabled}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-gray-500">Coverage</span>
                  <span className="font-semibold">
                    {prefs.length > 0
                      ? Math.round((enabled / prefs.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </Section>

            <Section title="About notification prefs">
              <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                These are the user&apos;s in-app and email notification
                settings. They control which events the user receives alerts
                for, such as large transactions, card declines, and compliance
                alerts.
              </p>
            </Section>
          </div>
        </div>
      )}
    </>
  );
}
