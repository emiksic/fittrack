import { NextResponse } from "next/server";
import { fetchAllHevyWorkouts, fetchAllHevyWeightLog, isHevyConfigured } from "@/lib/hevy";
import { upsertWorkouts, upsertWeightEntry } from "@/lib/db";

export async function POST() {
  if (!isHevyConfigured()) {
    return NextResponse.json({ error: "Hevy is not configured." }, { status: 400 });
  }
  const workouts = await fetchAllHevyWorkouts();
  if (workouts === null) {
    return NextResponse.json({ error: "Sync failed." }, { status: 502 });
  }
  await upsertWorkouts(workouts);

  const weightLog = await fetchAllHevyWeightLog();
  if (weightLog) {
    for (const entry of weightLog) {
      await upsertWeightEntry(entry);
    }
  }

  return NextResponse.json({ synced: workouts.length, weightSynced: weightLog?.length ?? 0 });
}
