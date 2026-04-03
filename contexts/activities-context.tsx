"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { syncAndFetchActivities } from "@/actions/sync-activities";
import type { StravaActivity } from "@/types/strava";

type ActivitiesContextValue = {
  activities: StravaActivity[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ActivitiesContext = createContext<ActivitiesContextValue | null>(null);

export function ActivitiesProvider({
  hasSession,
  children,
}: {
  hasSession: boolean;
  children: ReactNode;
}) {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(hasSession);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!hasSession) return;
    setLoading(true);
    setError(null);
    const result = await syncAndFetchActivities();
    if (result.ok) {
      setActivities(result.activities);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [hasSession]);

  useEffect(() => {
    if (!hasSession) {
      setLoading(false);
      setActivities([]);
      return;
    }
    void refresh();
  }, [hasSession, refresh]);

  const value = useMemo(
    () => ({ activities, loading, error, refresh }),
    [activities, loading, error, refresh],
  );

  return <ActivitiesContext.Provider value={value}>{children}</ActivitiesContext.Provider>;
}

export function useActivities() {
  const ctx = useContext(ActivitiesContext);
  if (!ctx) throw new Error("useActivities must be used within ActivitiesProvider");
  return ctx;
}
