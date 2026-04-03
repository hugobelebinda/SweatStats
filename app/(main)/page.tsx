import { cookies } from "next/headers";

import { DashboardApp } from "@/components/dashboard/DashboardApp";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DbUser } from "@/types/database";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get("sweat_user_id")?.value);

  let userName = "there";
  if (hasSession) {
    const userId = cookieStore.get("sweat_user_id")?.value;
    if (userId) {
      const admin = createAdminClient();
      const { data: userRow } = await admin
        .from("users")
        .select("first_name,last_name")
        .eq("id", userId)
        .single();

      const user = userRow as DbUser | null;
      const first = user?.first_name ?? "";
      const last = user?.last_name ?? "";
      const full = `${first} ${last}`.trim();
      if (full) userName = full;
    }
  }

  return <DashboardApp hasSession={hasSession} authError={sp.error} userName={userName} />;
}
