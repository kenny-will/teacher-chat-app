"use client";

import { useState } from "react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  FlaskConicalIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  SectionHeader,
  Tag,
} from "@/components/meridian/primitives";
import { useDashboardNav } from "@/contexts/dashboard-nav";
import { useServerData } from "@/hooks/use-server-data";
import { cn } from "@/lib/utils";
import {
  adminGetUsers,
  adminInjectDeposit,
  adminInjectWithdrawal,
} from "@/modules/financial/application/mutations/financial.mutations";
import { Feedback } from "./admin-shared";

// ─── Constants ────────────────────────────────────────────────────

const DEPOSIT_RAILS = [
  "ACH",
  "Wire",
  "RTP / FedNow",
  "Check",
  "BTC",
  "ETH",
  "TRX",
  "USDT (TRC-20)",
  "USDT (ERC-20)",
];
const WITHDRAW_RAILS = [
  "ACH",
  "Wire",
  "RTP / FedNow",
  "BTC",
  "ETH",
  "TRX",
  "USDT (TRC-20)",
  "USDT (ERC-20)",
];

const QUICK_SCENARIOS = [
  {
    type: "deposit" as const,
    label: "ACH · $25,000",
    rail: "ACH",
    amount: "25000",
    desc: "ACH from Acme Corp.",
    recipient: "",
    memo: "",
  },
  {
    type: "deposit" as const,
    label: "Wire · $120,000",
    rail: "Wire",
    amount: "120000",
    desc: "Wire · Client invoice #INV-2048",
    recipient: "",
    memo: "",
  },
  {
    type: "deposit" as const,
    label: "RTP · $4,800",
    rail: "RTP / FedNow",
    amount: "4800",
    desc: "RTP instant transfer",
    recipient: "",
    memo: "",
  },
  {
    type: "deposit" as const,
    label: "BTC · $8,400",
    rail: "BTC",
    amount: "8400",
    desc: "BTC transfer · 0.12 BTC",
    recipient: "",
    memo: "",
  },
  {
    type: "deposit" as const,
    label: "USDT · $50,000",
    rail: "USDT (TRC-20)",
    amount: "50000",
    desc: "USDT stablecoin deposit",
    recipient: "",
    memo: "",
  },
  {
    type: "withdrawal" as const,
    label: "Wire · $245,000",
    rail: "Wire",
    amount: "245000",
    desc: "",
    recipient: "Atlas Components Ltd.",
    memo: "Vendor payment INV-9042",
  },
  {
    type: "withdrawal" as const,
    label: "ACH · $412,800",
    rail: "ACH",
    amount: "412800",
    desc: "",
    recipient: "Payroll · 84 staff",
    memo: "Jun payroll run",
  },
  {
    type: "withdrawal" as const,
    label: "USDT · $50,000",
    rail: "USDT (TRC-20)",
    amount: "50000",
    desc: "",
    recipient: "TRX wallet T9d4a…Kz8",
    memo: "Crypto transfer",
  },
  {
    type: "withdrawal" as const,
    label: "BTC · $12,000",
    rail: "BTC",
    amount: "12000",
    desc: "",
    recipient: "bc1qxy2k…gfp2",
    memo: "BTC withdrawal",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[11.5px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

type RawUser = Awaited<ReturnType<typeof adminGetUsers>>[number];

// ─── Per-user inject panel ─────────────────────────────────────

function InjectPanel({
  user,
  onClose,
}: {
  user: RawUser;
  onClose: () => void;
}) {
  const { setView } = useDashboardNav();
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [amount, setAmount] = useState("");
  const [rail, setRail] = useState(DEPOSIT_RAILS[0]);
  const [description, setDesc] = useState("");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const rails = type === "deposit" ? DEPOSIT_RAILS : WITHDRAW_RAILS;

  function flash(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 5000);
  }

  function applyScenario(s: (typeof QUICK_SCENARIOS)[number]) {
    setType(s.type);
    setRail(s.rail);
    setAmount(s.amount);
    setDesc(s.desc);
    setRecipient(s.recipient);
    setMemo(s.memo);
  }

  async function handleInject() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      flash("Error: Enter a valid amount.");
      return;
    }
    setBusy(true);
    try {
      if (type === "deposit") {
        await adminInjectDeposit(user.id, {
          amount,
          rail,
          description: description || `${rail} Deposit`,
          reference: "",
        });
        flash(
          `Deposit of $${amt.toLocaleString()} injected as Pending for ${user.name}.`,
        );
        setTimeout(() => setView("deposits"), 1800);
      } else {
        await adminInjectWithdrawal(user.id, {
          amount,
          rail,
          recipient: recipient || `${rail} Withdrawal`,
          memo,
        });
        flash(
          `Withdrawal of $${amt.toLocaleString()} injected as Pending for ${user.name}.`,
        );
        setTimeout(() => setView("withdrawals"), 1800);
      }
      setAmount("");
      setDesc("");
      setRecipient("");
      setMemo("");
    } catch (e) {
      flash(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="col-span-12 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-white/5 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-indigo-100 dark:border-indigo-800/40 bg-indigo-50 dark:bg-indigo-950/30">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-indigo-600 grid place-items-center text-white text-[11px] font-semibold shrink-0">
            {getInitials(user.name)}
          </div>
          <div>
            <span className="text-[13px] font-semibold text-indigo-900 dark:text-indigo-200">
              {user.name}
            </span>
            <span className="ml-2 text-[11px] text-indigo-500 dark:text-indigo-400">
              {user.email}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-lg grid place-items-center text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <Feedback msg={feedback} />

      <div className="grid grid-cols-12 gap-5 p-5">
        {/* Inject form */}
        <div className="col-span-12 lg:col-span-7">
          {/* Type toggle */}
          <div className="flex gap-2 mb-4">
            {(["deposit", "withdrawal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setRail(
                    t === "deposit" ? DEPOSIT_RAILS[0] : WITHDRAW_RAILS[0],
                  );
                }}
                className={cn(
                  "flex items-center gap-2 px-5 h-9 rounded-xl text-[13px] font-semibold transition border-2",
                  type === t
                    ? t === "deposit"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-violet-600 text-white border-violet-600"
                    : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/8",
                )}
              >
                {t === "deposit" ? (
                  <ArrowDownLeftIcon className="h-3.5 w-3.5" />
                ) : (
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                )}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount (USD)">
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </FormField>

            <FormField label="Rail / Network">
              <select
                value={rail}
                onChange={(e) => setRail(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {rails.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </FormField>

            {type === "deposit" ? (
              <FormField label="Description / Source" className="col-span-2">
                <input
                  placeholder="e.g. ACH from Acme Corp., Invoice #1042"
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </FormField>
            ) : (
              <>
                <FormField label="Recipient / Payee">
                  <input
                    placeholder="e.g. Atlas Components Ltd."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </FormField>
                <FormField label="Memo (optional)">
                  <input
                    placeholder="e.g. Invoice INV-2048"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </FormField>
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/8 flex items-center justify-between gap-4">
            <p className="text-[11.5px] text-gray-400 dark:text-gray-500">
              Status will be <strong>Pending</strong>. Approve or reject from{" "}
              {type === "deposit" ? "Deposits" : "Withdrawals"}.
            </p>
            <Button
              size="sm"
              className={cn(
                "gap-2 shrink-0",
                type === "deposit"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-violet-600 hover:bg-violet-700",
              )}
              onClick={handleInject}
              disabled={busy || !amount}
            >
              <SendIcon className="h-3.5 w-3.5" />
              {busy ? "Injecting…" : `Inject ${type}`}
            </Button>
          </div>
        </div>

        {/* Quick scenarios */}
        <div className="col-span-12 lg:col-span-5">
          <SectionHeader title="Quick scenarios" subtitle="Click to pre-fill" />
          <div className="mt-2 space-y-1.5">
            {QUICK_SCENARIOS.map((s) => (
              <button
                key={s.label}
                onClick={() => applyScenario(s)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/8 transition text-left"
              >
                <div className="flex items-center gap-2">
                  {s.type === "deposit" ? (
                    <ArrowDownLeftIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <ArrowUpRightIcon className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                  )}
                  <div>
                    <div className="text-[12px] font-medium">{s.label}</div>
                    <div className="text-[10.5px] text-gray-400 dark:text-gray-500">
                      {s.rail}
                    </div>
                  </div>
                </div>
                <Tag tone={s.type === "deposit" ? "green" : "brand"}>
                  {s.type === "deposit" ? "Deposit" : "Withdraw"}
                </Tag>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── User row ──────────────────────────────────────────────────

function UserRow({
  user,
  activeAction,
  onAction,
}: {
  user: RawUser;
  activeAction: "deposit" | "withdrawal" | null;
  onAction: (action: "deposit" | "withdrawal" | null) => void;
}) {
  const initials = getInitials(user.name);
  const isOpen = activeAction !== null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-[12.5px] border-b border-gray-100 dark:border-white/8 last:border-0 transition",
        isOpen
          ? "bg-indigo-50/50 dark:bg-indigo-950/20"
          : "hover:bg-gray-50 dark:hover:bg-white/5",
      )}
    >
      {/* Avatar */}
      <div
        className="h-8 w-8 rounded-full grid place-items-center text-white text-[11px] font-semibold shrink-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(235 70% 58%), hsl(280 60% 40%))",
        }}
      >
        {initials}
      </div>

      {/* Identity */}
      <div className="flex-1 min-w-0">
        <div className="font-medium dark:text-white truncate">{user.name}</div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
          {user.email}
        </div>
      </div>

      {/* Role badge */}
      <Tag
        tone={user.role === "admin" ? "brand" : "neutral"}
        className="shrink-0 capitalize"
      >
        {user.role}
      </Tag>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() =>
            onAction(activeAction === "deposit" ? null : "deposit")
          }
          className={cn(
            "flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11.5px] font-medium border transition",
            activeAction === "deposit"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400",
          )}
        >
          <ArrowDownLeftIcon className="h-3 w-3" />
          Deposit
        </button>
        <button
          onClick={() =>
            onAction(activeAction === "withdrawal" ? null : "withdrawal")
          }
          className={cn(
            "flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11.5px] font-medium border transition",
            activeAction === "withdrawal"
              ? "bg-violet-600 text-white border-violet-600"
              : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400",
          )}
        >
          <ArrowUpRightIcon className="h-3 w-3" />
          Withdraw
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export function AdminSimulatePage() {
  const { data: users, isLoading } = useServerData(() => adminGetUsers(), []);
  // activePanel: { userId, action } | null
  const [activePanel, setActivePanel] = useState<{
    userId: string;
    action: "deposit" | "withdrawal";
  } | null>(null);

  const users = (users ?? []).filter((u) => u.role !== "admin");

  function handleAction(
    userId: string,
    action: "deposit" | "withdrawal" | null,
  ) {
    if (!action) {
      setActivePanel(null);
      return;
    }
    // Toggle off if same user+action is already open
    if (activePanel?.userId === userId && activePanel.action === action) {
      setActivePanel(null);
    } else {
      setActivePanel({ userId, action });
    }
  }

  const activeUser = activePanel
    ? ((users ?? []).find((u) => u.id === activePanel.userId) ?? null)
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Admin · Simulate"
        title="Simulate transactions."
        subtitle="Inject demo deposits or withdrawals into any user's account directly from this list."
      />

      {/* How it works */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 p-4 mb-5 flex items-start gap-3">
        <FlaskConicalIcon className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
        <ol className="text-[12px] text-blue-700 dark:text-blue-400 space-y-0.5 list-decimal list-inside">
          <li>
            Click <strong>Deposit</strong> or <strong>Withdraw</strong> next to
            any user to open the inject form.
          </li>
          <li>
            Fill in the amount and rail, then click <strong>Inject</strong>.
          </li>
          <li>
            The transaction appears as <strong>Pending</strong> — go to Deposits
            or Withdrawals to approve it.
          </li>
        </ol>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* User list */}
        <div className="col-span-12 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center gap-2">
            <FlaskConicalIcon className="h-4 w-4 text-gray-400" />
            <span className="text-[13px] font-semibold dark:text-white">
              {isLoading
                ? "Loading users…"
                : `${users.length} user${users.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10.5px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100 dark:border-white/8">
            <div className="col-span-5">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-5 text-right">Actions</div>
          </div>

          {isLoading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 dark:bg-white/8 rounded-lg"
                />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-gray-400 dark:text-gray-500">
              No users found.
            </div>
          ) : (
            users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                activeAction={
                  activePanel?.userId === u.id ? activePanel.action : null
                }
                onAction={(action) => handleAction(u.id, action)}
              />
            ))
          )}
        </div>

        {/* Inject panel — appears below the list when an action is selected */}
        {activeUser && activePanel && (
          <InjectPanel
            key={activeUser.id + activePanel.action}
            user={activeUser}
            onClose={() => setActivePanel(null)}
          />
        )}
      </div>
    </>
  );
}
