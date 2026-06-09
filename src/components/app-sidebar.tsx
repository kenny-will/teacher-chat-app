"use client";

import * as React from "react";
import {
  ActivityIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  BellIcon,
  CreditCardIcon,
  FileTextIcon,
  FlaskConicalIcon,
  LayoutDashboardIcon,
  LockIcon,
  LogOutIcon,
  MapPinIcon,
  MessageCircleIcon,
  MoonIcon,
  ReceiptIcon,
  Settings2Icon,
  ShieldCheckIcon,
  ShieldIcon,
  SunIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
  ZapIcon,
  GlobeIcon,
  BarChart3Icon,
  ChevronDownIcon,
  BanknoteIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { useDashboardNav } from "@/contexts/dashboard-nav";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { SITE_TITLE } from "@/lib/site";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

// ─── Nav definitions ─────────────────────────────────────────────────────────

const USER_NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboardIcon },
  {
    key: "investments",
    label: "Investments",
    icon: BanknoteIcon,
    href: process.env.NEXT_PUBLIC_INVEST,
  },
  { key: "accounts", label: "Accounts", icon: WalletIcon },
  {
    key: "transactions",
    label: "Transactions",
    icon: ReceiptIcon,
  },
  { key: "deposit", label: "Deposit", icon: ArrowDownLeftIcon },
  { key: "withdrawal", label: "Withdrawal", icon: ArrowUpRightIcon },
  { key: "cards", label: "Cards", icon: CreditCardIcon, badge: "6" },
  { key: "settings", label: "Settings", icon: Settings2Icon },
] as const;

const ADMIN_NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboardIcon },
  { key: "accounts", label: "Accounts", icon: WalletIcon },
  { key: "transactions", label: "Transactions", icon: ReceiptIcon },
  { key: "deposits", label: "Deposits", icon: ArrowDownLeftIcon },
  { key: "withdrawals", label: "Withdrawals", icon: ArrowUpRightIcon },
  { key: "simulate", label: "Simulate", icon: FlaskConicalIcon },
  { key: "cards", label: "Cards", icon: CreditCardIcon },
  { key: "chat", label: "Live Chat", icon: MessageCircleIcon },
  { key: "locations", label: "Live Locations", icon: MapPinIcon },
  { key: "roles", label: "Roles", icon: ShieldCheckIcon },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Administrator",
    editor: "Editor",
    viewer: "Viewer",
  };
  return labels[role] ?? role;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { mode, view, isAdmin, setView, setMode } = useDashboardNav();
  const { isMobile, setOpenMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const user = useAuth();
  const isDark = resolvedTheme === "dark";

  const navItems = mode === "user" ? USER_NAV : ADMIN_NAV;

  const initials = getInitials(user.name);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* ── Header ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! h-12"
              asChild
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="h-7 w-7 rounded-lg bg-gray-900 dark:bg-white grid place-items-center shrink-0">
                  <ZapIcon className="h-3.5 w-3.5 text-white dark:text-gray-900" />
                </div>
                <span className="text-[15px] font-semibold tracking-tight">
                  {SITE_TITLE}
                </span>
                <span className="ml-auto text-[10px] font-medium bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5">
                  {mode === "admin" ? "ADMIN" : "v4.2"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User mode workspace banner */}
        {mode === "user" && (
          <div className="px-1 pb-1">
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition">
              <div className="h-7 w-7 rounded-md bg-indigo-600 text-white grid place-items-center text-[11px] font-semibold shrink-0">
                {initials}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-[12.5px] font-semibold leading-tight truncate">
                  {user.name}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  {roleLabel(user.role)} · USD
                </div>
              </div>
              <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            </button>
          </div>
        )}

        {/* Admin mode: operator console banner */}
        {mode === "admin" && (
          <div className="px-1 pb-1">
            <div className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg bg-gray-900 dark:bg-white/10 dark:border dark:border-white/10 text-white">
              <div className="h-7 w-7 rounded-md bg-indigo-500 grid place-items-center text-[11px] font-semibold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold leading-tight">
                  Operator console
                </div>
                <div className="text-[11px] text-white/60">
                  global · region us-east-1
                </div>
              </div>
              <ShieldIcon className="h-3.5 w-3.5 text-white/70 shrink-0" />
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent>
        {/* Primary nav */}
        <SidebarGroup>
          {mode === "admin" && (
            <SidebarGroupLabel className="text-[10.5px] uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500 px-3">
              Manage User
            </SidebarGroupLabel>
          )}
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.key;
              return (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    tooltip={item.label}
                    onClick={() => {
                      // console.log("href: ", item.href);
                      if ("href" in item && item.href)
                        return (window.location.href =  "https://" + item.href);
                      setView(item.key);
                      if (isMobile) setOpenMobile(false);
                    }}
                    className={cn(
                      "h-9 gap-2.5 rounded-lg text-[13px] transition",
                      isActive
                        ? "bg-gray-900 text-white hover:bg-gray-900 hover:text-white dark:bg-white dark:text-gray-900 dark:hover:bg-white dark:hover:text-gray-900"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive
                          ? "text-white dark:text-gray-900"
                          : "text-gray-500 dark:text-gray-400",
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span
                        className={cn(
                          "text-[10.5px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                          isActive
                            ? "bg-white/15 text-white dark:bg-gray-900/10 dark:text-gray-900"
                            : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter>
        <div className="space-y-3 p-1">
          {/* Mode switcher — admins only */}
          {isAdmin && (
            <div className="rounded-xl border border-gray-200 dark:border-white/10 p-1 flex items-center gap-1">
              {(["user", "admin"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 h-7 rounded-lg text-[11.5px] font-medium transition capitalize",
                    mode === m
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8",
                  )}
                >
                  {m === "user" ? "User" : "Admin"}
                </button>
              ))}
            </div>
          )}

          {/* User profile */}
          <div className="flex items-center gap-2.5 px-1">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full ring-1 ring-gray-200 dark:ring-white/10 shrink-0"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full grid place-items-center text-white text-[11px] font-semibold shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(235 70% 58%), hsl(280 60% 40%))",
                }}
              >
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium truncate">
                {user.name}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </div>
            </div>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition shrink-0"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition shrink-0"
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
