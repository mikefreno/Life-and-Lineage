import { Character, PlayerCharacter } from "../../classes/character";
import { getRandomName } from "./misc";
import { flipCoin, rollD20 } from "./roll";

export function generateNewCharacter() {
  const sex = flipCoin() == "Heads" ? "male" : "female";
  const name = getRandomName(sex);

  //const newChar = new Character({});
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
