import { DungeonInstance, DungeonLevel } from "./dungeon";
import dungeons from "../assets/json/dungeons.json";
import { action, makeObservable, observable, reaction } from "mobx";
import { Character, PlayerCharacter } from "./character";
import { lowSanityDebuffGenerator } from "../utility/functions/conditions";
import { TutorialOption } from "../utility/types";
import { Shop } from "./shop";
import { calculateAge } from "../utility/functions/misc";
import { generateNewAdoptee } from "../utility/functions/characterAid";
import { saveGame } from "../utility/functions/save_load";

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
  independantChildren?: Character[];
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
  independantChildren: Character[];

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
    independantChildren,
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
    this.independantChildren = independantChildren ?? [];

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
      independantChildren: observable,
      independantChildrenAgeCheck: action,
      adopt: action,
    });

    reaction(
      () => [
        this.date,
        this.atDeathScreen,
        this.colorScheme,
        this.vibrationEnabled,
        this.healthWarning,
        this.tutorialsShown,
        this.tutorialsEnabled,
        this.independantChildren,
      ],
      () => {
        saveGame(this);
      },
    );
  }

  //----------------------------------Date----------------------------------//

  /**
   * Moves the game time forward, effectively aging all characters.
   * Additionally will "tick" all time based events,
   * this includes affections, conditions and investements. Additionally will roll to apply a debuff if the player character
   * has negative sanity
   */
  public gameTick({ playerState }: { playerState: PlayerCharacter }) {
    const dateObject = new Date(this.date);
    dateObject.setDate(dateObject.getDate() + 7);
    this.date = dateObject.toISOString();
    if (playerState.currentSanity < 0) {
      lowSanityDebuffGenerator(playerState);
    }
    playerState.tickDownRelationshipAffection();
    playerState.conditionTicker();
    playerState.tickAllInvestments();
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
    const currentState = this.tutorialsShown;
    currentState[tutorial] = state;
    this.tutorialsShown = currentState;
  }

  public resetTutorialState(callbackFunction?: () => any) {
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
    if (callbackFunction) {
      callbackFunction();
    }
  }

  public disableTutorials() {
    this.tutorialsEnabled = false;
  }
  public enableTutorials() {
    this.tutorialsEnabled = true;
  }

  /**
   * Remove any children in `independantChildren` who are no longer minors (under 18 y.o.)
   */
  public independantChildrenAgeCheck() {
    this.independantChildren = this.independantChildren.filter((child) => {
      const age = calculateAge(new Date(child.birthdate), new Date(this.date));
      return age < 18;
    });
    this.fillUpIndependantChildren();
  }

  /**
   * Set `independantChildren` to min length (6)
   */
  private fillUpIndependantChildren() {
    while (this.independantChildren.length < 6) {
      this.independantChildren.push(generateNewAdoptee());
    }
  }

  public adopt({
    adoptee,
    player,
  }: {
    adoptee: Character;
    player: PlayerCharacter;
  }) {
    this.independantChildren = this.independantChildren.filter(
      (child) => child.id !== adoptee.id,
    );
    player.adopt(adoptee);
  }

  public toJSON(): any {
    return {
      date: this.date,
      startDate: this.startDate,
      completedInstances: this.completedInstances,
      atDeathScreen: this.atDeathScreen,
      dungeonInstances: this.dungeonInstances
        ? this.dungeonInstances.map((instance) => instance.toJSON())
        : undefined,
      shops: this.shops ? this.shops.map((shop) => shop.toJSON()) : undefined,
      colorScheme: this.colorScheme,
      vibrationEnabled: this.vibrationEnabled,
      healthWarning: this.healthWarning,
      tutorialsShown: this.tutorialsShown,
      tutorialsEnabled: this.tutorialsEnabled,
      independantChildren: this.independantChildren,
    };
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
      independantChildren: json.independantChildren,
    });

    return game;
  }
}
