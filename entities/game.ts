import { action, makeObservable, observable, reaction } from "mobx";
import { Character, PlayerCharacter } from "./character";
import { lowSanityDebuffGenerator } from "../utility/functions/conditions";
import { TutorialOption } from "../utility/types";
import { generateNewAdoptee } from "../utility/functions/characterAid";
import { RootStore } from "../stores/RootStore";
import { storage } from "../utility/functions/storage";
import { throttle } from "lodash";
import { stringify } from "flatted";
import { TimeStore } from "../stores/TimeStore";

interface GameOptions {
  timeStore: TimeStore;
  atDeathScreen?: boolean;
  tutorialsShown?: Record<TutorialOption, boolean>;
  tutorialsEnabled?: boolean;
  independantChildren?: Character[];
  root: RootStore;
}

/**
 * This stores anything not directly related to the `PlayerCharacter`, the idea was to store anything that should persist in player character death.
 * The above would include obvious things like the app settings (vibration, tutorials and health warning level, color scheme) date properties and shops
 */
export class Game {
  timeStore: TimeStore;
  atDeathScreen: boolean;
  tutorialsShown: Record<TutorialOption, boolean>;
  tutorialsEnabled: boolean;
  independantChildren: Character[];
  startingNewGame = false;
  root: RootStore;

  constructor({
    timeStore,
    atDeathScreen,
    tutorialsShown,
    tutorialsEnabled,
    independantChildren,
    root,
  }: GameOptions) {
    this.timeStore = timeStore;
    this.atDeathScreen = atDeathScreen ?? false;
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
    this.root = root;

    makeObservable(this, {
      atDeathScreen: observable,
      tutorialsShown: observable,
      tutorialsEnabled: observable,
      gameTick: action,
      hitDeathScreen: action,
      updateTutorialState: action,
      resetTutorialState: action,
      disableTutorials: action,
      enableTutorials: action,
      independantChildren: observable,
      independantChildrenAgeCheck: action,
      adopt: action,
      inheritance: action,
      startingNewGame: observable,
    });

    reaction(
      () => [
        this.atDeathScreen,
        this.tutorialsEnabled,
        this.independantChildren,
        this.tutorialsShown[0],
        this.tutorialsShown[1],
        this.tutorialsShown[2],
        this.tutorialsShown[3],
        this.tutorialsShown[4],
        this.tutorialsShown[5],
        this.tutorialsShown[6],
        this.tutorialsShown[7],
        this.tutorialsShown[8],
        this.tutorialsShown[9],
        this.tutorialsShown[10],
        this.tutorialsShown[11],
        this.tutorialsShown[12],
        this.tutorialsShown[13],
        this.tutorialsShown[14],
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
  public gameTick() {
    this.timeStore.tick();
    const playerState = this.root.playerState;
    if (!playerState) throw new Error("Missing player in root!");
    if (playerState.currentSanity < 0) {
      lowSanityDebuffGenerator(playerState);
    }
    playerState.gameTurnHandler();
  }
  //----------------------------------Dungeon----------------------------------//

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
    this.root.dungeonStore.dungeonInstances.forEach((inst) =>
      inst.levels.forEach((dung) => {
        if (dung.bossDefeated) {
          inheritedSkillPoints += 3;
        }
      }),
    );
    return inheritedSkillPoints;
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
      const age = this.timeStore.calculateAge({
        birthYear: child.birthdate.year,
        birthWeek: child.birthdate.week,
      });
      return age < 18;
    });
    this.fillUpIndependantChildren();
  }

  /**
   * Set `independantChildren` to min length (6)
   */
  private fillUpIndependantChildren() {
    while (this.independantChildren.length < 6) {
      this.independantChildren.push(generateNewAdoptee(this.root));
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

  static fromJSON(json: any): Game {
    const game = new Game({
      timeStore: TimeStore.fromJSON({ ...json.timeStore, root: json.root }),
      atDeathScreen: json.atDeathScreen,
      tutorialsShown: json.tutorialsShown,
      tutorialsEnabled: json.tutorialsEnabled,
      independantChildren: json.independantChildren
        ? json.independantChildren.map((ind: any) =>
            Character.fromJSON({ ...ind, root: json.root }),
          )
        : [],
      root: json.root,
    });

    return game;
  }
}

const _gameSave = async (game: Game | null) => {
  if (game) {
    try {
      storage.set("game", stringify({ ...game, root: null }));
    } catch (e) {
      console.log("Error in _gameSave:", e);
    }
  }
};
export const saveGame = throttle(_gameSave, 500);
