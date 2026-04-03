import type { StravaActivity } from "@/types/strava";

/** Riegel endurance formula: T2 = T1 * (D2/D1)^1.06 — T in seconds, D in meters. */
export function riegelPredictTime(
  refTimeSec: number,
  refDistM: number,
  targetDistM: number,
): number {
  if (refDistM <= 0 || refTimeSec <= 0 || targetDistM <= 0) return 0;
  return refTimeSec * Math.pow(targetDistM / refDistM, 1.06);
}

export function formatTimeHMS(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const RUN_TYPES = new Set(["Run", "Trail Run", "Virtual Run"]);

function isRun(a: StravaActivity) {
  return RUN_TYPES.has(a.type);
}

/** Max runs used for aggregates (matches typical Strava sync page size). */
export const PERFORMANCE_RUN_WINDOW = 30;

/**
 * Up to `maxRuns` most recent run activities (Strava order is newest-first).
 */
export function getLastRuns(activities: StravaActivity[], maxRuns = PERFORMANCE_RUN_WINDOW): StravaActivity[] {
  const runs = activities.filter(
    (a) => isRun(a) && a.distance >= 400 && a.moving_time > 0,
  );
  return runs.slice(0, maxRuns);
}

function medianPositive(values: number[]): number {
  const sorted = values.filter((x) => x > 0 && Number.isFinite(x)).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export const STANDARD_DISTANCES_M = {
  "1k": 1000,
  "3k": 3000,
  "5k": 5000,
  "10k": 10000,
  halfMarathon: 21097.5,
  /** Official marathon — 42.195 km */
  marathon: 42195,
} as const;

export type StandardDistanceKey = keyof typeof STANDARD_DISTANCES_M;

/**
 * Daniels-style oxygen cost for horizontal running (ACSM / Daniels Running Formula style).
 * velocity in m/min; returns VO2 in ml/kg/min.
 */
function oxygenCostRunning(velocityMPerMin: number): number {
  return 0.2 * velocityMPerMin + 0.000104 * velocityMPerMin * velocityMPerMin + 3.5;
}

/**
 * Fraction of VO2max sustainable for duration (minutes) — simplified decay from Daniels tables.
 * ~96% at 5 min, ~92% at 20 min, ~88% at 60 min.
 */
function fractionVO2maxForDuration(durationMin: number): number {
  if (durationMin <= 5) return 0.96;
  if (durationMin >= 120) return 0.82;
  return 0.96 - (durationMin - 5) * (0.14 / 115);
}

/**
 * Estimate VO2max (ml/kg/min) from a single run: velocity → oxygen cost ÷ sustainable fraction.
 */
export function estimateVO2MaxFromRun(ref: StravaActivity | null): number | null {
  if (!ref || ref.moving_time <= 0 || ref.distance <= 0) return null;
  const velocityMPerMin = ref.distance / (ref.moving_time / 60);
  const vo2 = oxygenCostRunning(velocityMPerMin);
  const durationMin = ref.moving_time / 60;
  const frac = fractionVO2maxForDuration(durationMin);
  return vo2 / frac;
}

/**
 * Race projections: for each standard distance, **median** of Riegel times from each of the last
 * runs (up to {@link PERFORMANCE_RUN_WINDOW}). VO₂ max: **median** of per-run estimates over the same set.
 */
export function buildRacePredictions(activities: StravaActivity[]): {
  refRuns: StravaActivity[];
  runCount: number;
  predictions: Record<StandardDistanceKey, number>;
  vo2max: number | null;
} {
  const refRuns = getLastRuns(activities, PERFORMANCE_RUN_WINDOW);
  const runCount = refRuns.length;

  const emptyPredictions = {} as Record<StandardDistanceKey, number>;
  (Object.keys(STANDARD_DISTANCES_M) as StandardDistanceKey[]).forEach((k) => {
    emptyPredictions[k] = 0;
  });

  if (runCount === 0) {
    return { refRuns, runCount: 0, predictions: emptyPredictions, vo2max: null };
  }

  const vo2Estimates = refRuns
    .map((r) => estimateVO2MaxFromRun(r))
    .filter((v): v is number => v != null && v > 0 && Number.isFinite(v));
  const vo2max = vo2Estimates.length === 0 ? null : medianPositive(vo2Estimates);

  const predictions = {} as Record<StandardDistanceKey, number>;
  for (const key of Object.keys(STANDARD_DISTANCES_M) as StandardDistanceKey[]) {
    const targetD = STANDARD_DISTANCES_M[key];
    const times = refRuns.map((r) => riegelPredictTime(r.moving_time, r.distance, targetD));
    predictions[key] = medianPositive(times);
  }

  return { refRuns, runCount, predictions, vo2max };
}
