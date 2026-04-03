"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import BodyModelPanel from "@/components/body-model/BodyModelPanel";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/activities", label: "Activities", icon: "🏃" },
  { href: "/coach", label: "Coach", icon: "💬" },
  { href: "/performance", label: "Performance", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
] as const;

export function DashboardShell({
  hasSession,
  children,
}: {
  hasSession: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (!hasSession) {
    return <>{children}</>;
  }

  const showRightPanel = pathname === "/";

  return (
    <main className="box-border h-screen overflow-hidden bg-page-bg text-marine dark:bg-slate-950 dark:text-slate-100">
      <div
        className={cn(
          "grid h-screen gap-5 p-5",
          showRightPanel ? "grid-cols-[80px_1fr_350px]" : "grid-cols-[80px_1fr]",
        )}
      >
        <aside className="flex flex-col items-center rounded-[30px] bg-white py-10 shadow-[0_10px_20px_rgba(0,0,0,0.02)] dark:bg-slate-900 dark:shadow-none">
          <Link
            href="/"
            className="mb-14 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-marine to-pink text-xl text-white shadow-[0_5px_15px_rgba(233,69,96,0.4)]"
            aria-label="FitDash home"
          >
            ⚡
          </Link>
          <nav className="flex flex-1 flex-col items-center">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "mb-5 flex h-[50px] w-[50px] items-center justify-center rounded-[15px] text-xl transition-colors",
                    active
                      ? "bg-marine text-white shadow-[0_5px_15px_rgba(22,33,62,0.3)] dark:bg-pink dark:shadow-[0_5px_15px_rgba(233,69,96,0.25)]"
                      : "text-[#9ca3af] hover:bg-slate-100 dark:hover:bg-slate-800",
                  )}
                  aria-label={item.label}
                >
                  <span>{item.icon}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col gap-6 overflow-y-auto pr-2.5">
          {children}
        </section>

        {showRightPanel && (
          <aside className="relative flex min-h-0 flex-col overflow-hidden rounded-[30px] bg-[#f8f9fc] dark:bg-slate-900">
            <div className="relative min-h-0 flex-1 w-full">
              <div className="absolute inset-0 z-0 min-h-[260px] w-full">
                <BodyModelPanel />
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-[#f8f9fc] via-[#f8f9fc]/70 to-transparent dark:from-slate-900 dark:via-slate-900/80"
                aria-hidden
              />
              <div className="pointer-events-auto absolute left-1/2 top-[58%] z-[2] flex w-[80%] -translate-x-1/2 -translate-y-1/2 items-center gap-4 rounded-[20px] bg-white/85 px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-slate-800/92">
                <span className="text-2xl text-pink" aria-hidden>
                  ❤️
                </span>
                <div>
                  <h4 className="text-sm font-bold text-marine dark:text-slate-100">Heart Rate</h4>
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
        )}
      </div>
    </main>
  );
}
