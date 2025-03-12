import {
  PlayerCharacter,
  getStartingBook,
  savePlayer,
} from "@/entities/character";
import { storage } from "@/utility/functions/storage";
import { parse } from "flatted";
import UIStore from "@/stores/UIStore";
import EnemyStore from "@/stores/EnemyStore";
import { DungeonStore } from "@/stores/DungeonStore";
import { ShopStore } from "@/stores/ShopsStore";
import { action, makeObservable, observable } from "mobx";
import { AuthStore } from "@/stores/AuthStore";
import { TimeStore } from "@/stores/TimeStore";
import { CharacterStore } from "@/stores/CharacterStore";
import { TutorialStore } from "@/stores/TutorialStore";
import { Condition } from "@/entities/conditions";
import sanityDebuffs from "@/assets/json/sanityDebuffs.json";
import { ConditionObjectType, EffectOptions } from "@/utility/types";
import { StashStore } from "@/stores/StashStore";
import { SaveStore } from "@/stores/SaveStore";
import { AudioStore } from "@/stores/AudioStore";
import { PlayerAnimationStore } from "@/stores/PlayerAnimationStore";
import { Platform } from "react-native";

export class RootStore {
  playerState: PlayerCharacter | null;
  playerAnimationStore: PlayerAnimationStore;
  time: TimeStore;
  enemyStore: EnemyStore;
  shopsStore: ShopStore;
  dungeonStore: DungeonStore;
  uiStore: UIStore;
  authStore: AuthStore;
  stashStore: StashStore;
  characterStore: CharacterStore;
  tutorialStore: TutorialStore;
  saveStore: SaveStore;
  audioStore: AudioStore;

  constructed: boolean = false;
  atDeathScreen: boolean = false;
  startingNewGame: boolean = false;
  pathname: string = "/";

  includeDevAttacks: boolean = false;

  devActions: {
    action: (value: number) => void;
    name: string;
    max?: number;
    step?: number;
    min?: number | undefined;
    initVal?: number | undefined;
  }[] = [];

  constructor() {
    this.uiStore = new UIStore({ root: this });

    const retrieved_player = storage.getString("player");
    this.playerState = retrieved_player
      ? PlayerCharacter.fromJSON({ ...parse(retrieved_player), root: this })
      : null;
    this.playerAnimationStore = new PlayerAnimationStore({ root: this });

    this.uiStore.markStoreAsLoaded("player");

    this.time = new TimeStore({ root: this });
    this.uiStore.markStoreAsLoaded("time");

    this.enemyStore = new EnemyStore({ root: this });
    this.uiStore.markStoreAsLoaded("enemy");

    this.dungeonStore = new DungeonStore({ root: this });
    this.uiStore.markStoreAsLoaded("dungeon");

    this.authStore = new AuthStore({ root: this });
    this.uiStore.markStoreAsLoaded("auth");

    this.shopsStore = new ShopStore({ root: this });
    this.uiStore.markStoreAsLoaded("shops");

    if (Platform.OS == "ios") {
      this.audioStore = new AudioStore({ root: this });
    } else {
      this.uiStore.markStoreAsLoaded("ambient");
    }
    this.uiStore.markStoreAsLoaded("audio");

    this.characterStore = new CharacterStore({ root: this });
    this.uiStore.markStoreAsLoaded("character");

    this.tutorialStore = new TutorialStore({ root: this });
    this.uiStore.markStoreAsLoaded("tutorial");

    this.stashStore = new StashStore({ root: this });
    this.uiStore.markStoreAsLoaded("stash");

    this.saveStore = new SaveStore({ root: this });
    this.uiStore.markStoreAsLoaded("save");

    this.constructed = true;

    makeObservable(this, {
      constructed: observable,
      atDeathScreen: observable,
      startingNewGame: observable,
      devActions: observable,
      includeDevAttacks: observable,
      pathname: observable,

      hitDeathScreen: action,
      clearDeathScreen: action,
      addDevAction: action,
      removeDevAction: action,
    });
  }

  gameTick() {
    this.time.tick();
    if (!this.playerState) throw new Error("Missing player in root!");

    if (this.playerState.currentSanity < 0) {
      this.generateLowSanityDebuff();
    }

    this.playerState.gameTurnHandler();
    this.checkForBirths();
  }

  inheritance() {
    let points = 0;
    for (const inst of this.dungeonStore.dungeonInstances) {
      for (const level of inst.levels) {
        if (level.bossDefeated) {
          points += 3;
        }
      }
    }
    return points;
  }

  addDevAction(
    newAction:
      | {
          action: (value: number) => void;
          name: string;
          max?: number;
          step?: number;
          min?: number | undefined;
          initVal?: number | undefined;
        }
      | {
          action: (value: number) => void;
          name: string;
          max?: number;
          step?: number;
          min?: number | undefined;
          initVal?: number | undefined;
        }[],
  ) {
    if (Array.isArray(newAction)) {
      newAction.forEach((action) => {
        const existingIndex = this.devActions.findIndex(
          (existing) => existing.name === action.name,
        );
        if (existingIndex !== -1) {
          this.devActions[existingIndex] = action;
        } else {
          this.devActions.push(action);
        }
      });
    } else {
      const existingIndex = this.devActions.findIndex(
        (existing) => existing.name === newAction.name,
      );
      if (existingIndex !== -1) {
        this.devActions[existingIndex] = newAction;
      } else {
        this.devActions.push(newAction);
      }
    }
  }

  removeDevAction(actionName: string) {
    this.devActions = this.devActions.filter(
      (action) => action.name === actionName,
    );
  }

  async newGame(newPlayer: PlayerCharacter) {
    this.enemyStore.clearEnemyList();
    this.dungeonStore.resetForNewGame();

    const starterBook = getStartingBook(newPlayer);
    newPlayer.addToInventory(starterBook);

    this.playerState = newPlayer;
    this.shopsStore.setShops(this.shopsStore.getInitShopsState());
    savePlayer(newPlayer);
    await this.saveStore.createNewGame(newPlayer.fullName);
    this.clearDeathScreen();
  }

  checkForBirths() {
    if (!this.playerState) return;

    if (this.playerState.sex === "female" && this.playerState.isPregnant) {
      const baby = this.playerState.giveBirth();
      if (baby) {
        this.playerState.children.push(baby);
        this.characterStore.addCharacter(baby);
        this.uiStore.setNewbornBaby(baby);
      }
    }

    // Check partners
    this.playerState.partners.forEach((partner) => {
      if (partner.sex === "female" && partner.isPregnant) {
        const baby = partner.giveBirth();
        if (baby) {
          this.playerState?.children.push(baby);
          partner.children.push(baby);
          this.characterStore.addCharacter(baby);
          this.uiStore.setNewbornBaby(baby);
        }
      }
    });
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

  async leaveDungeon() {
    this.playerState?.clearMinions();
    this.enemyStore.clearEnemyList();
    this.dungeonStore.clearDungeonState();
    this.uiStore.clearDungeonColor();
  }
}
