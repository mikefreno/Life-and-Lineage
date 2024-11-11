import { throttle } from "lodash";
import type { Enemy } from "../../classes/creatures";
import { Game } from "../../classes/game";
import { storage } from "./storage";
import { PlayerCharacter } from "../../classes/character";
import {
  BoundingBox,
  type Tile,
} from "../../components/DungeonComponents/DungeonMap";
import { parse, stringify } from "flatted";

const _gameSave = async (game: Game | undefined) => {
  if (game) {
    try {
      storage.set("game", stringify(game.forSave()));
    } catch (e) {
      console.log("Error in _gameSave:", e);
    }
  }
};
const _playerSave = async (player: PlayerCharacter | undefined) => {
  if (player) {
    try {
      storage.set("player", stringify(player));
    } catch (e) {
      console.log("Error in _playerSave:", e);
    }
  }
};

export const saveGame = throttle(_gameSave, 500);
export const savePlayer = throttle(_playerSave, 500);

export const fullLoad = async () => {
  try {
    const retrieved_game = storage.getString("game");
    const retrieved_player = storage.getString("player");
    if (!retrieved_game || !retrieved_player)
      return { game: undefined, player: undefined };
    let game = Game.fromJSON(parse(retrieved_game));
    let player = PlayerCharacter.fromJSON(parse(retrieved_player));
    return { game, player };
  } catch (e) {
    console.log("Error in fullLoad:", e);
    return { game: undefined, player: undefined };
  }
};

export function dungeonSave({
  playerState,
  gameState,
  slug,
  instanceName,
  tiles,
  currentPosition,
  mapDimensions,
  enemyState,
  fightingBoss,
}: {
  playerState: PlayerCharacter | undefined;
  gameState: Game | undefined;
  slug: string[];
  instanceName: string;
  tiles: Tile[];
  currentPosition: Tile | null;
  mapDimensions: BoundingBox;
  enemyState: Enemy | null;
  fightingBoss: boolean;
}) {
  if (playerState && gameState) {
    const level = slug.length > 2 ? slug[1] + "," + slug[2] : slug[1];
    if (tiles.length > 0) {
      playerState.setInDungeon({
        state: true,
        instance: instanceName,
        level,
        dungeonMap: tiles,
        currentPosition: currentPosition ?? tiles[0],
        mapDimensions,
        enemyState,
        fightingBoss,
      });
      saveGame(gameState);
      savePlayer(playerState);
    }
  }
}
