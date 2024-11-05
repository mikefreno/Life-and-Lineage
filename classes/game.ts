import { DungeonInstance, DungeonLevel } from "./dungeon";
import dungeonsJSON from "../assets/json/dungeons.json";
import { action, makeObservable, observable, reaction } from "mobx";
import { Character, PlayerCharacter } from "./character";
import { lowSanityDebuffGenerator } from "../utility/functions/conditions";
import { TutorialOption } from "../utility/types";
import { Shop } from "./shop";
import { calculateAge } from "../utility/functions/misc";
import { generateNewAdoptee } from "../utility/functions/characterAid";
import { saveGame, savePlayer } from "../utility/functions/save_load";

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
  inheritedGame?: boolean;
}

/**
 * This stores anything not directly related to the `PlayerCharacter`, the idea was to store anything that should persist in player character death.
 * The above would include obvious things like the app settings (vibration, tutorials and health warning level, color scheme) date properties and shops
 */
export class Game {
  date: string; // compared against the startDate to calculate ages
  readonly startDate: string; // only ever set at game start, should never again be modified.
  dungeonInstances: DungeonInstance[];
  atDeathScreen: boolean;
  shops: Shop[];
  colorScheme: "system" | "dark" | "light";
  vibrationEnabled: "full" | "minimal" | "none";
  healthWarning: number;
  tutorialsShown: Record<TutorialOption, boolean>;
  tutorialsEnabled: boolean;
  independantChildren: Character[];
  inheritedGame: boolean;

  constructor({
    date,
    startDate,
    dungeonInstances,
    atDeathScreen,
    shops,
    colorScheme,
    vibrationEnabled,
    healthWarning,
    tutorialsShown,
    tutorialsEnabled,
    independantChildren,
    inheritedGame,
  }: GameOptions) {
    this.date = date ?? new Date().toISOString();
    this.startDate = startDate ?? new Date().toISOString();
    this.dungeonInstances = dungeonInstances ?? Game.getInitDungeonState();
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
      [TutorialOption.keyItem]: false,
    };
    this.tutorialsEnabled = tutorialsEnabled ?? true;
    this.independantChildren = independantChildren ?? [];
    this.inheritedGame = inheritedGame ?? false;

    makeObservable(this, {
      date: observable,
      dungeonInstances: observable,
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
      disableTutorials: action,
      enableTutorials: action,
      independantChildren: observable,
      independantChildrenAgeCheck: action,
      adopt: action,
      inheritance: action,
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
    savePlayer(playerState);
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
  public openNextDungeonLevel(currentInstance: DungeonInstance) {
    const successfullLevelUnlock = currentInstance.unlockNextLevel();
    if (!successfullLevelUnlock) {
      const unlockObjects: any[] = [];
      currentInstance.unlocks.forEach((unlock) => {
        const matchingObj = dungeonsJSON.find((obj) => obj.name == unlock);
        if (matchingObj) {
          unlockObjects.push(matchingObj);
        }
      });
      unlockObjects.forEach((obj) => {
        const inst = DungeonInstance.fromJSON(obj);
        this.dungeonInstances.push(inst);
      });
    }
  }

  //----------------------------------Misc----------------------------------//
  /**
   * Used on player death to block the user from somehow going back, and healing their character
   */
  public hitDeathScreen() {
    this.atDeathScreen = true;
  }

  public inheritance() {
    this.atDeathScreen = false;
    let inheritedSkillPoints = 0;
    this.dungeonInstances.forEach((inst) =>
      inst.levels.forEach((dung) => {
        if (dung.bossDefeated) {
          inheritedSkillPoints += 3;
        }
      }),
    );
    return inheritedSkillPoints;
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
      [TutorialOption.keyItem]: false,
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
    partner = undefined,
  }: {
    adoptee: Character;
    player: PlayerCharacter;
    partner?: Character;
  }) {
    this.independantChildren = this.independantChildren.filter(
      (child) => child.id !== adoptee.id,
    );
    player.adopt({ child: adoptee, partner: partner });
  }

  forSave(): any {
    const clone = { ...this };
    clone.shops = clone.shops.map((shop) => shop.forSave());
    return clone;
  }

  public refreshAllShops(player: PlayerCharacter) {
    this.shops.forEach((shop) => shop.refreshInventory(player));
  }

  static getInitDungeonState() {
    const nearbyCave = dungeonsJSON.find((inst) => inst.name == "nearby cave");
    if (!nearbyCave) {
      throw new Error("json parse failure: no nearby cave in dungeonsJSON");
    }
    return [
      new DungeonInstance({
        name: "training grounds",
        unlocks: [],
        levels: [
          new DungeonLevel({
            level: 0,
            boss: [],
            tiles: 0,
            bossDefeated: true,
            unlocked: true,
          }),
        ],
      }),
      DungeonInstance.fromJSON(nearbyCave),
    ];
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
      independantChildren: json.independantChildren
        ? json.independantChildren.map((ind: any) => Character.fromJSON(ind))
        : [],
      inheritedGame: json.inheritedGame,
    });

    return game;
  }
}
