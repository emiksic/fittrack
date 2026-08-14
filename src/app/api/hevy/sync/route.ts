import { NextResponse } from "next/server";
import { fetchAllHevyWorkouts, isHevyConfigured } from "@/lib/hevy";
import { upsertWorkouts } from "@/lib/db";

export async function POST() {
  if (!isHevyConfigured()) {
    return NextResponse.json({ error: "Hevy is not configured." }, { status: 400 });
  }
  const workouts = await fetchAllHevyWorkouts();
  if (workouts === null) {
    return NextResponse.json({ error: "Sync failed." }, { status: 502 });
  }
  await upsertWorkouts(workouts);
  return NextResponse.json({ synced: workouts.length });
}
