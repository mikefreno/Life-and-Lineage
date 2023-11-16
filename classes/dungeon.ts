interface DungeonLevelOptions {
  level: number;
  step: number;
  stepsBeforeBoss: number;
  bossDefeated: boolean;
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

  public updateLevel(newDungeonLevel: DungeonLevel) {
    for (let i = 0; i < this.levels.length; i++) {
      if (this.levels[i].level === newDungeonLevel.level) {
        this.levels[i] = newDungeonLevel;
        break;
      }
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
  private step: number;
  readonly stepsBeforeBoss: number;
  private bossDefeated: boolean;

  constructor({
    level,
    step,
    stepsBeforeBoss,
    bossDefeated,
  }: DungeonLevelOptions) {
    this.level = level;
    this.step = step;
    this.stepsBeforeBoss = stepsBeforeBoss;
    this.bossDefeated = bossDefeated;
  }

  public getStep() {
    return this.step;
  }

  public incrementStep() {
    if (this.level < this.stepsBeforeBoss) {
      this.step += 1;
    }
  }

  public getCompleted() {
    return this.bossDefeated;
  }

  public toJSON(): object {
    return {
      level: this.level,
      step: this.step,
      stepsBeforeBoss: this.stepsBeforeBoss,
      bossDefeated: this.bossDefeated,
    };
  }

  static fromJSON(json: any): DungeonLevel {
    const level = new DungeonLevel({
      level: json.level,
      step: json.step,
      stepsBeforeBoss: json.stepsBeforeBoss,
      bossDefeated: json.bossDefeated,
    });
    return level;
  }
}
