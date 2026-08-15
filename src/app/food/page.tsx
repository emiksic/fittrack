"use client";

import { useFitnessData } from "@/context/FitnessDataContext";
import { useAddMealModal } from "@/context/AddMealModalContext";
import { COLORS, FONT_DISPLAY } from "@/lib/theme";
import { computeGoals, fmtShort, sum, todayISO } from "@/lib/calc";
import type { Meal } from "@/lib/types";

const cardStyle: React.CSSProperties = {
  background: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
};

export default function FoodPage() {
  const { loading, meals, settings, removeMeal } = useFitnessData();
  const { open: openAddMeal } = useAddMealModal();

  if (loading) return <div style={{ color: COLORS.textMuted, padding: "40px 0" }}>Loading…</div>;

  const today = todayISO();
  const goals = computeGoals(settings);
  const todayMealsRaw = meals.filter((m) => m.date === today);
  const consumedCalories = sum(todayMealsRaw, "calories");
  const remaining = Math.max(0, goals.calories - consumedCalories);

  const dateSet = [...new Set(meals.map((m) => m.date))].sort((a, b) => b.localeCompare(a));
  const mealsByDate = dateSet.map((date) => {
    const items = meals.filter((m) => m.date === date).sort((a, b) => a.time.localeCompare(b.time));
    return {
      date,
      label: fmtShort(date) + (date === today ? " · today" : ""),
      total: sum(items, "calories"),
      items,
    };
  });

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, marginBottom: 18 }}>Food</div>

      <div
        style={{
          ...cardStyle,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <SummaryStat label="Consumed today" value={`${consumedCalories} kcal`} />
        <SummaryStat label="Goal" value={`${goals.calories} kcal`} />
        <SummaryStat label="Remaining" value={`${remaining} kcal`} color={COLORS.accent} />
        <div
          onClick={openAddMeal}
          style={{
            alignSelf: "center",
            background: COLORS.accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            height: "fit-content",
          }}
        >
          + Add meal
        </div>
      </div>

      {mealsByDate.map((grp) => (
        <div key={grp.date} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, textTransform: "capitalize", marginBottom: 10 }}>
            {grp.label} · {grp.total} kcal
          </div>
          <div style={{ ...cardStyle, overflow: "hidden" }}>
            {grp.items.map((meal) => (
              <FoodMealRow key={meal.id} meal={meal} onRemove={() => removeMeal(meal.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, marginTop: 2, color: color || COLORS.text }}>{value}</div>
    </div>
  );
}

function FoodMealRow({ meal, onRemove }: { meal: Meal; onRemove: () => void }) {
  const { openEdit } = useAddMealModal();
  return (
    <div
      onClick={() => openEdit(meal)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: `1px solid ${COLORS.divider}`,
        gap: 12,
        cursor: "pointer",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{meal.name}</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
          {meal.time} · P{meal.protein}g C{meal.carbs}g F{meal.fat}g
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{meal.calories} kcal</div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{ color: "#666", cursor: "pointer", fontSize: 13 }}
        >
          Remove
        </div>
      </div>
    </div>
  );
}
