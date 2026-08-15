import type { ActivityLevel, GoalType, Meal, Settings, WeightEntry } from "./types";

export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
export const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const DAYS_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const MACRO_COLORS = {
  protein: "#3b82f6",
  carbs: "#22c55e",
  fat: "#f59e0b",
};

export function pad2(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

export function toISO(d: Date): string {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

export function offsetDate(daysAgo: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return toISO(d);
}

export function fmtShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return MONTHS_SHORT[d.getMonth()] + " " + d.getDate();
}

export function fmtFull(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return DAYS_FULL[d.getDay()] + ", " + MONTHS_FULL[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

export function round(n: number): number {
  return Math.round(n);
}

export function todayISO(): string {
  return offsetDate(0);
}

// Monday-start ISO date for the week containing the given date.
export function weekStart(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return toISO(d);
}

export function weekRangeLabel(weekStartIso: string): string {
  const start = new Date(weekStartIso + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}`;
  const endLabel = sameMonth ? `${end.getDate()}` : `${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;
  return `${startLabel}–${endLabel}`;
}

export const GOAL_LABELS: Record<GoalType, string> = {
  maintain: "Maintain weight",
  mild_loss: "Lose weight (mild, ~0.25 kg/week)",
  loss: "Lose weight (~0.5 kg/week)",
  mild_gain: "Gain weight (mild, ~0.25 kg/week)",
  gain: "Gain weight (~0.5 kg/week)",
};

// A 0.5 kg/week change corresponds to roughly a 500 kcal/day deficit or
// surplus (0.45 kg of fat ~= 3500 kcal); mild variants use half that.
const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  maintain: 0,
  mild_loss: -250,
  loss: -500,
  mild_gain: 250,
  gain: 500,
};

const MIN_CALORIES = 1200;

export type Goals = { calories: number; protein: number; carbs: number; fat: number };

export function computeGoals(settings: Settings): Goals {
  const bmr =
    settings.sex === "M"
      ? 10 * settings.weightKg + 6.25 * settings.heightCm - 5 * settings.age + 5
      : 10 * settings.weightKg + 6.25 * settings.heightCm - 5 * settings.age - 161;
  const factor = ACTIVITY_FACTORS[settings.activityLevel] || 1.2;
  const tdee = round(bmr * factor) + GOAL_ADJUSTMENTS[settings.goal];
  const calories = Math.max(MIN_CALORIES, tdee);
  return {
    calories,
    protein: round((calories * 0.3) / 4),
    carbs: round((calories * 0.4) / 4),
    fat: round((calories * 0.3) / 9),
  };
}

export type ChartPoint = { x: number; y: number; val: number };
export type LinePath = { path: string; points: ChartPoint[]; max: number };

export function buildLinePath(
  values: number[],
  width: number,
  height: number,
  padTop: number,
  padBottom: number
): LinePath {
  const max = Math.max(1, ...values);
  const n = values.length;
  const stepX = n > 1 ? width / (n - 1) : 0;
  const usableH = height - padTop - padBottom;
  const points = values.map((v, i) => ({
    x: round(i * stepX),
    y: round(padTop + usableH - (v / max) * usableH),
    val: v,
  }));
  const path = points.map((p, i) => (i === 0 ? "M" : "L") + p.x + " " + p.y).join(" ");
  return { path, points, max };
}

export function paceLabel(durationMin: number, distanceKm: number): string {
  if (!distanceKm) return "-";
  const paceMin = durationMin / distanceKm;
  const m = Math.floor(paceMin);
  const sec = round((paceMin - m) * 60);
  return m + ":" + pad2(sec) + " /km";
}

export function estimateRunCalories(distanceKm: number): number {
  return round(distanceKm * 62);
}

export function sum<T>(arr: T[], key: keyof T): number {
  return arr.reduce((a, m) => a + Number(m[key]), 0);
}

export function trackingStreak(meals: Meal[]): number {
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = offsetDate(i);
    if (meals.some((m) => m.date === d)) streak++;
    else break;
  }
  return streak;
}

export function calorieRingDasharray(consumed: number, goal: number): string {
  const C = 2 * Math.PI * 68;
  const pct = goal > 0 ? Math.min(1, consumed / goal) : 0;
  return round(pct * C) + " " + round(C);
}

export function macroPct(consumed: number, goal: number): number {
  if (!goal) return 0;
  return Math.min(100, round((consumed / goal) * 100));
}

export function weightTrendChart(weights: WeightEntry[]) {
  if (weights.length < 2) {
    return { hasData: false, noData: true, path: "", points: [] as ChartPoint[], firstLabel: "", lastLabel: "" };
  }
  const vals = weights.map((w) => w.weightKg);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const spread = Math.max(0.5, maxV - minV);
  const h = 140, padTop = 10, padBottom = 20, w = 280;
  const stepX = w / (vals.length - 1);
  const points = vals.map((v, i) => ({
    x: round(i * stepX),
    y: round(padTop + (h - padTop - padBottom) - ((v - minV) / spread) * (h - padTop - padBottom)),
    val: v,
  }));
  const path = points.map((p, i) => (i === 0 ? "M" : "L") + p.x + " " + p.y).join(" ");
  return {
    hasData: true,
    noData: false,
    path,
    points,
    firstLabel: weights[0].weightKg + " kg",
    lastLabel: weights[weights.length - 1].weightKg + " kg",
  };
}
