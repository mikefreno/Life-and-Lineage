interface DungeonLevelOptions {
  level: number;
  step: number;
  stepsBeforeBoss: number;
  bossDefeated: boolean;
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
    this.step += 1;
    return this.step;
  }

  public getCompleted() {
    return this.bossDefeated;
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
