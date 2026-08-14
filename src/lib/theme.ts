export const COLORS = {
  bg: "#0a0a0a",
  cardBg: "#141414",
  border: "#232323",
  divider: "#1e1e1e",
  text: "#f2f2f2",
  textMuted: "#8a8a8a",
  textMuted2: "#9a9a9a",
  textDim: "#7a7a7a",
  textFaint: "#666",
  accent: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#f87171",
  inputBg: "#1c1c1c",
  inputBorder: "#2a2a2a",
  chipBg: "#1c1c1c",
  chipText: "#b0b0b0",
} as const;

export const FONT_DISPLAY = "var(--font-space-grotesk), sans-serif";

export const MACRO_COLORS = {
  protein: COLORS.accent,
  carbs: COLORS.green,
  fat: COLORS.amber,
} as const;
