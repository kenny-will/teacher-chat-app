import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserLocation {
  userId: string
  userName: string
  userEmail: string
  latitude: number
  longitude: number
  accuracy: number
  city: string
  region: string
  country: string
  flag: string
  isOnline: boolean
  updatedAt: Date | null
}

function toDate(ts: unknown): Date | null {
  if (!ts) return null
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts instanceof Date) return ts
  return null
}

// ─── Reverse geocode via Nominatim (free, no API key) ─────────────────────────

async function reverseGeocode(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "Accept-Language": "en" } },
    )
    const data = await res.json()
    const addr = data.address ?? {}
    const city    = addr.city ?? addr.town ?? addr.village ?? addr.county ?? "Unknown"
    const region  = addr.state ?? addr.region ?? ""
    const country = addr.country ?? "Unknown"
    const code    = (addr.country_code ?? "").toUpperCase()
    // Unicode flag from country code (e.g. "NG" → 🇳🇬)
    const flag = code.length === 2
      ? String.fromCodePoint(...[...code].map((c) => 0x1F1E6 + c.charCodeAt(0) - 65))
      : ""
    return { city, region, country, flag }
  } catch {
    return { city: "Unknown", region: "", country: "Unknown", flag: "" }
  }
}

// ─── Write location to Firestore ──────────────────────────────────────────────

async function pushLocation(
  userId: string,
  userName: string,
  userEmail: string,
  pos: GeolocationPosition,
) {
  if (!db) return
  const { latitude, longitude, accuracy } = pos.coords
  const geo = await reverseGeocode(latitude, longitude)
  await setDoc(doc(db, "user_locations", userId), {
    userId, userName, userEmail,
    latitude, longitude, accuracy,
    ...geo,
    isOnline: true,
    updatedAt: serverTimestamp(),
  })
}

// ─── Mark user offline ────────────────────────────────────────────────────────

export async function markOffline(userId: string) {
  if (!db) return
  try {
    await setDoc(doc(db, "user_locations", userId), { isOnline: false }, { merge: true })
  } catch { /* ignore — fires during page unload */ }
}

// ─── Start tracking — returns stop function ────────────────────────────────────

export function startLocationTracking(
  userId: string,
  userName: string,
  userEmail: string,
): () => void {
  if (typeof navigator === "undefined" || !navigator.geolocation || !db) return () => {}

  let watchId: number | null = null
  let lastPush = 0
  const THROTTLE_MS = 30_000 // push at most every 30s

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const now = Date.now()
      if (now - lastPush > THROTTLE_MS) {
        lastPush = now
        pushLocation(userId, userName, userEmail, pos)
      }
    },
    (err) => {
      // Permission denied or unavailable — write placeholder without coords
      if (db) {
        setDoc(
          doc(db, "user_locations", userId),
          { userId, userName, userEmail, isOnline: true, updatedAt: serverTimestamp() },
          { merge: true },
        ).catch(() => {})
      }
      console.warn("Geolocation error:", err.message)
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
  )

  // Also push once immediately
  navigator.geolocation.getCurrentPosition(
    (pos) => { lastPush = Date.now(); pushLocation(userId, userName, userEmail, pos) },
    () => {},
    { enableHighAccuracy: false, timeout: 10000 },
  )

  // Mark offline on tab close
  function handleUnload() { markOffline(userId) }
  window.addEventListener("beforeunload", handleUnload)

  return () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    window.removeEventListener("beforeunload", handleUnload)
    markOffline(userId)
  }
}

// ─── Subscribe to all user locations (admin) ──────────────────────────────────

export function subscribeToLocations(
  callback: (locations: UserLocation[]) => void,
): Unsubscribe {
  if (!db) return () => {}
  return onSnapshot(collection(db, "user_locations"), (snap) => {
    const locs: UserLocation[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        userId:    data.userId    ?? d.id,
        userName:  data.userName  ?? "Unknown",
        userEmail: data.userEmail ?? "",
        latitude:  data.latitude  ?? 0,
        longitude: data.longitude ?? 0,
        accuracy:  data.accuracy  ?? 0,
        city:      data.city      ?? "Unknown",
        region:    data.region    ?? "",
        country:   data.country   ?? "Unknown",
        flag:      data.flag      ?? "",
        isOnline:  data.isOnline  ?? false,
        updatedAt: toDate(data.updatedAt),
      }
    })
    callback(locs)
  })
}
