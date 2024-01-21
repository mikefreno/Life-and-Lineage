import shops from "../../assets/json/shops.json";
import names from "../../assets/json/names.json";
import { Shop, generateInventory } from "../../classes/shop";
import { rollD20 } from "./roll";

export function calculateAge(birthdate: Date, gameDate: Date) {
  let age = gameDate.getFullYear() - birthdate.getFullYear();
  const m = gameDate.getMonth() - birthdate.getMonth();

  if (m < 0 || (m === 0 && gameDate.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}

export function deathProbabilityByAge(age: number) {
  const a = 0.072;
  const b = 40;
  const probability = 1.0 / (1.0 + Math.exp(-a * (age - b)));
  return probability;
}

export function rollToLiveByAge(age: number) {
  const deathProbability = deathProbabilityByAge(age);
  const rollToLive = Math.ceil(deathProbability * 10) + 1;
  return rollToLive;
}

const heads = {
  Elderly_M: require("../../assets/images/heads/Elderly_M.png"),
  Elderly_F: require("../../assets/images/heads/Elderly_F.png"),
  Aging_M: require("../../assets/images/heads/Aging_M.png"),
  Aging_F: require("../../assets/images/heads/Aging_F.png"),
  MA_M: require("../../assets/images/heads/MA_M.png"),
  MA_F: require("../../assets/images/heads/MA_F.png"),
  Adult_M: require("../../assets/images/heads/Adult_M.png"),
  Adult_F: require("../../assets/images/heads/Adult_F.png"),
  YA_M: require("../../assets/images/heads/YA_M.png"),
  YA_F: require("../../assets/images/heads/YA_F.png"),
  Teen_M: require("../../assets/images/heads/Teen_M.png"),
  Teen_F: require("../../assets/images/heads/Teen_F.png"),
  Child_M: require("../../assets/images/heads/Child_M.png"),
  Child_F: require("../../assets/images/heads/Child_F.png"),
  Baby_M: require("../../assets/images/heads/Baby_M.png"),
  Baby_F: require("../../assets/images/heads/Baby_F.png"),
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

export function toTitleCase(title: string) {
  return title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getRandomName(sex: string) {
  const filteredNames = names.filter((name) => {
    return name.sex == sex;
  });
  const randomIndex = Math.floor(Math.random() * filteredNames.length);
  return {
    firstName: filteredNames[randomIndex].firstName,
    lastName: filteredNames[randomIndex].lastName,
  };
}

export function generateBirthday(minAge: number, maxAge: number) {
  const today = new Date();
  const minDate = new Date();
  const maxDate = new Date();

  minDate.setFullYear(today.getFullYear() - maxAge - 1);
  minDate.setDate(minDate.getDate() + 1);
  maxDate.setFullYear(today.getFullYear() - minAge);

  const diff = maxDate.getTime() - minDate.getTime();
  const randomTimestamp = Math.random() * diff + minDate.getTime();

  return new Date(randomTimestamp).toISOString();
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createShops(playerClass: "mage" | "paladin" | "necromancer") {
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
      shopKeeperName: `${name.firstName} ${name.lastName}`,
      shopKeeperSex: sex,
      shopKeeperBirthDate: birthday,
      personality: shop.possiblePersonalities[randIdx],
      baseGold: shop.baseGold,
      lastStockRefresh: new Date(),
      archetype: shop.type,
      inventory: generateInventory(itemCount, shop.trades, playerClass),
    });
    createdShops.push(newShop);
  });
  return createdShops;
}

export function numberToRoman(num: number): string {
  let roman = "";
  const romanMap = new Map<number, string>([
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ]);

  if (isNaN(num)) {
    throw new Error("Input must be a number between 1 and 100.");
  }
  if (num == 0) {
    return "";
  }

  const sortedRomanMap = Array.from(romanMap.entries()).sort(
    (a, b) => b[0] - a[0],
  );

  for (const [value, symbol] of sortedRomanMap) {
    while (num >= value) {
      roman += symbol;
      num -= value;
    }
  }

  return roman;
}
export function asReadableGold(gold: number) {
  if (gold >= 1_000_000_000) {
    const cleanedUp = (gold / 1_000_000_000).toFixed(2);
    return `${parseFloat(cleanedUp).toLocaleString()}B`;
  }
  if (gold >= 1_000_000) {
    const cleanedUp = (gold / 1_000_000).toFixed(2);
    return `${parseFloat(cleanedUp).toLocaleString()}M`;
  }
  if (gold >= 10_000) {
    const cleanedUp = (gold / 1000).toFixed(2);
    return `${parseFloat(cleanedUp).toLocaleString()}K`;
  } else return gold.toLocaleString();
}
