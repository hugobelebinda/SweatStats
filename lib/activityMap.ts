import polyline from "@mapbox/polyline";

import type { StravaActivity } from "@/types/strava";

export type LatLng = [number, number];

/** Strava summary polylines use precision 5. */
export function decodeActivityPolyline(activity: StravaActivity): LatLng[] {
  const encoded =
    activity.map?.summary_polyline ??
    (activity as { map_polyline?: string }).map_polyline;
  if (!encoded) return [];
  try {
    return polyline.decode(encoded, 5) as LatLng[];
  } catch {
    return [];
  }
}

export function polylineBounds(coords: LatLng[]): [[number, number], [number, number]] | null {
  if (coords.length === 0) return null;
  let minLat = coords[0][0];
  let maxLat = coords[0][0];
  let minLng = coords[0][1];
  let maxLng = coords[0][1];
  for (const [lat, lng] of coords) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}
