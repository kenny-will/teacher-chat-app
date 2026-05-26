"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRightIcon, CheckIcon, ZapIcon, ShieldIcon, CreditCardIcon, TrendingUpIcon, BarChart3Icon, FileTextIcon, GlobeIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Hero from "./hero"
import Perks from "./perks"
import { LanguageSwitcher } from "@/components/google-translate"

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#2A5CFF] grid place-items-center">
              <span className="text-white font-bold text-[13px]">M</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tightish text-gray-900">Meridian</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-[13.5px] text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">Product</a>
            <a href="#pricing" className="hover:text-gray-900 transition">Pricing</a>
            <a href="#" className="hover:text-gray-900 transition">Docs</a>
            <a href="#" className="hover:text-gray-900 transition">Blog</a>
            <a href="#" className="hover:text-gray-900 transition">Company</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="landing" />
          <Link href="/dashboard" className="hidden sm:block text-[13.5px] text-gray-600 hover:text-gray-900 transition px-3 py-1.5">
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg bg-[#2A5CFF] px-4 h-9 text-[13.5px] font-medium text-white hover:bg-[#1E47E5] transition"
          >
            Start free <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroDashboardPreview() {
  return (
    <div className="relative w-full rounded-2xl border border-gray-200 bg-white shadow-[0_12px_40px_-12px_rgba(10,12,18,.18),0_2px_4px_rgba(10,12,18,.06)] overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white border border-gray-200 px-3 py-1 text-[11px] text-gray-400">
          <span className="text-gray-300">🔒</span> app.meridian.finance/dashboard
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 p-4 border-b border-gray-100">
        {[
          { label: "Balance", value: "$2.48M", delta: "+4.2%", color: "#2A5CFF" },
          { label: "Monthly inflow", value: "$842k", delta: "+12.4%", color: "#10B981" },
          { label: "Yield earned", value: "$18,240", delta: "+2.1%", color: "#10B981" },
          { label: "Pending", value: "14", delta: "wire approvals", color: "#F59E0B" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-gray-100 p-3">
            <div className="text-[10px] text-gray-500">{k.label}</div>
            <div className="mt-0.5 font-semibold text-[16px] leading-none tabular" style={{ color: k.color }}>{k.value}</div>
            <div className="mt-1 text-[10px] text-gray-400">{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="p-4">
        <div className="text-[11px] font-medium text-gray-700 mb-2">Cash flow · last 30 days</div>
        <div className="h-[100px] relative overflow-hidden rounded-xl bg-gradient-to-b from-blue-50/60 to-transparent">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2A5CFF" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#2A5CFF" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            <path
              d="M0,70 C30,65 60,50 90,45 C120,40 150,55 180,38 C210,22 240,30 270,20 C300,10 330,25 360,18 C380,13 400,15 400,15 L400,100 L0,100 Z"
              fill="url(#heroGrad)"
            />
            <path
              d="M0,70 C30,65 60,50 90,45 C120,40 150,55 180,38 C210,22 240,30 270,20 C300,10 330,25 360,18 C380,13 400,15 400,15"
              fill="none"
              stroke="#2A5CFF"
              strokeWidth="2"
            />
          </svg>
        </div>
        {/* Transaction row hint */}
        <div className="mt-3 space-y-1.5">
          {[
            { name: "Atlas Labs · Wire", amount: "$124,000", status: "Settled", color: "#10B981" },
            { name: "Aurora Defense · ACH", amount: "$84,200", status: "Pending", color: "#F59E0B" },
          ].map((t) => (
            <div key={t.name} className="flex items-center justify-between text-[10.5px] rounded-lg bg-gray-50 px-2.5 py-1.5">
              <span className="text-gray-600">{t.name}</span>
              <span className="font-medium text-gray-800 tabular">{t.amount}</span>
              <span className="font-medium" style={{ color: t.color }}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// function Hero() {
//   return (
//     <section className="relative overflow-hidden bg-white hero-wash bg-grid">
//       <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">
//           {/* Copy */}
//           <div>
//             <div className="inline-flex items-center gap-2 rounded-full border border-[#2A5CFF]/20 bg-[#2A5CFF]/5 px-3 py-1 text-[12.5px] text-[#2A5CFF] font-medium mb-6">
//               <span className="h-1.5 w-1.5 rounded-full bg-[#2A5CFF] animate-pulse" />
//               Now in public beta · 1,400+ companies
//             </div>
//             <h1 className="font-display text-[52px] lg:text-[62px] leading-[1.05] tracking-tighter2 text-gray-900">
//               Move money at the{" "}
//               <em className="not-italic text-[#2A5CFF]">speed</em>{" "}
//               of your ambition.
//             </h1>
//             <p className="mt-5 text-[17px] leading-relaxed text-gray-600 max-w-[480px]">
//               Meridian gives ambitious teams unified accounts, payments, treasury, and compliance — all through one API and a beautiful dashboard.
//             </p>
//             <div className="mt-8 flex items-center gap-3 flex-wrap">
//               <Link
//                 href="/dashboard"
//                 className="flex items-center gap-2 rounded-xl bg-[#2A5CFF] px-6 h-12 text-[14px] font-medium text-white hover:bg-[#1E47E5] transition shadow-[0_0_0_1px_rgba(42,92,255,.25),0_8px_30px_-8px_rgba(42,92,255,.45)]"
//               >
//                 Start for free <ArrowRightIcon className="h-4 w-4" />
//               </Link>
//               <Link
//                 href="/dashboard"
//                 className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 h-12 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition"
//               >
//                 Schedule a demo
//               </Link>
//             </div>
//             <div className="mt-6 flex items-center gap-5 text-[12.5px] text-gray-500">
//               {["No credit card required", "SOC 2 Type II", "99.999% uptime SLA"].map((t) => (
//                 <span key={t} className="flex items-center gap-1.5">
//                   <CheckIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
//                   {t}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Dashboard preview */}
//           <div className="relative">
//             <div className="absolute -inset-4 rounded-3xl bg-[#2A5CFF]/5 blur-2xl" />
//             <div className="relative">
//               <HeroDashboardPreview />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// ─── Marquee ──────────────────────────────────────────────────────────────────
const MARQUEE_COMPANIES = [
  "Northwind Inc.", "Atlas Labs", "Aurora Defense", "Bracket Studios",
  "Spectrum AI", "Hexagon Labs", "Evergreen GmbH", "Prismatic SAS",
  "Octavia", "Tidepool Inc.", "Rock & Ore", "Wavefront LLC",
  "Pinnacle Robotics", "Lumen Labs", "Meridian Capital",
]

function Marquee() {
  const doubled = [...MARQUEE_COMPANIES, ...MARQUEE_COMPANIES]
  return (
    <section className="border-y border-gray-200 bg-gray-50 py-4 overflow-hidden">
      <div className="flex">
        <div className="marquee-track flex gap-12 pr-12 whitespace-nowrap">
          {doubled.map((name, i) => (
            <span key={i} className="text-[12.5px] font-medium text-gray-400 tracking-wide">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: GlobeIcon,
    title: "Global Payments",
    desc: "ACH, wires, SEPA, SWIFT, RTP, and FedNow — all through one unified API with real-time status and automatic reconciliation.",
  },
  {
    icon: ShieldIcon,
    title: "Compliance & KYC",
    desc: "Automated identity verification, sanctions screening across 14 lists, and a full case management queue — stay compliant without slowing down.",
  },
  {
    icon: CreditCardIcon,
    title: "Cards & Spend",
    desc: "Issue virtual and physical cards with per-card limits, merchant controls, and real-time transaction feeds for your entire team.",
  },
  {
    icon: TrendingUpIcon,
    title: "Treasury & Yields",
    desc: "Automate cash sweeps into T-bills and money markets. Earn 4.8%+ APY on idle balances while keeping full same-day liquidity.",
  },
  {
    icon: ZapIcon,
    title: "Risk & Fraud",
    desc: "ML models running on every authorization. Block fraud in <50ms with 98.4% recall and configurable velocity rules.",
  },
  {
    icon: BarChart3Icon,
    title: "Reporting & Audit",
    desc: "GAAP-compliant statements, immutable audit logs with 7-year retention, and one-click exports to your ERP or accounting system.",
  },
]

function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <div className="text-[11.5px] uppercase tracking-[0.14em] text-[#2A5CFF] font-medium mb-3">The platform</div>
          <h2 className="font-display text-[42px] lg:text-[52px] leading-[1.08] tracking-tighter2 text-gray-900">
            Everything your finance team needs,{" "}
            <em className="not-italic text-gray-400">in one place.</em>
          </h2>
          <p className="mt-4 text-[16px] text-gray-600 max-w-xl mx-auto">
            Stop stitching together a dozen tools. Meridian is the infrastructure layer that unifies your entire financial stack.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-[#2A5CFF]/30 hover:shadow-[0_2px_4px_rgba(10,12,18,.04),0_8px_24px_-8px_rgba(10,12,18,.08)] transition group"
            >
              <div className="h-10 w-10 rounded-xl bg-[#2A5CFF]/8 grid place-items-center mb-4 group-hover:bg-[#2A5CFF]/12 transition">
                <f.icon className="h-5 w-5 text-[#2A5CFF]" />
              </div>
              <h3 className="font-semibold text-[15px] text-gray-900">{f.title}</h3>
              <p className="mt-2 text-[13.5px] text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Deep Dive ────────────────────────────────────────────────────────────────
const DEEP_DIVE_TABS = [
  {
    label: "Treasury",
    heading: "Earn yield on every dollar.",
    body: "Meridian automatically sweeps idle balances into T-bills and government MMFs — earning 4.8% APY while keeping your cash available same-day. No lockup. No manual trades. Full audit trail.",
    stats: [
      { label: "Current APY", value: "4.82%" },
      { label: "Auto-sweep threshold", value: "$50k" },
      { label: "Liquidity", value: "Same-day" },
    ],
  },
  {
    label: "Payments",
    heading: "Every rail. One integration.",
    body: "From ACH and wires to RTP and FedNow, Meridian supports every payment rail in the US and 40+ countries. Build once, reach everywhere — with real-time status, webhooks, and automatic retry logic.",
    stats: [
      { label: "Payment rails", value: "12+" },
      { label: "Settlement time", value: "<2s RTP" },
      { label: "Uptime", value: "99.999%" },
    ],
  },
  {
    label: "Cards",
    heading: "Spend exactly how you want.",
    body: "Issue unlimited virtual cards in seconds. Set per-card merchant category controls, spend limits, and expiry. Get real-time notifications and daily reconciliation pushed to your accounting system.",
    stats: [
      { label: "Card issuance", value: "Instant" },
      { label: "Spending controls", value: "Per-card" },
      { label: "Cashback", value: "Up to 2%" },
    ],
  },
  {
    label: "Capital",
    heading: "Grow with your revenue.",
    body: "Meridian Capital offers working capital lines tied to your real-time transaction data — no lengthy applications, no equity dilution. Draw and repay daily, with transparent pricing.",
    stats: [
      { label: "Lines available", value: "Up to $5M" },
      { label: "Decision time", value: "<24h" },
      { label: "Fee", value: "1.5–2.5%/mo" },
    ],
  },
]

function DeepDive() {
  const [active, setActive] = useState(0)
  const tab = DEEP_DIVE_TABS[active]

  return (
    <section className="py-24 bg-[#0A0C12]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <div className="text-[11.5px] uppercase tracking-[0.14em] text-[#5482FF] font-medium mb-3">Deep dive</div>
          <h2 className="font-display text-[42px] lg:text-[52px] leading-[1.08] tracking-tighter2 text-white">
            Built for the whole finance stack.
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1 gap-1">
            {DEEP_DIVE_TABS.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActive(i)}
                className={cn(
                  "px-5 h-9 rounded-lg text-[13.5px] font-medium transition",
                  i === active
                    ? "bg-[#2A5CFF] text-white shadow-[0_0_0_1px_rgba(42,92,255,.4)]"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-display text-[34px] leading-tight tracking-tighter2 text-white mb-4">
              {tab.heading}
            </h3>
            <p className="text-[15px] text-white/60 leading-relaxed mb-8">{tab.body}</p>
            <div className="grid grid-cols-3 gap-4">
              {tab.stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] text-white/40 mb-1">{s.label}</div>
                  <div className="font-semibold text-[20px] text-white tabular">{s.value}</div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-1.5 text-[13.5px] text-[#5482FF] hover:text-[#85A8FF] transition font-medium"
            >
              See it in action <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Right panel: abstract UI hint */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="text-[11.5px] text-white/40 uppercase tracking-widest mb-4">{tab.label} — live view</div>
            <div className="space-y-3">
              {active === 0 && (
                <>
                  {[
                    { label: "US T-Bills · 6-month", apy: "4.94%", balance: "$1,240,000", status: "Active" },
                    { label: "Government MMF · Vanguard", apy: "4.78%", balance: "$840,000", status: "Active" },
                    { label: "Operating buffer", apy: "—", balance: "$400,000", status: "Reserved" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-[12.5px] rounded-lg bg-white/5 border border-white/8 px-3 py-2.5">
                      <span className="text-white/70">{r.label}</span>
                      <span className="text-emerald-400 font-medium tabular">{r.apy}</span>
                      <span className="text-white/50 tabular">{r.balance}</span>
                    </div>
                  ))}
                </>
              )}
              {active === 1 && (
                <>
                  {[
                    { rail: "ACH", time: "1–3 days", vol: "$820M / day" },
                    { rail: "Wire", time: "Same day", vol: "$284M / day" },
                    { rail: "RTP / FedNow", time: "<2s", vol: "$42M / day" },
                    { rail: "SEPA / SWIFT", time: "1–2 days", vol: "$22M / day" },
                  ].map((r) => (
                    <div key={r.rail} className="flex items-center justify-between text-[12.5px] rounded-lg bg-white/5 border border-white/8 px-3 py-2.5">
                      <span className="text-white/70 font-medium">{r.rail}</span>
                      <span className="text-white/40 font-mono">{r.time}</span>
                      <span className="text-[#5482FF] tabular">{r.vol}</span>
                    </div>
                  ))}
                </>
              )}
              {active === 2 && (
                <>
                  {[
                    { name: "Engineering · virtual", limit: "$5,000 / mo", txns: "42 txns" },
                    { name: "Marketing · virtual", limit: "$2,000 / mo", txns: "18 txns" },
                    { name: "Travel · physical", limit: "$10,000 / mo", txns: "7 txns" },
                    { name: "SaaS subscriptions", limit: "$1,500 / mo", txns: "12 txns" },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-[12.5px] rounded-lg bg-white/5 border border-white/8 px-3 py-2.5">
                      <span className="text-white/70">{r.name}</span>
                      <span className="text-white/40">{r.limit}</span>
                      <span className="text-[#5482FF] tabular">{r.txns}</span>
                    </div>
                  ))}
                </>
              )}
              {active === 3 && (
                <>
                  {[
                    { label: "Credit line approved", value: "$2,400,000" },
                    { label: "Drawn", value: "$840,000" },
                    { label: "Available", value: "$1,560,000" },
                    { label: "Next repayment", value: "$28,400 · Jul 31" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-[12.5px] rounded-lg bg-white/5 border border-white/8 px-3 py-2.5">
                      <span className="text-white/60">{r.label}</span>
                      <span className="text-white font-semibold tabular">{r.value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Metrics ──────────────────────────────────────────────────────────────────
const METRICS = [
  { value: "$2.4B", label: "processed daily" },
  { value: "99.999%", label: "uptime · 12-month rolling" },
  { value: "41", label: "countries supported" },
  { value: "<42ms", label: "p99 API latency" },
]

function MetricsStrip() {
  return (
    <section className="py-20 bg-white border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {METRICS.map((m) => (
            <div key={m.label} className="text-center">
              <div className="font-display text-[48px] lg:text-[56px] leading-none tracking-tighter2 text-gray-900">
                {m.value}
              </div>
              <div className="mt-2 text-[13.5px] text-gray-500">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
function Testimonial() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="text-[64px] text-[#2A5CFF]/20 font-serif leading-none mb-6">"</div>
        <blockquote className="font-display text-[26px] lg:text-[32px] leading-[1.3] tracking-tightish text-gray-900">
          We closed our Series B with a clean data room because Meridian had already reconciled every dollar since day one. Our auditors were done in two weeks instead of eight.
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#0A0C12] grid place-items-center text-white text-[12px] font-semibold">
            MC
          </div>
          <div className="text-left">
            <div className="text-[13.5px] font-semibold text-gray-900">Mia Costa</div>
            <div className="text-[12.5px] text-gray-500">CFO, Aurora Defense · $2.4M ARR</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter",
    price: "Free",
    sub: "No monthly fee",
    cta: "Get started",
    highlight: false,
    features: [
      "1 business account (USD)",
      "ACH + domestic wires",
      "Up to 5 team members",
      "Basic KYC — auto-approved",
      "API access + webhooks",
      "Community support",
    ],
  },
  {
    name: "Business",
    price: "$299",
    sub: "per month",
    cta: "Start 14-day trial",
    highlight: true,
    features: [
      "Everything in Starter",
      "Multi-currency accounts",
      "Cards (virtual + physical)",
      "Treasury sweep automation",
      "Priority KYC queue",
      "Risk & fraud dashboard",
      "Dedicated CSM",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    sub: "volume-based pricing",
    cta: "Talk to sales",
    highlight: false,
    features: [
      "Everything in Business",
      "Unlimited accounts & users",
      "White-label API access",
      "Custom compliance workflows",
      "SLA with financial penalties",
      "Dedicated infrastructure",
      "24/7 engineering support",
    ],
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <div className="text-[11.5px] uppercase tracking-[0.14em] text-[#2A5CFF] font-medium mb-3">Pricing</div>
          <h2 className="font-display text-[42px] lg:text-[52px] leading-[1.08] tracking-tighter2 text-gray-900">
            Transparent pricing. No surprises.
          </h2>
          <p className="mt-4 text-[16px] text-gray-600">
            Start free. Scale as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "rounded-2xl border p-7 flex flex-col",
                p.highlight
                  ? "border-[#2A5CFF] bg-[#2A5CFF] text-white shadow-[0_0_0_1px_rgba(42,92,255,.25),0_12px_40px_-12px_rgba(42,92,255,.45)]"
                  : "border-gray-200 bg-white"
              )}
            >
              {p.highlight && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-medium text-white mb-4 self-start">
                  Most popular
                </div>
              )}
              <div className={cn("text-[13px] font-medium mb-1", p.highlight ? "text-blue-200" : "text-gray-500")}>
                {p.name}
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className={cn("font-display text-[44px] leading-none tracking-tighter2", p.highlight ? "text-white" : "text-gray-900")}>
                  {p.price}
                </span>
                {p.price !== "Custom" && (
                  <span className={cn("text-[13px]", p.highlight ? "text-blue-200" : "text-gray-500")}>
                    / mo
                  </span>
                )}
              </div>
              <div className={cn("text-[12px] mb-6", p.highlight ? "text-blue-200" : "text-gray-400")}>{p.sub}</div>
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl h-10 text-[13.5px] font-medium mb-7 transition",
                  p.highlight
                    ? "bg-white text-[#2A5CFF] hover:bg-blue-50"
                    : "bg-[#0A0C12] text-white hover:bg-[#252A36]"
                )}
              >
                {p.cta} <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
              <ul className="space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className={cn("flex items-start gap-2.5 text-[13px]", p.highlight ? "text-blue-100" : "text-gray-600")}>
                    <CheckIcon className={cn("h-4 w-4 shrink-0 mt-0.5", p.highlight ? "text-white" : "text-emerald-500")} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="py-24 bg-[#0A0C12]">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-[42px] lg:text-[56px] leading-[1.06] tracking-tighter2 text-white">
          Ready to move money like it's{" "}
          <em className="not-italic text-[#5482FF]">2026?</em>
        </h2>
        <p className="mt-5 text-[16px] text-white/60 max-w-md mx-auto">
          Join 1,400+ companies that have unified their financial infrastructure on Meridian.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-[#2A5CFF] px-7 h-12 text-[14px] font-medium text-white hover:bg-[#1E47E5] transition shadow-[0_0_0_1px_rgba(42,92,255,.4),0_8px_30px_-8px_rgba(42,92,255,.6)]"
          >
            Start for free <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 h-12 text-[14px] font-medium text-white hover:bg-white/10 transition"
          >
            See the dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    {
      heading: "Product",
      links: ["Payments", "Cards", "Treasury", "Compliance", "Risk & Fraud", "Reporting"],
    },
    {
      heading: "Developers",
      links: ["API Reference", "SDKs", "Webhooks", "Changelog", "Status", "Open Source"],
    },
    {
      heading: "Company",
      links: ["About", "Blog", "Careers", "Press", "Security", "Contact"],
    },
    {
      heading: "Legal",
      links: ["Privacy", "Terms", "Cookie policy", "GDPR", "Licences"],
    },
  ]

  return (
    <footer className="bg-[#0A0C12] border-t border-white/8">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#2A5CFF] grid place-items-center">
                <span className="text-white font-bold text-[13px]">M</span>
              </div>
              <span className="font-semibold text-[15px] text-white">Meridian</span>
            </div>
            <p className="text-[13px] text-white/40 max-w-[220px] leading-relaxed">
              Modern financial infrastructure for ambitious teams — accounts, payments, treasury, and compliance in one platform.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11.5px] text-white/40">All systems operational</span>
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <div className="text-[11px] uppercase tracking-[0.12em] text-white/30 font-medium mb-3">{col.heading}</div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13px] text-white/50 hover:text-white/80 transition">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/8 flex items-center justify-between flex-wrap gap-4 text-[12.5px] text-white/30">
          <span>© 2026 Meridian Financial Inc. · Member FDIC · FINRA / SIPC</span>
          <span>Regulated by FinCEN · MSB License #31000266090076</span>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Perks />
        <Features />
        <DeepDive />
        <MetricsStrip />
        <Testimonial />
        <Pricing />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
