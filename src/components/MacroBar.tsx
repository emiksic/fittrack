import { COLORS } from "@/lib/theme";

export default function MacroBar({
  label,
  valueLabel,
  pct,
  color,
}: {
  label: string;
  valueLabel: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: "#c9c9c9", fontWeight: 500 }}>{label}</span>
        <span style={{ color: COLORS.textMuted }}>{valueLabel}</span>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: COLORS.border, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 5, width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
