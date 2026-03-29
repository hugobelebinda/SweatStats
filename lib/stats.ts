import type { StravaActivity } from "@/types/strava";

export interface WeeklyStats {
  weeklyDistance: string;
  weeklyTime: string;
  avgPace: string;
  lastWorkoutType: string;
  lastWorkoutDate: string;
  lastWorkoutDistance: string;
}

/**
 * Ported from Frontend/src/App.svelte `calculateWeeklyStats` — logic must stay identical.
 */
export function calculateWeeklyStats(data: StravaActivity[]): WeeklyStats {
  const defaults: WeeklyStats = {
    weeklyDistance: "0",
    weeklyTime: "0h 0m",
    avgPace: "0:00",
    lastWorkoutType: "Run",
    lastWorkoutDate: "Yesterday",
    lastWorkoutDistance: "0.0",
  };

  if (!data.length) return defaults;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentActivities = data.filter((a) => new Date(a.start_date) >= oneWeekAgo);

  const totalDistMeters = recentActivities.reduce((acc, curr) => acc + curr.distance, 0);
  const weeklyDistance = (totalDistMeters / 1000).toFixed(1);

  const totalSeconds = recentActivities.reduce((acc, curr) => acc + curr.moving_time, 0);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const weeklyTime = `${hrs}h ${mins}m`;

  let avgPace = "0:00";
  if (totalDistMeters > 0) {
    const paceSecondsPerKm = totalSeconds / (totalDistMeters / 1000);
    const paceMins = Math.floor(paceSecondsPerKm / 60);
    const paceSecs = Math.floor(paceSecondsPerKm % 60);
    avgPace = `${paceMins}:${paceSecs < 10 ? "0" : ""}${paceSecs}`;
  }

  let lastWorkoutType = defaults.lastWorkoutType;
  let lastWorkoutDate = defaults.lastWorkoutDate;
  let lastWorkoutDistance = defaults.lastWorkoutDistance;
  if (data.length > 0) {
    lastWorkoutType = data[0].type;
    lastWorkoutDate = new Date(data[0].start_date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    lastWorkoutDistance = (data[0].distance / 1000).toFixed(1);
  }

  return {
    weeklyDistance,
    weeklyTime,
    avgPace,
    lastWorkoutType,
    lastWorkoutDate,
    lastWorkoutDistance,
  };
}
