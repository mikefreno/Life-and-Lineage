import { ColorValue } from "react-native";
import type { PlayerCharacter } from "@/entities/character";
import type { Condition } from "@/entities/conditions";
import type { Enemy, Minion } from "@/entities/creatures";
import { VFXImageOptions } from "@/utility/vfxmapping";
import { Being } from "@/entities/being";

type StatEffect = {
  stat: "health" | "mana" | "sanity";
  amount: { min: number; max: number };
  turns?: number;
  isPoison?: boolean;
};

type ConditionEffect = {
  condition: Condition;
  isPoison?: boolean;
};

export enum Modifier {
  Health,
  Mana,
  Sanity,
  HealthRegen,
  ManaRegen,
  SanityRegen,
  Strength,
  Dexterity,
  Intelligence,
  PhysicalDamage,
  PhysicalDamageAdded,
  PhysicalDamageMultiplier,
  Armor,
  ArmorAdded,
  BlockChance,
  DodgeChance,
  FireDamage,
  FireDamageAdded,
  FireDamageMultiplier,
  FireResistance,
  ColdDamage,
  ColdDamageAdded,
  ColdDamageMultiplier,
  ColdResistance,
  LightningDamage,
  LightningDamageAdded,
  LightningDamageMultiplier,
  LightningResistance,
  PoisonDamage,
  PoisonDamageAdded,
  PoisonDamageMultiplier,
  PoisonResistance,
  HolyDamage,
  HolyDamageAdded,
  HolyDamageMultiplier,
  HolyResistance,
  MagicDamage,
  MagicDamageAdded,
  MagicDamageMultiplier,
  MagicResistance,
}

export enum DamageType {
  PHYSICAL,
  FIRE,
  COLD,
  LIGHTNING,
  POISON,
  HOLY,
  MAGIC,
}

export const DamageTypeToString: Record<DamageType, string> = {
  [DamageType.PHYSICAL]: "physical",
  [DamageType.FIRE]: "fire",
  [DamageType.COLD]: "cold",
  [DamageType.LIGHTNING]: "lightning",
  [DamageType.POISON]: "poison",
  [DamageType.HOLY]: "holy",
  [DamageType.MAGIC]: "magic",
};

export const StringToDamageType: Record<string, DamageType> = {
  physical: DamageType.PHYSICAL,
  fire: DamageType.FIRE,
  cold: DamageType.COLD,
  lightning: DamageType.LIGHTNING,
  poison: DamageType.POISON,
  holy: DamageType.HOLY,
  magic: DamageType.MAGIC,
};

export function parseDamageTypeObject(
  data: { [key: string]: number } | undefined,
): {
  [key in DamageType]?: number;
} {
  if (!data) return {};
  const returnObject: { [key in DamageType]?: number } = {};
  Object.entries(data).forEach(([key, value]) => {
    let damageType: DamageType | undefined;

    if (!isNaN(Number(key))) {
      damageType = Number(key) as DamageType;
    } else {
      damageType = StringToDamageType[key.toLowerCase()];
    }
    if (damageType !== undefined && value !== undefined) {
      returnObject[damageType] = value;
    } else {
      throw new Error(`invalid damage type: ${key})`);
    }
  });
  return returnObject;
}

export function stringToModifier(key: string): Modifier | undefined {
  const modifierKey = key.toLowerCase();
  switch (modifierKey) {
    case "health":
      return Modifier.Health;
    case "mana":
      return Modifier.Mana;
    case "sanity":
      return Modifier.Sanity;
    case "healthregen":
      return Modifier.HealthRegen;
    case "manaregen":
      return Modifier.ManaRegen;
    case "sanityregen":
      return Modifier.SanityRegen;
    case "strength":
      return Modifier.Strength;
    case "dexterity":
      return Modifier.Dexterity;
    case "intelligence":
      return Modifier.Intelligence;
    case "armor":
      return Modifier.Armor;
    case "armoradded":
      return Modifier.ArmorAdded;
    case "blockchance":
      return Modifier.BlockChance;
    case "dodgechance":
      return Modifier.DodgeChance;
    case "fireresistance":
      return Modifier.FireResistance;
    case "coldresistance":
      return Modifier.ColdResistance;
    case "lightningresistance":
      return Modifier.LightningResistance;
    case "poisonresistance":
      return Modifier.PoisonResistance;
    case "physicaldamage":
      return Modifier.PhysicalDamage;
    case "physicaldamageadded":
      return Modifier.PhysicalDamageAdded;
    case "physicaldamagemultiplier":
      return Modifier.PhysicalDamageMultiplier;
    case "firedamage":
      return Modifier.FireDamage;
    case "firedamageadded":
      return Modifier.FireDamageAdded;
    case "firedamagemultiplier":
      return Modifier.FireDamageMultiplier;
    case "colddamage":
      return Modifier.ColdDamage;
    case "colddamageadded":
      return Modifier.ColdDamageAdded;
    case "colddamagemultiplier":
      return Modifier.ColdDamageMultiplier;
    case "lightningdamage":
      return Modifier.LightningDamage;
    case "lightningdamageadded":
      return Modifier.LightningDamageAdded;
    case "lightningdamagemultiplier":
      return Modifier.LightningDamageMultiplier;
    case "poisondamage":
      return Modifier.PoisonDamage;
    case "poisondamageadded":
      return Modifier.PoisonDamageAdded;
    case "poisondamagemultiplier":
      return Modifier.PoisonDamageMultiplier;
    default:
      return Number.parseInt(key) as Modifier;
  }
}

export function modifierToString(modifier: Modifier): string {
  return Modifier[modifier]
    .toLowerCase()
    .replace(/_/g, "")
    .replace(/damage/g, " damage")
    .replace(/resistance/g, " resistance")
    .replace(/chance/g, " chance")
    .replace(/multiplier/g, " multiplier")
    .replace(/added/g, " added")
    .replace(/regen/g, " regen");
}

export enum Rarity {
  NORMAL,
  MAGIC,
  RARE,
}
export const RarityAsString: Record<Rarity, string> = {
  [Rarity.NORMAL]: "Normal",
  [Rarity.MAGIC]: "Magic",
  [Rarity.RARE]: "Rare",
};

export type ItemEffect = StatEffect | ConditionEffect;

export enum ItemClassType {
  Artifact = "artifact",
  Bow = "bow",
  Potion = "potion",
  Poison = "poison",
  Junk = "junk",
  Ingredient = "ingredient",
  Wand = "wand",
  Focus = "focus",
  Melee = "melee",
  Shield = "shield",
  BodyArmor = "bodyArmor",
  Helmet = "helmet",
  Robe = "robe",
  Hat = "hat",
  Book = "book",
  Arrow = "arrow",
  Staff = "staff",
  StoryItem = "storyItem",
}

export enum Personality {
  AGGRESSIVE = "aggressive",
  ARROGANT = "arrogant",
  CALM = "calm",
  CREEPY = "creepy",
  INCREDULOUS = "incredulous",
  INSANE = "insane",
  JOVIAL = "jovial",
  OPEN = "open",
  RESERVED = "reserved",
  SILENT = "silent",
  WISE = "wise",
}

export type InvestmentType = {
  name: string;
  description: string;
  cost: number;
  requires: { requirement: string; message: string; removes: boolean };
  turnsPerReturn: number;
  goldReturnRange: {
    min: number;
    max: number;
  };
  maxGoldStockPile: number;
  upgrades: InvestmentUpgrade[];
};

export type InvestmentUpgrade = {
  name: string;
  cost: number;
  description: string;
  excludes?: string | undefined;
  effect: {
    goldMinimumIncrease?: number | undefined;
    goldMaximumIncrease?: number | undefined;
    maxGoldStockPileIncrease?: number | undefined;
    turnsPerRollChange?: number | undefined;
    changeMaxSanity?: number | undefined;
  };
};

export enum Attribute {
  health,
  mana,
  sanity,
  strength,
  intelligence,
  dexterity,
  manaRegen,
}

export const AttributeToString: Record<Attribute, string> = {
  [Attribute.health]: "Health",
  [Attribute.mana]: "Mana",
  [Attribute.sanity]: "Sanity",
  [Attribute.strength]: "Strength",
  [Attribute.intelligence]: "Intelligence",
  [Attribute.dexterity]: "Dexterity",
  [Attribute.manaRegen]: "Regen",
};

export enum TutorialOption {
  class,
  aging,
  blessing,
  intro,
  spell,
  labor,
  dungeon,
  dungeonInterior,
  shops,
  shopInterior,
  medical,
  investing,
  training,
  firstBossKill,
  keyItem,
  relationships,
}

export enum MasteryLevel {
  Novice,
  Apprentice,
  Adept,
  Expert,
  Master,
  Legend,
}

export const MasteryToBarrier: Record<MasteryLevel, number> = {
  [MasteryLevel.Novice]: 0,
  [MasteryLevel.Apprentice]: 50,
  [MasteryLevel.Adept]: 125,
  [MasteryLevel.Expert]: 225,
  [MasteryLevel.Master]: 350,
  [MasteryLevel.Legend]: 500,
};

export const MasteryToString: Record<MasteryLevel, string> = {
  [MasteryLevel.Novice]: "Novice",
  [MasteryLevel.Apprentice]: "Apprentice",
  [MasteryLevel.Adept]: "Adept",
  [MasteryLevel.Expert]: "Expert",
  [MasteryLevel.Master]: "Master",
  [MasteryLevel.Legend]: "Legend",
};
export const StringToMastery: Record<string, MasteryLevel> = {
  novice: MasteryLevel.Novice,
  apprentice: MasteryLevel.Apprentice,
  adept: MasteryLevel.Adept,
  expert: MasteryLevel.Expert,
  master: MasteryLevel.Master,
  legend: MasteryLevel.Legend,
};

export enum Element {
  fire,
  earth,
  air,
  water,
  summoning,
  pestilence,
  blood,
  bone,
  holy,
  vengeance,
  protection,
  beastMastery,
  assassination,
  arcane,
}

export const ElementToString: Record<Element, string> = {
  [Element.fire]: "Fire",
  [Element.earth]: "Earth",
  [Element.air]: "Air",
  [Element.water]: "Water",
  [Element.summoning]: "Summoning",
  [Element.pestilence]: "Pestilence",
  [Element.blood]: "Blood",
  [Element.bone]: "Bone",
  [Element.holy]: "Holy",
  [Element.vengeance]: "Vengeance",
  [Element.protection]: "Protection",
  [Element.beastMastery]: "Beast Mastery",
  [Element.assassination]: "Assassination",
  [Element.arcane]: "Arcane",
};

export const StringToElement: Record<string, Element> = {
  fire: Element.fire,
  earth: Element.earth,
  air: Element.air,
  water: Element.water,
  summoning: Element.summoning,
  pestilence: Element.pestilence,
  blood: Element.blood,
  bone: Element.bone,
  holy: Element.holy,
  vengeance: Element.vengeance,
  protection: Element.protection,
  beastMastery: Element.beastMastery,
  assassination: Element.assassination,
  arcane: Element.arcane,
};

export function isElement(value: number): value is Element {
  return value >= 0 && value <= 13;
}
export enum PlayerClassOptions {
  mage = "mage",
  necromancer = "necromancer",
  ranger = "ranger",
  paladin = "paladin",
}
export function isPlayerClassOptions(value: any): value is PlayerClassOptions {
  return Object.values(PlayerClassOptions).includes(value);
}

export enum AttackUse {
  success,
  miss,
  block,
  stunned,
  lowEnergy,
}

export type Activity = {
  name: string;
  cost: number;
  aloneCooldown?: number;
  alone?: {
    meetingSomeone: number;
    nothingHappens: number;
    randomGood: number;
    randomBad: number;
  };
  dateCooldown?: number;
  date?: {
    increaseAffection: number;
    increaseAffectionRange: { min: number; max: number };
    decreaseAffection: number;
    decreaseAffectionRange: { min: number; max: number };
  };
  randomBad?: BadOutcome[];
  randomGood?: GoodOutcome[];
};
export type BadOutcome = {
  name: string;
  buyOff?: { price: number };
  fight?: string;
  dungeonTitle?: string;
  effect?: { healthDamage?: number; sanityDamage?: number };
};
export type GoodOutcome = {
  name: string;
  effect: { gold?: number; healthRestore?: number; sanityRestore?: number };
};
export enum SkillPoint {
  Health,
  Mana,
  Sanity,
  AttackPower,
}
export type EffectOptions =
  | "stun"
  | "silenced"
  | "accuracy reduction"
  | "accuracy increase"
  | "sanity heal"
  | "sanity damage"
  | "sanityMax increase"
  | "sanityMax decrease"
  | "heal"
  | "health damage"
  | "healthMax increase"
  | "healthMax decrease"
  | "mana regen"
  | "mana drain"
  | "manaMax increase"
  | "manaMax decrease"
  | "armor increase"
  | "armor decrease"
  | "weaken"
  | "strengthen"
  | "destroy undead"
  | "undead cower"
  | "blur"
  | "thorns"
  | "trap"
  | "revenge"
  | "blood magic consumable"
  | "execute"
  | "stealth";

export type EffectStyle = "multiplier" | "percentage" | "flat";

export type ConditionType = {
  id?: string;
  name: string;
  style: "debuff" | "buff";
  turns: number;
  trapSetupTime?: number;
  effect: EffectOptions[];
  effectStyle: EffectStyle[];
  effectMagnitude: number[];
  healthDamage: number[];
  sanityDamage: number[];
  placedby: string;
  placedbyID: string;
  aura?: boolean;
  icon: string;
  on: Being;
};

export type ConditionObjectType = {
  name: string;
  style: "debuff" | "buff";
  turns: number;
  trapSetupTime?: number;
  effect: EffectOptions[];
  effectStyle: EffectStyle[];
  effectAmount: number[];
  icon: string;
  aura?: boolean;
};

export type BeingType =
  | "block o wood"
  | "beast"
  | "undead"
  | "demi-human"
  | "human"
  | "draconic";

export type MerchantType =
  | "armorer"
  | "weaponsmith"
  | "weaver"
  | "archanist"
  | "junk dealer"
  | "fletcher"
  | "apothecary"
  | "librarian";

export type PlayerSpriteAnimationSet =
  | {
      sprite: VFXImageOptions;
      style: "static";
      position: "enemy" | "field" | "self";
      retrigger?: boolean;
      triggersScreenShake?: { when: "start" | "end"; duration: number };
      scale?: number;
      topOffset?: number;
      leftOffset?: number;
      rotate?: number;
      repeat?: number;
    }
  | {
      sprite: VFXImageOptions;
      style: "missile";
      position: "enemy";
      retrigger?: boolean;
      triggersScreenShake?: { when: "start" | "end"; duration: number };
      reachTargetAtFrame?: number;
      scale?: number;
      topOffset?: number;
      leftOffset?: number;
      rotate?: number;
      repeat?: number;
    }
  | {
      sprite: VFXImageOptions;
      style: "span";
      position: "field" | "enemy";
      retrigger?: boolean;
      triggersScreenShake?: { when: "start" | "end"; duration: number };
      scale?: number;
      topOffset?: number;
      leftOffset?: number;
      rotate?: number;
      repeat?: number;
    };

export type PlayerGlowAnimationSet = {
  glow: ColorValue;
  position: "enemy" | "field" | "self";
  triggersScreenShake?: { when: "start" | "end"; duration: number };
  duration?: number;
};

export type PlayerAnimationSet =
  | PlayerSpriteAnimationSet
  | PlayerGlowAnimationSet;
