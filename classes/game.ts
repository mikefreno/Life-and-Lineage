import { DungeonInstance, DungeonLevel } from "./dungeon";
import { Shop } from "./shop";
import dungeons from "../assets/json/dungeons.json";

interface GameOptions {
  date?: Date;
  shops: Shop[];
  dungeonInstances?: DungeonInstance[];
  furthestDepth?: { instance: string; level: number }[];
  atDeathScreen?: boolean;
  colorScheme: "system" | "dark" | "light";
}

export class Game {
  private date: Date;
  private dungeonInstances: DungeonInstance[];
  private furthestDepth: { instance: string; level: number }[];
  private atDeathScreen: boolean;
  private shops: Shop[];
  private colorScheme: "system" | "dark" | "light";

  constructor({
    date,
    dungeonInstances,
    furthestDepth,
    atDeathScreen,
    shops,
    colorScheme,
  }: GameOptions) {
    this.date = date ?? new Date();
    this.dungeonInstances = dungeonInstances ?? [
      new DungeonInstance({
        name: "training grounds",
        levels: [
          new DungeonLevel({
            level: 0,
            bosses: [],
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
            bosses: ["zombie"],
            stepsBeforeBoss: 25,
            bossDefeated: false,
          }),
        ],
      }),
    ];
    this.furthestDepth = furthestDepth ?? [
      { instance: "nearby cave", level: 1 },
    ];
    this.atDeathScreen = atDeathScreen ?? false;
    this.shops = shops;
    this.colorScheme = colorScheme ?? "system";
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
    console.log(foundInstance);
    console.log(foundInstance?.getLevels());
    if (foundInstance) {
      const found = foundInstance
        .getLevels()
        .find((dungeonLevel) => dungeonLevel.level == level);
      console.log(found);
      return found;
    }
  }

  public getInstance(instanceName: string) {
    return this.dungeonInstances.find(
      (instance) => instance.name == instanceName,
    );
  }

  public openNextDungeonLevel(currentInstance: string) {
    const goodRes = this.dungeonInstances
      .find((instance) => instance.name == currentInstance)
      ?.addLevel();
    if (!goodRes) {
      const nextInstance =
        dungeons[
          dungeons.findIndex((dungeon) => dungeon.instance == currentInstance) +
            1
        ];
      const matchingInstance = this.dungeonInstances.find(
        (dungeon) => dungeon.name == nextInstance.instance,
      );
      if (matchingInstance) {
        throw new Error("Next instance already exists!");
      } else {
        this.dungeonInstances.push(
          new DungeonInstance({
            name: nextInstance.instance,
            levels: [
              new DungeonLevel({
                level: nextInstance.levels[0].level,
                bosses: nextInstance.levels[0].boss,
                stepsBeforeBoss: nextInstance.levels[0].stepsBeforeBoss,
              }),
            ],
          }),
        );
        this.furthestDepth.push({ instance: nextInstance.instance, level: 1 });
      }
    } else {
      let depth = this.furthestDepth.find(
        (depth) => depth.instance == currentInstance,
      );
      console.log(depth);
      //console.log(Object.isFrozen(this.furthestDepth));
      if (depth) {
        depth = { instance: depth?.instance, level: depth!.level + 1 };
      }
      this.furthestDepth = this.furthestDepth.map((depth) =>
        depth.instance === currentInstance
          ? { ...depth, level: depth.level + 1 }
          : depth,
      );

      console.log(depth);
      console.log(this.furthestDepth);
    }
  }

  //----------------------------------Misc----------------------------------//
  public saveColorScheme(scheme: "dark" | "light" | "system") {
    this.colorScheme = scheme;
  }

  public getColorScheme() {
    return this.colorScheme;
  }

  public toJSON(): object {
    return {
      date: this.date.toISOString(),
      dungeonInstances: this.dungeonInstances.map((instance) =>
        instance.toJSON(),
      ),
      furthestDepth: this.furthestDepth,
      atDeathScreen: this.atDeathScreen,
      shops: this.shops.map((shop) => shop.toJSON()),
      colorScheme: this.colorScheme,
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
      colorScheme: json.colorScheme,
    });

    return game;
  }
}
