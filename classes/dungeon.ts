import bosses from "../assets/json/bosses.json";
import { Enemy } from "./creatures";
import { action, makeObservable, observable } from "mobx";
import { BeingType } from "../utility/types";

interface DungeonLevelOptions {
  level: number;
  boss: string[];
  tiles: number;
  unlocked?: boolean;
  bossDefeated?: boolean;
}

interface DungeonInstanceOptions {
  name: string;
  unlocks: string[];
  levels: DungeonLevel[];
}

/**
 * This is the top level and in combination with the DungeonLevel, creates what a player experiences as a Dungeon. It holds levels
 * Which are the individual levels. These are created when the last in range is cleared as dictated by the dungeons.json
 */
export class DungeonInstance {
  readonly name: string;
  levels: DungeonLevel[];
  readonly unlocks: string[];

  constructor({ name, levels, unlocks }: DungeonInstanceOptions) {
    this.name = name;
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
      DungeonLevel.fromJSON(level),
    );

    const instance = new DungeonInstance({
      name: json.name,
      levels: levels,
      unlocks: json.unlocks,
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
  readonly boss: string[];
  readonly tiles: number;
  unlocked: boolean;
  bossDefeated: boolean;

  constructor({
    level,
    boss,
    tiles,
    bossDefeated,
    unlocked,
  }: DungeonLevelOptions) {
    this.level = level;
    this.boss = boss;
    this.tiles = tiles;
    this.unlocked = unlocked ?? false;
    this.bossDefeated = bossDefeated ?? false;
    makeObservable(this, {
      bossDefeated: observable,
      getBoss: action,
      setBossDefeated: action,
    });
  }

  public unlock() {
    this.unlocked = true;
  }

  public setBossDefeated() {
    this.bossDefeated = true;
  }

  public getBoss(instanceName: string): Enemy {
    const bossObjects = this.boss.map((bossName) =>
      bosses.find((bossObj) => bossObj.name === bossName),
    );

    if (!bossObjects || bossObjects.length === 0) {
      throw new Error(
        `No boss found in getBoss() on DungeonLevel, looking for ${this.boss} in ${instanceName}`,
      );
    }
    const [mainBoss, ...minions] = bossObjects;
    if (!mainBoss) {
      throw new Error(
        `Main boss object not found in getBoss() on DungeonLevel, looking for ${this.boss} in ${instanceName}`,
      );
    }
    const boss = new Enemy({
      beingType: mainBoss.beingType as BeingType,
      creatureSpecies: mainBoss.name,
      health: mainBoss.health,
      healthMax: mainBoss.health,
      sanity: mainBoss.sanity,
      sanityMax: mainBoss.sanity,
      attackPower: mainBoss.attackPower,
      energy: mainBoss.energy.maximum,
      energyMax: mainBoss.energy.maximum,
      energyRegen: mainBoss.energy.regen,
      attacks: mainBoss.attacks,
      baseArmor: mainBoss.armorValue,
    });

    minions.forEach((minion) => {
      if (minion) {
        boss.createMinion(minion.name);
      }
    });

    return boss;
  }

  static fromJSON(json: any): DungeonLevel {
    const level = new DungeonLevel({
      level: json.level,
      boss: json.boss,
      tiles: json.tiles,
      bossDefeated: json.bossDefeated,
      unlocked: json.unlocked ? json.unlocked : json.level == 1 ? true : false,
    });
    return level;
  }
}
