import { Enemy } from "./creatures";
import { action, computed, makeObservable, observable } from "mobx";
import { DungeonStore } from "../stores/DungeonStore";
import enemiesJSON from "../assets/json/enemy.json";
import bossesJSON from "../assets/json/bosses.json";
import type { BeingType } from "../utility/types";

interface DungeonLevelOptions {
  level: number;
  bossEncounter: { name: string; scaler: number }[];
  normalEncounters: { name: string; scaler: number }[][];
  tiles: number;
  unlocked?: boolean;
  bossDefeated?: boolean;
  dungeonStore: DungeonStore;
}

interface DungeonInstanceOptions {
  id: number;
  name: string;
  difficulty: number;
  unlocks: string[];
  levels: DungeonLevel[];
  dungeonStore: DungeonStore;
}

/**
 * This is the top level and in combination with the DungeonLevel, creates what a player experiences as a Dungeon. It holds levels
 * Which are the individual levels. These are created when the last in range is cleared as dictated by the dungeons.json
 */
export class DungeonInstance {
  readonly id: number;
  name: string;
  readonly difficulty: number;
  levels: DungeonLevel[];
  readonly unlocks: string[];

  constructor({
    id,
    name,
    difficulty,
    levels,
    unlocks,
  }: DungeonInstanceOptions) {
    this.id = id;
    this.name = name;
    this.difficulty = difficulty;
    this.levels = levels;
    this.unlocks = unlocks;
    makeObservable(this, { levels: observable, unlockNextLevel: action });
  }

  public unlockNextLevel() {
    let currentMaxDepth = 0;
    this.levels.forEach((level) => {
      if (level.level > currentMaxDepth && level.unlocked) {
        currentMaxDepth = level.level;
      }
    });
    for (const level of this.levels) {
      if (level.level === currentMaxDepth + 1) {
        level.unlock();
        return true;
      }
    }
    return false;
  }

  static fromJSON(json: any): DungeonInstance {
    const levels = json.levels.map((level: any) =>
      DungeonLevel.fromJSON({ ...level, dungeonStore: json.dungeonStore }),
    );

    const instance = new DungeonInstance({
      id: json.id,
      name: json.name,
      difficulty: json.difficulty,
      levels: levels,
      unlocks: json.unlocks,
      dungeonStore: json.dungeonStore,
    });

    return instance;
  }
}

/**
 * This is at time of writing very simple, I plan on implementing the map logic to this class, maybe with a shaking function, maybe with the
 * map saved in state.
 */
export class DungeonLevel {
  readonly level: number;
  readonly bossEncounter: { name: string; scaler: number }[];
  readonly normalEncounters: { name: string; scaler: number }[][];
  readonly tiles: number;
  unlocked: boolean;
  bossDefeated: boolean;
  dungeonStore: DungeonStore;

  constructor({
    level,
    bossEncounter,
    normalEncounters,
    tiles,
    bossDefeated,
    unlocked,
    dungeonStore,
  }: DungeonLevelOptions) {
    this.level = level;
    this.bossEncounter = bossEncounter;
    this.normalEncounters = normalEncounters;
    this.tiles = tiles;
    this.unlocked = unlocked ?? false;
    this.bossDefeated = bossDefeated ?? false;
    this.dungeonStore = dungeonStore;
    makeObservable(this, {
      bossDefeated: observable,
      generateBossEncounter: computed,
      generateNormalEncounter: computed,
      setBossDefeated: action,
    });
  }

  public unlock() {
    this.unlocked = true;
  }

  public setBossDefeated() {
    this.bossDefeated = true;
  }

  get generateNormalEncounter(): Enemy[] {
    const fightIdx = Math.random() * this.normalEncounters.length;
    const enemiesSpec = this.normalEncounters[fightIdx];
    const enemies = enemiesSpec.map((enemySpec) => {
      let enemyJSON = enemiesJSON.find((json) => json.name == enemySpec.name);
      if (!enemyJSON) {
        throw new Error(`missing enemy: ${enemySpec.name}`);
      }
      if (enemySpec.scaler != 1) {
        enemyJSON.goldDropRange.minimum *= enemySpec.scaler;
        enemyJSON.goldDropRange.maximum *= enemySpec.scaler;
        enemyJSON.healthRange.minimum *= enemySpec.scaler;
        enemyJSON.healthRange.maximum *= enemySpec.scaler;
        enemyJSON.attackPowerRange.minimum *= enemySpec.scaler;
        enemyJSON.attackPowerRange.maximum *= enemySpec.scaler;
      }
      const hp =
        Math.floor(
          Math.random() *
            (enemyJSON.healthRange.maximum - enemyJSON.healthRange.minimum + 1),
        ) + enemyJSON.healthRange.minimum;
      const ap =
        Math.floor(
          Math.random() *
            (enemyJSON.attackPowerRange.maximum -
              enemyJSON.attackPowerRange.minimum +
              1),
        ) + enemyJSON.attackPowerRange.minimum;

      return new Enemy({
        beingType: enemyJSON.beingType as BeingType,
        creatureSpecies: enemyJSON.name,
        currentHealth: hp,
        baseHealth: hp,
        currentSanity: enemyJSON.sanity,
        baseSanity: enemyJSON.sanity,
        attackPower: ap,
        baseArmor: enemyJSON.armorValue,
        currentEnergy: enemyJSON.energy.maximum,
        baseEnergy: enemyJSON.energy.maximum,
        energyRegen: enemyJSON.energy.regen,
        attackStrings: enemyJSON.attackStrings,
        spellStrings: enemyJSON.spellStrings,
        enemyStore: this.dungeonStore.root.enemyStore,
      });
    });
    console.log(enemies);
    return enemies;
  }

  get generateBossEncounter(): Enemy[] {
    const bosses = this.bossEncounter.map((bossSpec) => {
      let bossJSON = bossesJSON.find((json) => json.name == bossSpec.name);
      if (!bossJSON) {
        throw new Error(`missing enemy: ${bossSpec.name}`);
      }
      if (bossSpec.scaler != 1) {
        bossJSON.goldDropRange.minimum *= bossSpec.scaler;
        bossJSON.goldDropRange.maximum *= bossSpec.scaler;
        bossJSON.health *= bossSpec.scaler;
        bossJSON.energy.maximum *= bossSpec.scaler;
        bossJSON.energy.regen *= bossSpec.scaler;
      }
      return new Enemy({
        beingType: bossJSON.beingType as BeingType,
        creatureSpecies: bossJSON.name,
        currentHealth: bossJSON.health,
        baseHealth: bossJSON.health,
        currentSanity: bossJSON.sanity,
        baseSanity: bossJSON.sanity,
        attackPower: bossJSON.attackPower,
        baseArmor: bossJSON.armorValue,
        currentEnergy: bossJSON.energy.maximum,
        baseEnergy: bossJSON.energy.maximum,
        energyRegen: bossJSON.energy.regen,
        attackStrings: bossJSON.attackStrings,
        spellStrings: bossJSON.spellStrings,
        enemyStore: this.dungeonStore.root.enemyStore,
      });
    });
    console.log(bosses);
    return bosses;
  }

  static fromJSON(json: any): DungeonLevel {
    const level = new DungeonLevel({
      level: json.level,
      bossEncounter: json.bossEncounter,
      normalEncounters: json.normalEncounters,
      tiles: json.tiles,
      bossDefeated: json.bossDefeated,
      unlocked: json.unlocked ? json.unlocked : json.level == 1 ? true : false,
      dungeonStore: json.dungeonStore,
    });
    return level;
  }
}
