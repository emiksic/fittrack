import { NextResponse } from "next/server";
import { fetchStravaRuns, isStravaConnected } from "@/lib/strava";
import { seedRuns } from "@/lib/seed";

export async function GET() {
  if (await isStravaConnected()) {
    const runs = await fetchStravaRuns();
    if (runs) {
      return NextResponse.json({ runs, source: "strava" });
    }
  }
  return NextResponse.json({ runs: seedRuns(), source: "mock" });
}
