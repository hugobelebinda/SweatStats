"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ActivityCard } from "@/components/ActivityCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useActivities } from "@/contexts/activities-context";
import { usePreferences } from "@/contexts/preferences-context";
import { formatDistance, formatPace } from "@/lib/units";
import { calculateWeeklyStats } from "@/lib/stats";

export function HomeDashboard({
  bannerError,
  userName,
}: {
  bannerError: string | null;
  userName: string;
}) {
  const { activities, loading, error } = useActivities();
  const { unit, bodyWeightKg, goalWeightKg } = usePreferences();

  const stats = useMemo(() => calculateWeeklyStats(activities), [activities]);

  const progressPct = useMemo(() => {
    if (bodyWeightKg <= 0 || goalWeightKg <= 0) return null;
    const anchor = Math.max(bodyWeightKg, goalWeightKg) + 5;
    const denom = anchor - goalWeightKg;
    if (denom <= 0) return 100;
    const pct = ((anchor - bodyWeightKg) / denom) * 100;
    return Math.min(100, Math.max(0, pct));
  }, [bodyWeightKg, goalWeightKg]);

  const syncError = error;

  return (
    <>
      <header className="mb-2.5 flex items-center">
        <div>
          <h1 className="text-2xl font-bold text-marine dark:text-white">
            Hello{" "}
            <span className="italic text-marine/95 dark:text-white">
              {userName}
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-[#9ca3af] dark:text-slate-400">
            You&apos;re crushing your goals.
          </p>
        </div>
      </header>

      {(bannerError || syncError) && (
        <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200" role="alert">
          {bannerError || syncError}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[#9ca3af] dark:text-slate-400">Loading activities…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-5">
            <StatCard
              dot="pink"
              title="Weekly Distance"
              svg={
                <path d="M0 15 Q25 5 50 10 T100 5" fill="none" stroke="#e94560" strokeWidth="2" />
              }
              value={<>{formatDistance(stats.totalWeeklyMeters, unit, 1)}</>}
            />
            <StatCard
              dot="marine"
              title="Avg Pace"
              svg={
                <path
                  d="M0 10 L20 15 L40 5 L60 12 L80 8 L100 10"
                  fill="none"
                  stroke="#16213e"
                  strokeWidth="2"
                  className="dark:stroke-slate-200"
                />
              }
              value={
                <>
                  {stats.totalWeeklyMeters > 0
                    ? formatPace(stats.totalWeeklyMeters, stats.totalWeeklyMovingSeconds, unit)
                    : "—"}
                </>
              }
            />
            <StatCard
              dot="pink"
              title="Total Time"
              svg={
                <path d="M0 18 Q50 0 100 18" fill="none" stroke="#e94560" strokeWidth="2" />
              }
              value={stats.weeklyTime}
            />
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold dark:text-slate-100">Body Conditions</h3>
            <div className="grid grid-cols-3 gap-5">
              <div className="flex h-[140px] flex-col justify-between rounded-[25px] bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
                <div>
                  <h4 className="text-sm font-bold text-marine dark:text-slate-100">Weight</h4>
                  <p className="mt-1.5 text-xs text-[#9ca3af] dark:text-slate-400">From Performance</p>
                </div>
                <div className="my-4 flex h-10 items-end gap-1.5">
                  {[40, 60, 50, 80, 70].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-sm ${i === 3 ? "bg-marine dark:bg-pink" : "bg-[#f3f4f6] dark:bg-slate-700"}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="mt-auto">
                  <span className="text-[28px] font-bold text-marine dark:text-white">
                    {bodyWeightKg.toFixed(1)}{" "}
                    <span className="text-sm font-medium text-[#9ca3af] dark:text-slate-400">kg</span>
                  </span>
                </div>
              </div>

              <div className="flex h-[140px] flex-col justify-between rounded-[25px] bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
                <div>
                  <h4 className="text-sm font-bold text-marine dark:text-slate-100">Weight Goal</h4>
                  <p className="mt-1.5 text-xs text-[#9ca3af] dark:text-slate-400">
                    Target: {goalWeightKg} kg
                  </p>
                </div>
                <div className="mt-8 h-2 w-full rounded bg-[#f3f4f6] dark:bg-slate-700">
                  <div
                    className="h-full rounded bg-pink"
                    style={{ width: `${progressPct != null ? progressPct : 0}%` }}
                  />
                </div>
                <div className="mt-auto">
                  <span className="text-[28px] font-bold text-marine dark:text-white">
                    {progressPct != null ? `${Math.round(progressPct)}` : "—"}{" "}
                    <span className="text-sm font-medium text-[#9ca3af] dark:text-slate-400">
                      % Done
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex h-[140px] flex-col items-center rounded-[25px] bg-white p-5 text-center shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
                <div>
                  <h4 className="text-sm font-bold text-marine dark:text-slate-100">Last Workout</h4>
                  <p className="mt-1.5 text-xs text-[#9ca3af] dark:text-slate-400">
                    {stats.lastWorkoutDate}
                  </p>
                </div>
                <div className="mt-2.5 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[conic-gradient(#16213e_70%,#f3f4f6_0)] dark:bg-[conic-gradient(#e94560_70%,#334155_0)]">
                  <div className="flex h-[55px] w-[55px] flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                    <h3 className="text-xs font-bold">{stats.lastWorkoutType}</h3>
                    <p className="text-[10px] font-semibold text-[#9ca3af] dark:text-slate-400">
                      {formatDistance(stats.lastWorkoutMeters, unit, 1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-[25px] bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
              <h3 className="mb-3 text-base font-bold text-marine dark:text-slate-100">
                Recent Volume
              </h3>
              <p className="mb-2 text-xs text-[#9ca3af] dark:text-slate-400">
                Last 7 days (including rest days)
              </p>
              <WeeklyChart activities={activities} />
            </div>
            <div className="rounded-[25px] bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-marine dark:text-slate-100">
                  Recent activities
                </h3>
                <Link
                  href="/activities"
                  className="text-xs font-semibold text-pink hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="max-h-[280px] overflow-y-auto pr-1">
                {activities.length === 0 ? (
                  <p className="text-sm text-[#9ca3af] dark:text-slate-400">
                    No activities synced yet.
                  </p>
                ) : (
                  activities.slice(0, 6).map((a) => (
                    <ActivityCard key={a.id} activity={a} unit={unit} />
                  ))
                )}
              </div>
            </div>
          </div>

          <Link
            href="/coach"
            className="mt-2 flex flex-col rounded-[25px] bg-gradient-to-br from-marine to-chat-end p-6 text-white transition-opacity hover:opacity-95"
          >
            <div className="mb-2 flex items-center gap-2.5">
              <h3 className="font-bold">Coach Dash</h3>
              <span
                className="h-2 w-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]"
                aria-hidden
              />
            </div>
            <p className="text-sm text-white/80">
              Open full-screen AI coach for training questions →
            </p>
          </Link>
        </>
      )}
    </>
  );
}

function StatCard({
  dot,
  title,
  svg,
  value,
}: {
  dot: "pink" | "marine";
  title: string;
  svg: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="relative rounded-[25px] bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
      <div className="mb-5 flex items-center gap-2.5">
        <span
          className={`h-2 w-2 rounded-full ${dot === "pink" ? "bg-pink" : "bg-marine dark:bg-slate-300"}`}
        />
        <h3 className="text-sm font-semibold text-[#6b7280] dark:text-slate-400">{title}</h3>
      </div>
      <div className="absolute right-5 top-10 h-[30px] w-[60px] opacity-50">
        <svg viewBox="0 0 100 20" className="h-full w-full" aria-hidden>
          {svg}
        </svg>
      </div>
      <h2 className="text-[28px] font-bold text-marine dark:text-white">{value}</h2>
    </div>
  );
}
