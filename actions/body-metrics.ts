"use server";

import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";
import type { DbUser } from "@/types/database";

export type BodyMetricsResult =
  | { ok: true; bodyWeightKg: number | null; goalWeightKg: number | null }
  | { ok: false; error: string };

export async function getBodyMetrics(): Promise<BodyMetricsResult> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("sweat_user_id")?.value;
  if (!userId) return { ok: false, error: "Not authenticated" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("body_weight_kg, goal_weight_kg")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { ok: false, error: "Could not load profile" };
  }

  const row = data as Pick<DbUser, "body_weight_kg" | "goal_weight_kg">;
  return {
    ok: true,
    bodyWeightKg: row.body_weight_kg ?? null,
    goalWeightKg: row.goal_weight_kg ?? null,
  };
}

export async function updateBodyMetrics(input: {
  bodyWeightKg: number | null;
  goalWeightKg: number | null;
}): Promise<BodyMetricsResult> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("sweat_user_id")?.value;
  if (!userId) return { ok: false, error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({
      body_weight_kg: input.bodyWeightKg,
      goal_weight_kg: input.goalWeightKg,
    })
    .eq("id", userId);

  if (error) {
    console.error(error);
    return { ok: false, error: "Update failed" };
  }

  return {
    ok: true,
    bodyWeightKg: input.bodyWeightKg,
    goalWeightKg: input.goalWeightKg,
  };
}
