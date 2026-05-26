"use client"

// Leaflet must only load on the client (uses window). This file is imported via
// dynamic(() => import('./admin-map-view'), { ssr: false }) in admin-locations.tsx

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { UserLocation } from "@/lib/firebase-location"

// Fix Leaflet default marker icon path broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Custom online/offline icons
const onlineIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:#4f46e5;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,.35);
    transform:rotate(-45deg);
  "></div>`,
  iconSize:   [32, 32],
  iconAnchor: [16, 32],
  popupAnchor:[0, -36],
})

const offlineIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:24px;height:24px;border-radius:50%;
    background:#9ca3af;border:2px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,.2);
  "></div>`,
  iconSize:   [24, 24],
  iconAnchor: [12, 24],
  popupAnchor:[0, -28],
})

function FitBounds({ locations }: { locations: UserLocation[] }) {
  const map = useMap()
  useEffect(() => {
    const online = locations.filter((l) => l.isOnline && l.latitude && l.longitude)
    if (!online.length) return
    const bounds = L.latLngBounds(online.map((l) => [l.latitude, l.longitude]))
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
  }, [locations, map])
  return null
}

export default function AdminMapView({ locations }: { locations: UserLocation[] }) {
  const online = locations.filter((l) => l.isOnline && l.latitude && l.longitude)
  const center: [number, number] = online.length
    ? [online[0].latitude, online[0].longitude]
    : [20, 0]

  return (
    <MapContainer
      center={center}
      zoom={3}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds locations={locations} />
      {locations.map((loc) => {
        if (!loc.latitude && !loc.longitude) return null
        return (
          <Marker
            key={loc.userId}
            position={[loc.latitude, loc.longitude]}
            icon={loc.isOnline ? onlineIcon : offlineIcon}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  {loc.flag} {loc.userName}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{loc.userEmail}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {loc.city}{loc.region ? `, ${loc.region}` : ""} · {loc.country}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                  {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                </div>
                <div style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: loc.isOnline ? "#10b981" : "#9ca3af"
                }}>
                  {loc.isOnline ? "● Online" : "○ Offline"}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
