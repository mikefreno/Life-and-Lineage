export type InvestmentType = {
  name: string;
  description: string;
  cost: number;
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
