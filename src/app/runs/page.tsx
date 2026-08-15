"use client";

import { useState } from "react";
import { useFitnessData } from "@/context/FitnessDataContext";
import { COLORS, FONT_DISPLAY } from "@/lib/theme";
import { estimateRunCalories, fmtShort, paceLabel } from "@/lib/calc";
import RouteMap from "@/components/RouteMap";
import type { Run } from "@/lib/types";

const cardStyle: React.CSSProperties = {
  background: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
};

export default function RunsPage() {
  const { loading, runs } = useFitnessData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (loading) return <div style={{ color: COLORS.textMuted, padding: "40px 0" }}>Loading…</div>;

  const runsSorted = [...runs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, marginBottom: 18 }}>Runs</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {runsSorted.map((r) => (
          <RunCard
            key={r.id}
            run={r}
            isOpen={selectedId === r.id}
            onToggle={() => setSelectedId((cur) => (cur === r.id ? null : r.id))}
          />
        ))}
      </div>
    </div>
  );
}

function RunCard({ run: r, isOpen, onToggle }: { run: Run; isOpen: boolean; onToggle: () => void }) {
  const stravaUrl = r.source === "strava" ? `https://www.strava.com/activities/${r.id.replace(/^strava-/, "")}` : null;
  const hasDetails = !!(stravaUrl || r.polyline);

  return (
    <div style={{ ...cardStyle, overflow: "hidden" }}>
      <div
        onClick={hasDetails ? onToggle : undefined}
        style={{
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: hasDetails ? "pointer" : "default",
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
      {isOpen && hasDetails && (
        <div style={{ padding: "4px 22px 20px", borderTop: `1px solid ${COLORS.divider}` }}>
          {r.polyline && (
            <div style={{ marginTop: 14, background: COLORS.inputBg, borderRadius: 12, padding: 10, maxWidth: 320 }}>
              <RouteMap polyline={r.polyline} />
            </div>
          )}
          {stravaUrl && (
            <a
              href={stravaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-block",
                marginTop: 14,
                fontSize: 13,
                color: COLORS.accent,
                fontWeight: 600,
              }}
            >
              View on Strava ↗
            </a>
          )}
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
