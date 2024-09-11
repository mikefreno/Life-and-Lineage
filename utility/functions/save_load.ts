import { throttle } from "lodash";
import { PlayerCharacter } from "../../classes/character";
import type { Enemy } from "../../classes/creatures";
import { Game } from "../../classes/game";
import type { AppContextType, DungeonContextType } from "../types";
import { MMKV } from "react-native-mmkv";
export const storage = new MMKV();

const _fullSave = async (
  game: Game | undefined,
  player: PlayerCharacter | undefined,
) => {
  if (game && player) {
    try {
      storage.set("game", JSON.stringify(game));
      storage.set("player", JSON.stringify(player));
    } catch (e) {
      console.log("Error in fullSave:", e);
    }
  }
};

export const fullSave = throttle(_fullSave, 2000);

/**
 * This should only rarely be called directly, such as app settings changes and after each turn in the dungeon.
 */
export const fullLoad = async () => {
  try {
    const retrieved_game = storage.getString("game");
    const retrieved_player = storage.getString("player");
    let game;
    let player;
    if (retrieved_game) {
      game = Game.fromJSON(JSON.parse(retrieved_game));
    }
    if (retrieved_player) {
      player = PlayerCharacter.fromJSON(JSON.parse(retrieved_player));
    }
    return { player, game };
  } catch (e) {
    console.log("Error in fullLoad:", e);
    return { game: undefined, player: undefined };
  }
};

interface dungeonSave {
  enemy: Enemy | null;
  dungeonData: DungeonContextType | undefined;
  appData: AppContextType | undefined;
}

export function dungeonSave({ enemy, dungeonData, appData }: dungeonSave) {
  if (!appData || !dungeonData)
    throw new Error("missing context in dungeonSave()");
  const { playerState, gameState } = appData;
  const {
    slug,
    tiles,
    instanceName,
    currentPosition,
    fightingBoss,
    mapDimensions,
  } = dungeonData;
  if (playerState && gameState) {
    const level = slug.length > 2 ? slug[1] + "," + slug[2] : slug[1];
    if (tiles.length > 0) {
      playerState.setInDungeon({
        state: true,
        instance: instanceName,
        level: level,
        dungeonMap: tiles,
        currentPosition: currentPosition ?? tiles[0],
        mapDimensions: mapDimensions,
        enemy: enemy,
        fightingBoss: fightingBoss,
      });
      fullSave(gameState, playerState);
    }
  }
}
