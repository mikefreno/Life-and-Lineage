export type InvestmentType = {
  name: string;
  description: string;
  cost: number;
  requires: { requirement: string; message: string } | null;
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

export type Spell = {
  name: string;
  element: string;
  proficiencyNeeded: number;
  manaCost: number;
  effects: {
    damage: number | null;
    buffs: string[] | null;
    debuffs:
      | {
          name: string;
          chance: number;
        }[]
      | null;
    summon?: string[] | undefined;
    selfDamage?: number | undefined;
  };
};

export type Attack = {
  name: string;
  targets: string;
  hitChance: number;
  damageMult: number;
  sanityDamage: number;
  debuffs:
    | {
        name: string;
        chance: number;
      }[]
    | null;
};

export type AttackObj = {
  name: string;
  energyCost?: number;
  targets?: "single" | "cleave" | "aoe";
  hitChance?: number;
  damageMult?: number;
  flatHealthDamage?: number;
  selfDamage?: number;
  flatSanityDamage?: number;
  buffs?: { name: string; chance: number }[];
  debuffs?: { name: string; chance: number }[];
  summons?: string[];
};

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
export type effectOptions =
  | "turn skip"
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
  | "revenge";

type ConditionBase = {
  id?: string;
  name: string;
  style: "debuff" | "buff";
  turns: number;
  placedby: string;
  aura?: boolean;
  icon?: string;
  simple: boolean;
};

type SimpleCondition = ConditionBase & {
  effect: effectOptions;
  effectStyle: "flat" | "multiplier" | null;
  effectMagnitude: number | null;
  healthDamage: number | null;
  sanityDamage: number | null;
  simple: true;
};

type ComplexCondition = ConditionBase & {
  effect: effectOptions[];
  effectStyle: ("flat" | "multiplier" | null)[] | null;
  effectMagnitude: (number | null)[];
  healthDamage: (number | null)[];
  sanityDamage: (number | null)[];
  simple: false;
};

export type ConditionType = SimpleCondition | ComplexCondition;
