import { PlayerCharacter } from "../entities/character";
import { Game } from "../entities/game";
import { storage } from "../utility/functions/storage";
import { parse } from "flatted";
import UIStore from "./UIStore";
import EnemyStore from "./EnemyStore";
import { DungeonStore } from "./DungeonStore";
import { ShopStore } from "./ShopsStore";

export class RootStore {
  gameState: Game | null;
  playerState: PlayerCharacter | null;
  enemyStore: EnemyStore;
  shopsStore: ShopStore;
  dungeonStore: DungeonStore;
  uiStore: UIStore;

  constructor() {
    const retrieved_game = storage.getString("game");
    const retrieved_player = storage.getString("player");

    this.gameState = retrieved_game
      ? Game.fromJSON({ ...parse(retrieved_game), root: this })
      : null;
    this.playerState = retrieved_player
      ? PlayerCharacter.fromJSON({ ...parse(retrieved_player), root: this })
      : null;
    this.enemyStore = new EnemyStore({ root: this });
    this.shopsStore = new ShopStore({ root: this });

    this.dungeonStore = new DungeonStore({ root: this });
    this.uiStore = new UIStore({ root: this });
  }
}
