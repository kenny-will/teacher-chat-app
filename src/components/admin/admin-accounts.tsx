"use client";

import { useState, useTransition } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  WalletIcon,
  CheckIcon,
  XIcon,
  RefreshCwIcon,
  MinusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag, PageHeader } from "@/components/meridian/primitives";
import { cn } from "@/lib/utils";
import { useServerData } from "@/hooks/use-server-data";
import {
  adminGetUsers,
  adminGetUserFinancialData,
  adminCreateAccount,
  adminAdjustAccountBalance,
  adminDeleteAccount,
} from "@/modules/financial/application/mutations/financial.mutations";
import { useCryptoPrices, type CryptoPrices } from "@/hooks/use-crypto-prices";
import { CRYPTO_SYMBOLS, CURRENCY_FLAGS, FX_RATES } from "@/lib/crypto-config";

// ─── Types ────────────────────────────────────────────────────────────────────

type RawUser = Awaited<ReturnType<typeof adminGetUsers>>[number];
type FinData = Awaited<ReturnType<typeof adminGetUserFinancialData>>;
type Account = FinData["accounts"][number];
type Feedback = { type: "success" | "error"; msg: string } | null;
const STATUS_TONE = {
  active: "green",
  earning: "brand",
  pending: "amber",
} as const;

const BANK_PRESETS = [
  { bank: "JPMorgan Chase", routing: "021000021" },
  { bank: "Bank of America", routing: "026009593" },
  { bank: "Wells Fargo", routing: "121042882" },
  { bank: "Citibank", routing: "021000089" },
  { bank: "Mercury · partner", routing: "084009519" },
  { bank: "BNP Paribas", routing: "IBAN FR76" },
  { bank: "HSBC", routing: "40-05-30" },
  { bank: "Meridian + BNY", routing: "meridian-internal" },
  { bank: "Custom", routing: "" },
];
const CRYPTO_PRESETS = [
  { label: "Bitcoin (BTC)", currency: "BTC", bank: "Bitcoin Network" },
  { label: "Ethereum (ETH)", currency: "ETH", bank: "Ethereum Network" },
  { label: "USDT (Ethereum)", currency: "USDT", bank: "Ethereum Network" },
  { label: "USDT (Tron)", currency: "USDT", bank: "Tron Network" },
  { label: "Tron (TRX)", currency: "TRX", bank: "Tron Network" },
  { label: "Solana (SOL)", currency: "SOL", bank: "Solana Network" },
  { label: "Custom", currency: "", bank: "" },
];
const BANK_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "SGD",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
];
const CRYPTO_CURRENCIES = ["BTC", "ETH", "TRX", "USDT", "USDC", "SOL", "BNB"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function fmtBalance(account: Account): string {
  const n = parseFloat(account.balance) || 0;
  if (CRYPTO_SYMBOLS.has(account.currency))
    return `${account.currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 8 })}`;
  return `${account.currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toUsd(account: Account, prices: CryptoPrices): number {
  const n = parseFloat(account.balance) || 0;
  if (CRYPTO_SYMBOLS.has(account.currency))
    return n * (prices[account.currency] ?? 0);
  return n * (FX_RATES[account.currency] ?? 1);
}

// ─── Feedback banner ─────────────────────────────────────────────────────────

function FeedbackBanner({
  fb,
  onDismiss,
}: {
  fb: Feedback;
  onDismiss: () => void;
}) {
  if (!fb) return null;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-[13px] font-medium",
        fb.type === "success"
          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
          : "bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
      )}
    >
      <span>{fb.msg}</span>
      <button onClick={onDismiss}>
        <XIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Adjust balance panel ────────────────────────────────────────────────────

function AdjustPanel({
  account,
  onDone,
  onCancel,
}: {
  account: Account;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"add" | "subtract">("add");
  const [pending, startTransition] = useTransition();
  const [fb, setFb] = useState<Feedback>(null);

  function handleSubmit() {
    const n = parseFloat(amount);
    if (!n || n <= 0) {
      setFb({ type: "error", msg: "Enter a valid amount." });
      return;
    }
    startTransition(async () => {
      try {
        await adminAdjustAccountBalance(account.id, n, direction);
        setFb({
          type: "success",
          msg: `Balance ${direction === "add" ? "increased" : "decreased"}.`,
        });
        setTimeout(onDone, 700);
      } catch (e) {
        setFb({
          type: "error",
          msg: e instanceof Error ? e.message : "Failed.",
        });
      }
    });
  }

  return (
    <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30 p-3 mt-2 space-y-2.5">
      <div className="text-[11.5px] font-semibold text-indigo-800 dark:text-indigo-300">
        Adjust — {account.name} ·{" "}
        <span className="font-mono">{fmtBalance(account)}</span>
      </div>
      {fb && <FeedbackBanner fb={fb} onDismiss={() => setFb(null)} />}
      <div className="flex gap-2">
        <button
          onClick={() => setDirection("add")}
          className={cn(
            "flex-1 h-7 rounded-lg text-[11.5px] font-medium border transition flex items-center justify-center gap-1",
            direction === "add"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-white/20",
          )}
        >
          <PlusIcon className="h-3 w-3" /> Add
        </button>
        <button
          onClick={() => setDirection("subtract")}
          className={cn(
            "flex-1 h-7 rounded-lg text-[11.5px] font-medium border transition flex items-center justify-center gap-1",
            direction === "subtract"
              ? "bg-rose-600 text-white border-rose-600"
              : "bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-white/20",
          )}
        >
          <MinusIcon className="h-3 w-3" /> Subtract
        </button>
      </div>
      <input
        type="number"
        min="0"
        step="any"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full h-8 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3 text-[12.5px] dark:text-white placeholder:text-gray-400 outline-none"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-7 text-[11.5px]"
          onClick={handleSubmit}
          disabled={pending}
        >
          {pending ? (
            <RefreshCwIcon className="h-3 w-3 animate-spin" />
          ) : (
            <CheckIcon className="h-3 w-3" />
          )}{" "}
          Confirm
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11.5px]"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Add account form ─────────────────────────────────────────────────────────

function AddAccountForm({
  userId,
  type,
  onDone,
  onCancel,
}: {
  userId: string;
  type: "bank" | "crypto";
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [currency, setCurrency] = useState(type === "bank" ? "USD" : "BTC");
  const [bankPresetIdx, setBankPresetIdx] = useState(0);
  const [cryptoPresetIdx, setCryptoPresetIdx] = useState(0);
  const [bankName, setBankName] = useState(
    type === "bank" ? BANK_PRESETS[0].bank : CRYPTO_PRESETS[0].bank,
  );
  const [routing, setRouting] = useState(
    type === "bank" ? BANK_PRESETS[0].routing : "",
  );
  const [apy, setApy] = useState("");
  const [status, setStatus] = useState<"active" | "earning" | "pending">(
    "active",
  );
  const [pending, startTransition] = useTransition();
  const [fb, setFb] = useState<Feedback>(null);

  const inputCls =
    "w-full h-8 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-3 text-[12.5px] dark:text-white placeholder:text-gray-400 outline-none";
  const labelCls =
    "block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1";

  function applyBankPreset(idx: number) {
    setBankPresetIdx(idx);
    setBankName(BANK_PRESETS[idx].bank);
    setRouting(BANK_PRESETS[idx].routing);
  }

  function applyCryptoPreset(idx: number) {
    setCryptoPresetIdx(idx);
    if (CRYPTO_PRESETS[idx].currency) setCurrency(CRYPTO_PRESETS[idx].currency);
    if (CRYPTO_PRESETS[idx].bank) setBankName(CRYPTO_PRESETS[idx].bank);
  }

  function handleSubmit() {
    if (!name.trim()) {
      setFb({ type: "error", msg: "Name is required." });
      return;
    }
    if (!lastFour.trim()) {
      setFb({ type: "error", msg: "Last 4 digits required." });
      return;
    }
    startTransition(async () => {
      try {
        await adminCreateAccount(userId, {
          name: name.trim(),
          lastFour: lastFour.slice(-4),
          bankName,
          currency,
          accountType: type === "crypto" ? "crypto" : apy ? "sweep" : "bank",
          routing: routing.trim() || undefined,
          apy: apy || "0",
          status,
        });
        onDone();
      } catch (e) {
        setFb({
          type: "error",
          msg: e instanceof Error ? e.message : "Failed.",
        });
      }
    });
  }

  return (
    <div className="p-3 border border-dashed border-gray-300 dark:border-white/20 rounded-xl space-y-2.5 bg-gray-50 dark:bg-white/3 mt-2">
      <div className="text-[12px] font-semibold dark:text-white">
        {type === "bank" ? "New bank account" : "New crypto wallet"}
      </div>
      {fb && <FeedbackBanner fb={fb} onDismiss={() => setFb(null)} />}

      <div>
        <label className={labelCls}>
          {type === "bank" ? "Bank preset" : "Crypto preset"}
        </label>
        {type === "bank" ? (
          <select
            value={bankPresetIdx}
            onChange={(e) => applyBankPreset(Number(e.target.value))}
            className={inputCls}
          >
            {BANK_PRESETS.map((p, i) => (
              <option key={i} value={i}>
                {p.bank}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={cryptoPresetIdx}
            onChange={(e) => applyCryptoPreset(Number(e.target.value))}
            className={inputCls}
          >
            {CRYPTO_PRESETS.map((p, i) => (
              <option key={i} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Account name</label>
          <input
            className={inputCls}
            placeholder={type === "bank" ? "Operating · USD" : "Bitcoin Wallet"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Last 4 / ID</label>
          <input
            className={inputCls}
            placeholder="4910"
            maxLength={10}
            value={lastFour}
            onChange={(e) => setLastFour(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={inputCls}
          >
            {(type === "bank" ? BANK_CURRENCIES : CRYPTO_CURRENCIES).map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className={inputCls}
          >
            <option value="active">Active</option>
            <option value="earning">Earning</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>
            {type === "bank" ? "Bank name" : "Network"}
          </label>
          <input
            className={inputCls}
            placeholder={type === "bank" ? "JPMorgan Chase" : "Bitcoin Network"}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>
            {type === "bank" ? "Routing / IBAN" : "Wallet address"}
          </label>
          <input
            className={inputCls}
            placeholder={type === "bank" ? "021000021" : "1A1zP1…"}
            value={routing}
            onChange={(e) => setRouting(e.target.value)}
          />
        </div>
      </div>

      {type === "bank" && (
        <div>
          <label className={labelCls}>APY % (optional)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            placeholder="5.21"
            value={apy}
            onChange={(e) => setApy(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="flex-1 h-7 text-[11.5px]"
          onClick={handleSubmit}
          disabled={pending}
        >
          {pending ? (
            <RefreshCwIcon className="h-3 w-3 animate-spin" />
          ) : (
            <PlusIcon className="h-3 w-3" />
          )}{" "}
          Create
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11.5px]"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Account row (inside accordion) ──────────────────────────────────────────

function AccountRow({
  account,
  onAdjust,
  onDelete,
  isAdjusting,
}: {
  account: Account;
  onAdjust: (a: Account) => void;
  onDelete: (a: Account) => void;
  isAdjusting: boolean;
}) {
  const isCrypto = CRYPTO_SYMBOLS.has(account.currency);
  const apyVal = parseFloat(account.apy ?? "0");
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-white/8 last:border-0 text-[12px]">
      <div
        className={cn(
          "h-7 w-7 rounded-md grid place-items-center text-[12px] shrink-0",
          isCrypto
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
            : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300",
        )}
      >
        {isCrypto ? (
          (CURRENCY_FLAGS[account.currency] ?? "₿")
        ) : (
          <WalletIcon className="h-3.5 w-3.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold dark:text-white truncate">
          {account.name}
          <span className="font-normal text-gray-400 dark:text-gray-500 ml-1.5">
            •••• {account.lastFour}
          </span>
        </div>
        <div className="text-[10.5px] text-gray-500 dark:text-gray-400">
          {account.bankName}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="tabular-nums font-semibold dark:text-white">
          {fmtBalance(account)}
        </div>
        {apyVal > 0 && (
          <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400">
            {apyVal.toFixed(2)}% APY
          </div>
        )}
      </div>
      <Tag
        tone={
          STATUS_TONE[account.status as keyof typeof STATUS_TONE] ?? "neutral"
        }
      >
        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
      </Tag>
      <button
        onClick={() => onAdjust(account)}
        className={cn(
          "h-7 px-2 rounded-md text-[11px] font-medium border transition flex items-center gap-1",
          isAdjusting
            ? "bg-indigo-600 text-white border-indigo-600"
            : "border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
        )}
        title="Adjust balance"
      >
        <PencilIcon className="h-3 w-3" /> Adjust
      </button>
      <button
        onClick={() => onDelete(account)}
        className="h-7 w-7 rounded-md border border-gray-200 dark:border-white/20 text-gray-400 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-700 dark:hover:text-rose-400 transition grid place-items-center"
      >
        <TrashIcon className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── User accordion row ────────────────────────────────────────────────────

function UserAccountRow({
  user,
  prices,
}: {
  user: RawUser;
  prices: CryptoPrices;
}) {
  const [open, setOpen] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Account | null>(null);
  const [deletePending, startDelete] = useTransition();
  const [fb, setFb] = useState<Feedback>(null);

  const { data, isLoading, refetch } = useServerData(
    () => (open ? adminGetUserFinancialData(user.id) : Promise.resolve(null)),
    [open, user.id],
  );

  const accounts = data?.accounts ?? [];
  const totalUsd = accounts.reduce((s, a) => s + toUsd(a, prices), 0);
  const initials = getInitials(user.name);

  function handleDelete(account: Account) {
    if (!confirm(`Delete "${account.name}"?`)) return;
    startDelete(async () => {
      try {
        await adminDeleteAccount(account.id);
        setFb({ type: "success", msg: `Deleted "${account.name}".` });
        refetch();
      } catch (e) {
        setFb({
          type: "error",
          msg: e instanceof Error ? e.message : "Failed.",
        });
      }
    });
  }

  function handleAdjustDone() {
    setAdjustTarget(null);
    refetch();
  }
  function handleAddDone() {
    setShowAddBank(false);
    setShowAddCrypto(false);
    refetch();
  }

  return (
    <div className="border-b border-gray-200 dark:border-white/10 last:border-0">
      {/* User header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left"
      >
        <div
          className="h-9 w-9 rounded-full grid place-items-center text-white text-[12px] font-semibold shrink-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(235 70% 58%), hsl(280 60% 40%))",
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold dark:text-white">
            {user.name}
          </div>
          <div className="text-[11.5px] text-gray-500 dark:text-gray-400">
            {user.email}
          </div>
        </div>
        {open && data && (
          <div className="text-right shrink-0 mr-2">
            <div className="text-[13px] font-semibold tabular-nums dark:text-white">
              ≈ $
              {totalUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10.5px] text-gray-400 dark:text-gray-500">
              {accounts.length} account{accounts.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
        {!open && <Tag tone="neutral">{user.role}</Tag>}
        {open ? (
          <ChevronDownIcon className="h-4 w-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-400 shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="bg-gray-50 dark:bg-white/3 border-t border-gray-100 dark:border-white/8 px-5 pb-4 pt-3 space-y-3">
          {fb && <FeedbackBanner fb={fb} onDismiss={() => setFb(null)} />}

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 dark:bg-white/10 rounded-lg"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Add account buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-1.5 h-7 text-[11.5px]"
                  onClick={() => {
                    setShowAddBank((v) => !v);
                    setShowAddCrypto(false);
                  }}
                >
                  <PlusIcon className="h-3 w-3" />
                  Bank account
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-7 text-[11.5px]"
                  onClick={() => {
                    setShowAddCrypto((v) => !v);
                    setShowAddBank(false);
                  }}
                >
                  <PlusIcon className="h-3 w-3" />
                  Crypto wallet
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11.5px] ml-auto"
                  onClick={() => {
                    setFb(null);
                    refetch();
                  }}
                >
                  <RefreshCwIcon className="h-3 w-3" />
                </Button>
              </div>

              {showAddBank && (
                <AddAccountForm
                  userId={user.id}
                  type="bank"
                  onDone={handleAddDone}
                  onCancel={() => setShowAddBank(false)}
                />
              )}
              {showAddCrypto && (
                <AddAccountForm
                  userId={user.id}
                  type="crypto"
                  onDone={handleAddDone}
                  onCancel={() => setShowAddCrypto(false)}
                />
              )}

              {/* Bank accounts */}
              {accounts.filter((a) => !CRYPTO_SYMBOLS.has(a.currency)).length >
                0 && (
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
                  <div className="px-4 py-2 text-[10.5px] uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/8">
                    Bank accounts
                  </div>
                  {accounts
                    .filter((a) => !CRYPTO_SYMBOLS.has(a.currency))
                    .map((a) => (
                      <div key={a.id}>
                        <AccountRow
                          account={a}
                          isAdjusting={adjustTarget?.id === a.id}
                          onAdjust={(acc) =>
                            setAdjustTarget(
                              adjustTarget?.id === acc.id ? null : acc,
                            )
                          }
                          onDelete={handleDelete}
                        />
                        {adjustTarget?.id === a.id && (
                          <div className="px-4 pb-3">
                            <AdjustPanel
                              account={a}
                              onDone={handleAdjustDone}
                              onCancel={() => setAdjustTarget(null)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* Crypto wallets */}
              {accounts.filter((a) => CRYPTO_SYMBOLS.has(a.currency)).length >
                0 && (
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
                  <div className="px-4 py-2 text-[10.5px] uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/8">
                    Crypto wallets
                  </div>
                  {accounts
                    .filter((a) => CRYPTO_SYMBOLS.has(a.currency))
                    .map((a) => (
                      <div key={a.id}>
                        <AccountRow
                          account={a}
                          isAdjusting={adjustTarget?.id === a.id}
                          onAdjust={(acc) =>
                            setAdjustTarget(
                              adjustTarget?.id === acc.id ? null : acc,
                            )
                          }
                          onDelete={handleDelete}
                        />
                        {adjustTarget?.id === a.id && (
                          <div className="px-4 pb-3">
                            <AdjustPanel
                              account={a}
                              onDone={handleAdjustDone}
                              onCancel={() => setAdjustTarget(null)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {accounts.length === 0 && !showAddBank && !showAddCrypto && (
                <div className="py-6 text-center text-[12px] text-gray-400 dark:text-gray-600">
                  No accounts yet — add one above.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminAccountsPage() {
  const {
    data: rawUsers,
    isLoading,
    refetch,
  } = useServerData(() => adminGetUsers(), []);
  const { prices } = useCryptoPrices();

  const users = (rawUsers ?? []).filter((u) => u.role !== "admin");

  return (
    <>
      <PageHeader
        eyebrow="Admin · Accounts"
        title="All Accounts."
        subtitle="Manage bank accounts and crypto wallets for every user. Click a user to expand."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={refetch}
          >
            <RefreshCwIcon className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
          <WalletIcon className="h-4 w-4 text-gray-400" />
          <span className="text-[13px] font-semibold dark:text-white">
            {isLoading
              ? "Loading users…"
              : `${users.length} user${users.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 dark:bg-white/8 rounded-lg"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-gray-400 dark:text-gray-500">
            No users found in the system.
          </div>
        ) : (
          users.map((u) => (
            <UserAccountRow key={u.id} user={u} prices={prices} />
          ))
        )}
      </div>

      <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 p-4">
        <div className="text-[12px] font-semibold text-blue-800 dark:text-blue-300 mb-1.5">
          How accounts work
        </div>
        <ul className="text-[11.5px] text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>
            Adjusting a bank account balance updates the user's combined balance
            on their Accounts page instantly.
          </li>
          <li>
            Crypto wallet amounts are displayed with live approximate USD
            equivalents.
          </li>
          <li>
            Use <strong>Deposits / Withdrawals</strong> to create transaction
            records that also update the main balance overview.
          </li>
        </ul>
      </div>
    </>
  );
}
