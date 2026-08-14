"use client";

import { useState } from "react";
import { useFitnessData } from "@/context/FitnessDataContext";
import { COLORS, FONT_DISPLAY } from "@/lib/theme";
import { fmtShort } from "@/lib/calc";
import type { Workout } from "@/lib/types";

const cardStyle: React.CSSProperties = {
  background: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
};

export default function WorkoutsPage() {
  const { loading, workouts } = useFitnessData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading) return <div style={{ color: COLORS.textMuted, padding: "40px 0" }}>Loading…</div>;

  const workoutsSorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, marginBottom: 18 }}>Workouts</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {workoutsSorted.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            isOpen={selectedId === w.id}
            onToggle={() => setSelectedId((cur) => (cur === w.id ? null : w.id))}
          />
        ))}
      </div>
    </div>
  );
}

function WorkoutCard({ workout, isOpen, onToggle }: { workout: Workout; isOpen: boolean; onToggle: () => void }) {
  const exerciseCount = workout.exercises.length;
  const setCount = workout.exercises.reduce((a, e) => a + e.sets.length, 0);

  return (
    <div style={{ ...cardStyle, overflow: "hidden" }}>
      <div
        onClick={onToggle}
        style={{
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{workout.name}</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>{fmtShort(workout.date)}</div>
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          <Metric label="Duration" value={`${workout.durationMin} min`} />
          <Metric label="Exercises" value={String(exerciseCount)} />
          <Metric label="Sets" value={String(setCount)} />
          <Metric label="Calories" value="~300" />
        </div>
      </div>
      {isOpen && (
        <div style={{ padding: "4px 22px 20px", borderTop: `1px solid ${COLORS.divider}` }}>
          {workout.exercises.map((ex, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{ex.name}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ex.sets.map((s, si) => (
                  <div key={si} style={{ fontSize: 12, color: COLORS.chipText, background: COLORS.chipBg, padding: "5px 10px", borderRadius: 8 }}>
                    Set {si + 1}: {s.reps} × {s.weight === 0 ? "BW" : `${s.weight} kg`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
