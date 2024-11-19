import { getRandomJobTitle } from "../../utility/functions/characterAid";
import { getRandomName } from "../../utility/functions/misc";
import {
  AttackUse,
  BeingType,
  Element,
  PlayerClassOptions,
} from "../../utility/types";
import { Character, PlayerCharacter } from "../character";
import { Enemy } from "../creatures";
import { Item } from "../item";

describe("Enemy", () => {
  let enemy: Enemy;
  let player: PlayerCharacter;

  beforeEach(() => {
    enemy = new Enemy({
      beingType: "test" as BeingType,
      creatureSpecies: "test",
      health: 100,
      healthMax: 100,
      sanity: null,
      sanityMax: null,
      attackPower: 10,
      energy: 50,
      energyMax: 50,
      energyRegen: 50,
      attacks: ["stab"],
    });
    player = new PlayerCharacter({
      firstName: "John",
      lastName: "Doe",
      sex: "male",
      playerClass: PlayerClassOptions.mage,
      blessing: Element.fire,
      parents: [createParent("male"), createParent("female")],
      birthdate: new Date().toString(),
      ...getStartingBaseStats({ playerClass: PlayerClassOptions.mage }),
    });
    const bow_with_multi_attack = Item.fromJSON({
      name: "recurve bow",
      baseValue: 500,
      slot: "two-hand",
      attacks: ["shoot", "rapid shot"],
      icon: "Bow",
      itemClass: "bow",
      stats: {
        damage: 7.5,
      },
      requirements: {
        dexterity: 5,
      },
      playerClass: PlayerClassOptions.mage,
    });
    player.equipItem([bow_with_multi_attack]);
  });
  it("enemy single hit attacks should still work", () => {
    const attackRes = enemy.attacks[0].use({ user: enemy, target: player });
    expect(attackRes.result).toBe(AttackUse.success);
    console.log(attackRes.logString);
  });
  it("player single hit attacks should still work", () => {
    const attackRes = player.physicalAttacks[0].use({
      user: player,
      target: enemy,
    });
    expect(attackRes.result).toBe(AttackUse.success);
    console.log(attackRes.logString);
  });
  it("player multi hit attacks should work", () => {
    const attackRes = player.physicalAttacks[1].use({
      user: player,
      target: enemy,
    });
    expect(attackRes.result).toBe(AttackUse.success);
    console.log(attackRes.logString);
  });
});

function createParent(sex: "female" | "male"): Character {
  const firstName = getRandomName(sex).firstName;
  const job = getRandomJobTitle();
  const parent = new Character({
    firstName: firstName,
    lastName: "Doe",
    sex: sex,
    job: job,
    affection: 85,
    birthdate: generateBirthday(32, 55),
  });
  return parent;
}
function getStartingBaseStats({
  playerClass,
}: {
  playerClass: PlayerClassOptions;
}) {
  switch (playerClass) {
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
