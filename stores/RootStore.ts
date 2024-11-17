import { PlayerCharacter } from "../entities/character";
import { Game } from "../entities/game";
import { storage } from "../utility/functions/storage";
import { parse } from "flatted";
import UIStore from "./UIStore";
import EnemyStore from "./EnemyStore";
import { DungeonStore } from "./DungeonStore";
import { ShopStore } from "./ShopsStore";
import { action, computed, makeObservable, observable, reaction } from "mobx";

const compactPaths = [
  "/",
  "/spells",
  "/labor",
  "/dungeon",
  "/shops",
  "/medical",
];

export class RootStore {
  gameState: Game | null;
  playerState: PlayerCharacter | null;
  enemyStore: EnemyStore;
  shopsStore: ShopStore;
  dungeonStore: DungeonStore;
  uiStore: UIStore;
  currentPath: string = "";
  constructed: boolean = false;
  atDeathScreen: boolean = false;

  constructor() {
    const retrieved_game = storage.getString("game");
    const retrieved_player = storage.getString("player");

    this.uiStore = new UIStore({ root: this });
    this.shopsStore = new ShopStore({ root: this });

    this.gameState = retrieved_game
      ? Game.fromJSON({ ...parse(retrieved_game), root: this })
      : null;
    this.playerState = retrieved_player
      ? PlayerCharacter.fromJSON({ ...parse(retrieved_player), root: this })
      : null;

    this.enemyStore = new EnemyStore({ root: this });
    this.dungeonStore = new DungeonStore({ root: this });

    this.constructed = true;

    makeObservable(this, {
      currentPath: observable,
      constructed: observable,
      setPathName: action,
      compactPath: computed,
    });

    reaction(
      () => [
        this.playerState?.unAllocatedSkillPoints,
        this.compactPath,
        this.playerState?.conditions.length,
      ],
      () => {
        this.uiStore.setPlayerStatusCompact(
          !!this.playerState &&
            (this.playerState.unAllocatedSkillPoints > 0 ||
              !this.compactPath ||
              this.playerState.conditions.length > 0),
        );
      },
    );
  }

  get compactPath() {
    return compactPaths.includes(this.currentPath);
  }

  setPathName(pathname: string) {
    this.currentPath = pathname;
  }
}
