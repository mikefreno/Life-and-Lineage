import type { PlayerCharacter } from "../entities/character";
import type { Condition } from "../entities/conditions";
import type { Enemy, Minion } from "../entities/creatures";

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

export type Modifier =
  | "health"
  | "mana"
  | "sanity"
  | "healthRegen"
  | "manaRegen"
  | "sanityRegen"
  | "strength"
  | "dexterity"
  | "intelligence"
  | "armor"
  | "armorAdded"
  | "blockChance"
  | "dodgeChance"
  | "fireResistance"
  | "coldResistance"
  | "lightningResistance"
  | "poisonResistance"
  | "physicalDamage"
  | "physicalDamageAdded"
  | "physicalDamageMultiplier"
  | "fireDamage"
  | "fireDamageAdded"
  | "fireDamageMultiplier"
  | "coldDamage"
  | "coldDamageAdded"
  | "coldDamageMultiplier"
  | "lightningDamage"
  | "lightningDamageAdded"
  | "lightningDamageMultiplier"
  | "poisonDamage"
  | "poisonDamageAdded"
  | "poisonDamageMultiplier";

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
}

export const AttributeToString: Record<Attribute, string> = {
  [Attribute.health]: "Health",
  [Attribute.mana]: "Mana",
  [Attribute.sanity]: "Sanity",
  [Attribute.strength]: "Strength",
  [Attribute.intelligence]: "Intelligence",
  [Attribute.dexterity]: "Dexterity",
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
  | "maxHealth increase"
  | "maxHealth decrease"
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
  on: PlayerCharacter | Enemy | Minion | null;
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
