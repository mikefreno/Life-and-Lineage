import AsyncStorage from "@react-native-async-storage/async-storage";
import { Game } from "../classes/game";
import { PlayerCharacter } from "../classes/character";
import shops from "../assets/json/shops.json";
import names from "../assets/json/names.json";
import { Shop, generateInventory } from "../classes/shop";

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

export const fullSave = async (
  game: Game | null,
  player: PlayerCharacter | null,
) => {
  if (game && player) {
    try {
      const jsonGame = JSON.stringify(game);
      await AsyncStorage.setItem("game", jsonGame);
      const jsonPlayer = JSON.stringify(player);
      await AsyncStorage.setItem("player", jsonPlayer);
    } catch (e) {
      console.log(e);
    }
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

export function damageReduction(armorValue: number) {
  if (armorValue >= 600) {
    return 0.925;
  } else {
    const reduction = 92.5 * (1 - Math.exp(-0.01 * armorValue));
    return Math.min(reduction, 92.5) / 100;
  }
}

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

function getRandomName(sex: string): string {
  const filteredNames = names.filter((name) => {
    return name.sex == sex;
  });
  const randomIndex = Math.floor(Math.random() * filteredNames.length);
  return `${filteredNames[randomIndex].firstName} ${filteredNames[randomIndex].lastName}`;
}

export function generateBirthday(minAge: number, maxAge: number): Date {
  const today = new Date();
  const minDate = new Date();
  const maxDate = new Date();

  minDate.setFullYear(today.getFullYear() - maxAge - 1);
  minDate.setDate(minDate.getDate() + 1);
  maxDate.setFullYear(today.getFullYear() - minAge);

  const diff = maxDate.getTime() - minDate.getTime();
  const randomTimestamp = Math.random() * diff + minDate.getTime();

  return new Date(randomTimestamp);
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createShops() {
  let createdShops: Shop[] = [];
  shops.forEach((shop) => {
    //want to favor likelihood of male shopkeepers slightly
    const sex = rollD20() <= 12 ? "male" : "female";
    const name = getRandomName(sex);
    const birthday = generateBirthday(28, 60);
    const randIdx = Math.floor(
      Math.random() * shop.possiblePersonalities.length,
    );
    const itemCount = getRandomInt(
      shop.itemQuantityRange.minimum,
      shop.itemQuantityRange.maximum,
    );
    const newShop = new Shop({
      shopKeeperName: name,
      shopKeeperSex: sex,
      shopKeeperBirthDate: birthday,
      personality: shop.possiblePersonalities[randIdx],
      baseGold: shop.baseGold,
      lastStockRefresh: new Date(),
      archetype: shop.type,
      inventory: generateInventory(itemCount, shop.trades),
    });
    createdShops.push(newShop);
  });
  return createdShops;
}
