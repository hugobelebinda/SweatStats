/** Strava API v3 athlete payload (subset used by the app). */
export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
}

/** Activity returned by GET /athlete/activities and stored in the dashboard. */
export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
  map?: { summary_polyline?: string };
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: StravaAthlete;
}
