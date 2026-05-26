"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { startLocationTracking } from "@/lib/firebase-location"
import { firebaseReady } from "@/lib/firebase"

/**
 * Invisible component — mounts in user layout, watches geolocation,
 * pushes updates to Firestore, marks offline on unmount/tab close.
 */
export function LocationTracker() {
  const user = useAuth()

  useEffect(() => {
    if (!firebaseReady) return
    const stop = startLocationTracking(user.id, user.name, user.email)
    return stop
  }, [user.id, user.name, user.email])

  return null
}
