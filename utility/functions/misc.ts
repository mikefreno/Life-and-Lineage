import artifacts from "../../assets/json/items/artifacts.json";
import arrows from "../../assets/json/items/arrows.json";
import bows from "../../assets/json/items/bows.json";
import bodyArmor from "../../assets/json/items/bodyArmor.json";
import mageBooks from "../../assets/json/items/mageBooks.json";
import necroBooks from "../../assets/json/items/necroBooks.json";
import paladinBooks from "../../assets/json/items/paladinBooks.json";
import rangerBooks from "../../assets/json/items/rangerBooks.json";
import foci from "../../assets/json/items/foci.json";
import hats from "../../assets/json/items/hats.json";
import helmets from "../../assets/json/items/helmets.json";
import ingredients from "../../assets/json/items/ingredients.json";
import junk from "../../assets/json/items/junk.json";
import poison from "../../assets/json/items/poison.json";
import potions from "../../assets/json/items/potions.json";
import robes from "../../assets/json/items/robes.json";
import shields from "../../assets/json/items/shields.json";
import staves from "../../assets/json/items/staves.json";
import melee from "../../assets/json/items/melee.json";
import wands from "../../assets/json/items/wands.json";
import names from "../../assets/json/names.json";
import { ItemClassType, PlayerClassOptions, TutorialOption } from "../types";
import { CommonActions, NavigationProp } from "@react-navigation/native";
import { storage } from "./storage";

export const AccelerationCurves = {
  linear: (t: number) => 1 + t,
  quadratic: (t: number) => 1 + Math.pow(t, 2),
  cubic: (t: number) => 1 + Math.pow(t, 3),
  exponential: (t: number) => Math.exp(t) - 1,
};

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

export function getDaysBetweenDates(startDate: Date, endDate: Date): number {
  const oneDayMs = 1000 * 60 * 60 * 24;
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const diffDays = Math.round((endMs - startMs) / oneDayMs);

  return diffDays;
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

export function getItemJSONMap(
  playerClass: PlayerClassOptions,
): Record<ItemClassType, any[]> {
  return {
    artifact: artifacts,
    arrow: arrows,
    bodyArmor: bodyArmor,
    book:
      {
        mage: mageBooks,
        paladin: paladinBooks,
        necromancer: necroBooks,
        ranger: rangerBooks,
      }[playerClass] || mageBooks,
    bow: bows,
    focus: foci,
    hat: hats,
    helmet: helmets,
    ingredient: ingredients,
    junk: junk,
    poison: poison,
    potion: potions,
    robe: robes,
    staff: staves,
    shield: shields,
    wand: wands,
    melee: melee,
  };
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
    const cleanedUp = (gold / 1_000_000_000).toFixed(0);
    return `${parseFloat(cleanedUp).toLocaleString()}B`;
  }
  if (gold >= 1_000_000) {
    const cleanedUp = (gold / 1_000_000).toFixed(0);
    return `${parseFloat(cleanedUp).toLocaleString()}M`;
  }
  if (gold >= 10_000) {
    const cleanedUp = (gold / 1000).toFixed(0);
    return `${parseFloat(cleanedUp).toLocaleString()}K`;
  }
  if (gold > 20) {
    return gold.toFixed(0).toLocaleString();
  } else return gold.toFixed(1).toLocaleString();
}

export function damageReduction(armorValue: number) {
  if (armorValue >= 600) {
    return 0.925;
  } else {
    const reduction = 92.5 * (1 - Math.exp(-0.01 * armorValue));
    return Math.min(reduction, 92.5) / 100;
  }
}

/**
 * Wait for a time in ms, ex: wait(2000).then(()=>)
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

export function toTitleCase(title: string | undefined) {
  if (!title) {
    return "";
  }
  let spacePass = title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return spacePass
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function updateStoredTutorialState(state: boolean) {
  storage.set("tutorialsEnabled", JSON.stringify(state));
}
export function loadStoredTutorialState(): boolean {
  return JSON.parse(storage.getString("tutorialsEnabled") ?? "true");
}
export function getLocalTutorialState(tutorial: TutorialOption) {
  return JSON.parse(storage.getString(tutorial.toString()) ?? "false");
}
export function setLocalTutorialState(
  tutorial: TutorialOption,
  state: boolean,
) {
  storage.set(tutorial.toString(), JSON.stringify(state));
}

export function flipCoin() {
  return Math.random() < 0.5 ? "Heads" : "Tails";
}

export function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

export default function clearHistory(
  navigation: NavigationProp<ReactNavigation.RootParamList>,
) {
  navigation.dispatch(
    CommonActions.reset({
      routes: [{ key: "(tabs)", name: "(tabs)" }],
    }),
  );
}
