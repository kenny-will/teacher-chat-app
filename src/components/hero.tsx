import React, { useState } from "react";

/**
 * Hero — pixel-faithful recreation of Perks's hero landing.
 *
 * Requirements:
 *   • React 18+, TypeScript
 *   • Tailwind CSS (arbitrary values enabled — default in v3+)
 *   • Hanken Grotesk loaded via Google Fonts (close stand-in for Perks Sans)
 *
 * Drop the hero image at: /assets/hero-desktop.webp (or pass `heroSrc`).
 */

export interface HeroProps {
  heroSrc?: string;
  onSubmit?: (email: string) => void;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Atoms                                                                     */
/* -------------------------------------------------------------------------- */

const PerkLogo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 120 40" className={className} aria-label="Perks" role="img">
    <text
      x="0"
      y="30"
      fontFamily="'Hanken Grotesk', system-ui, sans-serif"
      fontWeight={800}
      fontStyle="italic"
      fontSize="32"
      fill="#1ec677"
      letterSpacing="-1"
    >
      perks
    </text>
    <circle cx="106" cy="11" r="3" fill="#1ec677" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="4 12 10 18 20 6" />
  </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="3" y1="13" x2="21" y2="13" />
    <line x1="3" y1="19" x2="14" y2="19" />
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3.2" />
    <path d="M5.6 19.5c1.4-2.6 3.8-4.1 6.4-4.1s5 1.5 6.4 4.1" />
  </svg>
);

const InfoIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="11" x2="12" y2="17" strokeLinecap="round" />
    <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const NerdwalletMark: React.FC = () => (
  <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden="true">
    <rect width="28" height="28" rx="6" fill="#0a8e63" />
    <text
      x="14"
      y="20"
      textAnchor="middle"
      fontFamily="'Hanken Grotesk', sans-serif"
      fontWeight={900}
      fontSize="18"
      fill="#fff"
    >
      n
    </text>
  </svg>
);

const BadgeMark: React.FC = () => (
  <svg viewBox="0 0 32 36" className="h-9 w-8" aria-hidden="true">
    <path
      d="M16 2l11 4v12c0 8-5.5 13-11 16-5.5-3-11-8-11-16V6l11-4z"
      fill="none"
      stroke="#dcfce7"
      strokeWidth="1.6"
    />
    <path
      d="M11 18l4 4 7-8"
      fill="none"
      stroke="#dcfce7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Trust marquee                                                             */
/* -------------------------------------------------------------------------- */

type TrustItem = {
  kind: "badge" | "nerd" | "text";
  title: React.ReactNode;
  body: React.ReactNode;
};

const TRUST_ITEMS: TrustItem[] = [
  {
    kind: "badge",
    title: "#1 Most Loved",
    body: <>Banking App&trade;</>,
  },
  {
    kind: "nerd",
    title: "nerdwallet",
    body: (
      <>
        Named NerdWallet's Best Overall
        <br />
        Checking Account of 2026&trade;
      </>
    ),
  },
  {
    kind: "text",
    title: "1 Million+ 5 star reviews",
    body: <>in the Google Play and Apple App Stores</>,
  },
  {
    kind: "text",
    title: "USA Today",
    body: (
      <>
        Rated 5 stars for customer
        <br />
        service by USA Today
      </>
    ),
  },
  {
    kind: "text",
    title: "FDIC Insured Deposits",
    body: (
      <>
        Deposits up to $250k through The Bancorp
        <br />
        Bank, N.A. or Stride Bank, N.A., Members FDIC&sect;
      </>
    ),
  },
];

const TrustCell: React.FC<{ item: TrustItem }> = ({ item }) => (
  <div className="flex shrink-0 items-center gap-3 px-8 sm:px-10">
    {item.kind === "badge" && <BadgeMark />}
    {item.kind === "nerd" && <NerdwalletMark />}
    <div className="leading-tight">
      {item.kind === "nerd" ? (
        <div className="text-[15px] font-semibold lowercase tracking-tight text-white">
          {item.title}
        </div>
      ) : (
        <div className="text-[15px] font-extrabold leading-snug text-white">
          {item.title}
        </div>
      )}
      <div className="mt-0.5 text-[12px] font-medium leading-snug text-emerald-100/90">
        {item.body}
      </div>
    </div>
  </div>
);

const TrustMarquee: React.FC = () => {
  // Doubled list -> seamless loop
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS];
  return (
    <div
      className="relative w-full overflow-hidden py-7"
      aria-label="Awards and recognitions"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <div className="flex w-max items-center animate-[perks-marquee_42s_linear_infinite]">
        {items.map((it, i) => (
          <TrustCell key={i} item={it} />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export const Hero: React.FC<HeroProps> = ({
  heroSrc = "/img/hero-desktop.webp",
  onSubmit,
  className = "",
}) => {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email);
  };

  return (
    <div
      className={
        "relative min-h-screen w-full overflow-hidden font-sans text-white " +
        className
      }
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 22% 35%, #1f6f4a 0%, #115937 40%, #0a3b25 75%, #062b1a 100%)",
      }}
    >
      {/* marquee keyframes */}
      <style>{`
        @keyframes perks-marquee {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>

      {/* ---------------- Top bar ---------------- */}
      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-10 lg:px-14">
        <div className="flex items-center gap-5 sm:gap-7">
          <button
            type="button"
            aria-label="Open menu"
            className="grid h-8 w-8 place-items-center rounded text-white/95 hover:text-white"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <PerkLogo className="h-8 w-auto sm:h-9" />
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <a
            href="#get-started"
            className="rounded-full bg-emerald-400 px-5 py-2.5 text-[15px] font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 sm:px-6 sm:py-3 sm:text-base"
          >
            Get started
          </a>
          <a
            href="#login"
            className="hidden items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-white hover:text-emerald-100 sm:flex"
          >
            <UserIcon className="h-6 w-6" />
            Log in
          </a>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-5 pb-14 pt-6 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-14 lg:pt-12 xl:gap-10">
        {/* Copy column */}
        <div className="relative max-w-[640px]">
          <h1
            className="font-extrabold tracking-[-0.025em] text-white"
            style={{
              fontSize: "clamp(44px, 6.4vw, 92px)",
              lineHeight: 0.95,
              letterSpacing: "-0.025em",
            }}
          >
            America&rsquo;s #1
            <br />
            Choice for
            <br />
            Banking
          </h1>

          <ul className="mt-8 space-y-3 text-[17px] leading-[1.5] sm:mt-10 sm:text-lg">
            {[
              <>
                <a className="underline decoration-2 underline-offset-[6px]" href="#">
                  Fee-free banking
                </a>{" "}
                plus{" "}
                <a className="underline decoration-2 underline-offset-[6px]" href="#">
                  early pay access
                </a>
                .
              </>,
              <>
                <a className="underline decoration-2 underline-offset-[6px]" href="#">
                  5% cash back and build credit everyday
                </a>
                .
              </>,
              <>
                <a className="underline decoration-2 underline-offset-[6px]" href="#">
                  3.75% APY on your savings
                </a>
                .
              </>,
            ].map((node, i) => (
              <li key={i} className="flex items-start gap-3 font-medium text-white">
                <CheckIcon className="mt-1.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>{node}</span>
              </li>
            ))}
          </ul>

          {/* Form */}
          <form
            id="get-started"
            onSubmit={submit}
            className="mt-7 flex w-full max-w-[640px] flex-col gap-3 sm:mt-8 sm:flex-row sm:items-stretch"
          >
            <label className="relative flex-1">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-14 w-full rounded-md border border-white/45 bg-transparent px-5 text-[15px] font-medium text-white placeholder-white/85 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/50 sm:h-[58px]"
              />
            </label>
            <button
              type="submit"
              className="h-14 shrink-0 rounded-md bg-emerald-400 px-8 text-[16px] font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 sm:h-[58px] sm:px-10"
            >
              Get started
            </button>
          </form>

          <p className="mt-5 max-w-[640px] text-[13px] leading-relaxed text-white/85">
            Perks is a fintech, not a bank. Optional services and products may
            have fees or charges. #1 ranking based on J.D. Power survey.{" "}
            <button
              type="button"
              aria-label="More info"
              className="inline-flex translate-y-[3px] items-center text-white/85 hover:text-white"
            >
              <InfoIcon className="h-4 w-4" />
            </button>
          </p>
        </div>

        {/* Hero image */}
        <div className="relative mx-auto w-full max-w-[640px] lg:mx-0 lg:translate-x-2">
          <img
            src={heroSrc}
            alt="Perks app on iPhone alongside a Perks Visa Signature debit card with a 5% cash back badge"
            className="block h-auto w-full select-none"
            draggable={false}
          />
        </div>
      </section>

      {/* ---------------- Trust marquee ---------------- */}
      <div className="relative z-10 mt-2 border-t border-white/5">
        <TrustMarquee />
      </div>
    </div>
  );
};

export default Hero;