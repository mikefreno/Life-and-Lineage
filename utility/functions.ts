import { Game } from "../classes/game";
import { PlayerCharacter } from "../classes/character";
import shops from "../assets/json/shops.json";
import names from "../assets/json/names.json";
import conditions from "../assets/json/conditions.json";
import { Shop, generateInventory } from "../classes/shop";
import { Condition } from "../classes/conditions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import sanityDebuffs from "../assets/json/sanityDebuffs.json";
import { ConditionBase } from "./types";

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

export function calculateAge(birthdate: Date, gameDate: Date) {
  let age = gameDate.getFullYear() - birthdate.getFullYear();
  const m = gameDate.getMonth() - birthdate.getMonth();

  if (m < 0 || (m === 0 && gameDate.getDate() < birthdate.getDate())) {
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
      shopKeeperName: name,
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

interface createDebuffDeps {
  debuffName: string;
  debuffChance: number;
  enemyMaxHP: number;
  enemyMaxSanity?: number | null;
  primaryAttackDamage: number;
}
export function createDebuff({
  debuffName,
  debuffChance,
  enemyMaxHP,
  enemyMaxSanity = 50,
  primaryAttackDamage,
}: createDebuffDeps) {
  const roll = rollD20();
  if (roll * 5 >= 100 - debuffChance * 100) {
    const debuffObj = conditions.find(
      (condition) => condition.name == debuffName,
    ) as ConditionBase;
    if (debuffObj) {
      let healthDamage = 0;
      if (
        debuffObj.effect.includes("health damage") &&
        debuffObj.effectAmount
      ) {
        healthDamage = debuffObj.effectAmount;
        if (debuffObj.effectStyle == "multiplier") {
          healthDamage *= primaryAttackDamage;
        } else if (debuffObj.effectStyle == "percentage") {
          healthDamage *= enemyMaxHP;
        }
      }
      let sanityDamage = 0;
      if (
        debuffObj.effect.includes("sanity damage") &&
        debuffObj.effectAmount
      ) {
        sanityDamage = debuffObj.effectAmount;
        if (debuffObj.effectStyle == "multiplier") {
          sanityDamage *= primaryAttackDamage;
        } else if (debuffObj.effectStyle == "percentage") {
          sanityDamage *= enemyMaxSanity ?? 50;
        }
      }
      const debuff = new Condition({
        name: debuffObj.name,
        style: "debuff",
        turns: debuffObj.turns,
        effect: debuffObj.effect,
        healthDamage: healthDamage > 0 ? healthDamage : null,
        sanityDamage: sanityDamage > 0 ? sanityDamage : null,
        effectStyle:
          debuffObj.effectStyle != "percentage" ? debuffObj.effectStyle : null,
        effectMagnitude: debuffObj.effectAmount,
        icon: debuffObj.icon,
      });
      return debuff;
    } else {
      throw new Error("Failed to find debuff in createDebuff()");
    }
  }
}

interface createBuffDeps {
  buffName: string;
  buffChance: number;
  attackPower: number;
  maxHealth: number;
  maxSanity: number;
  armor: number;
}

export function createBuff({
  buffName,
  buffChance,
  attackPower,
  maxHealth,
  maxSanity,
}: createBuffDeps) {
  const roll = rollD20();
  if (roll * 5 >= 100 - buffChance * 100) {
    const buffObj = conditions.find(
      (condition) => condition.name == buffName,
    ) as ConditionBase;
    if (buffObj) {
      let heal = 0;
      if (buffObj.effect.includes("heal") && buffObj.effectAmount) {
        heal = buffObj.effectAmount;
        if (buffObj.effectStyle == "multiplier") {
          heal *= attackPower;
        } else if (buffObj.effectStyle == "percentage") {
          heal *= maxHealth;
        }
      }
      let sanityHeal = 0;
      if (buffObj.effect.includes("sanity heal") && buffObj.effectAmount) {
        heal = buffObj.effectAmount;
        if (buffObj.effectStyle == "multiplier") {
          sanityHeal *= attackPower;
        } else if (buffObj.effectStyle == "percentage") {
          sanityHeal *= maxSanity;
        }
      }
      const debuff = new Condition({
        name: buffObj.name,
        style: "debuff",
        turns: buffObj.turns,
        effect: buffObj.effect,
        healthDamage: heal > 0 ? heal * -1 : null,
        sanityDamage: sanityHeal > 0 ? sanityHeal * -1 : null,
        effectStyle:
          buffObj.effectStyle != "percentage" ? buffObj.effectStyle : null,
        effectMagnitude: buffObj.effectAmount,
        icon: buffObj.icon,
      });
      return debuff;
    } else {
      throw new Error("Failed to find buff in createBuff()");
    }
  }
}

export function lowSanityDebuffGenerator(playerState: PlayerCharacter) {
  if (playerState && playerState.sanity < 0) {
    const roll = rollD20();
    if (roll >= 16) {
      const debuffObj = sanityDebuffs[
        Math.floor(Math.random() * sanityDebuffs.length)
      ] as ConditionBase;
      let healthDamage = 0;
      let sanityDamage = 0;
      if (
        debuffObj.effect.includes("health damage") &&
        debuffObj.effectAmount
      ) {
        if (debuffObj.effectStyle == "flat") {
          healthDamage = debuffObj.effectAmount;
        } else {
          healthDamage =
            debuffObj.effectAmount * playerState.getNonBuffedMaxHealth();
        }
      }

      const debuff = new Condition({
        name: debuffObj.name,
        style: "debuff",
        turns: debuffObj.turns,
        effect: debuffObj.effect,
        effectStyle:
          debuffObj.effectStyle != "percentage" ? debuffObj.effectStyle : null,
        effectMagnitude:
          healthDamage > 0 || sanityDamage > 0 ? null : debuffObj.effectAmount,
        healthDamage: healthDamage > 0 ? healthDamage : null,
        sanityDamage: sanityDamage > 0 ? sanityDamage : null,
        icon: debuffObj.icon,
      });
      playerState.addCondition(debuff);
    }
  }
}

export function getConditionEffectsOnAttacks(suppliedConditions: Condition[]) {
  let hitChanceMultiplier = 1;
  let damageMult = 1;
  let damageFlat = 0;
  suppliedConditions.forEach((condition) => {
    if (
      condition.effect.includes("accuracy reduction") &&
      condition.effectMagnitude
    ) {
      hitChanceMultiplier *= 1 - condition.effectMagnitude;
    }
    if (condition.effect.includes("strengthen") && condition.effectMagnitude) {
      if (condition.effectStyle == "flat") {
        damageFlat -= condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        damageMult *= 1 + condition.effectMagnitude;
      }
    } else if (
      condition.effect.includes("weaken") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        damageFlat += condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        damageMult *= 1 - condition.effectMagnitude;
      }
    }
  });
  return {
    hitChanceMultiplier: hitChanceMultiplier,
    damageMult: damageMult,
    damageFlat: damageFlat,
  };
}

export function getConditionEffectsOnDefenses(suppliedConditions: Condition[]) {
  let armorMult = 1;
  let armorFlat = 0;
  let healthMult = 1;
  let healthFlat = 0;
  suppliedConditions.forEach((condition) => {
    if (
      condition.effect.includes("armor increase") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        armorFlat += condition.effectMagnitude;
      } else if (
        condition.effectStyle == "multiplier" ||
        condition.effectStyle == "percentage"
      ) {
        armorMult *= 1 + condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("armor decrease") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        armorFlat -= condition.effectMagnitude;
      } else if (
        condition.effectStyle == "multiplier" ||
        condition.effectStyle == "percentage"
      ) {
        armorMult *= 1 - condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("healthMax increase") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        healthFlat += condition.effectMagnitude;
      } else if (
        condition.effectStyle == "multiplier" ||
        condition.effectStyle == "percentage"
      ) {
        healthMult *= 1 + condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("healthMax decrease") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        healthFlat -= condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        healthMult *= 1 - condition.effectMagnitude;
      }
    }
  });
  return {
    armorMult: armorMult,
    armorFlat: armorFlat,
    healthMult: healthMult,
    healthFlat: healthFlat,
  };
}

export function getConditionEffectsOnMisc(suppliedConditions: Condition[]) {
  let stunned = false;
  let manaRegenFlat = 0;
  let manaRegenMult = 1;
  suppliedConditions.forEach((condition) => {
    if (condition.effect.includes("turn skip") && stunned == false) {
      stunned = true;
    }
    if (condition.effect.includes("mana regen") && condition.effectMagnitude) {
      if (condition.effectStyle == "flat") {
        manaRegenFlat += condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        manaRegenMult *= 1 + condition.effectMagnitude;
      }
    }
    if (condition.effect.includes("mana drain") && condition.effectMagnitude) {
      if (condition.effectStyle == "flat") {
        manaRegenFlat -= condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        manaRegenMult *= 1 - condition.effectMagnitude;
      }
    }
  });
  return {
    isStunned: stunned,
    manaRegenFlat: manaRegenFlat,
    manaRegenMult: manaRegenMult,
  };
}
