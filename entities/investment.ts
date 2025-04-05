import { action, makeObservable, observable } from "mobx";
import { InvestmentUpgrade } from "@/utility/types";
import { PlayerCharacter } from "./character";

interface InvestmentProps {
  name: string;
  minimumReturn: number;
  maximumReturn: number;
  turnsPerRoll: number;
  turnsUntilNextRoll?: number;
  maxGoldStockPile: number;
  currentGoldStockPile?: number;
  upgrades?: string[];
  goldInvested: number;
}

/**
 * The players currently made investments, the options reside within the `investements.json`, once purchased, one of these is instantiated,
 * then the user interacts with this class
 */
export class Investment {
  name: string;
  minimumReturn: number;
  maximumReturn: number;
  turnsPerRoll: number;
  turnsUntilNextRoll: number;
  maxGoldStockPile: number;
  currentGoldStockPile: number;
  upgrades: string[];
  goldInvested: number;

  constructor({
    name,
    minimumReturn,
    maximumReturn,
    turnsPerRoll,
    turnsUntilNextRoll,
    maxGoldStockPile,
    currentGoldStockPile,
    upgrades,
    goldInvested,
  }: InvestmentProps) {
    this.name = name;
    this.minimumReturn = minimumReturn;
    this.maximumReturn = maximumReturn;
    this.turnsPerRoll = turnsPerRoll;
    this.turnsUntilNextRoll = turnsUntilNextRoll ?? turnsPerRoll;
    this.maxGoldStockPile = maxGoldStockPile;
    this.currentGoldStockPile = currentGoldStockPile ?? 0;
    this.upgrades = upgrades ?? [];
    this.goldInvested = goldInvested;

    makeObservable(this, {
      name: observable,
      minimumReturn: observable,
      maximumReturn: observable,
      turnsPerRoll: observable,
      turnsUntilNextRoll: observable,
      maxGoldStockPile: observable,
      currentGoldStockPile: observable,
      goldInvested: observable,
      upgrades: observable,
      turn: action,
      addUpgrade: action,
      collectGold: action,
    });
  }

  public turn() {
    this.turnsUntilNextRoll--;
    if (this.turnsUntilNextRoll == 0) {
      this.increaseCurrentGoldStockPile(this.getGoldRoll());
      this.turnsUntilNextRoll = this.turnsPerRoll;
    }
  }

  public collectGold() {
    const currentGold = this.currentGoldStockPile;
    this.currentGoldStockPile = 0;
    return currentGold;
  }

  public addUpgrade(upgrade: InvestmentUpgrade, player: PlayerCharacter) {
    this.upgrades.push(upgrade.name);
    this.increaseGoldInvested(upgrade.cost);
    if (upgrade.effect.goldMinimumIncrease) {
      this.increaseMinimumReturn(upgrade.effect.goldMinimumIncrease);
    }
    if (upgrade.effect.goldMaximumIncrease) {
      this.increaseMaximumReturn(upgrade.effect.goldMaximumIncrease);
    }
    if (upgrade.effect.turnsPerRollChange) {
      this.changeTurnsPerRoll(upgrade.effect.turnsPerRollChange);
    }
    if (upgrade.effect.maxGoldStockPileIncrease) {
      this.increaseMaxGoldStockPile(upgrade.effect.maxGoldStockPileIncrease);
    }
    if (upgrade.effect.changeMaxSanity) {
      player.changeBaseSanity(upgrade.effect.changeMaxSanity);
    }
  }

  private getGoldRoll() {
    return Math.floor(
      Math.random() * (this.maximumReturn - this.minimumReturn) +
        this.minimumReturn,
    );
  }

  private increaseMinimumReturn(upgradeEffect: number) {
    this.minimumReturn += upgradeEffect;
  }

  private increaseMaximumReturn(upgradeEffect: number) {
    this.maximumReturn += upgradeEffect;
  }

  private changeTurnsPerRoll(upgradeEffect: number) {
    this.turnsPerRoll += upgradeEffect;
  }

  private increaseMaxGoldStockPile(upgradeEffect: number) {
    this.maxGoldStockPile += upgradeEffect;
  }

  private increaseCurrentGoldStockPile(goldRoll: number) {
    if (this.currentGoldStockPile + goldRoll <= this.maxGoldStockPile) {
      this.currentGoldStockPile += goldRoll;
    } else {
      this.currentGoldStockPile = this.maxGoldStockPile;
    }
  }

  private increaseGoldInvested(upgradeCost: number) {
    this.goldInvested += upgradeCost;
  }

  static fromJSON(json: any): Investment {
    const investment = new Investment({
      name: json.name,
      minimumReturn: json.minimumReturn,
      maximumReturn: json.maximumReturn,
      turnsPerRoll: json.turnsPerRoll,
      turnsUntilNextRoll: json.turnsUntilNextRoll,
      maxGoldStockPile: json.maxGoldStockPile,
      currentGoldStockPile: json.currentGoldStockPile,
      goldInvested: json.goldInvested,
      upgrades: json.upgrades,
    });

    return investment;
  }
}
