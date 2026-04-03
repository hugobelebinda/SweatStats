export type UnitSystem = "km" | "mi";

const M_PER_MI = 1609.344;

export function metersToDisplay(meters: number, unit: UnitSystem): number {
  if (unit === "mi") return meters / M_PER_MI;
  return meters / 1000;
}

export function formatDistance(meters: number, unit: UnitSystem, decimals = 1): string {
  const v = metersToDisplay(meters, unit);
  return `${v.toFixed(decimals)} ${unit === "mi" ? "mi" : "km"}`;
}

/** Pace: seconds per km or per mile */
export function paceSecondsPerUnit(meters: number, movingSeconds: number, unit: UnitSystem): number {
  const km = meters / 1000;
  if (km <= 0) return 0;
  const secPerKm = movingSeconds / km;
  if (unit === "mi") return secPerKm * (M_PER_MI / 1000);
  return secPerKm;
}

export function formatPace(meters: number, movingSeconds: number, unit: UnitSystem): string {
  const sec = paceSecondsPerUnit(meters, movingSeconds, unit);
  if (sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}/${unit === "mi" ? "mi" : "km"}`;
}

export function formatDurationSeconds(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

/** Moving time as mm:ss (matches legacy activity cards). */
export function formatMovingClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
