import dungeons from "../assets/json/dungeons.json";
import bosses from "../assets/json/bosses.json";
import { Enemy } from "./creatures";
import { action, makeObservable, observable } from "mobx";
import { BeingType } from "../utility/types";

interface DungeonLevelOptions {
  level: number;
  bosses: string[];
  tiles: number;
  bossDefeated?: boolean;
}

interface DungeonInstanceOptions {
  name: string;
  levels?: DungeonLevel[];
}

/**
 * This is the top level and in combination with the DungeonLevel, creates what a player experiences as a Dungeon. It holds levels
 * Which are the individual levels. These are created when the last in range is cleared as dictated by the dungeons.json
 */
export class DungeonInstance {
  readonly name: string;
  levels: DungeonLevel[];

  constructor({ name, levels }: DungeonInstanceOptions) {
    this.name = name;
    this.levels = levels ?? [];
    makeObservable(this, { levels: observable, addLevel: action });
  }

  public addLevel() {
    const dungeonObj = dungeons.find(
      (dungeon) => dungeon.instance == this.name,
    );
    if (dungeonObj) {
      const nextLevelObj = dungeonObj.levels.find(
        (level) => level.level == this.levels[this.levels.length - 1].level + 1,
      );
      if (nextLevelObj) {
        this.levels.push(
          new DungeonLevel({
            level: nextLevelObj.level,
            bosses: nextLevelObj.boss,
            tiles: nextLevelObj.tiles,
          }),
        );
        return true;
      } else {
        return false;
      }
    } else {
      throw new Error(`failed to add level to ${this.name} instance`);
    }
  }

  toJSON(): any {
    return {
      name: this.name,
      levels: this.levels.map((level) => level.toJSON()),
    };
  }

  static fromJSON(json: any): DungeonInstance {
    const levels = json.levels.map((level: any) =>
      DungeonLevel.fromJSON(level),
    );

    const instance = new DungeonInstance({
      name: json.name,
      levels: levels,
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
  readonly bosses: string[];
  readonly tiles: number;
  bossDefeated: boolean;

  constructor({ level, bosses, tiles, bossDefeated }: DungeonLevelOptions) {
    this.level = level;
    this.bosses = bosses;
    this.tiles = tiles;
    this.bossDefeated = bossDefeated ?? false;
    makeObservable(this, {
      bossDefeated: observable,
      getBoss: action,
      setBossDefeated: action,
    });
  }

  public setBossDefeated() {
    this.bossDefeated = true;
  }

  public generateMap() {}

  public getBoss(instanceName: string): Enemy {
    const bossObjects = this.bosses.map((bossName) =>
      bosses.find((bossObj) => bossObj.name === bossName),
    );

    if (!bossObjects || bossObjects.length === 0) {
      throw new Error(
        `No boss found in getBoss() on DungeonLevel, looking for ${this.bosses} in ${instanceName}`,
      );
    }
    const [mainBoss, ...minions] = bossObjects;
    if (!mainBoss) {
      throw new Error(
        `Main boss object not found in getBoss() on DungeonLevel, looking for ${this.bosses} in ${instanceName}`,
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

  toJSON(): any {
    return {
      level: this.level,
      bosses: this.bosses,
      tiles: this.tiles,
      bossDefeated: this.bossDefeated,
    };
  }

  static fromJSON(json: any): DungeonLevel {
    const level = new DungeonLevel({
      level: json.level,
      bosses: json.bosses,
      tiles: json.tiles,
      bossDefeated: json.bossDefeated,
    });
    return level;
  }
}
