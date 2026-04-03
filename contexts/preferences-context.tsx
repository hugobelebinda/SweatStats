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

import { getBodyMetrics, updateBodyMetrics } from "@/actions/body-metrics";
import type { UnitSystem } from "@/lib/units";

const LS_UNIT = "sweatstats:unit";
const LS_THEME = "sweatstats:theme";
const LS_WEIGHT = "sweatstats:bodyWeightKg";
const LS_GOAL = "sweatstats:goalWeightKg";

type Theme = "light" | "dark";

type PreferencesContextValue = {
  unit: UnitSystem;
  setUnit: (u: UnitSystem) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  bodyWeightKg: number;
  goalWeightKg: number;
  setBodyMetrics: (body: number, goal: number) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function readLs<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function writeLs(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<UnitSystem>("km");
  const [theme, setThemeState] = useState<Theme>("light");
  const [bodyWeightKg, setBodyWeightState] = useState(78);
  const [goalWeightKg, setGoalWeightState] = useState(70);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUnitState(readLs(LS_UNIT, "km"));
    setThemeState(readLs(LS_THEME, "light"));
    setBodyWeightState(readLs(LS_WEIGHT, 78));
    setGoalWeightState(readLs(LS_GOAL, 70));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      const r = await getBodyMetrics();
      if (r.ok) {
        if (r.bodyWeightKg != null) setBodyWeightState(r.bodyWeightKg);
        if (r.goalWeightKg != null) setGoalWeightState(r.goalWeightKg);
      }
    })();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    writeLs(LS_THEME, theme);
  }, [theme, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeLs(LS_UNIT, unit);
  }, [unit, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeLs(LS_WEIGHT, bodyWeightKg);
    writeLs(LS_GOAL, goalWeightKg);
  }, [bodyWeightKg, goalWeightKg, hydrated]);

  const setUnit = useCallback((u: UnitSystem) => setUnitState(u), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const setBodyMetrics = useCallback((body: number, goal: number) => {
    setBodyWeightState(body);
    setGoalWeightState(goal);
    void updateBodyMetrics({ bodyWeightKg: body, goalWeightKg: goal });
  }, []);

  const value = useMemo(
    () => ({
      unit,
      setUnit,
      theme,
      setTheme,
      bodyWeightKg,
      goalWeightKg,
      setBodyMetrics,
    }),
    [unit, setUnit, theme, setTheme, bodyWeightKg, goalWeightKg, setBodyMetrics],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
