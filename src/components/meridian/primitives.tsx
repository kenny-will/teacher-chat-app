"use client"

import { cn } from "@/lib/utils"

// ─── Delta badge ────────────────────────────────────────────────
interface DeltaProps {
  value: number
  suffix?: string
  className?: string
}

export function Delta({ value, suffix = "%", className }: DeltaProps) {
  const up = value >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        up ? "text-emerald-600" : "text-rose-600",
        className
      )}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        {up ? (
          <path
            d="M2 7l3-3 3 3"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M2 3l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {up ? "+" : ""}
      {value.toFixed(2)}
      {suffix}
    </span>
  )
}

// ─── Tag / Pill ──────────────────────────────────────────────────
type TagTone = "neutral" | "brand" | "green" | "rose" | "amber" | "outline" | "dark"

interface TagProps {
  children: React.ReactNode
  tone?: TagTone
  className?: string
}

const toneMap: Record<TagTone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  brand: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-700",
  outline: "border border-gray-200 text-gray-700",
  dark: "bg-gray-900 text-white",
}

export function Tag({ children, tone = "neutral", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

// ─── Stat card ───────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string
  delta?: number
  hint?: string
  className?: string
  children?: React.ReactNode
}

export function StatCard({ label, value, delta, hint, className, children }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11.5px] text-gray-500">{label}</div>
        {delta !== undefined && <Delta value={delta} />}
      </div>
      <div className="mt-1 font-semibold text-[26px] leading-none tracking-tight tabular-nums">
        {value}
      </div>
      {children}
      {hint && <div className="mt-1 text-[11px] text-gray-500">{hint}</div>}
    </div>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────
interface AvatarBadgeProps {
  name: string
  size?: number
  className?: string
}

export function AvatarBadge({ name, size = 28, className }: AvatarBadgeProps) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const h = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue1 = h % 360
  const hue2 = (h * 7) % 360
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-white font-semibold",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue1} 70% 55%), hsl(${hue2} 60% 35%))`,
      }}
    >
      {initials || "·"}
    </div>
  )
}

// ─── Page header ─────────────────────────────────────────────────
interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          {eyebrow && (
            <div className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
              {eyebrow}
            </div>
          )}
          <h1 className="mt-1 font-semibold text-3xl leading-none tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-[13px] text-gray-600 max-w-[640px]">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}

// ─── Section header inside cards ─────────────────────────────────
interface SectionHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[14.5px] font-semibold text-gray-900 tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[12.5px] text-gray-500">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────────────
export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-gray-200", className)} />
}

// ─── Progress bar ────────────────────────────────────────────────
interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  color = "#2A5CFF",
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div
      className={cn(
        "h-1.5 w-full rounded-full bg-gray-100 overflow-hidden",
        className
      )}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────
export const fmtCurrency = (n: number, decimals = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
  }).format(n)

export const fmtNumber = (n: number, decimals = 1) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(n)
