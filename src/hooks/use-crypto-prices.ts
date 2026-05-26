"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { FALLBACK_PRICES } from "@/lib/crypto-config"

export type CryptoPrices  = Record<string, number>
export type CryptoChanges = Record<string, number>

export interface CryptoPriceData {
  prices:    CryptoPrices
  changes:   CryptoChanges
  stale:     boolean
  updatedAt: number | undefined
  loading:   boolean
}

const REFRESH_MS = 60_000 // match server cache TTL

const INITIAL: CryptoPriceData = {
  prices:    { ...FALLBACK_PRICES },
  changes:   {},
  stale:     true,
  updatedAt: undefined,
  loading:   true,
}

export function useCryptoPrices(): CryptoPriceData {
  const [data, setData] = useState<CryptoPriceData>(INITIAL)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      // Intentionally no cache: "no-store" — we rely on the CDN s-maxage header
      // returned by /api/prices to deduplicate browser requests at the network level.
      const res = await fetch("/api/prices")
      if (!res.ok) return
      const json = await res.json() as Omit<CryptoPriceData, "loading">
      setData({ ...json, loading: false })
    } catch {
      setData((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    fetch_()
    timer.current = setInterval(fetch_, REFRESH_MS)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [fetch_])

  return data
}
