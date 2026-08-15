"use client";

import { decodePolyline } from "@/lib/polyline";
import { COLORS } from "@/lib/theme";

// Renders a run's GPS route as a simple SVG line — no basemap tiles, since
// that would need a Google Maps/Mapbox API key. Longitude is scaled by
// cos(latitude) so the route isn't stretched east-west.
export default function RouteMap({
  polyline,
  color = COLORS.amber,
  height = 120,
}: {
  polyline: string;
  color?: string;
  height?: number;
}) {
  const points = decodePolyline(polyline);
  if (points.length < 2) return null;

  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const lngScale = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const spanLat = Math.max(maxLat - minLat, 0.0001);
  const spanLng = Math.max((maxLng - minLng) * lngScale, 0.0001);

  const width = 200;
  const padding = 8;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;
  const scale = Math.min(usableW / spanLng, usableH / spanLat);
  const offsetX = padding + (usableW - spanLng * scale) / 2;
  const offsetY = padding + (usableH - spanLat * scale) / 2;

  const projected = points.map(([lat, lng]): [number, number] => [
    offsetX + (lng - minLng) * lngScale * scale,
    offsetY + (maxLat - lat) * scale,
  ]);

  const path = projected.map(([x, y], i) => (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1)).join(" ");
  const [startX, startY] = projected[0];
  const [endX, endY] = projected[projected.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height, display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={startX} cy={startY} r={3} fill={COLORS.green} />
      <circle cx={endX} cy={endY} r={3} fill={COLORS.red} />
    </svg>
  );
}
