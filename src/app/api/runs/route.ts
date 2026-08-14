import { NextResponse } from "next/server";
import { fetchStravaRuns, isStravaConnected } from "@/lib/strava";
import { listRuns } from "@/lib/db";
import { seedRuns } from "@/lib/seed";

export async function GET() {
  if (await isStravaConnected()) {
    const cached = await listRuns("strava");
    if (cached.length > 0) {
      return NextResponse.json({ runs: cached, source: "strava" });
    }
    const runs = await fetchStravaRuns();
    if (runs) {
      return NextResponse.json({ runs, source: "strava" });
    }
  }
  return NextResponse.json({ runs: seedRuns(), source: "mock" });
}
