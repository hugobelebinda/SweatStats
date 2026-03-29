"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { syncAndFetchActivities } from "@/actions/sync-activities";
import { ActivityCard } from "@/components/ActivityCard";
import { WeeklyChart } from "@/components/WeeklyChart";
import { cn } from "@/lib/utils";
import { calculateWeeklyStats } from "@/lib/stats";
import type { StravaActivity } from "@/types/strava";

const weight = 104.6;
const weightGoal = 90.0;

function authErrorMessage(code: string | undefined) {
  switch (code) {
    case "auth":
      return "Strava sign-in failed. Please try again.";
    case "db":
      return "Could not save your account. Check Supabase configuration.";
    case "missing_code":
      return "Missing authorization code.";
    case "strava_denied":
      return "Strava authorization was cancelled.";
    default:
      return code ? "Something went wrong." : null;
  }
}

export function DashboardClient({
  initialHasSession,
  authError,
}: {
  initialHasSession: boolean;
  authError?: string;
}) {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(initialHasSession);
  const [syncError, setSyncError] = useState<string | null>(null);

  const stats = useMemo(() => calculateWeeklyStats(activities), [activities]);

  useEffect(() => {
    if (!initialHasSession) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setSyncError(null);
      const result = await syncAndFetchActivities();
      if (cancelled) return;
      if (result.ok) {
        setActivities(result.activities);
      } else {
        setSyncError(result.error);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialHasSession]);

  const bannerError = authErrorMessage(authError) || syncError;

  if (!initialHasSession) {
    return (
      <main className="text-center text-marine">
        <h1 className="mb-6 mt-[20vh] text-3xl font-bold">Welcome to FitDash</h1>
        {bannerError && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {bannerError}
          </p>
        )}
        <a
          href="/auth/strava"
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-pink px-10 py-4 text-lg font-bold text-white shadow-[0_10px_20px_rgba(233,69,96,0.4)] transition-colors hover:bg-pink/90",
          )}
        >
          Connect with Strava
        </a>
      </main>
    );
  }

  return (
    <main className="box-border h-screen overflow-hidden bg-[#f3f7f9] text-marine">
      <div className="grid h-screen grid-cols-[80px_1fr_350px] gap-5 p-5">
        {/* Sidebar */}
        <aside className="flex flex-col items-center rounded-[30px] bg-white py-10 shadow-[0_10px_20px_rgba(0,0,0,0.02)]">
          <div className="mb-14 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-marine to-pink text-xl text-white shadow-[0_5px_15px_rgba(233,69,96,0.4)]">
            ⚡
          </div>
          <nav className="flex flex-1 flex-col items-center">
            <button
              type="button"
              className="mb-5 flex h-[50px] w-[50px] items-center justify-center rounded-[15px] bg-marine text-xl text-white shadow-[0_5px_15px_rgba(22,33,62,0.3)]"
              aria-label="Home"
            >
              <span>🏠</span>
            </button>
            <button
              type="button"
              className="mb-5 flex h-[50px] w-[50px] items-center justify-center rounded-[15px] text-xl text-[#9ca3af]"
              aria-label="Runs"
            >
              <span>🏃</span>
            </button>
            <button
              type="button"
              className="mb-5 flex h-[50px] w-[50px] items-center justify-center rounded-[15px] text-xl text-[#9ca3af]"
              aria-label="Chat"
            >
              <span>💬</span>
            </button>
            <button
              type="button"
              className="mb-5 flex h-[50px] w-[50px] items-center justify-center rounded-[15px] text-xl text-[#9ca3af]"
              aria-label="Stats"
            >
              <span>📊</span>
            </button>
            <a
              href="/auth/logout"
              className="mt-auto flex h-[50px] w-[50px] items-center justify-center rounded-[15px] text-xl text-[#9ca3af] transition-colors hover:bg-gray-100"
              aria-label="Log out"
            >
              ⚙️
            </a>
          </nav>
        </aside>

        {/* Main */}
        <section className="flex flex-col gap-6 overflow-y-auto pr-2.5">
          <header className="mb-2.5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-marine">Good Morning!</h1>
              <p className="mt-1.5 text-sm text-[#9ca3af]">You&apos;re crushing your goals.</p>
            </div>
            <div className="flex w-[250px] items-center gap-2.5 rounded-full bg-white px-5 py-3 shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
              <span>🔍</span>
              <input
                type="search"
                placeholder="Search..."
                className="w-full border-none bg-transparent font-medium text-marine outline-none placeholder:text-[#9ca3af]"
              />
            </div>
          </header>

          {bannerError && (
            <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
              {bannerError}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-[#9ca3af]">Loading activities…</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-5">
                <StatCard
                  dot="pink"
                  title="Weekly Distance"
                  svg={
                    <path d="M0 15 Q25 5 50 10 T100 5" fill="none" stroke="#e94560" strokeWidth="2" />
                  }
                  value={
                    <>
                      {stats.weeklyDistance} <span className="text-sm font-medium text-[#9ca3af]">km</span>
                    </>
                  }
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
                    />
                  }
                  value={
                    <>
                      {stats.avgPace}{" "}
                      <span className="text-sm font-medium text-[#9ca3af]">/km</span>
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
                <h3 className="mb-5 text-lg font-bold">Body Conditions</h3>
                <div className="grid grid-cols-3 gap-5">
                  <div className="flex h-[140px] flex-col justify-between rounded-[25px] bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
                    <div>
                      <h4 className="text-sm font-bold text-marine">Weight</h4>
                      <p className="mt-1.5 text-xs text-[#9ca3af]">Lost X kg</p>
                    </div>
                    <div className="my-4 flex h-10 items-end gap-1.5">
                      {[40, 60, 50, 80, 70].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1.5 rounded-sm ${i === 3 ? "bg-marine" : "bg-[#f3f4f6]"}`}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-auto">
                      <span className="text-[28px] font-bold text-marine">
                        {weight}{" "}
                        <span className="text-sm font-medium text-[#9ca3af]">kg</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex h-[140px] flex-col justify-between rounded-[25px] bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
                    <div>
                      <h4 className="text-sm font-bold text-marine">Weight Goal</h4>
                      <p className="mt-1.5 text-xs text-[#9ca3af]">Target: {weightGoal}kg</p>
                    </div>
                    <div className="mt-8 h-2 w-full rounded bg-[#f3f4f6]">
                      <div className="h-full w-[85%] rounded bg-pink" />
                    </div>
                    <div className="mt-auto">
                      <span className="text-[28px] font-bold text-marine">
                        ? % <span className="text-sm font-medium text-[#9ca3af]">Done</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex h-[140px] flex-col items-center rounded-[25px] bg-white p-5 text-center shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
                    <div>
                      <h4 className="text-sm font-bold text-marine">Last Workout</h4>
                      <p className="mt-1.5 text-xs text-[#9ca3af]">{stats.lastWorkoutDate}</p>
                    </div>
                    <div className="mt-2.5 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[conic-gradient(#16213e_70%,#f3f4f6_0)]">
                      <div className="flex h-[55px] w-[55px] flex-col items-center justify-center rounded-full bg-white">
                        <h3 className="text-xs font-bold">{stats.lastWorkoutType}</h3>
                        <p className="text-[10px] font-semibold text-[#9ca3af]">
                          {stats.lastWorkoutDistance} km
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-[25px] bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
                  <h3 className="mb-3 text-base font-bold text-marine">Recent Volume</h3>
                  <WeeklyChart activities={activities} />
                </div>
                <div className="rounded-[25px] bg-white p-5 shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
                  <h3 className="mb-3 text-base font-bold text-marine">Recent activities</h3>
                  <div className="max-h-[280px] overflow-y-auto pr-1">
                    {activities.length === 0 ? (
                      <p className="text-sm text-[#9ca3af]">No activities synced yet.</p>
                    ) : (
                      activities.map((a) => <ActivityCard key={a.id} activity={a} />)
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto rounded-[25px] bg-gradient-to-br from-marine to-chat-end p-6 text-white">
                <div className="mb-4 flex items-center gap-2.5">
                  <h3 className="font-bold">Coach Dash </h3>
                  <span
                    className="h-2 w-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]"
                    aria-hidden
                  />
                </div>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Ask coach: 'How do I improve my pace?'"
                    className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-white outline-none placeholder:text-white/50"
                  />
                  <button
                    type="button"
                    className="w-11 shrink-0 rounded-xl bg-pink text-lg text-white"
                    aria-label="Send"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Right panel */}
        <aside className="relative flex items-center justify-center overflow-hidden rounded-[30px] bg-[#f8f9fc]">
          <div className="relative flex h-full w-full flex-col items-center justify-center">
            <Image
              src="https://images.fineartamerica.com/images-medium-large-5/6-runner-muscles-scieproscience-photo-library.jpg"
              alt="Body model"
              width={280}
              height={420}
              className="max-h-[80%] w-auto rounded-[180px] opacity-[0.55] drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)]"
              unoptimized
            />
            <div className="absolute top-[58%] flex w-[80%] -translate-y-1/2 items-center gap-4 rounded-[20px] bg-white/80 px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm">
              <span className="text-2xl text-pink" aria-hidden>
                ❤️
              </span>
              <div>
                <h4 className="text-sm font-bold text-marine">Heart Rate</h4>
                <p className="text-xs text-[#9ca3af]">Not Connected</p>
              </div>
              <div className="ml-auto h-[30px] w-[60px]">
                <svg viewBox="0 0 100 30" className="h-full w-full" aria-hidden>
                  <polyline
                    points="0,15 20,15 25,5 30,25 35,15 100,15"
                    fill="none"
                    stroke="#e94560"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
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
  svg: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className="relative rounded-[25px] bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
      <div className="mb-5 flex items-center gap-2.5">
        <span
          className={`h-2 w-2 rounded-full ${dot === "pink" ? "bg-pink" : "bg-marine"}`}
        />
        <h3 className="text-sm font-semibold text-[#6b7280]">{title}</h3>
      </div>
      <div className="absolute right-5 top-10 h-[30px] w-[60px] opacity-50">
        <svg viewBox="0 0 100 20" className="h-full w-full" aria-hidden>
          {svg}
        </svg>
      </div>
      <h2 className="text-[28px] font-bold text-marine">{value}</h2>
    </div>
  );
}
