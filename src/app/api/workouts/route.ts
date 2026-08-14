import { NextResponse } from "next/server";
import { fetchHevyWorkouts, isHevyConfigured } from "@/lib/hevy";
import { listWorkouts } from "@/lib/db";
import { seedWorkouts } from "@/lib/seed";

export async function GET() {
  if (isHevyConfigured()) {
    const cached = await listWorkouts("hevy");
    if (cached.length > 0) {
      return NextResponse.json({ workouts: cached, source: "hevy" });
    }
    const workouts = await fetchHevyWorkouts();
    if (workouts) {
      return NextResponse.json({ workouts, source: "hevy" });
    }
  }
  return NextResponse.json({ workouts: seedWorkouts(), source: "mock" });
}
