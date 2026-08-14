import { offsetDate } from "./calc";
import type { Meal, Run, Workout, WeightEntry } from "./types";

export function seedMeals(): Meal[] {
  const rows: [number, string, string, number, number, number, number][] = [
    [0, "07:30", "Oatmeal with banana", 420, 18, 65, 10],
    [0, "13:00", "Chicken with rice and broccoli", 650, 50, 70, 15],
    [0, "16:30", "Greek yogurt with walnuts", 280, 20, 15, 16],
    [1, "08:00", "Omelet with cheese and spinach", 380, 28, 6, 26],
    [1, "13:30", "Salmon with quinoa", 590, 42, 45, 22],
    [1, "18:00", "Protein shake", 220, 30, 10, 4],
    [1, "20:30", "Pasta bolognese", 610, 32, 70, 20],
    [2, "09:00", "Pancakes with honey", 450, 12, 70, 14],
    [2, "13:00", "Chicken Caesar salad", 520, 40, 20, 28],
    [2, "19:30", "Mushroom risotto", 480, 14, 65, 16],
    [3, "07:45", "Oatmeal with strawberries", 400, 16, 60, 10],
    [3, "12:30", "Turkey with sweet potato", 560, 45, 55, 14],
    [3, "16:00", "Cottage cheese with pineapple", 210, 24, 20, 3],
    [3, "20:00", "Steak with grilled vegetables", 640, 48, 25, 32],
    [4, "08:15", "Muesli with milk", 390, 16, 58, 10],
    [4, "13:00", "Chicken wrap", 480, 35, 45, 16],
    [4, "17:00", "Protein shake with banana", 260, 28, 25, 5],
    [5, "08:30", "Fried eggs with bacon", 420, 24, 4, 32],
    [5, "13:00", "Tuna salad", 380, 36, 15, 18],
    [5, "19:00", "Chicken vegetable stir-fry", 540, 42, 40, 20],
    [6, "07:30", "Oatmeal with banana", 420, 18, 65, 10],
    [6, "12:30", "Chicken sandwich", 460, 30, 45, 16],
    [6, "21:00", "Greek yogurt with honey", 240, 18, 28, 5],
    [8, "13:00", "Tuna sandwich", 410, 28, 40, 14],
    [9, "20:00", "Pizza margherita", 700, 25, 80, 28],
  ];
  return rows.map((r, i) => ({
    id: "m" + i,
    date: offsetDate(r[0]),
    time: r[1],
    name: r[2],
    calories: r[3],
    protein: r[4],
    carbs: r[5],
    fat: r[6],
  }));
}

export function seedWorkouts(): Workout[] {
  const bench = [
    { name: "Bench Press", sets: [{ reps: 8, weight: 60 }, { reps: 8, weight: 60 }, { reps: 7, weight: 60 }, { reps: 6, weight: 60 }] },
    { name: "Overhead Press", sets: [{ reps: 10, weight: 30 }, { reps: 10, weight: 30 }, { reps: 8, weight: 30 }] },
    { name: "Incline Dumbbell Press", sets: [{ reps: 12, weight: 22 }, { reps: 12, weight: 22 }, { reps: 10, weight: 22 }] },
    { name: "Triceps Pushdown", sets: [{ reps: 15, weight: 25 }, { reps: 15, weight: 25 }, { reps: 12, weight: 25 }] },
  ];
  const pull = [
    { name: "Deadlift", sets: [{ reps: 6, weight: 100 }, { reps: 6, weight: 100 }, { reps: 5, weight: 100 }, { reps: 5, weight: 100 }] },
    { name: "Pull-up", sets: [{ reps: 10, weight: 0 }, { reps: 10, weight: 0 }, { reps: 8, weight: 0 }, { reps: 8, weight: 0 }] },
    { name: "Barbell Row", sets: [{ reps: 10, weight: 50 }, { reps: 10, weight: 50 }, { reps: 8, weight: 50 }] },
    { name: "Bicep Curl", sets: [{ reps: 12, weight: 14 }, { reps: 12, weight: 14 }, { reps: 10, weight: 14 }] },
  ];
  const legs = [
    { name: "Squat", sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 80 }, { reps: 7, weight: 80 }, { reps: 6, weight: 80 }] },
    { name: "Leg Press", sets: [{ reps: 12, weight: 120 }, { reps: 12, weight: 120 }, { reps: 10, weight: 120 }] },
    { name: "Romanian Deadlift", sets: [{ reps: 10, weight: 60 }, { reps: 10, weight: 60 }, { reps: 10, weight: 60 }] },
    { name: "Calf Raise", sets: [{ reps: 15, weight: 40 }, { reps: 15, weight: 40 }, { reps: 15, weight: 40 }, { reps: 15, weight: 40 }] },
  ];
  const full = [
    { name: "Squat", sets: [{ reps: 8, weight: 70 }, { reps: 8, weight: 70 }, { reps: 8, weight: 70 }] },
    { name: "Bench Press", sets: [{ reps: 8, weight: 55 }, { reps: 8, weight: 55 }, { reps: 8, weight: 55 }] },
    { name: "Barbell Row", sets: [{ reps: 10, weight: 45 }, { reps: 10, weight: 45 }, { reps: 10, weight: 45 }] },
  ];
  return [
    { id: "w0", date: offsetDate(0), name: "Push Day", durationMin: 58, exercises: bench, source: "mock" },
    { id: "w1", date: offsetDate(2), name: "Pull Day", durationMin: 62, exercises: pull, source: "mock" },
    { id: "w2", date: offsetDate(4), name: "Leg Day", durationMin: 65, exercises: legs, source: "mock" },
    { id: "w3", date: offsetDate(7), name: "Push Day", durationMin: 55, exercises: bench, source: "mock" },
    { id: "w4", date: offsetDate(9), name: "Full Body", durationMin: 50, exercises: full, source: "mock" },
    { id: "w5", date: offsetDate(12), name: "Pull Day", durationMin: 60, exercises: pull, source: "mock" },
  ];
}

export function seedRuns(): Run[] {
  const rows: [number, number, number][] = [
    [1, 5.2, 28],
    [3, 8.0, 44],
    [6, 6.1, 33],
    [10, 10.0, 56],
    [13, 4.0, 21],
  ];
  return rows.map((r, i) => ({
    id: "r" + i,
    date: offsetDate(r[0]),
    distanceKm: r[1],
    durationMin: r[2],
    source: "mock",
  }));
}

export function seedWeightLog(): WeightEntry[] {
  return [
    { date: offsetDate(28), weightKg: 84.2 },
    { date: offsetDate(21), weightKg: 83.8 },
    { date: offsetDate(14), weightKg: 83.3 },
    { date: offsetDate(7), weightKg: 82.9 },
    { date: offsetDate(0), weightKg: 82.4 },
  ];
}
