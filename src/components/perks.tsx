import { SITE_TITLE } from "@/lib/site";
import React from "react";

/**
 * Perks — recreation of 's
 * "Now arriving: premium perks" section.
 *
 * Requirements:
 *   • React 18+, TypeScript
 *   • Tailwind CSS (arbitrary values enabled — default in v3+)
 *   • Hanken Grotesk loaded via Google Fonts (close stand-in for  Sans)
 *
 * Drop the lifestyle image at: /assets/prime-travel.webp (or pass `imageSrc`).
 */

export interface PerksProps {
  imageSrc?: string;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Logo                                                                      */
/* -------------------------------------------------------------------------- */

const PerksPrimeLogo: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 160 28"
    className={className}
    aria-label={`${SITE_TITLE} prime`}
    role="img"
  >
    <text
      x="0" y="22"
      fontFamily="'Hanken Grotesk', system-ui, sans-serif"
      fontWeight={800} fontStyle="italic" fontSize="22"
      fill="#1ec677" letterSpacing="-0.5"
    >
      {SITE_TITLE}
    </text>
    <circle cx="70" cy="7.5" r="2" fill="#1ec677" />
    <text
      x="78" y="22"
      fontFamily="'Hanken Grotesk', system-ui, sans-serif"
      fontWeight={400} fontSize="22"
      fill="#e7f0ec" letterSpacing="-0.3"
    >
      prime
    </text>
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Perk data + card                                                          */
/* -------------------------------------------------------------------------- */

type Perk = {
  title: React.ReactNode;
  body: React.ReactNode;
  cta?: { label: string; href: string };
};

const PERKS: Perk[] = [
  {
    title: "Visa Signature Concierge",
    body: (
      <>
        Call or chat with a 24/7 Visa Signature
        <sup className="text-[0.65em]">¹</sup> Concierge who will book flights,
        hotels, or reservations.
        <sup className="text-[0.65em]">²</sup>
      </>
    ),
  },
  {
    title: "Free Priority Pass Membership",
    body: (
      <>
        Get access to 1,800 airport lounges around the globe with Perks Prime.
        <sup className="text-[0.65em]">³</sup>
      </>
    ),
  },
  {
    title: "Luxury hotel collection",
    body: (
      <>
        Access a premium collection of benefits like VIP status, complimentary
        breakfast for two, and an upgrade when available.
        <sup className="text-[0.65em]">⁴</sup>
      </>
    ),
  },
  {
    title: "Global mobile data",
    body: (
      <>
        1GB/15 days of complimentary global mobile data for compatible devices
        with Visa and GigSky.
      </>
    ),
  },
  {
    title: "International ATM reimbursement",
    body: (
      <>
        Get two Perks out-of-network fees reimbursed each month when you
        withdraw cash from an international ATM on any physical Perks Card.
      </>
    ),
  },
  {
    title: "Many more perks",
    body: (
      <>
        Free tax filing, friend referrals, and more, you'll save on things you
        already spend on.
      </>
    ),
    cta: { label: "Learn More", href: "#" },
  },
];

const PerkCard: React.FC<{ perk: Perk }> = ({ perk }) => (
  <article className="flex min-h-[260px] flex-col rounded-2xl bg-[#e8efe9] p-7 sm:min-h-[280px] sm:p-8">
    <h3 className="text-[22px] font-extrabold leading-[1.15] tracking-tight text-[#0e3a2a] sm:text-[24px]">
      {perk.title}
    </h3>
    <p className="mt-6 text-[15px] leading-[1.55] text-[#0e3a2a]/90 sm:mt-7">
      {perk.body}
    </p>
    {perk.cta && (
      <p className="mt-2 text-[15px] leading-[1.55] text-[#0e3a2a]">
        <a
          href={perk.cta.href}
          className="font-semibold underline decoration-1 underline-offset-4 hover:text-[#0e3a2a]/70"
        >
          {perk.cta.label}
        </a>
      </p>
    )}
  </article>
);

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export const Perks: React.FC<PerksProps> = ({
  imageSrc = "/img/prime-travel.webp",
  className = "",
}) => {
  return (
    <section
      className={
        "w-full bg-[#0e3a2a] py-16 text-white sm:py-20 lg:py-24 " + className
      }
      aria-labelledby="prime-perks-heading"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        {/* Top: copy + image */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 max-w-[480px] lg:order-1 lg:ml-auto lg:mr-2">
            <PerksPrimeLogo className="h-6 w-auto" />
            <h2
              id="prime-perks-heading"
              className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-[-0.01em] text-white sm:text-[38px] lg:text-[40px]"
            >
              Now arriving: premium perks.
            </h2>
            <p className="mt-5 max-w-[440px] text-[15px] leading-[1.6] text-white/85 sm:text-[15.5px]">
              Perks Card is your ticket to all premium Perks Prime travel perks.
              See how you can enjoy $1,150 in annual benefits
              <sup className="text-[0.65em]">⁵⁶</sup> just for banking through
              Perks.
            </p>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-3xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]">
              <img
                src={imageSrc}
                alt="Traveler on a plane holding a phone in a green case"
                className="block h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Perk grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:mt-20 lg:grid-cols-3">
          {PERKS.map((p, i) => (
            <PerkCard key={i} perk={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Perks;