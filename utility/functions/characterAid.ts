import { Character, PlayerCharacter } from "../../classes/character";
import { flipCoin, rollD20 } from "./roll";
import jobs from "../../assets/json/jobs.json";
import { getRandomName } from "./misc/words";
import { generateBirthday } from "./misc/age";
import names from "../../assets/json/names.json";

export function generateNewCharacter() {
  const sex = flipCoin() == "Heads" ? "male" : "female";
  const sexuality = getRandomSexuality() as "straight" | "bisexual" | "gay";
  const name = getRandomName(sex);
  const birthdate = generateBirthday(18, 65);
  const job = getRandomJobTitle();

  const newChar = new Character({
    sex: sex,
    sexuality: sexuality,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate,
    deathdate: null,
    job: job,
  });
  return newChar;
}

export function getRandomJobTitle(): string {
  const randomIndex = Math.floor(Math.random() * jobs.length);
  return jobs[randomIndex].title;
}

export function getPregnancyCheck(
  playerCharacter: PlayerCharacter,
  npc: Character,
) {
  const rollToGetPregnant = rollD20();
  if (
    Math.ceil((playerCharacter.fertility * npc.fertility) / 100) >=
    rollToGetPregnant
  ) {
    return true;
  }
  return false;
}

const sexualities: Record<string, number> = {
  straight: 0.85,
  bisexual: 0.1,
  gay: 0.05,
};

export function getRandomSexuality() {
  const rand = Math.random();
  let sum = 0;

  for (const sexuality in sexualities) {
    sum += sexualities[sexuality];
    if (rand < sum) return sexuality;
  }
  return "straight";
}

export function getSexFromName(firstName: string) {
  const res = names.find((name) => name.firstName == firstName);
  return res?.sex ?? "male";
}
