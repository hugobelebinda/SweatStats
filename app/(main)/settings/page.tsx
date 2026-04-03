"use client";

import Link from "next/link";

import { usePreferences } from "@/contexts/preferences-context";

export default function SettingsPage() {
  const { unit, setUnit, theme, setTheme } = usePreferences();

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-marine dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-[#9ca3af] dark:text-slate-400">
          Units and theme apply across the whole app.
        </p>
      </header>

      <div className="max-w-md space-y-6">
        <section className="rounded-[25px] bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#9ca3af] dark:text-slate-400">
            Distance units
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setUnit("km")}
              className={`flex-1 rounded-xl py-3 text-sm font-bold ${
                unit === "km"
                  ? "bg-marine text-white dark:bg-pink"
                  : "bg-slate-100 text-marine dark:bg-slate-700 dark:text-slate-200"
              }`}
            >
              Kilometres
            </button>
            <button
              type="button"
              onClick={() => setUnit("mi")}
              className={`flex-1 rounded-xl py-3 text-sm font-bold ${
                unit === "mi"
                  ? "bg-marine text-white dark:bg-pink"
                  : "bg-slate-100 text-marine dark:bg-slate-700 dark:text-slate-200"
              }`}
            >
              Miles
            </button>
          </div>
        </section>

        <section className="rounded-[25px] bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#9ca3af] dark:text-slate-400">
            Theme
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex-1 rounded-xl py-3 text-sm font-bold ${
                theme === "light"
                  ? "bg-marine text-white dark:bg-pink"
                  : "bg-slate-100 text-marine dark:bg-slate-700 dark:text-slate-200"
              }`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex-1 rounded-xl py-3 text-sm font-bold ${
                theme === "dark"
                  ? "bg-marine text-white dark:bg-pink"
                  : "bg-slate-100 text-marine dark:bg-slate-700 dark:text-slate-200"
              }`}
            >
              Dark
            </button>
          </div>
        </section>

        <section className="rounded-[25px] bg-white p-6 shadow-[0_5px_15px_rgba(0,0,0,0.02)] dark:bg-slate-800 dark:shadow-none">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#9ca3af] dark:text-slate-400">
            Session
          </h2>
          <Link
            href="/auth/logout"
            className="inline-flex w-full items-center justify-center rounded-xl bg-pink py-3 text-sm font-bold text-white"
          >
            Log out
          </Link>
        </section>
      </div>
    </>
  );
}
