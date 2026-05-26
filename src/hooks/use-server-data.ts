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
 * Falls back to `fallback` while loading.
 *
 * @param fetcher - An async function (server action) to call
 * @param deps - Dependency array (re-fetches when these change)
 */
export function useServerData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
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

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setIsLoading(false)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { data, isLoading, error, refetch }
}
