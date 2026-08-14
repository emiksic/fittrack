import { NextResponse } from "next/server";
import { fetchAllStravaRuns, isStravaConnected } from "@/lib/strava";
import { upsertRuns } from "@/lib/db";

export async function POST() {
  if (!(await isStravaConnected())) {
    return NextResponse.json({ error: "Strava is not connected." }, { status: 400 });
  }
  const runs = await fetchAllStravaRuns();
  if (runs === null) {
    return NextResponse.json({ error: "Sync failed." }, { status: 502 });
  }
  await upsertRuns(runs);
  return NextResponse.json({ synced: runs.length });
}
