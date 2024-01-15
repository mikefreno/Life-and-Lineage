import { DungeonInstance, DungeonLevel } from "./dungeon";
import { Shop } from "./shop";
import dungeons from "../assets/json/dungeons.json";
import { action, makeObservable, observable } from "mobx";
import { PlayerCharacter } from "./character";
import { lowSanityDebuffGenerator } from "../utility/functions";

interface GameOptions {
  date?: string;
  shops: Shop[];
  dungeonInstances?: DungeonInstance[];
  furthestDepth?: { instance: string; level: number }[];
  atDeathScreen?: boolean;
  colorScheme?: "system" | "dark" | "light";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning?: number;
  tutorialsShown?: Record<string, boolean>;
  tutorialsEnabled?: boolean;
}

export class Game {
  date: string;
  dungeonInstances: DungeonInstance[];
  furthestDepth: { instance: string; level: number }[];
  atDeathScreen: boolean;
  shops: Shop[];
  colorScheme: "system" | "dark" | "light";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning: number;
  tutorialsShown: Record<string, boolean>;
  tutorialsEnabled: boolean;

  constructor({
    date,
    dungeonInstances,
    furthestDepth,
    atDeathScreen,
    shops,
    colorScheme,
    vibrationEnabled,
    healthWarning,
    tutorialsShown,
    tutorialsEnabled,
  }: GameOptions) {
    this.date = date ?? new Date().toISOString();
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
            stepsBeforeBoss: 10,
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
    this.vibrationEnabled = vibrationEnabled;
    this.healthWarning = healthWarning ?? 0.2;
    this.tutorialsShown = tutorialsShown ?? {
      class: true,
      aging: true,
      blessing: true,
      intro: false,
      spell: false,
      labor: false,
      dungeon: false,
      dungeonInterior: false,
      shops: false,
      shopInterior: false,
      medical: false,
      investing: false,
      training: false,
    };
    this.tutorialsEnabled = tutorialsEnabled ?? true;
    makeObservable(this, {
      date: observable,
      dungeonInstances: observable,
      furthestDepth: observable,
      atDeathScreen: observable,
      shops: observable,
      colorScheme: observable,
      vibrationEnabled: observable,
      healthWarning: observable,
      tutorialsShown: observable,
      tutorialsEnabled: observable,
      gameTick: action,
      getDungeon: action,
      getInstance: action,
      openNextDungeonLevel: action,
      setColorScheme: action,
      hitDeathScreen: action,
      modifyVibrationSettings: action,
      setHealthWarning: action,
      updateTutorialState: action,
      resetTutorialState: action,
      getTutorialState: action,
      disableTutorials: action,
      enableTutorials: action,
    });
  }

  //----------------------------------Date----------------------------------//
  public gameTick(playerState: PlayerCharacter) {
    const dateObject = new Date(this.date);
    dateObject.setDate(dateObject.getDate() + 7);
    this.date = dateObject.toISOString();
    if (playerState.sanity < 0) {
      lowSanityDebuffGenerator(playerState);
    }
    playerState.conditionTicker();
    playerState.tickAllInvestments();
  }
  //----------------------------------Dungeon----------------------------------//
  public getDungeon(instance: string, level: number): DungeonLevel | undefined {
    const foundInstance = this.dungeonInstances.find(
      (dungeonInstance) => dungeonInstance.name == instance,
    );
    if (foundInstance) {
      const found = foundInstance.levels.find(
        (dungeonLevel) => dungeonLevel.level == level,
      );
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
      //console.log(depth);
      //console.log(Object.isFrozen(this.furthestDepth));
      if (depth) {
        depth = { instance: depth?.instance, level: depth!.level + 1 };
      }
      this.furthestDepth = this.furthestDepth.map((depth) =>
        depth.instance === currentInstance
          ? { ...depth, level: depth.level + 1 }
          : depth,
      );

      //console.log(depth);
      //console.log(this.furthestDepth);
    }
  }

  //----------------------------------Misc----------------------------------//
  public hitDeathScreen() {
    this.atDeathScreen = true;
  }

  public setColorScheme(color: "light" | "dark" | "system") {
    this.colorScheme = color;
  }

  public modifyVibrationSettings(targetState: "full" | "minimal" | "none") {
    this.vibrationEnabled = targetState;
  }

  public setHealthWarning(desiredValue: number) {
    this.healthWarning = desiredValue;
  }

  public updateTutorialState(tutorial: string, state: boolean) {
    this.tutorialsShown[tutorial] = state;
  }

  public resetTutorialState() {
    const defaultState = {
      class: false,
      aging: false,
      blessing: false,
      intro: false,
      spell: false,
      labor: false,
      dungeon: false,
      dungeonInterior: false,
      shops: false,
      shopInterior: false,
      medical: false,
      investing: false,
      training: false,
    };
    this.tutorialsShown = defaultState;
    this.enableTutorials();
  }

  public disableTutorials() {
    this.tutorialsEnabled = false;
  }
  public enableTutorials() {
    this.tutorialsEnabled = true;
  }

  public getTutorialState(tutorial: string) {
    return this.tutorialsShown[tutorial];
  }

  static fromJSON(json: any): Game {
    const game = new Game({
      date: json.date ? json.date : new Date().toISOString(),
      furthestDepth: json.furthestDepth,
      atDeathScreen: json.atDeathScreen,
      dungeonInstances: json.dungeonInstances
        ? json.dungeonInstances.map((instance: any) =>
            DungeonInstance.fromJSON(instance),
          )
        : undefined,
      shops: json.shops
        ? json.shops.map((shop: any) => Shop.fromJSON(shop))
        : undefined,
      colorScheme: json.colorScheme,
      vibrationEnabled: json.vibrationEnabled,
      healthWarning: json.healthWarning,
      tutorialsShown: json.tutorialsShown,
      tutorialsEnabled: json.tutorialsEnabled,
    });

    return game;
  }
}
