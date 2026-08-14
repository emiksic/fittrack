"use client";

import { useState } from "react";
import { COLORS } from "@/lib/theme";
import type { ChartPoint } from "@/lib/calc";

export default function ChartPoints({
  points,
  labels,
  viewBoxWidth,
  color,
  formatValue,
}: {
  points: ChartPoint[];
  labels: string[];
  viewBoxWidth: number;
  color: string;
  formatValue: (val: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover !== null ? points[hover] : null;
  const tooltipWidth = 100;
  const tooltipX = active ? Math.min(Math.max(active.x - tooltipWidth / 2, 0), viewBoxWidth - tooltipWidth) : 0;
  const tooltipY = active ? Math.max(active.y - 48, 0) : 0;

  return (
    <>
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
      ))}
      {points.map((p, i) => (
        <circle
          key={"hit-" + i}
          cx={p.x}
          cy={p.y}
          r={10}
          fill="transparent"
          style={{ cursor: "pointer" }}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover((h) => (h === i ? null : h))}
        />
      ))}
      {active && (
        <foreignObject x={tooltipX} y={tooltipY} width={tooltipWidth} height={40} style={{ pointerEvents: "none", overflow: "visible" }}>
          <div
            style={{
              background: "#1c1c1c",
              border: `1px solid ${COLORS.inputBorder}`,
              borderRadius: 8,
              padding: "5px 8px",
              fontSize: 11,
              color: COLORS.text,
              textAlign: "center",
              lineHeight: 1.35,
            }}
          >
            <div style={{ fontWeight: 700 }}>{formatValue(active.val)}</div>
            <div style={{ color: COLORS.textDim }}>{labels[hover as number]}</div>
          </div>
        </foreignObject>
      )}
    </>
  );
}
