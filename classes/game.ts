import { DungeonInstance, DungeonLevel } from "./dungeon";
import dungeons from "../assets/json/dungeons.json";
import { action, makeObservable, observable } from "mobx";
import { PlayerCharacter } from "./character";
import { lowSanityDebuffGenerator } from "../utility/functions/conditions";
import { TutorialOption } from "../utility/types";
import { Shop } from "./shop";

interface GameOptions {
  date?: string;
  startDate?: string;
  shops: Shop[];
  dungeonInstances?: DungeonInstance[];
  completedInstances?: string[];
  atDeathScreen?: boolean;
  colorScheme?: "system" | "dark" | "light";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning?: number;
  tutorialsShown?: Record<TutorialOption, boolean>;
  tutorialsEnabled?: boolean;
}

/**
 * This stores anything not directly related to the `PlayerCharacter`, the idea was to store anything that should persist in player character death.
 * The above would include obvious things like the app settings (vibration, tutorials and health warning level, color scheme) date properties and shops
 */
export class Game {
  date: string; // compared against the startDate to calculate ages
  readonly startDate: string; // only ever set at game start, should never again be modified.
  dungeonInstances: DungeonInstance[];
  completedInstances: string[];
  atDeathScreen: boolean;
  shops: Shop[];
  colorScheme: "system" | "dark" | "light";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning: number;
  tutorialsShown: Record<TutorialOption, boolean>;
  tutorialsEnabled: boolean;

  constructor({
    date,
    startDate,
    dungeonInstances,
    completedInstances,
    atDeathScreen,
    shops,
    colorScheme,
    vibrationEnabled,
    healthWarning,
    tutorialsShown,
    tutorialsEnabled,
  }: GameOptions) {
    this.date = date ?? new Date().toISOString();
    this.startDate = startDate ?? new Date().toISOString();
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
      [TutorialOption.class]: true,
      [TutorialOption.aging]: true,
      [TutorialOption.blessing]: true,
      [TutorialOption.intro]: false,
      [TutorialOption.spell]: false,
      [TutorialOption.labor]: false,
      [TutorialOption.dungeon]: false,
      [TutorialOption.dungeonInterior]: false,
      [TutorialOption.shops]: false,
      [TutorialOption.shopInterior]: false,
      [TutorialOption.medical]: false,
      [TutorialOption.investing]: false,
      [TutorialOption.training]: false,
      [TutorialOption.firstBossKill]: false,
    };
    this.tutorialsEnabled = tutorialsEnabled ?? true;

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
      disableTutorials: action,
      enableTutorials: action,
    });
  }

  //----------------------------------Date----------------------------------//

  /**
   * Saves the game (after all other effects), and moves the game time forward, effectively aging all characters.
   * Additionally will "tick" all time based events,
   * this includes affections, conditions and investements. Additionally will roll to apply a debuff if the player character
   * has negative sanity. The full save is passed in instead of importing to prevent an import cycle
   */
  public gameTick({
    playerState,
    fullSave,
  }: {
    playerState: PlayerCharacter;
    fullSave: (
      game: Game,
      playerState: PlayerCharacter,
    ) => Promise<void> | undefined;
  }) {
    const dateObject = new Date(this.date);
    dateObject.setDate(dateObject.getDate() + 7);
    this.date = dateObject.toISOString();
    if (playerState.currentSanity < 0) {
      lowSanityDebuffGenerator(playerState);
    }
    playerState.tickDownRelationshipAffection();
    playerState.conditionTicker();
    playerState.tickAllInvestments();
    fullSave(this, playerState);
  }
  //----------------------------------Dungeon----------------------------------//
  public getDungeon(instance: string, level: string): DungeonLevel | undefined {
    const foundInstance = this.dungeonInstances.find(
      (dungeonInstance) => dungeonInstance.name == instance,
    );
    if (foundInstance) {
      const found = foundInstance.levels.find(
        (dungeonLevel) => dungeonLevel.level == Number(level),
      );
      return found;
    }
  }

  public getInstance(instanceName: string) {
    return this.dungeonInstances.find(
      (instance) => instance.name == instanceName,
    );
  }

  /**
   * Unlocks the next dungeon(s) when a boss has been defeated, given the name of the current dungeon the player is in.
   */
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
  /**
   * Used on player death to block the user from somehow going back, and healing their character
   */
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

  public updateTutorialState(tutorial: TutorialOption, state: boolean) {
    this.tutorialsShown[tutorial] = state;
  }

  public resetTutorialState() {
    const defaultState = {
      [TutorialOption.class]: false,
      [TutorialOption.aging]: false,
      [TutorialOption.blessing]: false,
      [TutorialOption.intro]: false,
      [TutorialOption.spell]: false,
      [TutorialOption.labor]: false,
      [TutorialOption.dungeon]: false,
      [TutorialOption.dungeonInterior]: false,
      [TutorialOption.shops]: false,
      [TutorialOption.shopInterior]: false,
      [TutorialOption.medical]: false,
      [TutorialOption.investing]: false,
      [TutorialOption.training]: false,
      [TutorialOption.firstBossKill]: false,
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

  static fromJSON(json: any): Game {
    const game = new Game({
      date: json.date,
      startDate: json.startDate,
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
    });

    return game;
  }
  static forSaving(game: Game) {
    return {
      ...game,
      shops: game.shops.map((shop) => shop.toJSON),
    };
  }
}
