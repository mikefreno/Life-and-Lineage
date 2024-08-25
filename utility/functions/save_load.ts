import { PlayerCharacter } from "../../classes/character";
import type { Enemy } from "../../classes/creatures";
import { Game } from "../../classes/game";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppContextType, DungeonContextType } from "../types";
import {
  Game as GameMessage,
  PlayerCharacter as PlayerCharacterMessage,
} from "../../proto/generated/game_data";
import { fromByteArray, toByteArray } from "react-native-quick-base64";
import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

//just saves game, simpler interface
export const saveGame = async (game: Game | null) => {
  try {
    const jsonGame = JSON.stringify(game);
    await AsyncStorage.setItem("game", jsonGame);
  } catch (e) {
    console.error(e);
  }
};

export const savePlayer = async (player: PlayerCharacter) => {
  try {
    const jsonPlayer = JSON.stringify(player);
    await AsyncStorage.setItem("player", jsonPlayer);
  } catch (e) {
    console.error(e);
  }
};

export const fullSave = async (
  game: Game | null,
  player: PlayerCharacter | null,
) => {
  if (game && player) {
    try {
      const packedGame = GameMessage.encode(game).finish();
      const packedPlayer = PlayerCharacterMessage.encode(player).finish();

      storage.set("test_game", fromByteArray(packedGame));
      storage.set("test_player", fromByteArray(packedPlayer));
    } catch (e) {
      console.error("Error in test_fullSave_new:", e);
    }
  } else {
    console.error("Game or player is null in test_fullSave_new");
  }
};

export const fullLoad = async () => {
  try {
    const retrieved_game = storage.getString("test_game");
    const retrieved_player = storage.getString("test_player");
    let game;
    let player;
    if (retrieved_game) {
      game = Game.fromJSON(GameMessage.decode(toByteArray(retrieved_game)));
    }
    if (retrieved_player) {
      player = PlayerCharacter.fromJSON(
        PlayerCharacterMessage.decode(toByteArray(retrieved_player)),
      );
    }
    return { player, game };
  } catch (e) {
    console.error("Error in test_fullLoad_new:", e);
    return { game: undefined, player: undefined };
  }
};

export const loadGame = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("game");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(e);
  }
};

export const loadPlayer = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("player");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(e);
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
