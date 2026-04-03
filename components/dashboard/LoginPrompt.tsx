"use client";

import { cn } from "@/lib/utils";

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

export function LoginPrompt({ authError }: { authError?: string }) {
  const bannerError = authErrorMessage(authError);

  return (
    <main className="min-h-screen bg-page-bg text-center text-marine dark:bg-slate-950 dark:text-slate-100">
      <h1 className="mb-6 mt-[20vh] text-3xl font-bold">Welcome to FitDash</h1>
      {bannerError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
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
