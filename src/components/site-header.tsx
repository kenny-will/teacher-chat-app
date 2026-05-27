"use client";

import {
  BellIcon,
  LogOutIcon,
  SearchIcon,
  SendIcon,
  Settings2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboardNav } from "@/contexts/dashboard-nav";
import { useAuthOptional } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/google-translate";
import { SITE_TITLE } from "@/lib/site";

const USER_BREADCRUMBS: Record<string, string[]> = {
  overview:     [SITE_TITLE, "Workspace", "Overview"],
  accounts:     [SITE_TITLE, "Banking",   "Accounts"],
  transactions: [SITE_TITLE, "Activity",  "Transactions"],
  pay:          [SITE_TITLE, "Money movement", "Send & Pay"],
  cards:        [SITE_TITLE, "Banking",   "Cards"],
  invest:       [SITE_TITLE, "Markets",   "Investments"],
  treasury:     [SITE_TITLE, "Markets",   "Treasury"],
  reports:      [SITE_TITLE, "Finance",   "Reports"],
  team:         [SITE_TITLE, "Workspace", "Team"],
  integrations: [SITE_TITLE, "Workspace", "Integrations"],
  settings:     [SITE_TITLE, "Workspace", "Settings"],
};

const ADMIN_BREADCRUMBS: Record<string, string[]> = {
  overview:     [SITE_TITLE, "Console",        "Overview"],
  users:        [SITE_TITLE, "Identity",       "Users"],
  orgs:         [SITE_TITLE, "Identity",       "Organizations"],
  transactions: [SITE_TITLE, "Payments",       "Transactions"],
  compliance:   [SITE_TITLE, "Risk",           "Compliance"],
  risk:         [SITE_TITLE, "Risk",           "Risk & Fraud"],
  system:       [SITE_TITLE, "Infrastructure", "System Health"],
  support:      [SITE_TITLE, "CX",             "Support"],
  audit:        [SITE_TITLE, "Security",       "Audit Log"],
  billing:      [SITE_TITLE, "Finance",        "Billing"],
};

export function SiteHeader() {
  const { mode, view, setView } = useDashboardNav();
  const user = useAuthOptional();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const crumbs =
    mode === "user"
      ? (USER_BREADCRUMBS[view] ?? USER_BREADCRUMBS.overview)
      : (ADMIN_BREADCRUMBS[view] ?? ADMIN_BREADCRUMBS.overview);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" />
        <Separator
          orientation="vertical"
          className="mx-1 data-[orientation=vertical]:h-4 dark:bg-white/10"
        />

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-500 dark:text-gray-400">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className="text-gray-300 dark:text-gray-600"
                >
                  <path
                    d="M4.5 3l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span
                className={
                  i === crumbs.length - 1
                    ? "text-gray-900 dark:text-gray-100 font-medium"
                    : "text-gray-500 dark:text-gray-400"
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Language */}
          <LanguageSwitcher variant="dashboard" />

          {/* CTA */}
          {mode === "user" && (
            <Button size="sm" onClick={() => setView('deposit')} className="gap-1.5 h-9">
              <SendIcon className="h-3.5 w-3.5" />
              Send money
            </Button>
          )}

          {/* User menu */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-white/10">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full ring-1 ring-gray-200 dark:ring-white/10"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-600 grid place-items-center text-xs font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-none">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                  {user.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="ml-1 h-8 w-8 grid place-items-center rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-white/8 transition"
              >
                <LogOutIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
