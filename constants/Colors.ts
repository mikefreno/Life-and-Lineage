import type { Theme } from "@react-navigation/native";
import {
  Element,
  MerchantType,
  PlayerClassOptions,
  Rarity,
} from "../utility/types";
import { ColorValue } from "react-native";

// Core colors
const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";
const defaultTab = "#ccc";

// Light theme colors
const lightBackground = "#fafafa";
const lightText = "#000";
const lightBorder = "#27272a";

// Dark theme colors
const darkBackground = "#09090b";
const darkCard = "#18181b";
const darkText = "#fff";
const darkBorder = "#fafafa";

export default {
  light: {
    text: lightText,
    border: lightBorder,
    background: lightBackground,
    tint: tintColorLight,
    tabIconDefault: defaultTab,
    tabIconSelected: tintColorLight,
    accent: lightBackground,
    card: "#ffffff",
    secondary: "#d4d4d8",
    error: "#ef4444",
    interactive: "#3b82f6",
    interactiveStrong: "#2563eb",
    shadow: "#000000",
    dimmed: "rgba(0,0,0,0.5)",
    health: "#f87171",
    mana: "#60a5fa",
    sanity: "#c084fc",
    success: "#22c55e",
  },
  dark: {
    text: darkText,
    border: darkBorder,
    background: darkBackground,
    tint: tintColorDark,
    tabIconDefault: defaultTab,
    tabIconSelected: tintColorDark,
    accent: darkCard,
    card: "#18181b",
    secondary: "#3f3f46",
    error: "#ef4444",
    interactive: "#2563eb",
    interactiveStrong: "#1d4ed8",
    shadow: "#000000",
    dimmed: "rgba(0,0,0,0.5)",
    health: "#991b1b",
    mana: "#1e40af",
    sanity: "#6b21a8",
    success: "#22c55e",
  },
};

export const LightTheme: Theme = {
  dark: false,
  fonts: {
    regular: {
      fontFamily: "PixelifySans",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "PixelifySans",
      fontWeight: "normal",
    },
    bold: {
      fontFamily: "PixelifySans",
      fontWeight: "normal",
    },
    heavy: {
      fontFamily: "PixelifySans",
      fontWeight: "normal",
    },
  },
  colors: {
    primary: tintColorLight,
    background: lightBackground,
    card: lightBackground,
    text: lightText,
    border: lightBorder,
    notification: tintColorLight,
  },
};

export const DarkTheme: Theme = {
  dark: true,
  fonts: {
    regular: {
      fontFamily: "PixelifySans",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "PixelifySans",
      fontWeight: "normal",
    },
    bold: {
      fontFamily: "PixelifySans",
      fontWeight: "normal",
    },
    heavy: {
      fontFamily: "PixelifySans",
      fontWeight: "normal",
    },
  },
  colors: {
    primary: tintColorDark,
    background: darkBackground,
    card: darkCard,
    text: darkText,
    border: darkBorder,
    notification: tintColorDark,
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

export const rarityColors: Record<
  Rarity,
  {
    background: { dark: ColorValue; light: ColorValue };
    text: ColorValue | undefined;
  }
> = {
  [Rarity.NORMAL]: {
    background: { dark: "#09090bFA", light: "#f4f4f5" },
    text: undefined,
  },
  [Rarity.MAGIC]: {
    background: { dark: "#172554FA", light: "#dbeafe" },
    text: "#3b82f6",
  },
  [Rarity.RARE]: {
    background: { dark: "#2e1065FA", light: "#ede9fe" },
    text: "#9333ea",
  },
};

export const shopColors: Record<
  MerchantType,
  {
    background: ColorValue;
    border: ColorValue;
    text: ColorValue;
  }
> = {
  armorer: {
    background: "#BCBCBC",
    border: "#787878",
    text: "#282828",
  },
  weaponsmith: {
    background: "#DD9191",
    border: "#B22222",
    text: "#505050",
  },
  weaver: {
    background: "#CDB5A7",
    border: "#9F8170",
    text: "#8A2BE2",
  },
  archanist: {
    background: "#9582D9",
    border: "#4B0082",
    text: "#FFD700",
  },
  "junk dealer": {
    background: "#E6BF99",
    border: "#CD7F32",
    text: "#8B4513",
  },
  fletcher: {
    background: "#E5D3B3",
    border: "#725339",
    text: "#2C1810",
  },
  apothecary: {
    background: "#9ECCB8",
    border: "#3D9970",
    text: "#800080",
  },
  librarian: {
    background: "#FFFFF8",
    border: "#f3eac1",
    text: "#8B4513",
  },
};
