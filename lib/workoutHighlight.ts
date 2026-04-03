export type MuscleHighlightZone = "upper" | "lower" | "full" | "none";

/**
 * Map Strava activity type → which body region should glow on the 3D figure.
 */
export function workoutToHighlight(type: string | undefined): MuscleHighlightZone {
  if (!type) return "none";
  const t = type.toLowerCase().replace(/\s+/g, "");

  if (
    t.includes("weight") ||
    t.includes("strength") ||
    t === "workout" ||
    t.includes("yoga") ||
    t.includes("pilates") ||
    t.includes("crossfit") ||
    t.includes("functional")
  ) {
    return "upper";
  }

  if (t.includes("swim") || t.includes("rowing") || t.includes("row")) {
    return "full";
  }

  if (
    t.includes("run") ||
    t.includes("walk") ||
    t.includes("hike") ||
    t.includes("trail") ||
    t.includes("virtualrun") ||
    t.includes("ride") ||
    t.includes("bike") ||
    t.includes("ebikeride") ||
    t.includes("virtualride") ||
    t.includes("ski") ||
    t.includes("snowboard") ||
    t.includes("skate")
  ) {
    return "lower";
  }

  return "none";
}
