import type { SupabaseClient } from "@supabase/supabase-js";

import type { DbUser } from "@/types/database";
import type { StravaActivity, StravaTokenResponse } from "@/types/strava";

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export async function exchangeStravaCode(code: string): Promise<StravaTokenResponse> {
  const body = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    client_secret: process.env.STRAVA_CLIENT_SECRET!,
    code,
    grant_type: "authorization_code",
  });
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(`Strava token exchange failed: ${await res.text()}`);
  }
  return res.json() as Promise<StravaTokenResponse>;
}

async function refreshStravaToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const body = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    client_secret: process.env.STRAVA_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(`Strava refresh failed: ${await res.text()}`);
  }
  return res.json() as Promise<RefreshTokenResponse>;
}

/**
 * Returns a valid access token, refreshing and persisting new tokens when expired.
 */
export async function ensureValidAccessToken(
  admin: SupabaseClient,
  user: DbUser,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (user.expires_at > now + 120) {
    return user.access_token;
  }
  const refreshed = await refreshStravaToken(user.refresh_token);
  const { error } = await admin
    .from("users")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      expires_at: refreshed.expires_at,
    })
    .eq("id", user.id);
  if (error) throw error;
  return refreshed.access_token;
}

export async function fetchStravaActivities(accessToken: string): Promise<StravaActivity[]> {
  const res = await fetch(
    "https://www.strava.com/api/v3/athlete/activities?per_page=30",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    throw new Error(`Strava activities failed: ${await res.text()}`);
  }
  return res.json() as Promise<StravaActivity[]>;
}
