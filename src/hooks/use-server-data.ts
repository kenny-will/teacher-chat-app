"use client"

import { useState, useEffect, useCallback } from "react"

interface UseServerDataResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Fetches data from a server action on mount.
 * Provides loading, error, and refetch state.
 *
 * @param fetcher - An async function (server action) to call
 * @param deps - Dependency array (re-fetches when these change)
 * @param timeoutMs - Max ms to wait before treating as a failure (default 15 000)
 */
export function useServerData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  timeoutMs = 15_000,
): UseServerDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setError(new Error("Request timed out — check your connection and try again."))
        setIsLoading(false)
      }
    }, timeoutMs)

    fetcher()
      .then((result) => {
        clearTimeout(timeoutId)
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((e: unknown) => {
        clearTimeout(timeoutId)
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { data, isLoading, error, refetch }
}
