/**
 * Canonical crypto configuration shared across client and server.
 * CRYPTO_USD_RATES is intentionally absent — live prices come from /api/prices.
 */

export const CRYPTO_SYMBOLS = new Set([
  "BTC", "ETH", "TRX", "USDT", "USDC", "SOL", "BNB",
])

export const CRYPTO_COINGECKO_IDS: Record<string, string> = {
  BTC:  "bitcoin",
  ETH:  "ethereum",
  TRX:  "tron",
  USDT: "tether",
  USDC: "usd-coin",
  SOL:  "solana",
  BNB:  "binancecoin",
}

// Reverse map: coingecko id → symbol
export const COINGECKO_ID_TO_SYMBOL = Object.fromEntries(
  Object.entries(CRYPTO_COINGECKO_IDS).map(([sym, id]) => [id, sym])
)

export const CRYPTO_META: Record<string, { name: string; badge: string; color: string }> = {
  BTC:  { name: "Bitcoin",   badge: "₿",  color: "bg-amber-500"   },
  ETH:  { name: "Ethereum",  badge: "Ξ",  color: "bg-indigo-500"  },
  TRX:  { name: "Tron",      badge: "♦",  color: "bg-red-500"     },
  USDT: { name: "Tether",    badge: "₮",  color: "bg-emerald-500" },
  USDC: { name: "USD Coin",  badge: "₵",  color: "bg-blue-500"    },
  SOL:  { name: "Solana",    badge: "◎",  color: "bg-purple-500"  },
  BNB:  { name: "BNB",       badge: "B",  color: "bg-yellow-500"  },
}

export const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", SGD: "🇸🇬", JPY: "🇯🇵", AUD: "🇦🇺",
  BTC: "₿",   ETH: "Ξ",   TRX: "♦",   USDT: "₮",  USDC: "₵",  SOL: "◎",
}

/** Last-known prices used as initial state before the first /api/prices response. */
export const FALLBACK_PRICES: Record<string, number> = {
  BTC: 70000, ETH: 3500, TRX: 0.152, USDT: 1, USDC: 1, SOL: 145, BNB: 380,
}

export const FX_RATES: Record<string, number> = {
  USD: 1, EUR: 1.08, GBP: 1.27, SGD: 0.74, JPY: 0.0067, AUD: 0.65, CAD: 0.73, CHF: 1.11,
}
