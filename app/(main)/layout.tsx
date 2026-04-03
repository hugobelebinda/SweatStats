import { cookies } from "next/headers";

import { AppProviders } from "@/components/providers/AppProviders";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get("sweat_user_id")?.value);

  return (
    <AppProviders hasSession={hasSession}>
      <DashboardShell hasSession={hasSession}>{children}</DashboardShell>
    </AppProviders>
  );
}
