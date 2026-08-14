import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/strava";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const settingsUrl = new URL("/settings", request.nextUrl.origin);

  if (error) {
    settingsUrl.searchParams.set("strava_error", error);
    return NextResponse.redirect(settingsUrl);
  }
  if (!code) {
    settingsUrl.searchParams.set("strava_error", "missing_code");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    await exchangeCodeForToken(code);
    settingsUrl.searchParams.set("strava_connected", "1");
  } catch (err) {
    console.error("Strava callback failed", err);
    settingsUrl.searchParams.set("strava_error", "token_exchange_failed");
  }
  return NextResponse.redirect(settingsUrl);
}
