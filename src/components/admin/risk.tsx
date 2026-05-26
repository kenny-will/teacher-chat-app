"use client"

import { Button } from "@/components/ui/button"
import { FlagIcon, DownloadIcon, MoreHorizontalIcon } from "lucide-react"
import { Sparkline } from "@/components/meridian/charts"
import { Delta, Tag, PageHeader, SectionHeader, ProgressBar } from "@/components/meridian/primitives"

const FRAUD_TYPES = [
  { label: "Card testing", count: 482, delta: -14.2, color: "#EF4444" },
  { label: "Account takeover", count: 218, delta: -8.1, color: "#F59E0B" },
  { label: "ACH return fraud", count: 94, delta: 3.2, color: "#F59E0B" },
  { label: "Synthetic identity", count: 48, delta: -22, color: "#EF4444" },
  { label: "First-party fraud", count: 22, delta: 0, color: "#8A91A0" },
] as const

const ML_MODELS = [
  { name: "Card fraud · XGBoost", precision: "98.4%", recall: "94.2%", f1: "96.2%", status: "green" },
  { name: "ATO detection · LSTM", precision: "96.1%", recall: "91.8%", f1: "93.9%", status: "green" },
  { name: "ACH risk · LightGBM", precision: "94.8%", recall: "88.4%", f1: "91.5%", status: "amber" },
  { name: "Velocity rules engine", precision: "99.2%", recall: "82.1%", f1: "89.8%", status: "green" },
] as const

const CASES = [
  { id: "RSK-0412", type: "Card testing", entity: "•••• 7892", amount: "$24k attempted", severity: "High", age: "22m", tone: "rose" },
  { id: "RSK-0411", type: "ACH return", entity: "Wavefront LLC", amount: "$18,210", severity: "Medium", age: "1h", tone: "amber" },
  { id: "RSK-0410", type: "Velocity anomaly", entity: "IP: 185.42.x.x", amount: "84 txns/15m", severity: "Medium", age: "3h", tone: "amber" },
  { id: "RSK-0409", type: "Account takeover", entity: "tomas@octavia.mx", amount: "$94k moved", severity: "High", age: "4h", tone: "rose" },
] as const

export function AdminRiskPage() {
  return (
    <>
      <PageHeader
        eyebrow="Risk"
        title="Risk & fraud."
        subtitle="ML-powered fraud detection, rule engine, and open case management."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="h-3.5 w-3.5" />Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <FlagIcon className="h-3.5 w-3.5" />New case
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Risk gauge */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Platform risk index" subtitle="Composite score · updated hourly" />
          <div className="mt-4 flex items-center gap-6">
            <div className="relative h-28 w-28 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="12"
                  strokeDasharray={`${(28 / 100) * 238.76} 238.76`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 grid place-items-center rotate-90">
                <div className="text-center">
                  <div className="font-semibold text-2xl leading-none">28</div>
                  <div className="text-[10px] text-gray-500">Low risk</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2.5 text-[12.5px]">
              {[
                { l: "Score range", v: "0 – 28 (Low)" },
                { l: "Threshold alert", v: "60+" },
                { l: "Last change", v: "−4 pts · 2h ago" },
                { l: "Trend", v: "↓ Improving" },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between">
                  <span className="text-gray-500">{r.l}</span>
                  <span className="font-medium">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fraud blocked */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="Fraud blocked · today" subtitle="1,482 total attempts" />
          <div className="mt-4 space-y-3">
            {FRAUD_TYPES.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between text-[12.5px]">
                  <span>{r.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums font-medium">{r.count}</span>
                    <Delta value={r.delta} />
                  </div>
                </div>
                <ProgressBar
                  value={(r.count / 482) * 100}
                  color={r.color}
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ML model performance */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5">
          <SectionHeader title="ML model performance" subtitle="Production · 30d" />
          <div className="mt-3">
            <div className="grid grid-cols-4 gap-2 px-1 py-2 text-[11px] uppercase tracking-[0.1em] text-gray-400 border-b border-gray-100">
              <div className="col-span-2">Model</div>
              <div className="text-right">Prec.</div>
              <div className="text-right">F1</div>
            </div>
            {ML_MODELS.map((m, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-2 px-1 py-2.5 items-center border-b border-gray-100 last:border-0 text-[12px]"
              >
                <div className="col-span-2 min-w-0">
                  <div className="font-medium truncate">{m.name}</div>
                  <div className="text-[10.5px] text-gray-500">Recall {m.recall}</div>
                </div>
                <div className="text-right tabular-nums font-medium">{m.precision}</div>
                <div className="text-right tabular-nums">
                  <span className={m.status === "green" ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                    {m.f1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open cases */}
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-200">
            <div>
              <h3 className="text-[14.5px] font-semibold tracking-tight">Open cases</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">12 total · 4 high severity</p>
            </div>
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              {["All · 12", "High · 4", "Medium · 6", "Low · 2"].map((t, i) => (
                <button key={t} className={`px-3 h-7 rounded-md text-[12px] font-medium transition whitespace-nowrap ${i === 0 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[11px] uppercase tracking-[0.12em] text-gray-400 border-b border-gray-100">
            <div className="col-span-1">Case ID</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Entity</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Severity</div>
            <div className="col-span-2">Age</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          {CASES.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 px-5 py-3 items-center text-[12.5px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
              <div className="col-span-1 font-mono text-[11.5px] text-gray-500">{r.id}</div>
              <div className="col-span-2 font-medium">{r.type}</div>
              <div className="col-span-2 text-gray-600 font-mono text-[11.5px]">{r.entity}</div>
              <div className="col-span-2 text-gray-700">{r.amount}</div>
              <div className="col-span-2">
                <Tag tone={r.tone as "rose" | "amber"}>{r.severity}</Tag>
              </div>
              <div className="col-span-2 text-gray-500">{r.age}</div>
              <div className="col-span-1 text-right flex items-center justify-end gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-[11.5px]">Review</Button>
                <button className="text-gray-400 hover:text-gray-700">
                  <MoreHorizontalIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
