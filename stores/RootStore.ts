import { PlayerCharacter } from "../entities/character";
import { storage } from "../utility/functions/storage";
import { parse } from "flatted";
import UIStore from "./UIStore";
import EnemyStore from "./EnemyStore";
import { DungeonStore } from "./DungeonStore";
import { ShopStore } from "./ShopsStore";
import { makeObservable, observable, reaction } from "mobx";
import { AuthStore } from "./AuthStore";
import { TimeStore } from "./TimeStore";
import { CharacterStore } from "./CharacterStore";
import { lowSanityDebuffGenerator } from "../utility/functions/conditions";
import { TutorialStore } from "./TutorialStore";

export class RootStore {
  time: TimeStore;
  playerState: PlayerCharacter | null;
  enemyStore: EnemyStore;
  shopsStore: ShopStore;
  dungeonStore: DungeonStore;
  uiStore: UIStore;
  authStore: AuthStore;

  characterStore: CharacterStore;
  tutorialStore: TutorialStore;

  constructed: boolean = false;
  atDeathScreen: boolean = false;
  startingNewGame: boolean = false;

  constructor() {
    this.time = new TimeStore({ root: this });
    this.authStore = new AuthStore({ root: this });
    this.uiStore = new UIStore({ root: this });
    this.shopsStore = new ShopStore({ root: this });
    this.enemyStore = new EnemyStore({ root: this });
    this.dungeonStore = new DungeonStore({ root: this });
    this.characterStore = new CharacterStore({ root: this });
    this.tutorialStore = new TutorialStore({ root: this });

    const retrieved_player = storage.getString("player");
    this.playerState = retrieved_player
      ? PlayerCharacter.fromJSON({ ...parse(retrieved_player), root: this })
      : null;

    this.constructed = true;

    makeObservable(this, {
      constructed: observable,
      atDeathScreen: observable,
      startingNewGame: observable,
    });

    reaction(
      () => [
        this.playerState?.unAllocatedSkillPoints,
        this.playerState?.conditions.length,
      ],
      () => {
        this.uiStore.setPlayerStatusCompact(
          !!this.playerState &&
            !(
              this.playerState.unAllocatedSkillPoints > 0 ||
              this.playerState.conditions.length > 0
            ),
        );
      },
    );
  }

  gameTick() {
    this.time.tick();
    if (!this.playerState) throw new Error("Missing player in root!");
    if (this.playerState.currentSanity < 0) {
      lowSanityDebuffGenerator(this.playerState);
    }
    this.playerState.gameTurnHandler();
  }

  inheritance(): number {
    let inheritedSkillPoints = 0;
    this.dungeonStore.dungeonInstances.forEach((inst) =>
      inst.levels.forEach((dung) => {
        if (dung.bossDefeated) {
          inheritedSkillPoints += 3;
        }
      }),
    );
    return inheritedSkillPoints;
  }

  hitDeathScreen() {
    this.atDeathScreen = true;
  }

  startNewGame() {
    this.startingNewGame = true;
  }

  setPlayer(player: PlayerCharacter) {
    this.playerState = player;
  }

  leaveDungeon() {
    this.playerState?.clearMinions();
    this.enemyStore.clearEnemyList();
    this.dungeonStore.clearDungeonState();
  }
}
