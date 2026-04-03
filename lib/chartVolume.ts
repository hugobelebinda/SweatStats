import type { StravaActivity } from "@/types/strava";

/** Local calendar day key (year-month-day in local TZ). */
function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Last 7 local calendar days (including today), each bucket sums distance (meters) for activities on that day.
 */
export function buildLastSevenDaysVolume(activities: StravaActivity[]): {
  labels: string[];
  distancesMeters: number[];
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: { key: string; label: string; meters: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({
      key: localDayKey(d),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      meters: 0,
    });
  }

  for (const a of activities) {
    const ad = new Date(a.start_date);
    ad.setHours(0, 0, 0, 0);
    const key = localDayKey(ad);
    const b = buckets.find((x) => x.key === key);
    if (b) b.meters += a.distance;
  }

  return {
    labels: buckets.map((b) => b.label),
    /** Total meters run that local calendar day */
    distancesMeters: buckets.map((b) => b.meters),
  };
}
