"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPinIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  WifiOffIcon,
} from "lucide-react";
import { PageHeader, AvatarBadge, Tag } from "@/components/meridian/primitives";
import { cn } from "@/lib/utils";
import { firebaseReady } from "@/lib/firebase";
import {
  subscribeToLocations,
  type UserLocation,
} from "@/lib/firebase-location";

// Leaflet is client-only — must use dynamic import with ssr: false
const AdminMapView = dynamic(() => import("./admin-map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-full rounded-2xl bg-gray-100 dark:bg-white/8 animate-pulse flex items-center justify-center">
      <div className="text-[12px] text-gray-400">Loading map…</div>
    </div>
  ),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date | null): string {
  if (!date) return "never";
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

// ─── Not configured ───────────────────────────────────────────────────────────

function NotConfigured() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 grid place-items-center">
        <MapPinIcon className="h-7 w-7 text-amber-500" />
      </div>
      <div>
        <div className="text-[14px] font-semibold text-gray-600 dark:text-gray-300">
          Firebase not configured
        </div>
        <div className="text-[12px] text-gray-400 mt-1.5 max-w-xs">
          Add Firebase credentials to{" "}
          <code className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
            .env
          </code>{" "}
          to enable live location tracking.
        </div>
      </div>
    </div>
  );
}

// ─── User location row ─────────────────────────────────────────────────────

function LocationRow({ loc }: { loc: UserLocation }) {
  const mapsUrl =
    loc.latitude && loc.longitude
      ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`
      : null;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-white/8 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition">
      <div className="relative shrink-0">
        <AvatarBadge name={loc.userName} size={36} />
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900",
            loc.isOnline ? "bg-emerald-500" : "bg-gray-400",
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold truncate">
            {loc.userName}
          </span>
          {loc.flag && <span className="text-[16px]">{loc.flag}</span>}
        </div>
        <div className="text-[11.5px] text-gray-500 dark:text-gray-400 truncate">
          {loc.userEmail}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-[12.5px] font-medium">
          {loc.latitude
            ? `${loc.city}${loc.region ? `, ${loc.region}` : ""}`
            : "Location unknown"}
        </div>
        <div className="text-[11px] text-gray-400">
          {loc.country}
          {loc.accuracy ? ` · ±${Math.round(loc.accuracy)}m` : ""}
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1">
        <Tag tone={loc.isOnline ? "green" : "neutral"}>
          {loc.isOnline ? "Online" : "Offline"}
        </Tag>
        <span className="text-[10.5px] text-gray-400">
          {timeAgo(loc.updatedAt)}
        </span>
      </div>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-indigo-600 transition shrink-0 p-1"
          title="Open in Google Maps"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

// ─── Admin locations page ─────────────────────────────────────────────────────

export function AdminLocationsPage() {
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const online = locations.filter((l) => l.isOnline);
  const offline = locations.filter((l) => !l.isOnline);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToLocations((locs) => {
      setLocations(locs);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Admin · Locations"
        title="Live locations."
        subtitle={
          firebaseReady
            ? loading
              ? "Connecting…"
              : `${online.length} online · ${offline.length} offline`
            : "Firebase not configured"
        }
        actions={
          <div className="flex items-center gap-2">
            {online.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {online.length} live
                </span>
              </div>
            )}
          </div>
        }
      />

      {!firebaseReady ? (
        <NotConfigured />
      ) : (
        <div className="grid grid-cols-12 gap-5">
          {/* Map */}
          <div
            className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden"
            style={{ height: 460 }}
          >
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <RefreshCwIcon className="h-6 w-6 text-gray-300 animate-spin" />
              </div>
            ) : locations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
                <WifiOffIcon className="h-10 w-10 text-gray-200 dark:text-white/10" />
                <div>
                  <div className="text-[14px] font-medium text-gray-400">
                    No location data yet
                  </div>
                  <div className="text-[12px] text-gray-400 mt-1">
                    Users need to allow location access in their browser.
                    Locations appear here as soon as they connect.
                  </div>
                </div>
              </div>
            ) : (
              <AdminMapView locations={locations} />
            )}
          </div>

          {/* User list */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
            {/* Online count chips */}
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-center">
                <div className="text-[22px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {online.length}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-500">
                  Online now
                </div>
              </div>
              <div className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 text-center">
                <div className="text-[22px] font-semibold text-gray-500">
                  {offline.length}
                </div>
                <div className="text-[11px] text-gray-500">Offline</div>
              </div>
              <div className="flex-1 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/20 p-3 text-center">
                <div className="text-[22px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {locations.length}
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-500">
                  Total
                </div>
              </div>
            </div>

            {/* Scrollable user list */}
            <div
              className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden flex flex-col"
              style={{ maxHeight: 390 }}
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/8 text-[12px] font-semibold text-gray-600 dark:text-gray-300">
                Users · {locations.length}
              </div>
              <div className="overflow-y-auto flex-1">
                {loading ? (
                  <div className="p-4 space-y-3 animate-pulse">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-100 dark:bg-white/8 rounded"
                      />
                    ))}
                  </div>
                ) : locations.length === 0 ? (
                  <div className="py-10 text-center text-[12px] text-gray-400">
                    No users tracked yet
                  </div>
                ) : (
                  // Online first, then offline
                  [...online, ...offline].map((loc) => (
                    <LocationRow key={loc.userId} loc={loc} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
