import {
  flipCoin,
  getNPCBaseCombatStats,
  getRandomName,
  getRandomPersonality,
} from "./misc";
import { Element, PlayerClassOptions } from "@/utility/types";
import { Character, PlayerCharacter } from "@/entities/character";
import type { RootStore } from "@/stores/RootStore";
import { jsonServiceStore } from "@/stores/SingletonSource";

export function generateNewCharacter(root: RootStore) {
  const sex = flipCoin() == "Heads" ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = root.time.generateBirthDateInRange(18, 65);
  const job = getRandomJobTitle();
  const randomPersonality = getRandomPersonality();

  const newChar = new Character({
    sex: sex,

    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate,
    job: job,
    personality: randomPersonality,
    beingType: "human",
    activeAuraConditionIds: [],
    animationStrings: {},
    ...getNPCBaseCombatStats(),
    root,
  });
  root.characterStore.addCharacter(newChar);
  return newChar;
}

export function generateNewAdoptee(root: RootStore) {
  const sex = flipCoin() == "Heads" ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = root.time.generateBirthDateInRange(1, 17);
  const randomPersonality = getRandomPersonality();

  const newChar = new Character({
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate,
    personality: randomPersonality,
    beingType: "human",
    activeAuraConditionIds: [],
    animationStrings: {},
    ...getNPCBaseCombatStats(),
    root,
  });
  root.characterStore.addCharacter(newChar);
  return newChar;
}

export function getRandomJobTitle(): string {
  const randomIndex = Math.floor(
    Math.random() * jsonServiceStore.readJsonFileSync("jobs").length,
  );
  return jsonServiceStore.readJsonFileSync("jobs")[randomIndex].title;
}

export function getSexFromName(firstName: string) {
  const res = jsonServiceStore
    .readJsonFileSync("names")
    .find((name) => name.firstName == firstName);
  return res?.sex ?? "male";
}

export function getStartingBaseStats({
  classSelection,
}: {
  classSelection: PlayerClassOptions | undefined;
}) {
  switch (classSelection) {
    case PlayerClassOptions.necromancer:
      return {
        baseHealth: 80,
        baseMana: 120,
        baseStrength: 3,
        baseIntelligence: 6,
        baseDexterity: 4,
        baseManaRegen: 6,
        baseSanity: 40,
      };
    case PlayerClassOptions.paladin:
      return {
        baseHealth: 120,
        baseMana: 80,
        baseStrength: 6,
        baseIntelligence: 4,
        baseDexterity: 3,
        baseManaRegen: 5,
        baseSanity: 60,
      };
    case PlayerClassOptions.mage:
      return {
        baseHealth: 100,
        baseMana: 100,
        baseStrength: 5,
        baseIntelligence: 5,
        baseDexterity: 3,
        baseManaRegen: 5,
        baseSanity: 50,
      };
    case PlayerClassOptions.ranger:
    default:
      return {
        baseHealth: 90,
        baseMana: 90,
        baseStrength: 4,
        baseIntelligence: 3,
        baseDexterity: 7,
        baseManaRegen: 5,
        baseSanity: 50,
      };
  }
}

export function createParent(
  sex: "female" | "male",
  root: RootStore,
  lastName: string,
): Character {
  const firstName = getRandomName(sex).firstName;
  const job = getRandomJobTitle();
  const personality = getRandomPersonality();
  const parent = new Character({
    beingType: "human",
    firstName: firstName,
    lastName: lastName,
    personality,
    sex: sex,
    job: job,
    affection: 85,
    birthdate: root.time.generateBirthDateInRange(32, 55),
    root,
    activeAuraConditionIds: [],
    animationStrings: {},
    ...getNPCBaseCombatStats(),
  });
  root.characterStore.addCharacter(parent);
  return parent;
}

export function createPlayerCharacter({
  root,
  classSelection,
  blessingSelection,
  firstName,
  lastName,
  sex,
  allocatedStats,
}: {
  root: RootStore;
  classSelection: PlayerClassOptions;
  blessingSelection: Element;
  firstName: string;
  lastName: string;
  sex: "male" | "female";
  allocatedStats: {
    baseHealth: number;
    baseMana: number;
    baseStrength: number;
    baseIntelligence: number;
    baseDexterity: number;
    baseManaRegen: number;
    baseSanity: number;
  };
}) {
  root.characterStore.clearCharacters();
  const mom = createParent("female", root, lastName);
  const dad = createParent("male", root, lastName);
  let newCharacter: PlayerCharacter;
  const bday = root.time.generateBirthDateForAge(15);

  const basePlayerOptions = {
    beingType: "human",
    animationStrings: {},
    activeAuraConditionIds: [],
    firstName,
    lastName,
    sex,
    playerClass: classSelection,
    blessing: blessingSelection,
    parentIds: [mom.id, dad.id], // Changed from parents array to parentIds
    birthdate: bday,
    ...allocatedStats,
    root,
  };

  if (
    classSelection === PlayerClassOptions.paladin &&
    (blessingSelection == Element.vengeance ||
      blessingSelection == Element.protection ||
      blessingSelection == Element.holy)
  ) {
    newCharacter = new PlayerCharacter(basePlayerOptions);
  } else if (
    classSelection === PlayerClassOptions.necromancer &&
    (blessingSelection == Element.bone ||
      blessingSelection == Element.blood ||
      blessingSelection == Element.summoning ||
      blessingSelection == Element.pestilence)
  ) {
    newCharacter = new PlayerCharacter(basePlayerOptions);
  } else if (
    classSelection == PlayerClassOptions.mage &&
    (blessingSelection == Element.air ||
      blessingSelection == Element.fire ||
      blessingSelection == Element.earth ||
      blessingSelection == Element.water)
  ) {
    newCharacter = new PlayerCharacter(basePlayerOptions);
  } else if (
    classSelection == PlayerClassOptions.ranger &&
    (blessingSelection == Element.beastMastery ||
      blessingSelection == Element.assassination ||
      blessingSelection == Element.arcane)
  ) {
    newCharacter = new PlayerCharacter(basePlayerOptions);
  } else {
    throw new Error("Incorrect Player class/blessing combination!");
  }

  root.characterStore.addCharacter(newCharacter);
  return newCharacter;
}
