"use client";

import { useState } from "react";
import { useFitnessData } from "@/context/FitnessDataContext";
import { COLORS, FONT_DISPLAY, MACRO_COLORS } from "@/lib/theme";
import { buildLinePath, computeGoals, fmtShort, macroPct, offsetDate, round, sum, weightTrendChart } from "@/lib/calc";
import MacroBar from "@/components/MacroBar";

const cardStyle: React.CSSProperties = {
  background: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
};

export default function StatsPage() {
  const { loading, meals, weightLog, settings } = useFitnessData();
  const [range, setRange] = useState<7 | 30>(7);

  if (loading) return <div style={{ color: COLORS.textMuted, padding: "40px 0" }}>Loading…</div>;

  const goals = computeGoals(settings);
  const rangeDates: string[] = [];
  for (let i = range - 1; i >= 0; i--) rangeDates.push(offsetDate(i));

  const dailyCals = rangeDates.map((d) => sum(meals.filter((m) => m.date === d), "calories"));
  const calChartRaw = buildLinePath(dailyCals, 640, 190, 10, 20);
  const chartH = 190, padTop = 10, padBottom = 20;
  const goalYRaw = round(padTop + (chartH - padTop - padBottom) - (goals.calories / calChartRaw.max) * (chartH - padTop - padBottom));
  const goalY = Math.max(10, Math.min(170, goalYRaw));

  const rangeMeals = meals.filter((m) => rangeDates.includes(m.date));
  const totalProtein = sum(rangeMeals, "protein");
  const totalCarbs = sum(rangeMeals, "carbs");
  const totalFat = sum(rangeMeals, "fat");
  const avgMacros = [
    { label: "Protein", value: round(totalProtein / range), goal: goals.protein, color: MACRO_COLORS.protein },
    { label: "Carbs", value: round(totalCarbs / range), goal: goals.carbs, color: MACRO_COLORS.carbs },
    { label: "Fat", value: round(totalFat / range), goal: goals.fat, color: MACRO_COLORS.fat },
  ];

  const rangeWeights = weightLog.filter((w) => rangeDates.includes(w.date)).sort((a, b) => a.date.localeCompare(b.date));
  const weightChart = weightTrendChart(rangeWeights);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600 }}>Statistics</div>
        <div style={{ display: "flex", gap: 6, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 4 }}>
          <RangeButton label="7 days" active={range === 7} onClick={() => setRange(7)} />
          <RangeButton label="30 days" active={range === 30} onClick={() => setRange(30)} />
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9", marginBottom: 14 }}>Calories over time</div>
        <svg viewBox="0 0 640 190" style={{ width: "100%", height: 190, overflow: "visible" }}>
          <line x1={0} y1={goalY} x2={640} y2={goalY} stroke="#3b3b3b" strokeWidth={1} strokeDasharray="4 4" />
          <path d={calChartRaw.path} fill="none" stroke={COLORS.accent} strokeWidth={2.5} />
          {calChartRaw.points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={COLORS.accent} />
          ))}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textDim, marginTop: 6 }}>
          <span>{fmtShort(rangeDates[0])}</span>
          <span>goal {goals.calories} kcal/day</span>
          <span>{fmtShort(rangeDates[rangeDates.length - 1])}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16 }}>
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9", marginBottom: 14 }}>Average daily macro intake</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {avgMacros.map((m) => (
              <MacroBar key={m.label} label={m.label} valueLabel={`${m.value}g`} pct={macroPct(m.value, m.goal)} color={m.color} />
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9", marginBottom: 14 }}>Weight trend</div>
          {weightChart.hasData ? (
            <>
              <svg viewBox="0 0 280 140" style={{ width: "100%", height: 140, overflow: "visible" }}>
                <path d={weightChart.path} fill="none" stroke={COLORS.green} strokeWidth={2.5} />
                {weightChart.points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={COLORS.green} />
                ))}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textDim, marginTop: 6 }}>
                <span>{weightChart.firstLabel}</span>
                <span>{weightChart.lastLabel}</span>
              </div>
            </>
          ) : (
            <div style={{ color: COLORS.textFaint, fontSize: 13, padding: "30px 0", textAlign: "center" }}>
              Not enough data for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RangeButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "7px 14px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        background: active ? COLORS.accent : "transparent",
        color: active ? "#fff" : COLORS.textMuted2,
      }}
    >
      {label}
    </div>
  );
}
