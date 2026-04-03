"use client";

import { ActivitiesProvider } from "@/contexts/activities-context";
import { PreferencesProvider } from "@/contexts/preferences-context";

export function AppProviders({
  hasSession,
  children,
}: {
  hasSession: boolean;
  children: React.ReactNode;
}) {
  return (
    <PreferencesProvider>
      <ActivitiesProvider hasSession={hasSession}>{children}</ActivitiesProvider>
    </PreferencesProvider>
  );
}
