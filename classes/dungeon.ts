import dungeons from "../assets/json/dungeons.json";
import bosses from "../assets/json/bossMonsters.json";
import { getRandomInt } from "../utility/functions";
import { Monster } from "./creatures";

interface DungeonLevelOptions {
  level: number;
  bosses: string[];
  step?: number;
  stepsBeforeBoss: number;
  bossDefeated?: boolean;
}

interface DungeonInstanceOptions {
  name: string;
  levels?: DungeonLevel[];
}

export class DungeonInstance {
  readonly name: string;
  private levels: DungeonLevel[];

  constructor({ name, levels }: DungeonInstanceOptions) {
    this.name = name;
    this.levels = levels ?? [];
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
            stepsBeforeBoss: nextLevelObj.stepsBeforeBoss,
          }),
        );
        console.log("added");
        return true;
      } else {
        return false;
      }
    } else {
      throw new Error(`failed to add level to ${this.name} instance`);
    }
  }

  public getLevels() {
    return this.levels;
  }

  public toJSON(): object {
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

export class DungeonLevel {
  readonly level: number;
  readonly bosses: string[];
  private step: number;
  readonly stepsBeforeBoss: number;
  private bossDefeated: boolean;

  constructor({
    level,
    bosses,
    step,
    stepsBeforeBoss,
    bossDefeated,
  }: DungeonLevelOptions) {
    this.level = level;
    this.bosses = bosses;
    this.step = step ?? 0;
    this.stepsBeforeBoss = stepsBeforeBoss;
    this.bossDefeated = bossDefeated ?? false;
  }

  public getStep() {
    return this.step;
  }

  public incrementStep() {
    if (this.step < this.stepsBeforeBoss) {
      this.step += 1;
    }
  }

  public getBoss(instanceName: string) {
    let bossObjects = this.bosses.map((boss) =>
      bosses.find((bossObj) => bossObj.name == boss),
    );
    if (bossObjects) {
      let bosses: Monster[] = [];
      bossObjects.forEach((bossObj) => {
        if (bossObj) {
          bosses.push(
            new Monster({
              creatureSpecies: bossObj.name,
              health: bossObj.health,
              healthMax: bossObj.health,
              sanity: bossObj.sanity,
              sanityMax: bossObj.sanity,
              attackPower: bossObj.attackPower,
              energy: bossObj.energy.maximum,
              energyMax: bossObj.energy.maximum,
              energyRegen: bossObj.energy.regen,
              attacks: bossObj.attacks,
            }),
          );
        }
      });
      return bosses;
    }
    throw new Error(
      `No boss found in getBoss() on DungeonLevel, looking for ${this.bosses} in ${instanceName}`,
    );
  }

  public setBossDefeated() {
    this.bossDefeated = true;
  }
  public bossDefeatedCheck() {
    return this.bossDefeated;
  }

  public getCompleted() {
    return this.bossDefeated;
  }

  public toJSON(): object {
    return {
      level: this.level,
      bosses: this.bosses,
      step: this.step,
      stepsBeforeBoss: this.stepsBeforeBoss,
      bossDefeated: this.bossDefeated,
    };
  }

  static fromJSON(json: any): DungeonLevel {
    const level = new DungeonLevel({
      level: json.level,
      bosses: json.bosses,
      step: json.step,
      stepsBeforeBoss: json.stepsBeforeBoss,
      bossDefeated: json.bossDefeated,
    });
    return level;
  }
}
