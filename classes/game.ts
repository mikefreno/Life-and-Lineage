import { DungeonInstance, DungeonLevel } from "./dungeon";
import { Shop } from "./shop";
import dungeons from "../assets/json/dungeons.json";
import { action, makeObservable, observable } from "mobx";
import { PlayerCharacter } from "./character";
import { lowSanityDebuffGenerator } from "../utility/functions/conditions";

interface GameOptions {
  date?: string;
  shops: Shop[];
  dungeonInstances?: DungeonInstance[];
  completedInstances?: string[];
  atDeathScreen?: boolean;
  colorScheme?: "system" | "dark" | "light";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning?: number;
  tutorialsShown?: Record<string, boolean>;
  tutorialsEnabled?: boolean;
  medicalOptions?: {
    health: boolean;
    mana: boolean;
    sanity: boolean;
    other: boolean;
  };
}

export class Game {
  date: string;
  dungeonInstances: DungeonInstance[];
  completedInstances: string[];
  atDeathScreen: boolean;
  shops: Shop[];
  colorScheme: "system" | "dark" | "light";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning: number;
  tutorialsShown: Record<string, boolean>;
  tutorialsEnabled: boolean;
  medicalOptions: {
    health: boolean;
    mana: boolean;
    sanity: boolean;
    other: boolean;
  };

  constructor({
    date,
    dungeonInstances,
    completedInstances,
    atDeathScreen,
    shops,
    colorScheme,
    vibrationEnabled,
    healthWarning,
    tutorialsShown,
    tutorialsEnabled,
    medicalOptions,
  }: GameOptions) {
    this.date = date ?? new Date().toISOString();
    this.dungeonInstances = dungeonInstances ?? [
      new DungeonInstance({
        name: "training grounds",
        levels: [
          new DungeonLevel({
            level: 0,
            bosses: [],
            tiles: 0,
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
            tiles: 10,
            bossDefeated: false,
          }),
        ],
      }),
    ];
    this.completedInstances = completedInstances ?? [];
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
    this.medicalOptions = medicalOptions ?? {
      health: true,
      mana: true,
      sanity: true,
      other: true,
    };
    makeObservable(this, {
      date: observable,
      dungeonInstances: observable,
      atDeathScreen: observable,
      completedInstances: observable,
      shops: observable,
      colorScheme: observable,
      vibrationEnabled: observable,
      healthWarning: observable,
      tutorialsShown: observable,
      tutorialsEnabled: observable,
      medicalOptions: observable,
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
      setMedicalOptionVisibility: action,
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
    playerState.tickDownRelationshipAffection();
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

  public openNextDungeonLevel(currentInstanceName: string) {
    const foundInstanceObj = dungeons.find(
      (dungeon) => dungeon.instance == currentInstanceName,
    );
    if (!foundInstanceObj) {
      throw new Error("Missing instance object!");
    } else {
      const ownedInstance = this.dungeonInstances.find(
        (instance) => instance.name == currentInstanceName,
      );
      if (!ownedInstance) {
        throw new Error("Missing owned instance");
      }
      if (ownedInstance.levels.length < foundInstanceObj.levels.length) {
        ownedInstance.addLevel();
      } else {
        const unlockStrings = foundInstanceObj.unlocks;
        unlockStrings.forEach((unlock) => {
          const found = dungeons.find((dungeon) => dungeon.instance == unlock);
          if (!found) {
            throw new Error("Missing instance object in unlock loop!");
          } else {
            let alreadyExists = false;
            this.dungeonInstances.forEach((instance) => {
              if (instance.name == found.instance) {
                alreadyExists = true;
              }
            });
            if (!alreadyExists) {
              const instance = new DungeonInstance({
                name: found.instance,
                levels: [
                  new DungeonLevel({
                    level: 1,
                    step: 0,
                    tiles: found.levels[0].tiles,
                    bosses: found.levels[0].boss,
                    bossDefeated: false,
                  }),
                ],
              });
              this.dungeonInstances.push(instance);
            }
          }
        });
      }
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

  public setMedicalOptionVisibility(
    type: "health" | "mana" | "sanity" | "other",
    state: boolean,
  ) {
    this.medicalOptions[type] = state;
  }

  static fromJSON(json: any): Game {
    const game = new Game({
      date: json.date ? json.date : new Date().toISOString(),
      completedInstances: json.completedInstances,
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
      medicalOptions: json.medicalOptions,
    });

    return game;
  }
}
