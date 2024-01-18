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

export type ConditionBase = {
  name: string;
  style: "buff" | "debuff";
  turns: number;
  effect: (
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
  )[];
  effectStyle: "multiplier" | "percentage" | "flat" | null;
  effectAmount: number | null;
  icon: string;
};
