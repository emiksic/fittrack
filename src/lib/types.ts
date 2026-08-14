export type Meal = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // HH:MM
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type WorkoutSet = { reps: number; weight: number };
export type WorkoutExercise = { name: string; sets: WorkoutSet[] };
export type Workout = {
  id: string;
  date: string;
  name: string;
  durationMin: number;
  exercises: WorkoutExercise[];
  source: "mock" | "hevy";
};

export type Run = {
  id: string;
  date: string;
  distanceKm: number;
  durationMin: number;
  source: "mock" | "strava";
};

export type WeightEntry = { date: string; weightKg: number };

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Settings = {
  sex: "M" | "F";
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
};

export type NewMealInput = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type IntegrationStatus = {
  hevy: { configured: boolean };
  strava: { configured: boolean; connected: boolean; athleteName?: string };
};
