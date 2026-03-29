import { cookies } from "next/headers";

import { DashboardClient } from "@/components/dashboard/DashboardClient";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get("sweat_user_id")?.value);
  return <DashboardClient initialHasSession={hasSession} authError={sp.error} />;
}
