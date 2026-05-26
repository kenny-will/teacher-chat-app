"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  DashboardNavProvider,
  useDashboardNav,
} from "@/contexts/dashboard-nav";
import { useAuth } from "@/contexts/auth-context";

// ─── User pages ───────────────────────────────────────────────────────────────
import { OverviewPage } from "@/components/dashboard/overview";
import { AccountsPage } from "@/components/dashboard/accounts";
import { TransactionsPage } from "@/components/dashboard/transactions";
import { DepositPage } from "@/components/dashboard/deposit";
import { WithdrawalPage } from "@/components/dashboard/withdrawal";
import { CardsPage } from "@/components/dashboard/cards";
import { InvestPage } from "@/components/dashboard/invest";
import { TreasuryPage } from "@/components/dashboard/treasury";
import { ReportsPage } from "@/components/dashboard/reports";
import { TeamPage } from "@/components/dashboard/team";
import { IntegrationsPage } from "@/components/dashboard/integrations";
import { SettingsPage } from "@/components/dashboard/settings";

// ─── Admin pages ──────────────────────────────────────────────────────────────
import { AdminOverviewPage } from "@/components/admin/overview";
import { AdminStudentPickerPage } from "@/components/admin/student-picker";
import { AdminUserTransactionsPage } from "@/components/admin/admin-transactions-page";
import { AdminDepositsPage } from "@/components/admin/admin-deposits";
import { AdminWithdrawalsPage } from "@/components/admin/admin-withdrawals";
import { AdminSimulatePage } from "@/components/admin/admin-simulate";
import { AdminCardsPage } from "@/components/admin/admin-cards";
import { AdminActivityPage } from "@/components/admin/admin-activity";
import { AdminSupportPage } from "@/components/admin/support";
import { AdminNotificationsPage } from "@/components/admin/admin-notifications";
import { AdminAuditLogPage } from "@/components/admin/audit-log";
import { AdminChatPage } from "@/components/admin/admin-chat";
import { AdminLocationsPage } from "@/components/admin/admin-locations";
import { ChatWidget } from "@/components/chat/chat-widget";
import { LocationTracker } from "@/components/chat/location-tracker";

// ─── Route tables ─────────────────────────────────────────────────────────────

const USER_PAGES: Record<string, React.ComponentType> = {
  overview: OverviewPage,
  accounts: AccountsPage,
  transactions: TransactionsPage,
  deposit: DepositPage,
  withdrawal: WithdrawalPage,
  cards: CardsPage,
  invest: InvestPage,
  treasury: TreasuryPage,
  reports: ReportsPage,
  team: TeamPage,
  integrations: IntegrationsPage,
  settings: SettingsPage,
};

const ADMIN_PAGES: Record<string, React.ComponentType> = {
  overview: AdminOverviewPage,
  users: AdminStudentPickerPage,
  transactions: AdminUserTransactionsPage,
  deposits: AdminDepositsPage,
  withdrawals: AdminWithdrawalsPage,
  simulate: AdminSimulatePage,
  cards: AdminCardsPage,
  activity: AdminActivityPage,
  support: AdminSupportPage,
  notifications: AdminNotificationsPage,
  audit: AdminAuditLogPage,
  chat: AdminChatPage,
  locations: AdminLocationsPage,
};

// ─── Content renderer ─────────────────────────────────────────────────────────

function DashboardContent() {
  const { mode, view, isAdmin } = useDashboardNav();

  const effectiveMode = mode === "admin" && isAdmin ? "admin" : "user";
  const pages = effectiveMode === "admin" ? ADMIN_PAGES : USER_PAGES;
  const Page = pages[view] ?? pages.overview;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <Page />
      </div>
      {effectiveMode === "user" && (
        <>
          <ChatWidget />
          <LocationTracker />
        </>
      )}
    </div>
  );
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export function DashboardLayout() {
  const user = useAuth();
  const isAdmin = user.role === "admin";

  return (
    <DashboardNavProvider isAdmin={isAdmin}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <DashboardContent />
        </SidebarInset>
      </SidebarProvider>
    </DashboardNavProvider>
  );
}
