"use client"

import React from "react"

// ─── Shared pieces ────────────────────────────────────────────────

const ContactlessIcon: React.FC<{ color?: string }> = ({ color = "currentColor" }) => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path d="M8 6c4.5 3 4.5 13 0 16"   stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M13 8.5c3 2.2 3 8.8 0 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M18 11c1.6 1.2 1.6 4.8 0 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const ChipIcon: React.FC = () => (
  <svg width="42" height="33" viewBox="0 0 46 36" aria-hidden="true">
    <defs>
      <linearGradient id="chip-base" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#e9ecef" />
        <stop offset="45%"  stopColor="#cfd3d8" />
        <stop offset="100%" stopColor="#aab0b6" />
      </linearGradient>
      <linearGradient id="chip-cell" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#d9dde2" />
        <stop offset="100%" stopColor="#b6bbc1" />
      </linearGradient>
    </defs>
    <rect x="0.5" y="0.5" width="45" height="35" rx="5" fill="url(#chip-base)" stroke="#9ea4ab" strokeWidth="0.6" />
    <g stroke="#8c9197" strokeWidth="0.7">
      <line x1="0" y1="11" x2="46" y2="11" /><line x1="0" y1="24" x2="46" y2="24" />
      <line x1="16" y1="0" x2="16" y2="11" /><line x1="30" y1="0" x2="30" y2="11" />
      <line x1="16" y1="24" x2="16" y2="36" /><line x1="30" y1="24" x2="30" y2="36" />
      <line x1="13" y1="11" x2="13" y2="24" /><line x1="33" y1="11" x2="33" y2="24" />
    </g>
    <rect x="13" y="11" width="20" height="13" fill="url(#chip-cell)" stroke="#8c9197" strokeWidth="0.7" />
  </svg>
)

interface BaseProps {
  number?: string
  validThru?: string
  cardholder?: string
  variant?: string
  className?: string
}

function mask(number: string) {
  const d = number.replace(/\s/g, "")
  return `${d.slice(0, 4)} •••• •••• ${d.slice(-4)}`
}

// ─── Mastercard ───────────────────────────────────────────────────

export const MastercardCard: React.FC<BaseProps> = ({
  number = "5412 7512 3412 3456",
  validThru = "12/27",
  cardholder = "Cardholder",
  variant = "debit",
  className = "",
}) => (
  <div className={"relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-[22px] bg-white shadow-[0_18px_40px_-12px_rgba(16,24,40,0.22)] " + className}>
    <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle,rgba(0,0,0,0.06) 0.6px,transparent 0.9px)", backgroundSize: "4px 4px" }} />
    <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%,transparent 35%,rgba(255,255,255,0.6) 90%)" }} />
    <div className="pointer-events-none absolute rounded-full border border-neutral-300" style={{ width: "118%", aspectRatio: "1/1", right: "-72%", top: "50%", transform: "translateY(-50%)" }} />

    <div className="relative flex h-full flex-col px-6 py-5">
      <div className="flex items-start justify-between">
        <div className="text-[22px] font-light tracking-tight text-neutral-800 leading-none">
          Mastercard<sup className="text-[8px] font-normal text-neutral-500 ml-px">®</sup>
        </div>
        <ContactlessIcon color="#555" />
      </div>
      <div className="mt-5"><ChipIcon /></div>
      <div className="mt-4 text-[18px] font-medium tracking-[0.06em] text-neutral-800 tabular-nums font-mono">
        {mask(number)}
      </div>
      <div className="mt-2 leading-tight">
        <div className="text-[8px] font-bold tracking-[0.1em] text-neutral-500">VALID THRU</div>
        <div className="text-[13px] font-medium text-neutral-800 tabular-nums">{validThru}</div>
        <div className="text-[13px] font-medium text-neutral-800 uppercase tracking-wide mt-0.5">{cardholder}</div>
      </div>
    </div>

    <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[32%] flex-col items-center justify-center">
      <div className="absolute top-[24%] text-[13px] font-semibold text-neutral-700 capitalize">{variant}</div>
      <div className="absolute top-[44%] flex flex-col items-center">
        <svg width="52" height="40" viewBox="0 0 56 44" aria-hidden="true">
          <circle cx="20" cy="22" r="18" fill="#EB001B" />
          <circle cx="36" cy="22" r="18" fill="#F79E1B" style={{ mixBlendMode: "multiply" }} />
        </svg>
        <div className="mt-0.5 text-[11px] font-medium tracking-tight text-neutral-700">mastercard</div>
      </div>
    </div>
  </div>
)

// ─── Visa ─────────────────────────────────────────────────────────

export const VisaCard: React.FC<BaseProps> = ({
  number = "4111 1111 1111 1234",
  validThru = "09/28",
  cardholder = "Cardholder",
  variant = "credit",
  className = "",
}) => (
  <div className={"relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-[22px] shadow-[0_18px_40px_-12px_rgba(16,24,40,0.28)] " + className}
    style={{ background: "linear-gradient(135deg,#1a1f71 0%,#1e3a8a 45%,#1d4ed8 100%)" }}>
    <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.04) 0.8px,transparent 1px)", backgroundSize: "5px 5px" }} />
    <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
    <div className="pointer-events-none absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-indigo-300/10 blur-2xl" />

    <div className="relative flex h-full flex-col px-6 py-5">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-semibold tracking-[0.2em] text-blue-200 uppercase mt-1">Meridian Bank</div>
        <ContactlessIcon color="rgba(255,255,255,0.7)" />
      </div>
      <div className="mt-5"><ChipIcon /></div>
      <div className="mt-4 text-[18px] font-medium tracking-[0.06em] text-white tabular-nums font-mono">
        {mask(number)}
      </div>
      <div className="mt-2 leading-tight">
        <div className="text-[8px] font-bold tracking-[0.1em] text-blue-200">VALID THRU</div>
        <div className="text-[13px] font-medium text-white tabular-nums">{validThru}</div>
        <div className="text-[13px] font-medium text-white/90 uppercase tracking-wide mt-0.5">{cardholder}</div>
      </div>
    </div>

    <div className="pointer-events-none absolute bottom-5 right-6 flex flex-col items-end gap-1">
      <div className="text-[11px] font-medium text-blue-200 capitalize">{variant}</div>
      <svg viewBox="0 0 750 471" height="28" aria-hidden="true" fill="white">
        <path d="M278.197 334.228L311.283 140.438H364.208L331.107 334.228H278.197Z" />
        <path d="M524.307 144.758C513.769 140.823 497.24 136.605 476.755 136.605C424.499 136.605 387.697 163.665 387.415 202.934C387.13 232.064 414.924 248.292 436.068 258.078C457.775 268.113 464.99 274.592 464.876 283.516C464.74 297.259 448.684 303.602 433.706 303.602C412.948 303.602 401.885 300.615 384.953 293.279L377.868 290.008L370.101 335.776C382.504 341.361 405.52 346.206 429.424 346.433C484.839 346.433 521.003 319.679 521.406 277.816C521.611 254.885 507.401 237.422 476.953 223.024C457.389 213.545 445.524 207.146 445.647 197.499C445.647 188.91 455.453 179.695 477.041 179.695C495.065 179.411 508.006 183.508 518.153 187.872L523.077 190.229L530.768 146.027L524.307 144.758Z" />
        <path d="M612.22 140.438H572.022C558.978 140.438 549.199 144.215 543.606 157.603L463.641 334.228H519.007L530.102 303.927H597.218L603.778 334.228H652.802L612.22 140.438ZM545.467 265.193C549.724 254.146 566.476 209.79 566.476 209.79C566.194 210.277 570.735 198.665 573.337 191.514L576.869 208.004C576.869 208.004 587.035 256.151 589.212 265.193H545.467Z" />
        <path d="M233.954 140.438L182.177 271.756L176.743 245.331C167.197 214.741 138.484 181.688 106.443 165.115L153.919 334.092L209.688 334.024L289.794 140.438H233.954Z" />
        <path d="M137.368 140.438H51.609L50.97 144.534C117.343 161.193 161.856 200.725 179.875 248.009L161.572 157.751C158.414 144.499 148.757 140.862 137.368 140.438Z" />
      </svg>
    </div>
  </div>
)

// ─── Verve ────────────────────────────────────────────────────────

export const VerveCard: React.FC<BaseProps> = ({
  number = "6500 1234 5678 9012",
  validThru = "06/27",
  cardholder = "Cardholder",
  variant = "debit",
  className = "",
}) => (
  <div className={"relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-[22px] shadow-[0_18px_40px_-12px_rgba(16,24,40,0.28)] " + className}
    style={{ background: "linear-gradient(140deg,#d97706 0%,#b45309 40%,#92400e 100%)" }}>
    <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.05) 0.8px,transparent 1px)", backgroundSize: "5px 5px" }} />
    <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-yellow-300/20 blur-3xl" />
    <div className="pointer-events-none absolute left-0 bottom-0 h-32 w-32 rounded-full bg-orange-900/30 blur-2xl" />
    {/* decorative arc */}
    <svg className="pointer-events-none absolute right-0 top-0 h-full opacity-10" viewBox="0 0 200 220" fill="none">
      <circle cx="180" cy="60" r="130" stroke="white" strokeWidth="40" />
    </svg>

    <div className="relative flex h-full flex-col px-6 py-5">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-semibold tracking-[0.2em] text-amber-200 uppercase mt-1">Meridian Bank</div>
        <ContactlessIcon color="rgba(255,255,255,0.75)" />
      </div>
      <div className="mt-5"><ChipIcon /></div>
      <div className="mt-4 text-[18px] font-medium tracking-[0.06em] text-white tabular-nums font-mono">
        {mask(number)}
      </div>
      <div className="mt-2 leading-tight">
        <div className="text-[8px] font-bold tracking-[0.1em] text-amber-200">VALID THRU</div>
        <div className="text-[13px] font-medium text-white tabular-nums">{validThru}</div>
        <div className="text-[13px] font-medium text-white/90 uppercase tracking-wide mt-0.5">{cardholder}</div>
      </div>
    </div>

    <div className="pointer-events-none absolute bottom-5 right-6 flex flex-col items-end gap-1">
      <div className="text-[11px] font-medium text-amber-200 capitalize">{variant}</div>
      {/* Verve wordmark */}
      <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-md px-2.5 py-1">
        <div className="text-[15px] font-black text-white tracking-tight">verve</div>
        <div className="h-2 w-2 rounded-full bg-green-400" />
      </div>
    </div>
  </div>
)

// ─── Gold (Mastercard Gold) ───────────────────────────────────────

export const GoldCard: React.FC<BaseProps> = ({
  number = "5500 9876 5432 1098",
  validThru = "03/29",
  cardholder = "Cardholder",
  variant = "credit",
  className = "",
}) => (
  <div className={"relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-[22px] shadow-[0_18px_40px_-12px_rgba(120,80,0,0.35)] " + className}
    style={{ background: "linear-gradient(135deg,#78350f 0%,#b45309 30%,#d97706 55%,#f59e0b 72%,#fbbf24 85%,#fcd34d 100%)" }}>
    <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.08) 60%,transparent 70%)" }} />
    <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 8px)" }} />
    <div className="pointer-events-none absolute -right-12 top-4 h-56 w-56 rounded-full bg-yellow-200/20 blur-3xl" />

    <div className="relative flex h-full flex-col px-6 py-5">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-semibold tracking-[0.2em] text-yellow-100 uppercase mt-1">Meridian Gold</div>
        <ContactlessIcon color="rgba(255,255,255,0.8)" />
      </div>
      <div className="mt-5"><ChipIcon /></div>
      <div className="mt-4 text-[18px] font-medium tracking-[0.06em] text-white drop-shadow-sm tabular-nums font-mono">
        {mask(number)}
      </div>
      <div className="mt-2 leading-tight">
        <div className="text-[8px] font-bold tracking-[0.1em] text-yellow-100">VALID THRU</div>
        <div className="text-[13px] font-medium text-white tabular-nums">{validThru}</div>
        <div className="text-[13px] font-medium text-white uppercase tracking-wide mt-0.5">{cardholder}</div>
      </div>
    </div>

    <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[32%] flex-col items-center justify-center">
      <div className="absolute top-[22%] text-[13px] font-semibold text-yellow-100 capitalize">{variant}</div>
      <div className="absolute top-[42%] flex flex-col items-center">
        <svg width="52" height="40" viewBox="0 0 56 44" aria-hidden="true">
          <circle cx="20" cy="22" r="18" fill="rgba(255,255,255,0.55)" />
          <circle cx="36" cy="22" r="18" fill="rgba(255,255,255,0.35)" style={{ mixBlendMode: "screen" }} />
        </svg>
        <div className="mt-0.5 text-[11px] font-semibold text-yellow-100 tracking-tight">mastercard</div>
      </div>
    </div>
  </div>
)

// ─── Black / Infinite ─────────────────────────────────────────────

export const BlackCard: React.FC<BaseProps> = ({
  number = "4000 0000 0000 0002",
  validThru = "11/30",
  cardholder = "Cardholder",
  variant = "infinite",
  className = "",
}) => (
  <div className={"relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-[22px] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] " + className}
    style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#171717 50%,#1c1c1c 100%)" }}>
    <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.025) 0.8px,transparent 1px)", backgroundSize: "4px 4px" }} />
    <div className="pointer-events-none absolute -right-8 top-0 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
    <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(120deg,transparent 60%,rgba(255,255,255,0.03) 80%,transparent 90%)" }} />

    <div className="relative flex h-full flex-col px-6 py-5">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-semibold tracking-[0.25em] text-gray-400 uppercase mt-1">Meridian Infinite</div>
        <ContactlessIcon color="rgba(255,255,255,0.4)" />
      </div>
      <div className="mt-5"><ChipIcon /></div>
      <div className="mt-4 text-[18px] font-medium tracking-[0.06em] text-gray-200 tabular-nums font-mono">
        {mask(number)}
      </div>
      <div className="mt-2 leading-tight">
        <div className="text-[8px] font-bold tracking-[0.1em] text-gray-500">VALID THRU</div>
        <div className="text-[13px] font-medium text-gray-200 tabular-nums">{validThru}</div>
        <div className="text-[13px] font-medium text-gray-200 uppercase tracking-wide mt-0.5">{cardholder}</div>
      </div>
    </div>

    <div className="pointer-events-none absolute bottom-5 right-6 flex flex-col items-end gap-1">
      <div className="text-[11px] font-medium text-gray-400 capitalize">{variant}</div>
      <svg viewBox="0 0 750 471" height="26" aria-hidden="true" fill="rgba(255,255,255,0.5)">
        <path d="M278.197 334.228L311.283 140.438H364.208L331.107 334.228H278.197Z" />
        <path d="M524.307 144.758C513.769 140.823 497.24 136.605 476.755 136.605C424.499 136.605 387.697 163.665 387.415 202.934C387.13 232.064 414.924 248.292 436.068 258.078C457.775 268.113 464.99 274.592 464.876 283.516C464.74 297.259 448.684 303.602 433.706 303.602C412.948 303.602 401.885 300.615 384.953 293.279L377.868 290.008L370.101 335.776C382.504 341.361 405.52 346.206 429.424 346.433C484.839 346.433 521.003 319.679 521.406 277.816C521.611 254.885 507.401 237.422 476.953 223.024C457.389 213.545 445.524 207.146 445.647 197.499C445.647 188.91 455.453 179.695 477.041 179.695C495.065 179.411 508.006 183.508 518.153 187.872L523.077 190.229L530.768 146.027L524.307 144.758Z" />
        <path d="M612.22 140.438H572.022C558.978 140.438 549.199 144.215 543.606 157.603L463.641 334.228H519.007L530.102 303.927H597.218L603.778 334.228H652.802L612.22 140.438ZM545.467 265.193C549.724 254.146 566.476 209.79 566.476 209.79C566.194 210.277 570.735 198.665 573.337 191.514L576.869 208.004C576.869 208.004 587.035 256.151 589.212 265.193H545.467Z" />
        <path d="M233.954 140.438L182.177 271.756L176.743 245.331C167.197 214.741 138.484 181.688 106.443 165.115L153.919 334.092L209.688 334.024L289.794 140.438H233.954Z" />
        <path d="M137.368 140.438H51.609L50.97 144.534C117.343 161.193 161.856 200.725 179.875 248.009L161.572 157.751C158.414 144.499 148.757 140.862 137.368 140.438Z" />
      </svg>
    </div>
  </div>
)
