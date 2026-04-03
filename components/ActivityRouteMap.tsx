"use client";

import dynamic from "next/dynamic";

import type { LatLng } from "@/lib/activityMap";

const Inner = dynamic(() => import("./ActivityRouteMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
      <span className="text-sm text-slate-500">Loading map…</span>
    </div>
  ),
});

export function ActivityRouteMap({ coords }: { coords: LatLng[] }) {
  return <Inner coords={coords} />;
}
