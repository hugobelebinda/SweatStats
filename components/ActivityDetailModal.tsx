"use client";

import { useEffect } from "react";

import { ActivityRouteMap } from "@/components/ActivityRouteMap";
import { decodeActivityPolyline } from "@/lib/activityMap";
import {
  formatDistance,
  formatMovingClock,
  formatPace,
  type UnitSystem,
} from "@/lib/units";
import type { StravaActivity } from "@/types/strava";

export function ActivityDetailModal({
  activity,
  unit,
  onClose,
}: {
  activity: StravaActivity;
  unit: UnitSystem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const coords = decodeActivityPolyline(activity);
  const dateFull = new Date(activity.start_date).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-marine/40 p-4 backdrop-blur-md dark:bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-[101] max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/30 bg-white/95 p-8 shadow-2xl dark:border-slate-600 dark:bg-slate-900/95">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-marine dark:bg-slate-800 dark:text-slate-200"
        >
          Close
        </button>

        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-pink">Activity</p>
        <h2
          id="activity-detail-title"
          className="mb-2 text-3xl font-bold leading-tight text-marine dark:text-white"
        >
          {activity.name}
        </h2>
        <p className="mb-8 text-sm text-[#9ca3af] dark:text-slate-400">{dateFull}</p>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <GlassStat label="Distance" value={formatDistance(activity.distance, unit, 2)} />
          <GlassStat label="Moving time" value={formatMovingClock(activity.moving_time)} />
          <GlassStat
            label="Avg pace"
            value={formatPace(activity.distance, activity.moving_time, unit)}
          />
          {activity.total_elevation_gain != null && (
            <GlassStat
              label="Elevation"
              value={`${Math.round(activity.total_elevation_gain)} m`}
            />
          )}
          {activity.average_heartrate != null && (
            <GlassStat label="Avg HR" value={`${Math.round(activity.average_heartrate)} bpm`} />
          )}
          {activity.max_heartrate != null && (
            <GlassStat label="Max HR" value={`${Math.round(activity.max_heartrate)} bpm`} />
          )}
        </div>

        <div className="mb-4">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-marine dark:text-slate-200">
            Route
          </h3>
          <ActivityRouteMap coords={coords} />
        </div>
      </div>
    </div>
  );
}

function GlassStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-gradient-to-br from-white/80 to-[#f8f9fc]/90 p-4 shadow-sm dark:border-slate-600 dark:from-slate-800/80 dark:to-slate-900/80">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af] dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-marine dark:text-white">{value}</p>
    </div>
  );
}
