"use client";

import { useFitnessData } from "@/context/FitnessDataContext";
import { COLORS, FONT_DISPLAY } from "@/lib/theme";
import { estimateRunCalories, fmtShort, paceLabel } from "@/lib/calc";

const cardStyle: React.CSSProperties = {
  background: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
};

export default function RunsPage() {
  const { loading, runs } = useFitnessData();

  if (loading) return <div style={{ color: COLORS.textMuted, padding: "40px 0" }}>Loading…</div>;

  const runsSorted = [...runs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, marginBottom: 18 }}>Runs</div>
      <div style={{ ...cardStyle, overflow: "hidden" }}>
        {runsSorted.map((r) => (
          <div
            key={r.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 22px",
              borderBottom: `1px solid ${COLORS.divider}`,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {r.indoor ? `${Math.floor(r.durationMin)} min treadmill run` : `${r.distanceKm} km run`}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>{fmtShort(r.date)}</div>
            </div>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              <Metric label="Time" value={`${Math.floor(r.durationMin)} min`} />
              {!r.indoor && <Metric label="Pace" value={paceLabel(r.durationMin, r.distanceKm)} />}
              <Metric label="Calories" value={`~${estimateRunCalories(r.distanceKm)}`} />
            </div>
          </div>
        ))}
      </div>
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
