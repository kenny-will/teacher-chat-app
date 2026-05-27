"use client";

import { useState } from "react";
import { CreditCardIcon, PlusIcon, PencilIcon, Trash2Icon, LockIcon, UnlockIcon, CheckIcon, XIcon } from "lucide-react";
import {
  PageHeader,
  Tag,
  SectionHeader,
} from "@/components/meridian/primitives";
import { Button } from "@/components/ui/button";
import { useDashboardNav } from "@/contexts/dashboard-nav";
import { cn } from "@/lib/utils";
import {
  useAdminUserData,
  InlineUserPicker,
  UserPageHeader,
  PageSkeleton,
  Section,
  DataRow,
} from "./admin-shared";
import {
  adminCreateCard,
  adminUpdateCard,
  adminDeleteCard,
} from "@/modules/financial/application/mutations/financial.mutations";

// ─── Types ────────────────────────────────────────────────────────────────────

type CardStatus = "active" | "frozen" | "limit_hit";
type CardType   = "virtual" | "physical";

interface CardRow {
  id: string;
  label: string;
  cardUser: string;
  lastFour: string;
  network: string;
  cardVariant: string;
  number: string;
  validThru: string;
  limitAmount: string;
  spentAmount: string;
  activationFee: string;
  isActivated: boolean;
  cardType: CardType;
  status: CardStatus;
  isOwnerCard: boolean;
  sortOrder: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NETWORKS = ["Mastercard", "Visa", "Verve", "Mastercard Gold", "Visa Infinite"] as const;
const VARIANTS = ["debit", "credit", "infinite"] as const;

// ─── Blank form ───────────────────────────────────────────────────────────────

function blankForm(sortOrder = 999) {
  return {
    label: "",
    cardUser: "",
    lastFour: "",
    network: "Mastercard",
    cardVariant: "debit",
    number: "",
    validThru: "",
    limitAmount: "",
    spentAmount: "0",
    activationFee: "0",
    isActivated: true,
    cardType: "virtual" as CardType,
    status: "active" as CardStatus,
    isOwnerCard: false,
    sortOrder,
  };
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-[12.5px] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-white/30";

const selectCls = inputCls + " cursor-pointer";

// ─── Card form (create / edit) ────────────────────────────────────────────────

function CardForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: ReturnType<typeof blankForm>;
  onSave: (f: ReturnType<typeof blankForm>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [f, setF] = useState(initial);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-4">
      <SectionHeader
        title={initial.label ? "Edit card" : "Issue new card"}
        subtitle="All fields are editable by admin at any time"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Card label">
          <input className={inputCls} placeholder="e.g. Travel" value={f.label} onChange={set("label")} />
        </Field>
        <Field label="Cardholder / purpose">
          <input className={inputCls} placeholder="Name or team" value={f.cardUser} onChange={set("cardUser")} />
        </Field>
        <Field label="Network">
          <select className={selectCls} value={f.network} onChange={set("network")}>
            {NETWORKS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Card variant">
          <select className={selectCls} value={f.cardVariant} onChange={set("cardVariant")}>
            {VARIANTS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>
        <Field label="Card number">
          <input className={inputCls} placeholder="1234 5678 9012 3456" value={f.number} onChange={set("number")} />
        </Field>
        <Field label="Valid thru">
          <input className={inputCls} placeholder="MM/YY" value={f.validThru} onChange={set("validThru")} />
        </Field>
        <Field label="Last 4 digits">
          <input className={inputCls} placeholder="3456" maxLength={4} value={f.lastFour} onChange={set("lastFour")} />
        </Field>
        <Field label="Card type">
          <select className={selectCls} value={f.cardType} onChange={set("cardType")}>
            <option value="virtual">Virtual</option>
            <option value="physical">Physical</option>
          </select>
        </Field>
        <Field label="Monthly limit ($)">
          <input className={inputCls} type="number" min="0" placeholder="50000" value={f.limitAmount} onChange={set("limitAmount")} />
        </Field>
        <Field label="Amount spent ($)">
          <input className={inputCls} type="number" min="0" placeholder="0" value={f.spentAmount} onChange={set("spentAmount")} />
        </Field>
        <Field label="Activation fee ($)">
          <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00" value={f.activationFee} onChange={set("activationFee")} />
        </Field>
        <Field label="Status">
          <select className={selectCls} value={f.status} onChange={set("status")}>
            <option value="active">Active</option>
            <option value="frozen">Frozen</option>
            <option value="limit_hit">Limit hit</option>
          </select>
        </Field>
        <Field label="Sort order">
          <input className={inputCls} type="number" value={f.sortOrder} onChange={set("sortOrder")} />
        </Field>
      </div>

      {/* Toggle row */}
      <div className="flex flex-wrap gap-4 pt-1">
        <label className="flex items-center gap-2 text-[12.5px] cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-white/20"
            checked={f.isActivated}
            onChange={(e) => setF((p) => ({ ...p, isActivated: e.target.checked }))}
          />
          Activated
        </label>
        <label className="flex items-center gap-2 text-[12.5px] cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-white/20"
            checked={f.isOwnerCard}
            onChange={(e) => setF((p) => ({ ...p, isOwnerCard: e.target.checked }))}
          />
          Owner card
        </label>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={() => onSave(f)} disabled={saving || !f.label || !f.lastFour || !f.limitAmount}>
          {saving ? "Saving…" : "Save card"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Delete confirm inline ─────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-red-500">Delete?</span>
      <button onClick={onConfirm} className="h-7 px-2.5 rounded-lg bg-red-500 text-white text-[11.5px] font-medium hover:bg-red-600 transition">
        Yes
      </button>
      <button onClick={onCancel} className="h-7 px-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-[11.5px] hover:bg-gray-50 dark:hover:bg-white/5 transition">
        No
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminCardsPage() {
  const { selectedUser } = useDashboardNav();
  const { data, isLoading, refetch } = useAdminUserData(selectedUser?.id);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!selectedUser) {
    return (
      <>
        <PageHeader
          eyebrow="Admin · Cards"
          title="Cards & Spend."
          subtitle="Select a user to view their card program."
        />
        <InlineUserPicker hint="Click a user below to view their cards and spending data." />
      </>
    );
  }

  const cards = (data?.cards ?? []) as CardRow[];
  const stats = data?.cardStats;

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleCreate(f: ReturnType<typeof blankForm>) {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await adminCreateCard(selectedUser.id, {
        ...f,
        limitAmount: f.limitAmount || "0",
        spentAmount: f.spentAmount || "0",
        activationFee: f.activationFee || "0",
        sortOrder: Number(f.sortOrder),
      });
      await refetch();
      setShowCreate(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(cardId: string, f: ReturnType<typeof blankForm>) {
    setSaving(true);
    try {
      await adminUpdateCard(cardId, {
        ...f,
        limitAmount: f.limitAmount || "0",
        spentAmount: f.spentAmount || "0",
        activationFee: f.activationFee || "0",
        sortOrder: Number(f.sortOrder),
      });
      await refetch();
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cardId: string) {
    setSaving(true);
    try {
      await adminDeleteCard(cardId);
      await refetch();
      setDeletingId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleFreeze(card: CardRow) {
    const newStatus: CardStatus = card.status === "frozen" ? "active" : "frozen";
    await adminUpdateCard(card.id, { status: newStatus });
    await refetch();
  }

  async function handleToggleActivation(card: CardRow) {
    await adminUpdateCard(card.id, { isActivated: !card.isActivated });
    await refetch();
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin · Cards"
        title="Cards & Spend."
        subtitle={`Card program for ${selectedUser.name}`}
        actions={
          <div className="flex items-center gap-2">
            <Tag tone="neutral">{cards.length} cards</Tag>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => { setShowCreate(true); setEditingId(null); }}
            >
              <PlusIcon className="h-3.5 w-3.5" />Issue card
            </Button>
          </div>
        }
      />

      {!isLoading && data && (
        <UserPageHeader user={selectedUser} data={data} isLoading={isLoading} refetch={refetch} />
      )}

      {isLoading ? (
        <PageSkeleton />
      ) : !data?.hasData && !showCreate ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-12 text-center text-gray-400">
          <CreditCardIcon className="h-8 w-8 mx-auto mb-3 text-gray-200 dark:text-white/15" />
          <div className="text-[14px] font-medium">No data for this user</div>
          <div className="text-[12px] mt-1">Load demo data or issue a card manually.</div>
          <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-3.5 w-3.5" />Issue first card
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Create form */}
          {showCreate && (
            <CardForm
              initial={blankForm(cards.length)}
              onSave={handleCreate}
              onCancel={() => setShowCreate(false)}
              saving={saving}
            />
          )}

          <div className="grid grid-cols-12 gap-5">
            {/* Cards list */}
            <div className="col-span-12 lg:col-span-8 space-y-3">
              {cards.length === 0 && !showCreate ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center text-[12.5px] text-gray-400">
                  No cards issued yet.
                </div>
              ) : (
                cards.map((c) => (
                  <div key={c.id}>
                    {editingId === c.id ? (
                      <CardForm
                        initial={{
                          label: c.label,
                          cardUser: c.cardUser,
                          lastFour: c.lastFour,
                          network: c.network,
                          cardVariant: c.cardVariant,
                          number: c.number,
                          validThru: c.validThru,
                          limitAmount: c.limitAmount,
                          spentAmount: c.spentAmount,
                          activationFee: c.activationFee,
                          isActivated: c.isActivated,
                          cardType: c.cardType,
                          status: c.status,
                          isOwnerCard: c.isOwnerCard,
                          sortOrder: c.sortOrder,
                        }}
                        onSave={(f) => handleUpdate(c.id, f)}
                        onCancel={() => setEditingId(null)}
                        saving={saving}
                      />
                    ) : (
                      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
                        {/* Card header row */}
                        <div className="flex items-center gap-4 px-5 py-4">
                          <div className="h-10 w-16 rounded-lg bg-gray-900 dark:bg-gray-700 flex items-center justify-center shrink-0 text-[9px] font-bold text-white/60 uppercase tracking-wider">
                            {c.network.split(" ")[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-semibold">{c.label}</span>
                              {c.isOwnerCard && <Tag tone="brand">Owner</Tag>}
                              <Tag tone={c.status === "active" ? "green" : c.status === "frozen" ? "rose" : "amber"}>
                                {c.status}
                              </Tag>
                              {!c.isActivated && (
                                <Tag tone="amber">Pending activation</Tag>
                              )}
                            </div>
                            <div className="text-[11.5px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {c.cardUser} · {c.network} · {c.cardType} · ••••&nbsp;{c.lastFour} · exp {c.validThru}
                              {parseFloat(c.activationFee) > 0 && (
                                <> · <span className="text-amber-500">Fee ${parseFloat(c.activationFee).toFixed(2)}</span></>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[13px] font-semibold tabular-nums">
                              ${parseFloat(c.spentAmount).toLocaleString()}
                              <span className="text-gray-400 font-normal"> / ${parseFloat(c.limitAmount).toLocaleString()}</span>
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {parseFloat(c.limitAmount) > 0
                                ? Math.round((parseFloat(c.spentAmount) / parseFloat(c.limitAmount)) * 100)
                                : 0}% used
                            </div>
                          </div>
                        </div>

                        {/* Action bar */}
                        <div className="flex items-center gap-1.5 px-5 py-2.5 border-t border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/3">
                          <button
                            onClick={() => { setEditingId(c.id); setShowCreate(false); }}
                            className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-gray-200 dark:border-white/10 text-[11.5px] font-medium hover:bg-white dark:hover:bg-white/10 transition"
                          >
                            <PencilIcon className="h-3 w-3" />Edit
                          </button>
                          <button
                            onClick={() => handleToggleFreeze(c)}
                            className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-gray-200 dark:border-white/10 text-[11.5px] font-medium hover:bg-white dark:hover:bg-white/10 transition"
                          >
                            {c.status === "frozen"
                              ? <><UnlockIcon className="h-3 w-3" />Unfreeze</>
                              : <><LockIcon className="h-3 w-3" />Freeze</>}
                          </button>
                          <button
                            onClick={() => handleToggleActivation(c)}
                            className={cn(
                              "flex items-center gap-1.5 h-7 px-3 rounded-lg border text-[11.5px] font-medium transition",
                              c.isActivated
                                ? "border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10"
                                : "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                            )}
                          >
                            {c.isActivated
                              ? <><XIcon className="h-3 w-3" />Deactivate</>
                              : <><CheckIcon className="h-3 w-3" />Activate</>}
                          </button>
                          <div className="flex-1" />
                          {deletingId === c.id ? (
                            <DeleteConfirm
                              onConfirm={() => handleDelete(c.id)}
                              onCancel={() => setDeletingId(null)}
                            />
                          ) : (
                            <button
                              onClick={() => setDeletingId(c.id)}
                              className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-red-200 dark:border-red-500/30 text-red-500 text-[11.5px] font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                            >
                              <Trash2Icon className="h-3 w-3" />Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Card program stats */}
            <div className="col-span-12 lg:col-span-4">
              {stats && (
                <Section title="Program stats">
                  <DataRow label="Card spend MTD" value={`$${parseFloat(stats.cardSpendMtd).toLocaleString()}`} />
                  <DataRow label="Spend Δ%" value={`${stats.cardSpendDelta}%`} />
                  <DataRow label="Rebate YTD" value={`$${parseFloat(stats.rebateEarnedYtd).toLocaleString()}`} />
                  <DataRow label="Rebate %" value={`${stats.rebatePercent}%`} />
                  <DataRow label="Top merchant" value={stats.topMerchantName} />
                  <DataRow label="Top amount" value={stats.topMerchantAmount} />
                  <DataRow label="Declines (total)" value={stats.declinedThisMonth} />
                  <DataRow label="Declines (policy)" value={stats.declinedByPolicy} />
                  <DataRow label="Declines (network)" value={stats.declinedByNetwork} />
                </Section>
              )}

              {/* Quick summary */}
              {cards.length > 0 && (
                <Section title="Card summary">
                  <DataRow label="Total cards" value={cards.length} />
                  <DataRow label="Active" value={cards.filter((c) => c.status === "active").length} />
                  <DataRow label="Frozen" value={cards.filter((c) => c.status === "frozen").length} />
                  <DataRow label="Limit hit" value={cards.filter((c) => c.status === "limit_hit").length} />
                  <DataRow label="Not activated" value={cards.filter((c) => !c.isActivated).length} />
                  <DataRow
                    label="Total limit"
                    value={`$${cards.reduce((s, c) => s + parseFloat(c.limitAmount), 0).toLocaleString()}`}
                  />
                  <DataRow
                    label="Total spent"
                    value={`$${cards.reduce((s, c) => s + parseFloat(c.spentAmount), 0).toLocaleString()}`}
                  />
                </Section>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
