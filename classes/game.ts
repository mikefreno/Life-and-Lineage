import { PlayerCharacter } from "./character";
import { DungeonInstance, DungeonLevel } from "./dungeon";

interface GameOptions {
  date?: Date;
  player: PlayerCharacter;
  dungeonInstances?: DungeonInstance[];
  furthestDepth?: { instance: string; level: number };
  atDeathScreen?: boolean;
}

export class Game {
  private date: Date;
  private player: PlayerCharacter;
  private dungeonInstances: DungeonInstance[];
  private furthestDepth: { instance: string; level: number };
  private atDeathScreen: boolean;

  constructor({
    date,
    player,
    dungeonInstances,
    furthestDepth,
    atDeathScreen,
  }: GameOptions) {
    this.date = date ?? new Date();
    this.player = player;
    this.dungeonInstances = dungeonInstances ?? [
      new DungeonInstance({
        name: "nearby cave",
        levels: [
          new DungeonLevel({
            level: 1,
            step: 0,
            stepsBeforeBoss: 25,
            bossDefeated: false,
          }),
        ],
      }),
    ];
    this.furthestDepth = furthestDepth ?? { instance: "nearby cave", level: 1 };
    this.atDeathScreen = atDeathScreen ?? false;
  }

  public getGameDate(): Date {
    return this.date;
  }

  public hitDeathScreen() {
    this.atDeathScreen = true;
  }
  public getAtDeathScreen() {
    return this.atDeathScreen;
  }

  public getDungeon(instance: string, level: number): DungeonLevel | undefined {
    const foundInstance = this.dungeonInstances.find(
      (dungeonInstance) => dungeonInstance.name == instance,
    );
    if (foundInstance) {
      const found = foundInstance
        .getLevels()
        .find((dungeonLevel) => dungeonLevel.level == level);
      return found;
    }
  }
  public getInstance(instanceName: string) {
    return this.dungeonInstances.find(
      (instance) => instance.name == instanceName,
    );
  }

  public getAllInstances() {
    return this.dungeonInstances;
  }

  public updateNamedInstance(instanceName: string, instance: DungeonInstance) {}

  public updateDungeonLevel(instanceName: string, dungeonLevel: DungeonLevel) {
    let containingInstance = this.dungeonInstances.find(
      (instance) => instance.name === instanceName,
    );

    if (containingInstance) {
      containingInstance.updateLevel(dungeonLevel);
    }
  }

  public getPlayer(): PlayerCharacter {
    return this.player;
  }

  public getFuthestDepth() {
    return this.furthestDepth;
  }

  static fromJSON(json: any): Game {
    const game = new Game({
      date: new Date(json.date),
      player: PlayerCharacter.fromJSON(json.player),
      furthestDepth: json.furthestDepth,
    });
    return game;
  }
}
