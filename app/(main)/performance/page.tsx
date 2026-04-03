"use client";

import { useEffect, useMemo, useState } from "react";

import { useActivities } from "@/contexts/activities-context";
import { usePreferences } from "@/contexts/preferences-context";
import {
  buildRacePredictions,
  formatTimeHMS,
  STANDARD_DISTANCES_M,
  type StandardDistanceKey,
} from "@/lib/predictions";

const LABELS: Record<StandardDistanceKey, string> = {
  "1k": "1 km",
  "3k": "3 km",
  "5k": "5 km",
  "10k": "10 km",
  halfMarathon: "Half marathon (21.1 km)",
  marathon: "Marathon (42.2 km)",
};

export default function PerformancePage() {
  const { activities, loading } = useActivities();
  const { bodyWeightKg, goalWeightKg, setBodyMetrics } = usePreferences();
  const [w, setW] = useState(String(bodyWeightKg));
  const [g, setG] = useState(String(goalWeightKg));

  useEffect(() => {
    setW(String(bodyWeightKg));
    setG(String(goalWeightKg));
  }, [bodyWeightKg, goalWeightKg]);

  const { runCount, predictions, vo2max } = useMemo(
    () => buildRacePredictions(activities),
    [activities],
  );

  const saveWeights = () => {
    const bw = parseFloat(w);
    const gw = parseFloat(g);
    if (!Number.isFinite(bw) || !Number.isFinite(gw)) return;
    setBodyMetrics(bw, gw);
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-marine dark:text-white">Performance</h1>
        <p className="mt-1 text-sm text-[#9ca3af] dark:text-slate-400">
          Weight targets, race projections and VO₂ max are aggregated from your{" "}
          <strong>last 30 runs</strong> (median Riegel time per distance; median per-run VO₂ estimate).
        </p>
      </header>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[25px] bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
          <h2 className="mb-4 text-lg font-bold text-marine dark:text-white">Body metrics</h2>
          <p className="mb-4 text-xs text-[#9ca3af] dark:text-slate-400">

            <code className="rounded bg-slate-100 px-1 dark:bg-slate-900"> Weight </code>
            
          </p>
          <div className="mb-4 flex flex-wrap gap-4">
            <label className="flex flex-col text-sm">
              <span className="mb-1 font-medium text-marine dark:text-slate-200">Current weight (kg)</span>
              <input
                type="number"
                step="0.1"
                value={w}
                onChange={(e) => setW(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
            <label className="flex flex-col text-sm">
              <span className="mb-1 font-medium text-marine dark:text-slate-200">Goal weight (kg)</span>
              <input
                type="number"
                step="0.1"
                value={g}
                onChange={(e) => setG(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={saveWeights}
            className="rounded-full bg-pink px-6 py-2 text-sm font-bold text-white"
          >
            Save
          </button>
        </section>

        <section className="rounded-[25px] bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
          <h2 className="mb-2 text-lg font-bold text-marine dark:text-white">VO₂ max estimate</h2>
          <p className="mb-4 text-xs leading-relaxed text-[#9ca3af] dark:text-slate-400">
            For each of your last runs (up to 30), we estimate VO₂max from speed and duration (ACSM-style
            oxygen cost ÷ sustainable fraction for that duration). The value shown is the{" "}
            <strong>median</strong> of those estimates. Lab testing is more accurate.
          </p>
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : vo2max != null ? (
            <p className="text-4xl font-bold text-pink">{vo2max.toFixed(1)}</p>
          ) : (
            <p className="text-sm text-slate-500">Need at least one recorded run.</p>
          )}
          <p className="mt-1 text-xs text-slate-500">ml · kg⁻¹ · min⁻¹</p>
        </section>
      </div>

      <section className="rounded-[25px] bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
        <h2 className="mb-2 text-lg font-bold text-marine dark:text-white">Race predictor</h2>
        <p className="mb-4 text-xs text-[#9ca3af] dark:text-slate-400">
          Riegel:{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-900">T₂ = T₁ × (D₂/D₁)^1.06</code>
          {runCount > 0 ? (
            <>
              {" "}
              For each of your <strong>{runCount}</strong> most recent runs (max 30), we predict each
              race time; the table shows the <strong>median</strong> projection (robust to easy days and
              outliers).
            </>
          ) : (
            " — no runs in your synced activities yet."
          )}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[#9ca3af] dark:border-slate-600">
                <th className="py-2 pr-4">Event</th>
                <th className="py-2">Projected time</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(STANDARD_DISTANCES_M) as StandardDistanceKey[]).map((key) => (
                <tr key={key} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-3 pr-4 font-medium text-marine dark:text-slate-200">
                    {LABELS[key]}
                  </td>
                  <td className="py-3 font-mono text-slate-700 dark:text-slate-300">
                    {formatTimeHMS(predictions[key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
