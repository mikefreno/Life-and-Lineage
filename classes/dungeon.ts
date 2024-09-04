import dungeons from "../assets/json/dungeons.json";
import bosses from "../assets/json/bosses.json";
import { Enemy } from "./creatures";
import { action, makeObservable, observable } from "mobx";
import { beingType } from "../utility/types";

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
    console.log(this.bosses);

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
      beingType: mainBoss.beingType as beingType,
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
      bosses: json.bosses,
      tiles: json.tiles,
      bossDefeated: json.bossDefeated,
    });
    return level;
  }
}
