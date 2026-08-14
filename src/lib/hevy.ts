import type { Workout, WorkoutExercise } from "./types";

const HEVY_BASE_URL = "https://api.hevyapp.com/v1";

export function isHevyConfigured(): boolean {
  return !!process.env.HEVY_API_KEY;
}

// Shape of the Hevy public API (https://api.hevyapp.com/v1/workouts).
// Documented for Hevy Pro accounts; verify against a live response once
// HEVY_API_KEY is configured, since this is implemented from API docs
// without a live account to test against.
type HevyApiSet = {
  reps?: number | null;
  weight_kg?: number | null;
  duration_seconds?: number | null;
  distance_meters?: number | null;
};

type HevyApiExercise = {
  title: string;
  sets: HevyApiSet[];
};

type HevyApiWorkout = {
  id: string;
  title: string;
  start_time: string; // ISO timestamp
  end_time: string; // ISO timestamp
  exercises: HevyApiExercise[];
};

type HevyApiWorkoutsResponse = {
  page: number;
  page_count: number;
  workouts: HevyApiWorkout[];
};

function mapWorkout(w: HevyApiWorkout): Workout {
  const start = new Date(w.start_time);
  const end = new Date(w.end_time);
  const durationMin = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const exercises: WorkoutExercise[] = w.exercises.map((ex) => ({
    name: ex.title,
    sets: ex.sets.map((s) => ({
      reps: s.reps ?? 0,
      weight: s.weight_kg ?? 0,
      durationSec: s.duration_seconds ?? undefined,
      distanceMeters: s.distance_meters ?? undefined,
    })),
  }));
  const date =
    start.getFullYear() +
    "-" +
    String(start.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(start.getDate()).padStart(2, "0");
  return {
    id: w.id,
    date,
    name: w.title,
    durationMin,
    exercises,
    source: "hevy",
  };
}

// Fetches recent workouts from Hevy. Returns null if not configured or the
// request fails, so callers can fall back to mock data.
export async function fetchHevyWorkouts(limit = 10): Promise<Workout[] | null> {
  const apiKey = process.env.HEVY_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${HEVY_BASE_URL}/workouts?page=1&pageSize=${limit}`, {
      headers: { "api-key": apiKey },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Hevy API error", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as HevyApiWorkoutsResponse;
    return data.workouts.map(mapWorkout);
  } catch (err) {
    console.error("Hevy API request failed", err);
    return null;
  }
}

// Paginates through the full workout history and returns every workout.
// Used for a one-time "sync all history" import into the database, as
// opposed to fetchHevyWorkouts() which only returns the most recent page
// for live display.
export async function fetchAllHevyWorkouts(): Promise<Workout[] | null> {
  const apiKey = process.env.HEVY_API_KEY;
  if (!apiKey) return null;

  try {
    const pageSize = 10; // Hevy API max page size
    const all: Workout[] = [];
    for (let page = 1; ; page++) {
      const res = await fetch(`${HEVY_BASE_URL}/workouts?page=${page}&pageSize=${pageSize}`, {
        headers: { "api-key": apiKey },
        cache: "no-store",
      });
      if (!res.ok) {
        console.error("Hevy API error", res.status, await res.text());
        break;
      }
      const data = (await res.json()) as HevyApiWorkoutsResponse;
      if (data.workouts.length === 0) break;
      all.push(...data.workouts.map(mapWorkout));
      if (page >= data.page_count) break;
    }
    return all;
  } catch (err) {
    console.error("Hevy full sync failed", err);
    return null;
  }
}
