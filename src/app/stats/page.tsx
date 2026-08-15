"use client";

import { useState } from "react";
import { useFitnessData } from "@/context/FitnessDataContext";
import { COLORS, FONT_DISPLAY, MACRO_COLORS } from "@/lib/theme";
import {
  buildLinePath,
  computeGoals,
  estimateRunCalories,
  fmtShort,
  macroPct,
  offsetDate,
  paceLabel,
  round,
  sum,
  toISO,
  todayISO,
  weekRangeLabel,
  weekStart,
  weightTrendChart,
} from "@/lib/calc";
import MacroBar from "@/components/MacroBar";
import ChartPoints from "@/components/ChartPoints";
import ActivityCalendar from "@/components/ActivityCalendar";

const cardStyle: React.CSSProperties = {
  background: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
};

export default function StatsPage() {
  const { loading, meals, weightLog, settings, runs, workouts } = useFitnessData();
  const [range, setRange] = useState<7 | 30>(30);

  if (loading) return <div style={{ color: COLORS.textMuted, padding: "40px 0" }}>Loading…</div>;

  const goals = computeGoals(settings);
  const rangeDates: string[] = [];
  for (let i = range - 1; i >= 0; i--) rangeDates.push(offsetDate(i));

  const rangeDateLabels = rangeDates.map(fmtShort);

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
  const weightDateLabels = rangeWeights.map((w) => fmtShort(w.date));

  const rangeRuns = runs.filter((r) => rangeDates.includes(r.date));
  const totalDistance = round(sum(rangeRuns, "distanceKm") * 10) / 10;
  const totalRunTime = sum(rangeRuns, "durationMin");
  const runCalories = rangeRuns.reduce((a, r) => a + estimateRunCalories(r.distanceKm), 0);
  const dailyDistance = rangeDates.map((d) => sum(runs.filter((r) => r.date === d), "distanceKm"));
  const distanceChart = buildLinePath(dailyDistance, 640, 190, 10, 20);

  const rangeWorkouts = workouts.filter((w) => rangeDates.includes(w.date));
  const totalWorkoutTime = sum(rangeWorkouts, "durationMin");
  const totalSets = rangeWorkouts.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0), 0);
  const dailyWorkoutMin = rangeDates.map((d) => sum(workouts.filter((w) => w.date === d), "durationMin"));
  const workoutChart = buildLinePath(dailyWorkoutMin, 640, 190, 10, 20);

  const WEEKS_TO_SHOW = 8;
  const thisWeekStart = new Date(weekStart(todayISO()) + "T00:00:00");
  const weekStarts: string[] = [];
  for (let i = WEEKS_TO_SHOW - 1; i >= 0; i--) {
    const d = new Date(thisWeekStart);
    d.setDate(d.getDate() - i * 7);
    weekStarts.push(toISO(d));
  }
  const weeklyStats = weekStarts.map((ws) => {
    const end = new Date(ws + "T00:00:00");
    end.setDate(end.getDate() + 6);
    const endIso = toISO(end);
    const inWeek = (d: string) => d >= ws && d <= endIso;
    return {
      weekStart: ws,
      workouts: workouts.filter((w) => inWeek(w.date)).length,
      runs: runs.filter((r) => inWeek(r.date)).length,
    };
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600 }}>Statistics</div>
        <div style={{ display: "flex", gap: 6, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 4 }}>
          <RangeButton label="7 days" active={range === 7} onClick={() => setRange(7)} />
          <RangeButton label="30 days" active={range === 30} onClick={() => setRange(30)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16, marginBottom: 16 }}>
        <div style={{ ...cardStyle, padding: 24 }}>
          <ActivityCalendar workouts={workouts} runs={runs} />
        </div>
        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9", marginBottom: 14 }}>Weekly activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weeklyStats.map((w) => (
              <div
                key={w.weekStart}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: COLORS.inputBg,
                  borderRadius: 10,
                  padding: "9px 14px",
                }}
              >
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                  {w.weekStart === weekStarts[weekStarts.length - 1] ? "This week" : weekRangeLabel(w.weekStart)}
                </span>
                <span style={{ fontSize: 12, display: "flex", gap: 14 }}>
                  <span style={{ color: COLORS.accent, fontWeight: 600 }}>{w.workouts} workouts</span>
                  <span style={{ color: COLORS.amber, fontWeight: 600 }}>{w.runs} runs</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9", marginBottom: 14 }}>Calories over time</div>
        <svg viewBox="0 0 640 190" style={{ width: "100%", height: 190, overflow: "visible" }}>
          <line x1={0} y1={goalY} x2={640} y2={goalY} stroke="#3b3b3b" strokeWidth={1} strokeDasharray="4 4" />
          <path d={calChartRaw.path} fill="none" stroke={COLORS.accent} strokeWidth={2.5} />
          <ChartPoints
            points={calChartRaw.points}
            labels={rangeDateLabels}
            viewBoxWidth={640}
            color={COLORS.accent}
            formatValue={(v) => `${v} kcal`}
          />
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
                <ChartPoints
                  points={weightChart.points}
                  labels={weightDateLabels}
                  viewBoxWidth={280}
                  color={COLORS.green}
                  formatValue={(v) => `${v} kg`}
                />
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

      <div style={{ ...cardStyle, padding: 24, marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9", marginBottom: 14 }}>Running distance over time</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 14, marginBottom: 18 }}>
          <StatBlock label="Total distance" value={`${totalDistance} km`} />
          <StatBlock label="Runs" value={String(rangeRuns.length)} />
          <StatBlock label="Total time" value={`${totalRunTime} min`} />
          <StatBlock label="Avg pace" value={paceLabel(totalRunTime, totalDistance)} />
          <StatBlock label="Calories burned" value={`~${runCalories}`} />
        </div>
        {rangeRuns.length > 0 ? (
          <>
            <svg viewBox="0 0 640 190" style={{ width: "100%", height: 190, overflow: "visible" }}>
              <path d={distanceChart.path} fill="none" stroke={COLORS.amber} strokeWidth={2.5} />
              <ChartPoints
                points={distanceChart.points}
                labels={rangeDateLabels}
                viewBoxWidth={640}
                color={COLORS.amber}
                formatValue={(v) => `${round(v * 10) / 10} km`}
              />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textDim, marginTop: 6 }}>
              <span>{fmtShort(rangeDates[0])}</span>
              <span>{fmtShort(rangeDates[rangeDates.length - 1])}</span>
            </div>
          </>
        ) : (
          <div style={{ color: COLORS.textFaint, fontSize: 13, padding: "30px 0", textAlign: "center" }}>
            No runs in the selected period.
          </div>
        )}
      </div>

      <div style={{ ...cardStyle, padding: 24, marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9", marginBottom: 14 }}>Workout time over time</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 14, marginBottom: 18 }}>
          <StatBlock label="Workouts" value={String(rangeWorkouts.length)} />
          <StatBlock label="Total time" value={`${totalWorkoutTime} min`} />
          <StatBlock label="Total sets" value={String(totalSets)} />
          <StatBlock
            label="Avg duration"
            value={rangeWorkouts.length ? `${round(totalWorkoutTime / rangeWorkouts.length)} min` : "-"}
          />
        </div>
        {rangeWorkouts.length > 0 ? (
          <>
            <svg viewBox="0 0 640 190" style={{ width: "100%", height: 190, overflow: "visible" }}>
              <path d={workoutChart.path} fill="none" stroke={COLORS.accent} strokeWidth={2.5} />
              <ChartPoints
                points={workoutChart.points}
                labels={rangeDateLabels}
                viewBoxWidth={640}
                color={COLORS.accent}
                formatValue={(v) => `${v} min`}
              />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textDim, marginTop: 6 }}>
              <span>{fmtShort(rangeDates[0])}</span>
              <span>{fmtShort(rangeDates[rangeDates.length - 1])}</span>
            </div>
          </>
        ) : (
          <div style={{ color: COLORS.textFaint, fontSize: 13, padding: "30px 0", textAlign: "center" }}>
            No workouts in the selected period.
          </div>
        )}
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: COLORS.inputBg, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600 }}>{value}</div>
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
