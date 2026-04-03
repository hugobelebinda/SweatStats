/** Supabase public.users row (Strava-linked account). */
export interface DbUser {
  id: string;
  strava_id: number;
  first_name: string | null;
  last_name: string | null;
  profile_pic: string | null;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  body_weight_kg?: number | null;
  goal_weight_kg?: number | null;
  created_at: string;
  updated_at: string;
}

/** Supabase public.activities row. */
export interface DbActivity {
  id: string;
  user_id: string;
  activity_id: number;
  name: string | null;
  type: string | null;
  distance: number;
  moving_time: number;
  start_date: string;
  map_polyline: string | null;
  created_at: string;
  updated_at: string;
}

/** Non-sensitive session info for the UI (never includes tokens). */
export interface SessionUser {
  id: string;
  stravaId: number;
  firstName: string | null;
  lastName: string | null;
  profilePic: string | null;
}
