import { throttle } from "lodash";
import { PlayerCharacter } from "../../classes/character";
import type { Enemy } from "../../classes/creatures";
import { Game } from "../../classes/game";
import type { AppContextType, DungeonContextType } from "../types";
import { storage } from "./storage";
import { parse, stringify } from "flatted";

const _fullSave = async (
  game: Game | undefined,
  player: PlayerCharacter | undefined,
) => {
  if (game && player) {
    try {
      storage.set("player", stringifyCircular(player));
      storage.set("game", stringifyCircular(Game.forSaving(game)));
    } catch (e) {
      console.log("Error in _fullSave:", e);
    }
  }
};

function stringifyCircular(obj) {
  const seen = new WeakSet();

  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return; // Ignore circular references
      }
      seen.add(value);
    }
    return value;
  });
}

/**
 * This should only rarely be called directly, such as app settings changes and shop transactions
 */
export const fullSave = throttle(_fullSave, 2000);

export const fullLoad = async () => {
  try {
    const retrieved_player = storage.getString("player");
    const retrieved_game = storage.getString("game");
    if (!retrieved_game || !retrieved_player)
      return { game: undefined, player: undefined };
    let game = Game.fromJSON(parse(retrieved_game));
    let player = PlayerCharacter.fromJSON(parse(retrieved_player));
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
