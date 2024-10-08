import { throttle } from "lodash";
import type { Enemy } from "../../classes/creatures";
import { Game } from "../../classes/game";
import type { AppContextType, DungeonContextType } from "../types";
import { storage } from "./storage";
import { parse, stringify } from "flatted";

const _gameSave = async (game: Game | undefined) => {
  if (game) {
    try {
      storage.set("game", stringify(Game.forSaving(game)));
    } catch (e) {
      console.log("Error in _gameSave:", e);
    }
  }
};

export const saveGame = throttle(_gameSave, 500);

export const loadGame = async () => {
  try {
    const retrieved_game = storage.getString("game");
    if (!retrieved_game) return { game: undefined };
    let game = Game.fromJSON(parse(retrieved_game));
    return { game };
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
      saveGame(gameState);
    }
  }
}
