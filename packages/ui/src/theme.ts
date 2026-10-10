export type ThemePreference = "system" | "light" | "dark";
export const lightColors = {
  background: "#F8FAFC", surface: "#FFFFFF", surfaceElevated: "#FFFFFF",
  text: "#0F172A", textSecondary: "#64748B", border: "#E2E8F0",
  primary: "#2563EB", primaryPressed: "#1D4ED8", primarySoft: "#DBEAFE",
  onPrimarySoft: "#1D4ED8", input: "#FFFFFF", placeholder: "#94A3B8",
  divider: "#F1F5F9", success: "#15803D", warning: "#B45309",
  danger: "#DC2626", overlay: "rgba(15, 23, 42, 0.08)",
};
export const darkColors = {
  background: "#080F20", surface: "#111C33", surfaceElevated: "#182641",
  text: "#F1F5F9", textSecondary: "#B6C2D5", border: "#2A3955",
  primary: "#818CF8", primaryPressed: "#A5B4FC", primarySoft: "#27345C",
  onPrimarySoft: "#C7D2FE", input: "#111C33", placeholder: "#8796B0",
  divider: "#26344D", success: "#4ADE80", warning: "#FBBF24",
  danger: "#F87171", overlay: "rgba(0, 0, 0, 0.24)",
};
export type PravaasColors = typeof lightColors;
