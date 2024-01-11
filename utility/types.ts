export type Investment = {
  name: string;
  description: string;
  cost: number;
  turnsPerReturn: number;
  goldReturnRange: {
    min: number;
    max: number;
  };
  maxGoldStockPile: number;
  upgrades: {
    name: string;
    cost: number;
    description: string;
    excludes?: string;
    effect: {
      goldMinimumIncrease?: number;
      goldMaximumIncrease?: number;
      maxGoldStockPileIncrease?: number;
      turnsPerRollChange?: number;
      permanentlyDecreaseMaxSanity?: number;
    };
  }[];
};
