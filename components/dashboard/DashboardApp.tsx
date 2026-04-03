"use client";

import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { LoginPrompt } from "@/components/dashboard/LoginPrompt";

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

export function DashboardApp({
  hasSession,
  authError,
  userName,
}: {
  hasSession: boolean;
  authError?: string;
  userName: string;
}) {
  if (!hasSession) {
    return <LoginPrompt authError={authError} />;
  }

  return <HomeDashboard bannerError={authErrorMessage(authError)} userName={userName} />;
}
