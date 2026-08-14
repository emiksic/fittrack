import { COLORS, FONT_DISPLAY } from "@/lib/theme";
import { calorieRingDasharray } from "@/lib/calc";

export default function CalorieRing({ consumed, goal, remaining }: { consumed: number; goal: number; remaining: number }) {
  const dasharray = calorieRingDasharray(consumed, goal);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <svg width={160} height={160} viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}>
          <circle cx={80} cy={80} r={68} fill="none" stroke={COLORS.border} strokeWidth={14} />
          <circle
            cx={80}
            cy={80}
            r={68}
            fill="none"
            stroke={COLORS.accent}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={dasharray}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: COLORS.text }}>{consumed}</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>/ {goal} kcal</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}>remaining {remaining} kcal</div>
    </div>
  );
}
