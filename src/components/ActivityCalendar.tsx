"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";
import { MONTHS_FULL, pad2, todayISO } from "@/lib/calc";
import type { Run, Workout } from "@/lib/types";

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ActivityCalendar({ workouts, runs }: { workouts: Workout[]; runs: Run[] }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startDow = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const workoutDates = new Set(workouts.map((w) => w.date));
  const runDates = new Set(runs.map((r) => r.date));
  const todayIso = todayISO();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9" }}>
          {MONTHS_FULL[viewMonth]} {viewYear}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <NavButton label="‹" onClick={goToPrevMonth} />
          <NavButton label="›" onClick={goToNextMonth} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
        {DOW_LABELS.map((d) => (
          <div key={d} style={{ fontSize: 10, color: COLORS.textFaint, textAlign: "center" }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
          const hasWorkout = workoutDates.has(dateStr);
          const hasRun = runDates.has(dateStr);
          const isToday = dateStr === todayIso;
          return (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                background: isToday ? COLORS.inputBg : "transparent",
                border: `1px solid ${isToday ? COLORS.inputBorder : "transparent"}`,
                fontSize: 11,
                color: isToday ? COLORS.text : COLORS.textMuted,
              }}
            >
              <div>{day}</div>
              <div style={{ display: "flex", gap: 3, marginTop: 3, height: 5 }}>
                {hasWorkout && <span style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.accent }} />}
                {hasRun && <span style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS.amber }} />}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 12, color: COLORS.textMuted }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent }} />
          Workout
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.amber }} />
          Run
        </div>
      </div>
    </div>
  );
}

function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        background: COLORS.inputBg,
        border: `1px solid ${COLORS.inputBorder}`,
        color: COLORS.textMuted2,
        fontSize: 14,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
}
