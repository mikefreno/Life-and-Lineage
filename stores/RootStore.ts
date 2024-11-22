import { PlayerCharacter } from "../entities/character";
import { storage } from "../utility/functions/storage";
import { parse } from "flatted";
import UIStore from "./UIStore";
import EnemyStore from "./EnemyStore";
import { DungeonStore } from "./DungeonStore";
import { ShopStore } from "./ShopsStore";
import { action, makeObservable, observable } from "mobx";
import { AuthStore } from "./AuthStore";
import { TimeStore } from "./TimeStore";
import { CharacterStore } from "./CharacterStore";
import { TutorialStore } from "./TutorialStore";
import { Condition } from "../entities/conditions";
import sanityDebuffs from "../assets/json/sanityDebuffs.json";
import { ConditionObjectType, EffectOptions } from "../utility/types";

export class RootStore {
  playerState: PlayerCharacter | null;
  time: TimeStore;
  enemyStore: EnemyStore;
  shopsStore: ShopStore;
  dungeonStore: DungeonStore;
  uiStore: UIStore;
  authStore: AuthStore;

  characterStore: CharacterStore;
  tutorialStore: TutorialStore;

  constructed: boolean = false;
  atDeathScreen: boolean = false;
  startingNewGame: boolean = false;

  constructor() {
    const retrieved_player = storage.getString("player");
    this.playerState = retrieved_player
      ? PlayerCharacter.fromJSON({ ...parse(retrieved_player), root: this })
      : null;

    this.time = new TimeStore({ root: this });
    this.authStore = new AuthStore({ root: this });
    this.uiStore = new UIStore({ root: this });
    this.shopsStore = new ShopStore({ root: this });
    this.enemyStore = new EnemyStore({ root: this });
    this.dungeonStore = new DungeonStore({ root: this });
    this.characterStore = new CharacterStore({ root: this });
    this.tutorialStore = new TutorialStore({ root: this });

    this.constructed = true;

    makeObservable(this, {
      constructed: observable,
      atDeathScreen: observable,
      startingNewGame: observable,
      hitDeathScreen: action,
      clearDeathScreen: action,
    });
  }

  gameTick() {
    this.time.tick();
    if (!this.playerState) throw new Error("Missing player in root!");

    if (this.playerState.currentSanity < 0) {
      this.generateLowSanityDebuff();
    }

    this.playerState.gameTurnHandler();
  }

  private generateLowSanityDebuff() {
    if (Math.random() < 0.75) return;

    const debuffObj = this.getRandomSanityDebuff();
    const debuff = this.createDebuffFromObject(debuffObj);
    this.playerState?.addCondition(debuff);
  }

  private getRandomSanityDebuff() {
    return sanityDebuffs[
      Math.floor(Math.random() * sanityDebuffs.length)
    ] as ConditionObjectType;
  }

  private createDebuffFromObject(debuffObj: ConditionObjectType): Condition {
    const healthMultiplier = this.playerState?.nonConditionalMaxHealth;
    const sanityMultiplier = this.playerState?.nonConditionalMaxSanity;

    const healthDamage = this.calculateDamage(
      debuffObj,
      "health damage",
      healthMultiplier ?? 1,
    );
    const sanityDamage = this.calculateDamage(
      debuffObj,
      "sanity damage",
      sanityMultiplier ?? 1,
    );

    return new Condition({
      name: debuffObj.name,
      style: "debuff",
      turns: debuffObj.turns,
      effect: debuffObj.effect as EffectOptions[],
      healthDamage,
      sanityDamage,
      effectStyle: debuffObj.effectStyle,
      effectMagnitude: debuffObj.effectAmount,
      placedby: "low sanity",
      icon: debuffObj.icon,
      aura: debuffObj.aura,
      placedbyID: "low sanity",
      on: null,
    });
  }

  private calculateDamage(
    debuffObj: ConditionObjectType,
    damageType: string,
    multiplier: number,
  ): number[] {
    return debuffObj.effect.map((effect, index) => {
      if (effect !== damageType || debuffObj.effectAmount[index] === null)
        return 0;
      const amount = debuffObj.effectAmount[index]!;
      const style = debuffObj.effectStyle[index];
      return style === "multiplier" || style === "percentage"
        ? amount * multiplier
        : amount;
    });
  }

  hitDeathScreen() {
    this.atDeathScreen = true;
  }
  clearDeathScreen() {
    this.atDeathScreen = false;
  }

  startNewGame() {
    this.startingNewGame = true;
  }

  setPlayer(player: PlayerCharacter) {
    this.playerState = player;
  }

  leaveDungeon() {
    this.playerState?.clearMinions();
    this.enemyStore.clearEnemyList();
    this.dungeonStore.clearDungeonState();
    this.uiStore.clearDungeonColor();
  }
}
