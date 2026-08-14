import { NextResponse } from "next/server";
import { fetchHevyWorkouts, isHevyConfigured } from "@/lib/hevy";
import { seedWorkouts } from "@/lib/seed";

export async function GET() {
  if (isHevyConfigured()) {
    const workouts = await fetchHevyWorkouts();
    if (workouts) {
      return NextResponse.json({ workouts, source: "hevy" });
    }
  }
  return NextResponse.json({ workouts: seedWorkouts(), source: "mock" });
}
