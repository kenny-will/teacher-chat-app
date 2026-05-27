"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tag,
  PageHeader,
  SectionHeader,
  AvatarBadge,
  Divider,
} from "@/components/meridian/primitives";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useServerData } from "@/hooks/use-server-data";
import {
  queryNotificationPrefs,
  mutateNotificationPref,
} from "@/modules/financial/application/queries/financial.queries";
import {
  getAuthMethod,
  changePassword,
  deleteAccount,
} from "@/modules/auth/application/actions/account.actions";
import { useRouter } from "next/navigation";
import {
  RefreshCwIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeOffIcon,
  AlertTriangleIcon,
} from "lucide-react";

type SectionKey =
  | "profile"
  | "workspace"
  | "security"
  | "notifications"
  | "developer"
  | "billing"
  | "export";

const SECURITY_ITEMS = [
  {
    label: "Two-factor authentication",
    detail: "Hardware key + TOTP",
    tone: "green",
    action: "Enrolled",
  },
  {
    label: "Single sign-on",
    detail: "Okta · SAML 2.0",
    tone: "green",
    action: "Connected",
  },
  {
    label: "Login history",
    detail: "42 sessions, 3 devices",
    tone: "neutral",
    action: "View",
  },
  {
    label: "Active devices",
    detail: "MacBook · iPhone · iPad",
    tone: "neutral",
    action: "Manage",
  },
  {
    label: "Trusted networks",
    detail: "3 IP ranges",
    tone: "neutral",
    action: "Manage",
  },
  {
    label: "Recovery codes",
    detail: "Last regenerated 30d ago",
    tone: "amber",
    action: "Regenerate",
  },
] as const;

const DEFAULT_NOTIF_LABELS = [
  "Large transactions (≥$50k)",
  "New invoice received",
  "Approval requested",
  "Card declined",
  "Weekly cash position",
  "Treasury rebalanced",
  "Compliance alerts",
  "Product updates",
];

// ─── Shared panel wrapper ─────────────────────────────────────────────────────

function Panel({
  children,
  danger = false,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        danger
          ? "border-rose-200 dark:border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/10"
          : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5",
      )}
    >
      {children}
    </div>
  );
}

function Feedback({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-medium",
        type === "success"
          ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
          : "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
      )}
    >
      {type === "success" ? (
        <CheckCircleIcon className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <XCircleIcon className="h-3.5 w-3.5 shrink-0" />
      )}
      {msg}
    </div>
  );
}

// ─── Section panels ──────────────────────────────────────────────────────────

function ProfilePanel() {
  const user = useAuth();
  return (
    <Panel>
      <SectionHeader
        title="Profile"
        subtitle="Personal details visible to your team"
      />
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="col-span-2 flex flex-col sm:flex-row items-center gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-14 w-14 rounded-full ring-2 ring-gray-200 dark:ring-white/10"
            />
          ) : (
            <AvatarBadge name={user.name} size={56} />
          )}
          <div>
            <div className="text-[14px] font-semibold">{user.name}</div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 capitalize">
              {user.email} · {user.role}
            </div>
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            Replace photo
          </Button>
        </div>
        {[
          ["Full name", user.name],
          ["Email", user.email],
          ["Role", user.role.charAt(0).toUpperCase() + user.role.slice(1)],
          ["Time zone", "America / Los Angeles"],
        ].map(([label, val]) => (
          <div key={label}>
            <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">
              {label}
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 h-10 flex items-center text-[13px] overflow-hidden">
              {val}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save changes</Button>
      </div>
    </Panel>
  );
}

function AuthMethodPanel() {
  const { data: authMethod, isLoading } = useServerData(getAuthMethod);

  return (
    <Panel>
      <SectionHeader
        title="Sign-in method"
        subtitle="How you authenticate to this account"
      />
      <div className="mt-3 flex items-center gap-3">
        {isLoading ? (
          <div className="h-6 w-36 rounded-full bg-gray-100 dark:bg-white/10 animate-pulse" />
        ) : authMethod?.method === "google" ? (
          <>
            <Tag tone="green">Google OAuth</Tag>
            <span className="text-[12px] text-gray-500 dark:text-gray-400">
              Managed by your Google account — no password set
            </span>
          </>
        ) : (
          <>
            <Tag tone="neutral">Email &amp; Password</Tag>
            {authMethod?.passwordChangedAt && (
              <span className="text-[12px] text-gray-500 dark:text-gray-400">
                Last changed{" "}
                {new Date(authMethod.passwordChangedAt).toLocaleDateString(
                  "en-US",
                  { dateStyle: "medium" },
                )}
              </span>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}

function ChangePasswordPanel() {
  const { data: authMethod, isLoading } = useServerData(getAuthMethod);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [busy, setBusy] = useState(false);
  const [fb, setFb] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  if (isLoading) return null;
  if (authMethod?.method !== "email") return null;

  const field = (
    key: keyof typeof form,
    label: string,
    showKey: keyof typeof show,
  ) => (
    <div>
      <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </div>
      <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-transparent">
        <input
          type={show[showKey] ? "text" : "password"}
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          placeholder="••••••••"
          className="flex-1 px-3 h-10 text-[13px] bg-transparent outline-none"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((p) => ({ ...p, [showKey]: !p[showKey] }))}
          className="px-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          {show[showKey] ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  async function handleSubmit() {
    if (!form.current || !form.next || !form.confirm || busy) return;
    setBusy(true);
    setFb(null);
    const res = await changePassword(form.current, form.next, form.confirm);
    if (res.success) {
      setFb({ type: "success", msg: "Password changed successfully." });
      setForm({ current: "", next: "", confirm: "" });
    } else {
      setFb({ type: "error", msg: res.error ?? "Something went wrong." });
    }
    setBusy(false);
  }

  return (
    <Panel>
      <SectionHeader
        title="Change password"
        subtitle="Must be at least 8 characters with uppercase, lowercase, and a number"
      />
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {field("current", "Current password", "current")}
        {field("next", "New password", "next")}
        {field("confirm", "Confirm new password", "confirm")}
      </div>
      {fb && (
        <div className="mt-3">
          <Feedback type={fb.type} msg={fb.msg} />
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          disabled={!form.current || !form.next || !form.confirm || busy}
          onClick={handleSubmit}
          className="gap-1.5"
        >
          {busy ? (
            <>
              <RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </div>
    </Panel>
  );
}

function SecurityRowsPanel() {
  return (
    <Panel>
      <SectionHeader title="Security" subtitle="Account protection" />
      <div className="mt-3 divide-y divide-gray-100 dark:divide-white/5">
        {SECURITY_ITEMS.map((r) => (
          <div
            key={r.label}
            className="py-3 flex items-center justify-between gap-4"
          >
            <div>
              <div className="text-[13px] font-medium">{r.label}</div>
              <div className="text-[11.5px] text-gray-500 dark:text-gray-400">
                {r.detail}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Tag tone={r.tone as "green" | "neutral" | "amber"}>
                {r.action}
              </Tag>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NotificationsPanel() {
  const { data: dbPrefs, isLoading } = useServerData(queryNotificationPrefs);
  const [notifState, setNotifState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (dbPrefs && dbPrefs.length > 0) {
      const map: Record<string, boolean> = {};
      for (const p of dbPrefs) map[p.id] = p.enabled;
      setNotifState(map);
    }
  }, [dbPrefs]);

  async function handleToggle(id: string, enabled: boolean) {
    setNotifState((prev) => ({ ...prev, [id]: enabled }));
    try {
      await mutateNotificationPref(id, enabled);
    } catch {
      setNotifState((prev) => ({ ...prev, [id]: !enabled }));
    }
  }

  return (
    <Panel>
      <SectionHeader
        title="Notifications"
        subtitle="When and where you hear from us"
      />
      {isLoading ? (
        <div className="mt-3 grid grid-cols-2 gap-3 animate-pulse">
          {DEFAULT_NOTIF_LABELS.map((l) => (
            <div
              key={l}
              className="rounded-lg border border-gray-200 dark:border-white/10 h-12 bg-gray-50 dark:bg-white/5"
            />
          ))}
        </div>
      ) : !dbPrefs?.length ? (
        <div className="mt-4 text-[12px] text-gray-400 dark:text-gray-500">
          No notification preferences configured. An admin can set these up for
          your account.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {dbPrefs.map((pref) => (
            <div
              key={pref.id}
              className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-3 flex items-center justify-between"
            >
              <span className="text-[12.5px]">{pref.label}</span>
              <Switch
                checked={notifState[pref.id] ?? pref.enabled}
                onCheckedChange={(v) => handleToggle(pref.id, v)}
              />
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function DangerZonePanel() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmed = input === "DELETE";

  async function handleDelete() {
    if (!confirmed || busy) return;
    setBusy(true);
    setError(null);
    const res = await deleteAccount();
    if (res.success) {
      router.push("/login");
      router.refresh();
    } else {
      setError(res.error ?? "Failed to delete account.");
      setBusy(false);
    }
  }

  return (
    <Panel danger>
      <div className="flex items-start gap-3">
        <AlertTriangleIcon className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <SectionHeader
            title="Delete account"
            subtitle="Permanently removes your account, all financial data, sessions, cards, transactions, and settings. This cannot be undone."
          />
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1">
                Type{" "}
                <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                  DELETE
                </span>{" "}
                to confirm
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                placeholder="DELETE"
                className="w-full max-w-xs rounded-lg border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-transparent px-3 h-10 text-[13px] font-mono placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none focus:border-rose-400 dark:focus:border-rose-500/60 transition"
              />
            </div>
            {error && <Feedback type="error" msg={error} />}
            <div className="flex items-center gap-3">
              <button
                disabled={!confirmed || busy}
                onClick={handleDelete}
                className={cn(
                  "inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium transition",
                  confirmed && !busy
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-rose-200 dark:bg-rose-900/30 text-rose-400 dark:text-rose-600 cursor-not-allowed",
                )}
              >
                {busy ? (
                  <>
                    <RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete my account"
                )}
              </button>
              <span className="text-[11.5px] text-gray-400 dark:text-gray-500">
                This action is irreversible
              </span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PlaceholderPanel({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <Panel>
      <SectionHeader title={title} subtitle={subtitle} />
      <p className="mt-4 text-[13px] text-gray-400 dark:text-gray-500">
        {description}
      </p>
    </Panel>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [active, setActive] = useState<SectionKey>("profile");

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings."
        subtitle="Profile, security, notifications, and developer tools."
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Active section content */}
        <div className="col-span-12 space-y-4">
          {/* Profile tab: all panels stacked */}
          {active === "profile" && (
            <>
              <ProfilePanel />
              <AuthMethodPanel />
              <ChangePasswordPanel />
              <DangerZonePanel />
            </>
          )}

          {/* Security tab */}
          {active === "security" && (
            <>
              <AuthMethodPanel />
              <ChangePasswordPanel />
              <SecurityRowsPanel />
              <DangerZonePanel />
            </>
          )}

          {/* Notifications tab */}
          {active === "notifications" && <NotificationsPanel />}

          {/* Placeholder tabs */}
          {active === "workspace" && (
            <PlaceholderPanel
              title="Workspace"
              subtitle="Org details, branding, time zone defaults"
              description="Add your workspace controls here."
            />
          )}
          {active === "developer" && (
            <PlaceholderPanel
              title="Developer"
              subtitle="API keys, webhooks, sandbox"
              description="Hook up your dev settings here."
            />
          )}
          {active === "billing" && (
            <PlaceholderPanel
              title="Plan & billing"
              subtitle="Current plan, invoices, payment method"
              description="Render your billing UI here."
            />
          )}
          {active === "export" && (
            <PlaceholderPanel
              title="Data export"
              subtitle="Download all your account data"
              description="Add export controls here."
            />
          )}
        </div>
      </div>
    </>
  );
}
