import { NextResponse } from "next/server";
import { getStravaAuthorizeUrl, isStravaConfigured } from "@/lib/strava";

export async function GET() {
  if (!isStravaConfigured()) {
    return NextResponse.json(
      { error: "Strava is not configured. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET." },
      { status: 400 }
    );
  }
  return NextResponse.redirect(getStravaAuthorizeUrl());
}
