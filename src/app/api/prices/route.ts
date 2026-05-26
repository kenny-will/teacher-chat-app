import { CRYPTO_COINGECKO_IDS, COINGECKO_ID_TO_SYMBOL, FALLBACK_PRICES } from "@/lib/crypto-config"

// Runs in Node.js (not Edge) and is pinned to Vercel's US-East region.
// All outbound requests to CoinGecko originate from US infrastructure only —
// no user IP headers are ever forwarded.
export const runtime         = "nodejs"
export const preferredRegion = ["iad1"]

const IDS = Object.values(CRYPTO_COINGECKO_IDS).join(",")
const COINGECKO_URL =
  `https://api.coingecko.com/api/v3/simple/price` +
  `?ids=${IDS}&vs_currencies=usd&include_24hr_change=true&precision=6`

export async function GET() {
  try {
    const headers: HeadersInit = { Accept: "application/json" }
    if (process.env.COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY
    }

    const res = await fetch(COINGECKO_URL, {
      headers,
      // Next.js data cache: at most one upstream call per 60 s per Vercel deployment.
      // Shared across all function instances — not per-user.
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return errorResponse(`CoinGecko ${res.status}`, 30)
    }

    type CoinGeckoEntry = { usd: number; usd_24h_change?: number }
    const raw = (await res.json()) as Record<string, CoinGeckoEntry>

    const prices: Record<string, number>  = {}
    const changes: Record<string, number> = {}

    for (const [id, entry] of Object.entries(raw)) {
      const symbol = COINGECKO_ID_TO_SYMBOL[id]
      if (!symbol) continue
      prices[symbol]  = entry.usd
      changes[symbol] = entry.usd_24h_change ?? 0
    }

    // Fill any gaps with fallback so callers always get a complete map
    for (const sym of Object.keys(FALLBACK_PRICES)) {
      if (prices[sym] === undefined) prices[sym] = FALLBACK_PRICES[sym]
    }

    return Response.json(
      { prices, changes, stale: false, updatedAt: Date.now() },
      {
        headers: {
          // CDN: serve cached copy for 60 s, then serve stale for 30 s while
          // the next revalidation runs in the background. Zero cold-start lag for users.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      },
    )
  } catch {
    return errorResponse("fetch failed", 10)
  }
}

function errorResponse(reason: string, maxAge: number) {
  return Response.json(
    { prices: FALLBACK_PRICES, changes: {}, stale: true, error: reason },
    {
      status: 200,
      headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` },
    },
  )
}
