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
import storyItems from "../../assets/json/items/storyItems.json";
import names from "../../assets/json/names.json";
import { ItemClassType, Personality, PlayerClassOptions } from "../types";
import { CommonActions, NavigationProp } from "@react-navigation/native";
import { Character } from "../../entities/character";
import { Enemy } from "../../entities/creatures";

export const AccelerationCurves = {
  linear: (t: number) => 1 + t,
  quadratic: (t: number) => 1 + Math.pow(t, 2),
  cubic: (t: number) => 1 + Math.pow(t, 3),
  exponential: (t: number) => Math.exp(t) - 1,
};

export const cleanRoundToTenths = (num: number): string => {
  const rounded = Math.round(num * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
};

export function getRandomPersonality(): Personality {
  const personalities = Object.values(Personality);
  const randomIndex = Math.floor(Math.random() * personalities.length);
  return personalities[randomIndex];
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

type Sex = "Male" | "Female";
type AgeGroup = "Elder" | "Adult" | "Youth";

const PERSONALITY_SETS: Record<
  Sex,
  Record<Personality, Record<AgeGroup, any>>
> = {
  Male: {
    [Personality.AGGRESSIVE]: {
      Elder: require("../../assets/images/heads/Male_Aggressive/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Aggressive/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Aggressive/Youth.png"),
    },
    [Personality.ARROGANT]: {
      Elder: require("../../assets/images/heads/Male_Arrogant/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Arrogant/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Arrogant/Youth.png"),
    },
    [Personality.CALM]: {
      Elder: require("../../assets/images/heads/Male_Calm/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Calm/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Calm/Youth.png"),
    },
    [Personality.CREEPY]: {
      Elder: require("../../assets/images/heads/Male_Creepy/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Creepy/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Creepy/Youth.png"),
    },
    [Personality.INCREDULOUS]: {
      Elder: require("../../assets/images/heads/Male_Incredulous/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Incredulous/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Incredulous/Youth.png"),
    },
    [Personality.INSANE]: {
      Elder: require("../../assets/images/heads/Male_Insane/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Insane/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Insane/Youth.png"),
    },
    [Personality.JOVIAL]: {
      Elder: require("../../assets/images/heads/Male_Jovial/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Jovial/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Jovial/Youth.png"),
    },
    [Personality.OPEN]: {
      Elder: require("../../assets/images/heads/Male_Open/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Open/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Open/Youth.png"),
    },
    [Personality.RESERVED]: {
      Elder: require("../../assets/images/heads/Male_Reserved/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Reserved/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Reserved/Youth.png"),
    },
    [Personality.SILENT]: {
      Elder: require("../../assets/images/heads/Male_Silent/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Silent/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Silent/Youth.png"),
    },
    [Personality.WISE]: {
      Elder: require("../../assets/images/heads/Male_Wise/Elder.png"),
      Adult: require("../../assets/images/heads/Male_Wise/Adult.png"),
      Youth: require("../../assets/images/heads/Male_Wise/Youth.png"),
    },
  },
  Female: {
    [Personality.AGGRESSIVE]: {
      Elder: require("../../assets/images/heads/Female_Aggressive/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Aggressive/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Aggressive/Youth.png"),
    },
    [Personality.ARROGANT]: {
      Elder: require("../../assets/images/heads/Female_Arrogant/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Arrogant/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Arrogant/Youth.png"),
    },
    [Personality.CALM]: {
      Elder: require("../../assets/images/heads/Female_Calm/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Calm/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Calm/Youth.png"),
    },
    [Personality.CREEPY]: {
      Elder: require("../../assets/images/heads/Female_Creepy/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Creepy/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Creepy/Youth.png"),
    },
    [Personality.INCREDULOUS]: {
      Elder: require("../../assets/images/heads/Female_Incredulous/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Incredulous/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Incredulous/Youth.png"),
    },
    [Personality.INSANE]: {
      Elder: require("../../assets/images/heads/Female_Insane/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Insane/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Insane/Youth.png"),
    },
    [Personality.JOVIAL]: {
      Elder: require("../../assets/images/heads/Female_Jovial/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Jovial/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Jovial/Youth.png"),
    },
    [Personality.OPEN]: {
      Elder: require("../../assets/images/heads/Female_Open/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Open/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Open/Youth.png"),
    },
    [Personality.RESERVED]: {
      Elder: require("../../assets/images/heads/Female_Reserved/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Reserved/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Reserved/Youth.png"),
    },
    [Personality.SILENT]: {
      Elder: require("../../assets/images/heads/Female_Silent/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Silent/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Silent/Youth.png"),
    },
    [Personality.WISE]: {
      Elder: require("../../assets/images/heads/Female_Wise/Elder.png"),
      Adult: require("../../assets/images/heads/Female_Wise/Adult.png"),
      Youth: require("../../assets/images/heads/Female_Wise/Youth.png"),
    },
  },
};

const CHILD_IMAGES = {
  boy: require("../../assets/images/heads/boy.png"),
  girl: require("../../assets/images/heads/girl.png"),
  toddler: require("../../assets/images/heads/toddler.png"),
} as const;

const AGE_THRESHOLDS = {
  TODDLER: 3,
  CHILD: 15,
  YOUTH: 20,
  ADULT: 60,
} as const;

export function getCharacterImage(
  age: number,
  sex: "Male" | "Female",
  personality: Personality,
) {
  if (age <= AGE_THRESHOLDS.TODDLER) {
    return CHILD_IMAGES.toddler;
  }
  if (age <= AGE_THRESHOLDS.CHILD) {
    return CHILD_IMAGES[sex === "Male" ? "boy" : "girl"];
  }

  let ageGroup;
  if (age > AGE_THRESHOLDS.ADULT) {
    ageGroup = "Elder";
  } else if (age > AGE_THRESHOLDS.YOUTH) {
    ageGroup = "Adult";
  } else {
    ageGroup = "Youth";
  }

  return PERSONALITY_SETS[sex][personality][ageGroup];
}

export function getItemJSONMap(
  playerClass: PlayerClassOptions,
): Record<ItemClassType, any[]> {
  return {
    artifact: artifacts,
    arrow: arrows,
    bodyArmor: bodyArmor,
    book: getClassSpecificBookList(playerClass),
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
    storyItem: storyItems,
  };
}

export function getClassSpecificBookList(playerClass: PlayerClassOptions) {
  switch (playerClass) {
    case PlayerClassOptions.necromancer:
      return necroBooks;
    case PlayerClassOptions.ranger:
      return rangerBooks;
    case PlayerClassOptions.paladin:
      return paladinBooks;
    default:
      return mageBooks;
  }
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
  return Math.round(Math.random() * (max - min + 1)) + min;
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

export function checkReleasePosition({
  bounds,
  position,
  runOnSuccess,
  handleSnapBack,
}: {
  bounds: {
    key: string;
    bounds:
      | {
          x: number;
          y: number;
          width: number;
          height: number;
        }
      | null
      | undefined;
  }[];
  position: { x: number; y: number };
  runOnSuccess: (args: any) => void;
  handleSnapBack: () => void;
}) {
  //console.log(`Dropping at (x:${position.x}, y:${position.y}`);
  for (const bound of bounds) {
    if (bound.bounds) {
      //console.log(
      //`Checking(${bound.key}) between (x:${bound.bounds.x} - ${
      //bound.bounds.x + bound.bounds.width
      //}, y: ${bound.bounds.y} - ${bound.bounds.y + bound.bounds.height})`,
      //);
      const isWidthAligned =
        position.x > bound.bounds.x &&
        position.x < bound.bounds.x + bound.bounds.width;
      const isHeightAligned =
        position.y > bound.bounds.y &&
        position.y < bound.bounds.y + bound.bounds.height;

      if (isWidthAligned && isHeightAligned) {
        runOnSuccess(bound.key);
        return;
      }
    }
  }
  handleSnapBack();
}

export const generateEnemyFromNPC = (character: Character) => {
  const { health, energy, attackPower, regen } = getNPCAsEnemyStats();
  const sprite = getAnimatedSpriteForNPC(character);
  return new Enemy({
    beingType: "human",
    creatureSpecies: character.fullName,
    currentHealth: health,
    baseHealth: health,
    energyRegen: regen,
    currentEnergy: energy,
    baseEnergy: energy,
    drops: [
      {
        item: "dagger",
        itemType: "melee" as ItemClassType,
        chance: 0.75,
      },
    ],
    goldDropRange: {
      minimum: 250,
      maximum: 1000,
    },
    sprite,
    attackPower,
  });
};

const getAnimatedSpriteForNPC = (character: Character) => {
  if (character.sex == "male") {
    if (character.age > 50) {
      return "npc_man_old";
    }
    return "npc_man";
  } else {
    if (character.age > 50) {
      return "npc_woman_old";
    }
    return "npc_woman";
  }
};

const getNPCAsEnemyStats = () => {
  const health = getRandomInt(75, 200);
  const energy = getRandomInt(20, 60);
  const attackPower = getRandomInt(10, 15);
  const regen = getRandomInt(3, 5);

  return { health, energy, attackPower, regen };
};
