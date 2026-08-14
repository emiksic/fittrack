"use client";

import { useFitnessData } from "@/context/FitnessDataContext";
import { useAddMealModal } from "@/context/AddMealModalContext";
import { COLORS, FONT_DISPLAY, MACRO_COLORS } from "@/lib/theme";
import {
  computeGoals,
  fmtFull,
  fmtShort,
  macroPct,
  paceLabel,
  estimateRunCalories,
  sum,
  todayISO,
  trackingStreak,
} from "@/lib/calc";
import CalorieRing from "@/components/CalorieRing";
import MacroBar from "@/components/MacroBar";

const cardStyle: React.CSSProperties = {
  background: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
};

export default function DashboardPage() {
  const { loading, meals, workouts, runs, settings } = useFitnessData();
  const { open: openAddMeal } = useAddMealModal();

  if (loading) return <div style={{ color: COLORS.textMuted, padding: "40px 0" }}>Loading…</div>;

  const today = todayISO();
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const goals = computeGoals(settings);

  const todayMealsRaw = meals.filter((m) => m.date === today);
  const consumed = {
    calories: sum(todayMealsRaw, "calories"),
    protein: sum(todayMealsRaw, "protein"),
    carbs: sum(todayMealsRaw, "carbs"),
    fat: sum(todayMealsRaw, "fat"),
  };
  const todayMeals = [...todayMealsRaw].sort((a, b) => a.time.localeCompare(b.time));

  const remaining = Math.max(0, goals.calories - consumed.calories);

  const macros = [
    { label: "Protein", consumed: consumed.protein, goal: goals.protein, color: MACRO_COLORS.protein },
    { label: "Carbs", consumed: consumed.carbs, goal: goals.carbs, color: MACRO_COLORS.carbs },
    { label: "Fat", consumed: consumed.fat, goal: goals.fat, color: MACRO_COLORS.fat },
  ];

  const todayWorkouts = workouts.filter((w) => w.date === today);
  const statBurned = todayWorkouts.length * 300;
  const statActiveMin = sum(todayWorkouts, "durationMin");
  const statStreak = trackingStreak(meals);

  const workoutsSorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  const runsSorted = [...runs].sort((a, b) => b.date.localeCompare(a.date));

  const lastW = workoutsSorted[0];
  const lastWorkout = lastW
    ? {
        name: lastW.name,
        dateLabel: fmtShort(lastW.date),
        durationMin: lastW.durationMin,
        exerciseCount: lastW.exercises.length,
        setCount: lastW.exercises.reduce((a, e) => a + e.sets.length, 0),
        calories: 300,
      }
    : { name: "-", dateLabel: "-", durationMin: 0, exerciseCount: 0, setCount: 0, calories: 0 };

  const lastR = runsSorted[0];
  const lastRun = lastR
    ? {
        distanceKm: lastR.distanceKm,
        dateLabel: fmtShort(lastR.date),
        durationLabel: Math.floor(lastR.durationMin) + " min",
        paceLabel: paceLabel(lastR.durationMin, lastR.distanceKm),
        calories: estimateRunCalories(lastR.distanceKm),
      }
    : { distanceKm: 0, dateLabel: "-", durationLabel: "-", paceLabel: "-", calories: 0 };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600, color: COLORS.text }}>{greeting}</div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4, textTransform: "capitalize" }}>{fmtFull(today)}</div>
      </div>

      {/* Today summary card */}
      <div style={{ ...cardStyle, padding: 28, display: "flex", gap: 36, flexWrap: "wrap", alignItems: "center" }}>
        <CalorieRing consumed={consumed.calories} goal={goals.calories} remaining={remaining} />
        <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 16 }}>
          {macros.map((m) => (
            <MacroBar
              key={m.label}
              label={m.label}
              valueLabel={`${m.consumed}g / ${m.goal}g`}
              pct={macroPct(m.consumed, m.goal)}
              color={m.color}
            />
          ))}
        </div>
      </div>

      {/* Stat blocks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14, marginTop: 16 }}>
        <div style={{ ...cardStyle, padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Burned by training</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600 }}>{statBurned} kcal</div>
        </div>
        <div style={{ ...cardStyle, padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Active minutes</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600 }}>{statActiveMin} min</div>
        </div>
        <div style={{ ...cardStyle, padding: "18px 20px" }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Tracking streak</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600 }}>{statStreak} days</div>
        </div>
      </div>

      {/* Today food */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600 }}>Today&apos;s meals</div>
          <div
            onClick={openAddMeal}
            style={{ background: COLORS.accent, color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 10, cursor: "pointer" }}
          >
            + Add meal
          </div>
        </div>
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          {todayMeals.length > 0 ? (
            todayMeals.map((meal) => <MealRow key={meal.id} meal={meal} />)
          ) : (
            <div style={{ padding: "28px 20px", textAlign: "center", color: COLORS.textFaint, fontSize: 14 }}>No entries yet today.</div>
          )}
        </div>
      </div>

      {/* Last workout + last run */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16, marginTop: 32 }}>
        <div style={{ ...cardStyle, padding: 22 }}>
          <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>
            Last workout
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{lastWorkout.name}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>{lastWorkout.dateLabel}</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Metric label="Duration" value={`${lastWorkout.durationMin} min`} />
            <Metric label="Exercises" value={String(lastWorkout.exerciseCount)} />
            <Metric label="Sets" value={String(lastWorkout.setCount)} />
            <Metric label="Calories" value={`~${lastWorkout.calories}`} />
          </div>
        </div>
        <div style={{ ...cardStyle, padding: 22 }}>
          <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>
            Last run
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{lastRun.distanceKm} km run</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>{lastRun.dateLabel}</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Metric label="Time" value={lastRun.durationLabel} />
            <Metric label="Pace" value={lastRun.paceLabel} />
            <Metric label="Calories" value={`~${lastRun.calories}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function MealRow({ meal }: { meal: { id: string; name: string; time: string; protein: number; carbs: number; fat: number; calories: number } }) {
  const { removeMeal } = useFitnessData();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: `1px solid ${COLORS.divider}`,
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text }}>{meal.name}</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
          {meal.time} · P{meal.protein} C{meal.carbs} F{meal.fat}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{meal.calories} kcal</div>
        <div onClick={() => removeMeal(meal.id)} style={{ color: "#666", cursor: "pointer", fontSize: 13 }}>
          Remove
        </div>
      </div>
    </div>
  );
}
