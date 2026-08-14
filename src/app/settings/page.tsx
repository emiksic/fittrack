"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFitnessData } from "@/context/FitnessDataContext";
import { COLORS, FONT_DISPLAY } from "@/lib/theme";
import { computeGoals } from "@/lib/calc";
import type { ActivityLevel } from "@/lib/types";

const cardStyle: React.CSSProperties = {
  background: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: COLORS.inputBg,
  border: `1px solid ${COLORS.inputBorder}`,
  color: COLORS.text,
  padding: "11px 12px",
  borderRadius: 10,
  fontSize: 14,
};

const fieldLabelStyle: React.CSSProperties = { fontSize: 12, color: COLORS.textMuted, marginBottom: 6 };

export default function SettingsPage() {
  const { loading, settings, updateSettings, logWeightToday, integrations, refreshIntegrations } = useFitnessData();
  const [disconnecting, setDisconnecting] = useState(false);

  if (loading) return <div style={{ color: COLORS.textMuted, padding: "40px 0" }}>Loading…</div>;

  const goals = computeGoals(settings);

  const handleDisconnectStrava = async () => {
    setDisconnecting(true);
    await fetch("/api/strava/disconnect", { method: "POST" });
    await refreshIntegrations();
    setDisconnecting(false);
  };

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, marginBottom: 18 }}>Settings</div>

      <Suspense fallback={null}>
        <IntegrationNotice />
      </Suspense>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16, marginBottom: 16 }}>
        <div style={{ ...cardStyle, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={fieldLabelStyle}>Sex</div>
            <select
              value={settings.sex}
              onChange={(e) => updateSettings({ sex: e.target.value as "M" | "F" })}
              style={inputStyle}
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <div style={fieldLabelStyle}>Age (years)</div>
            <input
              type="number"
              value={settings.age}
              onChange={(e) => updateSettings({ age: Number(e.target.value) || 0 })}
              style={inputStyle}
            />
          </div>
          <div>
            <div style={fieldLabelStyle}>Height (cm)</div>
            <input
              type="number"
              value={settings.heightCm}
              onChange={(e) => updateSettings({ heightCm: Number(e.target.value) || 0 })}
              style={inputStyle}
            />
          </div>
          <div>
            <div style={fieldLabelStyle}>Weight (kg)</div>
            <input
              type="number"
              value={settings.weightKg}
              onChange={(e) => updateSettings({ weightKg: Number(e.target.value) || 0 })}
              style={inputStyle}
            />
          </div>
          <div>
            <div style={fieldLabelStyle}>Activity level</div>
            <select
              value={settings.activityLevel}
              onChange={(e) => updateSettings({ activityLevel: e.target.value as ActivityLevel })}
              style={inputStyle}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly active (1-3x/week)</option>
              <option value="moderate">Moderately active (3-5x/week)</option>
              <option value="active">Very active (6-7x/week)</option>
              <option value="very_active">Extremely active</option>
            </select>
          </div>
          <div
            onClick={logWeightToday}
            style={{
              textAlign: "center",
              background: COLORS.inputBg,
              border: `1px solid ${COLORS.inputBorder}`,
              color: "#c9c9c9",
              fontSize: 13,
              fontWeight: 600,
              padding: 11,
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Log today&apos;s weight to trend
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9", marginBottom: 16 }}>Calculated daily goals (TDEE)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GoalRow label="Calories" value={`${goals.calories} kcal`} />
            <GoalRow label="Protein" value={`${goals.protein} g`} color={COLORS.accent} />
            <GoalRow label="Carbs" value={`${goals.carbs} g`} color={COLORS.green} />
            <GoalRow label="Fat" value={`${goals.fat} g`} color={COLORS.amber} />
          </div>
          <div style={{ fontSize: 12, color: COLORS.textFaint, marginTop: 16, lineHeight: 1.5 }}>
            Calculated with the Mifflin-St Jeor formula multiplied by an activity-level factor. Macro split: 30% protein, 40% carbs, 30% fat.
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#c9c9c9", marginBottom: 16 }}>Connected apps</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: COLORS.inputBg, borderRadius: 12, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Hevy</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                {integrations.hevy.configured
                  ? "Connected via HEVY_API_KEY — workouts are pulled live."
                  : "Not configured. Set HEVY_API_KEY to pull real workouts; showing mock data."}
              </div>
            </div>
            <StatusPill ok={integrations.hevy.configured} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: COLORS.inputBg, borderRadius: 12, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Strava</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                {!integrations.strava.configured
                  ? "Not configured. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET; showing mock data."
                  : integrations.strava.connected
                  ? `Connected${integrations.strava.athleteName ? " as " + integrations.strava.athleteName : ""} — runs are pulled live.`
                  : "Configured, not connected yet. Showing mock data until you connect."}
              </div>
            </div>
            {integrations.strava.configured && !integrations.strava.connected && (
              <a
                href="/api/strava/connect"
                style={{ background: COLORS.accent, color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 10, cursor: "pointer" }}
              >
                Connect Strava
              </a>
            )}
            {integrations.strava.connected && (
              <div
                onClick={handleDisconnectStrava}
                style={{
                  background: COLORS.inputBg,
                  border: `1px solid ${COLORS.inputBorder}`,
                  color: "#c9c9c9",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "9px 16px",
                  borderRadius: 10,
                  cursor: disconnecting ? "default" : "pointer",
                  opacity: disconnecting ? 0.6 : 1,
                }}
              >
                Disconnect
              </div>
            )}
            {!integrations.strava.configured && <StatusPill ok={false} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationNotice() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("strava_connected");
  const error = searchParams.get("strava_error");
  if (!connected && !error) return null;
  return (
    <div
      style={{
        marginBottom: 16,
        padding: "12px 16px",
        borderRadius: 10,
        fontSize: 13,
        background: connected ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
        border: `1px solid ${connected ? COLORS.green : COLORS.red}`,
        color: connected ? COLORS.green : COLORS.red,
      }}
    >
      {connected ? "Strava connected successfully." : `Strava connection failed (${error}).`}
    </div>
  );
}

function GoalRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", background: COLORS.inputBg, borderRadius: 12 }}>
      <span style={{ fontSize: 13, color: "#c9c9c9" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: color || COLORS.text }}>{value}</span>
    </div>
  );
}

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 999,
        background: ok ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
        color: ok ? COLORS.green : COLORS.textMuted,
      }}
    >
      {ok ? "Configured" : "Not configured"}
    </span>
  );
}
