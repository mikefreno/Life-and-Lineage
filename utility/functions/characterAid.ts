import { Character } from "../../classes/character";
import { flipCoin, getRandomName, generateBirthday } from "./misc";
import jobs from "../../assets/json/jobs.json";
import names from "../../assets/json/names.json";

export function generateNewCharacter() {
  const sex = flipCoin() == "Heads" ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = generateBirthday(18, 65);
  const job = getRandomJobTitle();

  const newChar = new Character({
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate,
    job: job,
  });
  return newChar;
}
export function generateNewAdoptee() {
  const sex = flipCoin() == "Heads" ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = generateBirthday(1, 17);

  const newChar = new Character({
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate,
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
