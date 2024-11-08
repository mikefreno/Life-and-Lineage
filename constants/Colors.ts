import { Element, PlayerClassOptions } from "../utility/types";

const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

export default {
  light: {
    text: "#000",
    background: "#fafafa",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
    accent: "#fafafa",
  },
  dark: {
    text: "#fff",
    background: "#09090b",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
    accent: "#18181b",
  },
};

export const elementalColorMap: Record<
  Element,
  { dark: string; light: string }
> = {
  [Element.fire]: { dark: "#FF5722", light: "#fff7ed" },
  [Element.earth]: { dark: "#937D62", light: "#DFDCC7" },
  [Element.air]: { dark: "#94a3b8", light: "#f8fafc" },
  [Element.water]: { dark: "#60a5fa", light: "#eff6ff" },
  [Element.summoning]: { dark: "#4b5563", light: "#9ca3af" },
  [Element.pestilence]: { dark: "#65a30d", light: "#a3e635" },
  [Element.blood]: { dark: "#991b1b", light: "#f87171" },
  [Element.bone]: { dark: "#9ca3af", light: "#e5e7eb" },
  [Element.holy]: { dark: "#facc15", light: "#fef9c3" },
  [Element.vengeance]: { dark: "#94a3b8", light: "#f1f5f9" },
  [Element.protection]: { dark: "#3b82f6", light: "#bfdbfe" },
  [Element.arcane]: { dark: "#06b6d4", light: "#99e7ff" },
  [Element.assassination]: { dark: "#1e293b", light: "#cbd5e1" },
  [Element.beastMastery]: { dark: "#854d0e", light: "#fef3c7" },
};

export const playerClassColors: Record<PlayerClassOptions, string> = {
  mage: "#2563eb",
  necromancer: "#9333ea",
  ranger: "#15803d",
  paladin: "#fcd34d",
};
