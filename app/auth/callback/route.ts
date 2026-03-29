import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeStravaCode } from "@/lib/strava";

export async function GET(request: Request) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${siteUrl}/?error=strava_denied`);
  }
  if (!code) {
    return NextResponse.redirect(`${siteUrl}/?error=missing_code`);
  }

  try {
    const token = await exchangeStravaCode(code);
    const admin = createAdminClient();

    const { data: row, error: dbError } = await admin
      .from("users")
      .upsert(
        {
          strava_id: token.athlete.id,
          first_name: token.athlete.firstname,
          last_name: token.athlete.lastname,
          profile_pic: token.athlete.profile,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          expires_at: token.expires_at,
        },
        { onConflict: "strava_id" },
      )
      .select("id")
      .single();

    if (dbError || !row) {
      console.error(dbError);
      return NextResponse.redirect(`${siteUrl}/?error=db`);
    }

    const res = NextResponse.redirect(`${siteUrl}/`);
    res.cookies.set("sweat_user_id", row.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${siteUrl}/?error=auth`);
  }
}
