"use client";

import { useState } from "react";

import { ActivityCard } from "@/components/ActivityCard";
import { ActivityDetailModal } from "@/components/ActivityDetailModal";
import { useActivities } from "@/contexts/activities-context";
import { usePreferences } from "@/contexts/preferences-context";
import type { StravaActivity } from "@/types/strava";

export default function ActivitiesPage() {
  const { activities, loading, error } = useActivities();
  const { unit } = usePreferences();
  const [selected, setSelected] = useState<StravaActivity | null>(null);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="min-w-0 flex-1 lg:max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-marine dark:text-white">Activities</h1>
          <p className="mt-1 text-sm text-[#9ca3af] dark:text-slate-400">
            Tap an activity for route map and full stats.
          </p>
        </header>

        {error && (
          <p
            className="mb-4 rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-[#9ca3af] dark:text-slate-400">Loading…</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-[#9ca3af] dark:text-slate-400">No activities yet.</p>
        ) : (
          <div>
            {activities.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                unit={unit}
                onSelect={() => setSelected(a)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ActivityDetailModal activity={selected} unit={unit} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
