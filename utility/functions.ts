import AsyncStorage from "@react-native-async-storage/async-storage";
import { Game } from "../classes/game";
import { PlayerCharacter } from "../classes/character";

export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
    console.log(e);
  }
};

//just saves game, simpler interface
export const saveGame = async (game: Game | null) => {
  try {
    const jsonGame = JSON.stringify(game);
    await AsyncStorage.setItem("game", jsonGame);
  } catch (e) {
    console.log(e);
  }
};
export const savePlayer = async (player: PlayerCharacter) => {
  try {
    const jsonPlayer = JSON.stringify(player);
    await AsyncStorage.setItem("player", jsonPlayer);
  } catch (e) {
    console.log(e);
  }
};

export const fullSave = async (game: Game, player: PlayerCharacter) => {
  try {
    const jsonGame = JSON.stringify(game);
    await AsyncStorage.setItem("game", jsonGame);
    const jsonPlayer = JSON.stringify(player);
    await AsyncStorage.setItem("player", jsonPlayer);
  } catch (e) {
    console.log(e);
  }
};

export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log(e);
  }
};

export const loadGame = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("game");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log(e);
  }
};

export const loadPlayer = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("player");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log(e);
  }
};

export function calculateAge(birthdate: Date, currentDate: Date) {
  let age = currentDate.getFullYear() - birthdate.getFullYear();
  const m = currentDate.getMonth() - birthdate.getMonth();

  if (m < 0 || (m === 0 && currentDate.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}

const heads = {
  Elderly_M: require("../assets/images/heads/Elderly_M.png"),
  Elderly_F: require("../assets/images/heads/Elderly_F.png"),
  Aging_M: require("../assets/images/heads/Aging_M.png"),
  Aging_F: require("../assets/images/heads/Aging_F.png"),
  MA_M: require("../assets/images/heads/MA_M.png"),
  MA_F: require("../assets/images/heads/MA_F.png"),
  Adult_M: require("../assets/images/heads/Adult_M.png"),
  Adult_F: require("../assets/images/heads/Adult_F.png"),
  YA_M: require("../assets/images/heads/YA_M.png"),
  YA_F: require("../assets/images/heads/YA_F.png"),
  Teen_M: require("../assets/images/heads/Teen_M.png"),
  Teen_F: require("../assets/images/heads/Teen_F.png"),
  Child_M: require("../assets/images/heads/Child_M.png"),
  Child_F: require("../assets/images/heads/Child_F.png"),
  Baby_M: require("../assets/images/heads/Baby_M.png"),
  Baby_F: require("../assets/images/heads/Baby_F.png"),
};

export function getCharacterImage(age: number, sex: "M" | "F") {
  if (age > 75) {
    return heads[`Elderly_${sex}`];
  }
  if (age > 60) {
    return heads[`Aging_${sex}`];
  }
  if (age > 45) {
    return heads[`MA_${sex}`];
  }
  if (age > 30) {
    return heads[`Adult_${sex}`];
  }
  if (age > 20) {
    return heads[`YA_${sex}`];
  }
  if (age > 15) {
    return heads[`Teen_${sex}`];
  }
  if (age > 4) {
    return heads[`Child_${sex}`];
  } else {
    return heads[`Baby_${sex}`];
  }
}

const monsters = {};
export function getMonsterImage(monsterName: string) {
  return require("../assets/images/monsters/goblin.png");
}

export function flipCoin() {
  return Math.random() < 0.5 ? "Heads" : "Tails";
}

export function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

export function toTitleCase(title: string) {
  return title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
