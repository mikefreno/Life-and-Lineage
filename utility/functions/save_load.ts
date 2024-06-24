import { PlayerCharacter } from "../../classes/character";
import { Game } from "../../classes/game";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  console.log("saving")
  if (game && player) {
    try {
      const jsonGame = JSON.stringify(game);
      const jsonPlayer = JSON.stringify(player);
      await Promise.all([
        AsyncStorage.setItem("game", jsonGame),
        AsyncStorage.setItem("player", jsonPlayer),
      ]);
    } catch (e) {
      console.error(e);
    }
  }
};

export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(e);
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
