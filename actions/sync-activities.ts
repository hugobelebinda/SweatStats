"use server";

import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";
import { ensureValidAccessToken, fetchStravaActivities } from "@/lib/strava";
import type { DbUser } from "@/types/database";
import type { StravaActivity } from "@/types/strava";

export type SyncActivitiesResult =
  | { ok: true; activities: StravaActivity[] }
  | { ok: false; error: string };

export async function syncAndFetchActivities(): Promise<SyncActivitiesResult> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("sweat_user_id")?.value;
  if (!userId) {
    return { ok: false, error: "Not authenticated" };
  }

  const admin = createAdminClient();
  const { data: userRow, error: userErr } = await admin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userErr || !userRow) {
    return { ok: false, error: "User not found" };
  }

  const user = userRow as DbUser;

  try {
    const accessToken = await ensureValidAccessToken(admin, user);
    const activities = await fetchStravaActivities(accessToken);

    for (const activity of activities) {
      const { error: upErr } = await admin.from("activities").upsert(
        {
          user_id: user.id,
          activity_id: activity.id,
          name: activity.name,
          type: activity.type,
          distance: activity.distance,
          moving_time: activity.moving_time,
          start_date: activity.start_date,
          map_polyline: activity.map?.summary_polyline ?? null,
        },
        { onConflict: "activity_id" },
      );
      if (upErr) throw upErr;
    }

    return { ok: true, activities };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Sync failed" };
  }
}
