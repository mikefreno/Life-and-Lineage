import { DungeonInstance, DungeonLevel } from "./dungeon";
import { Shop } from "./shop";

interface GameOptions {
  date?: Date;
  shops: Shop[];
  dungeonInstances?: DungeonInstance[];
  furthestDepth?: { instance: string; level: number };
  atDeathScreen?: boolean;
}

export class Game {
  private date: Date;
  private dungeonInstances: DungeonInstance[];
  private furthestDepth: { instance: string; level: number };
  private atDeathScreen: boolean;
  private shops: Shop[];

  constructor({
    date,
    dungeonInstances,
    furthestDepth,
    atDeathScreen,
    shops,
  }: GameOptions) {
    this.date = date ?? new Date();
    this.dungeonInstances = dungeonInstances ?? [
      new DungeonInstance({
        name: "training grounds",
        levels: [
          new DungeonLevel({
            level: 0,
            step: 0,
            stepsBeforeBoss: 0,
            bossDefeated: true,
          }),
        ],
      }),
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
    this.shops = shops;
  }

  //----------------------------------Date----------------------------------//
  public getGameDate(): Date {
    return this.date;
  }

  //----------------------------------Death----------------------------------//
  public hitDeathScreen() {
    this.atDeathScreen = true;
  }
  public getAtDeathScreen() {
    return this.atDeathScreen;
  }
  //----------------------------------Shops----------------------------------//
  public getShops() {
    return this.shops;
  }
  //----------------------------------Dungeon----------------------------------//
  public getFuthestDepth() {
    return this.furthestDepth;
  }

  public getAllInstances() {
    return this.dungeonInstances;
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

  public updateNamedInstance(instanceName: string, instance: DungeonInstance) {}

  public updateDungeonLevel(instanceName: string, dungeonLevel: DungeonLevel) {
    let containingInstance = this.dungeonInstances.find(
      (instance) => instance.name === instanceName,
    );

    if (containingInstance) {
      containingInstance.updateLevel(dungeonLevel);
    }
  }

  //----------------------------------Misc----------------------------------//
  public toJSON(): object {
    return {
      date: this.date.toISOString(),
      dungeonInstances: this.dungeonInstances.map((instance) =>
        instance.toJSON(),
      ),
      furthestDepth: this.furthestDepth,
      atDeathScreen: this.atDeathScreen,
      shops: this.shops.map((shop) => shop.toJSON()),
    };
  }

  static fromJSON(json: any): Game {
    const game = new Game({
      date: new Date(json.date),
      furthestDepth: json.furthestDepth,
      atDeathScreen: json.atDeathScreen,
      dungeonInstances: json.dungeonInstances.map((instance: any) =>
        DungeonInstance.fromJSON(instance),
      ),
      shops: json.shops.map((shop: any) => Shop.fromJSON(shop)),
    });

    return game;
  }
}
