import { Element } from "./types";

export const elementalColorMap: Record<
  Element,
  { dark: string; light: string }
> = {
  fire: { dark: "#FF5722", light: "#fff7ed" },
  earth: { dark: "#937D62", light: "#DFDCC7" },
  air: { dark: "#94a3b8", light: "#f8fafc" },
  water: { dark: "#60a5fa", light: "#eff6ff" },
  summoning: { dark: "#4b5563", light: "#9ca3af" },
  pestilence: { dark: "#65a30d", light: "#a3e635" },
  blood: { dark: "#991b1b", light: "#f87171" },
  bone: { dark: "#9ca3af", light: "#e5e7eb" },
  holy: { dark: "#facc15", light: "#fef9c3" },
  vengeance: { dark: "#94a3b8", light: "#f1f5f9" },
  protection: { dark: "#3b82f6", light: "#bfdbfe" },
  arcane: { dark: "#99e7ff", light: "#e0e7ff" },
  assassination: { dark: "#1e293b", light: "#cbd5e1" },
  beastMastery: { dark: "#854d0e", light: "#fef3c7" },
};
