import { flipCoin, getRandomName } from "./misc";
import jobs from "../../assets/json/jobs.json";
import names from "../../assets/json/names.json";
import { PlayerClassOptions } from "../types";
import { Character } from "../../entities/character";
import type { RootStore } from "../../stores/RootStore";

export function generateNewCharacter(root: RootStore) {
  const sex = flipCoin() == "Heads" ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = root.gameState!.timeStore.generateBirthDateInRange(18, 65);
  const job = getRandomJobTitle();

  const newChar = new Character({
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate,
    job: job,
    root,
  });
  return newChar;
}
export function generateNewAdoptee(root: RootStore) {
  const sex = flipCoin() == "Heads" ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = root.gameState!.timeStore.generateBirthDateInRange(1, 17);

  const newChar = new Character({
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate,
    root,
  });
  return newChar;
}

export function getRandomJobTitle(): string {
  const randomIndex = Math.floor(Math.random() * jobs.length);
  return jobs[randomIndex].title;
}

export function getSexFromName(firstName: string) {
  const res = names.find((name) => name.firstName == firstName);
  return res?.sex ?? "male";
}
export function getStartingBaseStats({
  classSelection,
}: {
  classSelection: PlayerClassOptions;
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
