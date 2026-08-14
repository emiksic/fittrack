"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import type {
  Meal,
  Workout,
  Run,
  WeightEntry,
  Settings,
  NewMealInput,
  IntegrationStatus,
} from "@/lib/types";

type FitnessData = {
  loading: boolean;
  meals: Meal[];
  workouts: Workout[];
  workoutsSource: "mock" | "hevy";
  runs: Run[];
  runsSource: "mock" | "strava";
  weightLog: WeightEntry[];
  settings: Settings;
  integrations: IntegrationStatus;
  addMeal: (input: NewMealInput) => Promise<{ ok: boolean; error?: string }>;
  removeMeal: (id: string) => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  logWeightToday: () => Promise<void>;
  refreshIntegrations: () => Promise<void>;
};

const DEFAULT_SETTINGS: Settings = {
  sex: "M",
  age: 29,
  heightCm: 180,
  weightKg: 82.4,
  activityLevel: "moderate",
  goal: "maintain",
};

const DEFAULT_INTEGRATIONS: IntegrationStatus = {
  hevy: { configured: false },
  strava: { configured: false, connected: false },
};

const FitnessDataContext = createContext<FitnessData | null>(null);

export function FitnessDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutsSource, setWorkoutsSource] = useState<"mock" | "hevy">("mock");
  const [runs, setRuns] = useState<Run[]>([]);
  const [runsSource, setRunsSource] = useState<"mock" | "strava">("mock");
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [integrations, setIntegrations] = useState<IntegrationStatus>(DEFAULT_INTEGRATIONS);

  useEffect(() => {
    if (pathname === "/login") return;
    let cancelled = false;
    (async () => {
      const [mealsRes, settingsRes, weightRes, workoutsRes, runsRes, integrationsRes] = await Promise.all([
        fetch("/api/meals").then((r) => r.json()),
        fetch("/api/settings").then((r) => r.json()),
        fetch("/api/weight").then((r) => r.json()),
        fetch("/api/workouts").then((r) => r.json()),
        fetch("/api/runs").then((r) => r.json()),
        fetch("/api/integrations/status").then((r) => r.json()),
      ]);
      if (cancelled) return;
      setMeals(mealsRes.meals);
      setSettings(settingsRes.settings);
      setWeightLog(weightRes.weightLog);
      setWorkouts(workoutsRes.workouts);
      setWorkoutsSource(workoutsRes.source);
      setRuns(runsRes.runs);
      setRunsSource(runsRes.source);
      setIntegrations(integrationsRes);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addMeal = useCallback(async (input: NewMealInput) => {
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error || "Could not save meal." };
    }
    const data = await res.json();
    setMeals((prev) => [...prev, data.meal]);
    return { ok: true };
  }, []);

  const removeMeal = useCallback(async (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/meals?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }, []);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const data = await res.json();
    setSettings(data.settings);
  }, []);

  const logWeightToday = useCallback(async () => {
    const today = new Date();
    const iso =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: iso, weightKg: settings.weightKg }),
    });
    const data = await res.json();
    setWeightLog(data.weightLog);
  }, [settings.weightKg]);

  const refreshIntegrations = useCallback(async () => {
    const [integrationsRes, runsRes, workoutsRes, weightRes] = await Promise.all([
      fetch("/api/integrations/status").then((r) => r.json()),
      fetch("/api/runs").then((r) => r.json()),
      fetch("/api/workouts").then((r) => r.json()),
      fetch("/api/weight").then((r) => r.json()),
    ]);
    setIntegrations(integrationsRes);
    setRuns(runsRes.runs);
    setRunsSource(runsRes.source);
    setWorkouts(workoutsRes.workouts);
    setWorkoutsSource(workoutsRes.source);
    setWeightLog(weightRes.weightLog);
  }, []);

  const value = useMemo<FitnessData>(
    () => ({
      loading,
      meals,
      workouts,
      workoutsSource,
      runs,
      runsSource,
      weightLog,
      settings,
      integrations,
      addMeal,
      removeMeal,
      updateSettings,
      logWeightToday,
      refreshIntegrations,
    }),
    [
      loading,
      meals,
      workouts,
      workoutsSource,
      runs,
      runsSource,
      weightLog,
      settings,
      integrations,
      addMeal,
      removeMeal,
      updateSettings,
      logWeightToday,
      refreshIntegrations,
    ]
  );

  return <FitnessDataContext.Provider value={value}>{children}</FitnessDataContext.Provider>;
}

export function useFitnessData(): FitnessData {
  const ctx = useContext(FitnessDataContext);
  if (!ctx) throw new Error("useFitnessData must be used within FitnessDataProvider");
  return ctx;
}
