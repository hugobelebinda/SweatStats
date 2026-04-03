"use client";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";

import type { LatLng } from "@/lib/activityMap";

import "leaflet/dist/leaflet.css";

function FitRoute({ coords }: { coords: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 0) return;
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
  }, [map, coords]);
  return null;
}

export default function ActivityRouteMapInner({ coords }: { coords: LatLng[] }) {
  if (coords.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        No GPS track for this activity.
      </div>
    );
  }

  const center = coords[Math.floor(coords.length / 2)]!;

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="z-0 h-[320px] w-full rounded-2xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={coords} pathOptions={{ color: "#e94560", weight: 4, opacity: 0.92 }} />
      <FitRoute coords={coords} />
    </MapContainer>
  );
}
