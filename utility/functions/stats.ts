import { ReactNode } from "react";
import {
  ArmorIcon,
  DexterityIcon,
  Dodge,
  Energy,
  Fire,
  HealthIcon,
  Holy,
  Ice,
  IntelligenceIcon,
  Lightning,
  Pestilence,
  Regen,
  Sanity,
  ShieldSlashIcon,
  StrengthIcon,
  Sword,
} from "../../assets/icons/SVGIcons";
import {
  ColdResist,
  FireResist,
  LightningResist,
  PoisonResist,
} from "../../components/ResistanceIcons";
import { Modifier } from "../types";
import { HealthRegen, SanityRegen } from "../../components/RegenIcons";
import { cleanRoundToTenths } from "./misc";
import { Item } from "../../entities/item";

type StatInfo = {
  icon: (props: { height?: number; width?: number }) => ReactNode;
  formatValue?: (value: number) => string;
  description?: string;
  shouldShowTotal?: boolean;
};

export const statMapping: Record<Modifier, StatInfo> = {
  [Modifier.Health]: {
    icon: HealthIcon,
    description: "Increased Max Health",
  },
  [Modifier.Mana]: {
    icon: Energy,
    description: "Increased Max Mana",
  },
  [Modifier.Sanity]: {
    icon: Sanity,
    description: "Increased Max Sanity",
  },
  [Modifier.HealthRegen]: {
    icon: HealthRegen,
    description: "Increased Health Regen",
  },
  [Modifier.ManaRegen]: {
    icon: Regen,
    description: "Increased Mana Regen",
  },
  [Modifier.SanityRegen]: {
    icon: SanityRegen,
    description: "Increased Sanity Regen",
  },
  [Modifier.Strength]: {
    icon: StrengthIcon,
    description: "Increased Strength",
  },
  [Modifier.Dexterity]: {
    icon: DexterityIcon,
    description: "Increased Dexterity",
  },
  [Modifier.Intelligence]: {
    icon: IntelligenceIcon,
    description: "Increased Intelligence",
  },
  [Modifier.Armor]: {
    icon: ArmorIcon,
    shouldShowTotal: true,
    description: "Base Item Armor",
  },
  [Modifier.ArmorAdded]: {
    icon: ArmorIcon,
    shouldShowTotal: true,
    description: "Armor Added",
  },
  [Modifier.BlockChance]: {
    icon: ShieldSlashIcon,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Base Item Block Chance",
  },
  [Modifier.DodgeChance]: {
    icon: Dodge,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Base Item Dodge Chance",
  },
  [Modifier.FireResistance]: {
    icon: FireResist,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Fire Resistance",
  },
  [Modifier.ColdResistance]: {
    icon: ColdResist,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Cold Resistance",
  },
  [Modifier.LightningResistance]: {
    icon: LightningResist,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Lightning Resistance",
  },
  [Modifier.PoisonResistance]: {
    icon: PoisonResist,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Poison Resistance",
  },
  [Modifier.PhysicalDamage]: {
    icon: Sword,
    shouldShowTotal: true,
    description: "Base Item Physical Damage",
  },
  [Modifier.PhysicalDamageAdded]: {
    icon: Sword,
    shouldShowTotal: true,
    description: "Physical Damage Added To Attacks/Spells",
  },
  [Modifier.PhysicalDamageMultiplier]: {
    icon: Sword,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Physical Damage To Attacks/Spells",
  },
  [Modifier.FireDamage]: {
    icon: Fire,
    shouldShowTotal: true,
    description: "Base Item Fire Damage",
  },
  [Modifier.FireDamageAdded]: {
    icon: Fire,
    shouldShowTotal: true,
    description: "Fire Damage Added To Attacks/Spells",
  },
  [Modifier.FireDamageMultiplier]: {
    icon: Fire,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Fire Damage To Attacks/Spells",
  },
  [Modifier.ColdDamage]: {
    icon: Ice,
    shouldShowTotal: true,
    description: "Base Item Cold Damage",
  },
  [Modifier.ColdDamageAdded]: {
    icon: Ice,
    shouldShowTotal: true,
    description: "Cold Damage Added To Attacks/Spells",
  },
  [Modifier.ColdDamageMultiplier]: {
    icon: Ice,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Cold Damage To Attacks/Spells",
  },
  [Modifier.LightningDamage]: {
    icon: Lightning,
    shouldShowTotal: true,
    description: "Base Item Lightning Damage",
  },
  [Modifier.LightningDamageAdded]: {
    icon: Lightning,
    shouldShowTotal: true,
    description: "Lightning Damage Added To Attacks/Spells",
  },
  [Modifier.LightningDamageMultiplier]: {
    icon: Lightning,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Lightning Damage To Attacks/Spells",
  },
  [Modifier.PoisonDamage]: {
    icon: Pestilence,
    shouldShowTotal: true,
    description: "Base Item Poison Damage",
  },
  [Modifier.PoisonDamageAdded]: {
    icon: Pestilence,
    shouldShowTotal: true,
    description: "Poison Damage Added To Attacks/Spells",
  },
  [Modifier.PoisonDamageMultiplier]: {
    icon: Pestilence,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Poison Damage To Attacks/Spells",
  },
  [Modifier.MagicDamage]: {
    icon: Regen,
    shouldShowTotal: true,
    description: "Base Item Magic Damage",
  },
  [Modifier.MagicDamageAdded]: {
    icon: Regen,
    shouldShowTotal: true,
    description: "Magic Damage Added To Attacks/Spells",
  },
  [Modifier.MagicDamageMultiplier]: {
    icon: Regen,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Magic Damage To Attacks/Spells",
  },
  [Modifier.HolyDamage]: {
    icon: Holy,
    shouldShowTotal: true,
    description: "Base Item Holy Damage",
  },
  [Modifier.HolyDamageAdded]: {
    icon: Holy,
    shouldShowTotal: true,
    description: "Holy Damage Added To Attacks/Spells",
  },
  [Modifier.HolyDamageMultiplier]: {
    icon: Holy,
    formatValue: (value) => `${cleanRoundToTenths(value * 100)}%`,
    description: "Increased Holy Damage To Attacks/Spells",
  },
};

export const DEFENSIVE_STATS = [
  Modifier.Health,
  Modifier.HealthRegen,
  Modifier.Mana,
  Modifier.ManaRegen,
  Modifier.Sanity,
  Modifier.SanityRegen,
  Modifier.Armor,
  Modifier.ArmorAdded,
  Modifier.BlockChance,
  Modifier.DodgeChance,
  Modifier.FireResistance,
  Modifier.ColdResistance,
  Modifier.LightningResistance,
  Modifier.PoisonResistance,
  Modifier.MagicResistance,
  Modifier.HolyResistance,
];

export const OFFENSIVE_STATS = [
  Modifier.Strength,
  Modifier.Dexterity,
  Modifier.Intelligence,
  Modifier.PhysicalDamage,
  Modifier.PhysicalDamageAdded,
  Modifier.PhysicalDamageMultiplier,
  Modifier.FireDamage,
  Modifier.FireDamageAdded,
  Modifier.FireDamageMultiplier,
  Modifier.ColdDamage,
  Modifier.ColdDamageAdded,
  Modifier.ColdDamageMultiplier,
  Modifier.LightningDamage,
  Modifier.LightningDamageAdded,
  Modifier.LightningDamageMultiplier,
  Modifier.PoisonDamage,
  Modifier.PoisonDamageAdded,
  Modifier.PoisonDamageMultiplier,
  Modifier.MagicDamage,
  Modifier.MagicDamageAdded,
  Modifier.MagicDamageMultiplier,
  Modifier.HolyDamage,
  Modifier.HolyDamageAdded,
  Modifier.HolyDamageMultiplier,
];

export const getStatInfo = (mod: Modifier): StatInfo => {
  return statMapping[mod] || { icon: () => null };
};

export const shouldShowModifier = (mod: Modifier, item: Item): boolean => {
  if (!item.stats) return false;

  if (
    [
      Modifier.Health,
      Modifier.Mana,
      Modifier.Sanity,
      Modifier.HealthRegen,
      Modifier.ManaRegen,
      Modifier.SanityRegen,
      Modifier.Strength,
      Modifier.Dexterity,
      Modifier.Intelligence,
      Modifier.FireResistance,
      Modifier.ColdResistance,
      Modifier.LightningResistance,
      Modifier.PoisonResistance,
      Modifier.MagicResistance,
      Modifier.HolyResistance,
    ].includes(mod)
  ) {
    return true;
  }

  if (
    [
      Modifier.PhysicalDamageMultiplier,
      Modifier.FireDamageMultiplier,
      Modifier.ColdDamageMultiplier,
      Modifier.LightningDamageMultiplier,
      Modifier.PoisonDamageMultiplier,
      Modifier.MagicDamageMultiplier,
      Modifier.HolyDamageMultiplier,
    ].includes(mod)
  ) {
    return false;
  }

  if (
    [
      [Modifier.PhysicalDamage, Modifier.PhysicalDamageAdded],
      [Modifier.FireDamage, Modifier.FireDamageAdded],
      [Modifier.ColdDamage, Modifier.ColdDamageAdded],
      [Modifier.LightningDamage, Modifier.LightningDamageAdded],
      [Modifier.MagicDamage, Modifier.MagicDamageAdded],
      [Modifier.HolyDamage, Modifier.HolyDamageAdded],
      [Modifier.PoisonDamage, Modifier.PoisonDamageAdded],
      [Modifier.Armor, Modifier.ArmorAdded],
    ].some(
      ([base, added]) =>
        mod === added && item.stats?.get(base) && item.stats?.get(added),
    )
  ) {
    return false;
  }

  return true;
};

export const getTotalValue = (mod: Modifier, value: number): string => {
  const info = getStatInfo(mod);
  if (info.formatValue) {
    return info.formatValue(value);
  }
  return value.toString();
};
