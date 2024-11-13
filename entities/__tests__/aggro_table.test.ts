import {
  AttackUse,
  BeingType,
  Element,
  PlayerClassOptions,
} from "../../utility/types";
import { AggroTable } from "../aggro_table";
import { Character, PlayerCharacter } from "../character";
import { Enemy, Minion } from "../creatures";
import { generateBirthday, getRandomName } from "../../utility/functions/misc";
import { getRandomJobTitle } from "../../utility/functions/characterAid";
import summons from "../../assets/json/summons.json";
import conditions from "../../assets/json/conditions.json";
import { Condition } from "../conditions";

describe("AggroTable", () => {
  let aggroTable: AggroTable;

  beforeEach(() => {
    aggroTable = new AggroTable();
  });

  it("should correctly add aggro points", () => {
    const targetId = "player1";
    aggroTable.addAggro(targetId, 10);
    expect(aggroTable["aggroPoints"].get(targetId)).toBe(10);

    aggroTable.addAggro(targetId, 5);
    expect(aggroTable["aggroPoints"].get(targetId)).toBe(15);
  });

  it("should get the highest aggro target", () => {
    const player1 = { id: "player1" } as PlayerCharacter;
    const player2 = { id: "player2" } as PlayerCharacter;
    const minion = { id: "minion1" } as Minion;

    aggroTable.addAggro("player1", 10);
    aggroTable.addAggro("player2", 5);
    aggroTable.addAggro("minion1", 15);

    const highestAggroTarget = aggroTable.getHighestAggroTarget([
      player1,
      player2,
      minion,
    ]);
    expect(highestAggroTarget).toBe(minion);
  });
});

describe("Enemy", () => {
  let enemy: Enemy;
  let player: PlayerCharacter;
  let minion: Minion;

  beforeEach(() => {
    enemy = new Enemy({
      beingType: "test" as BeingType,
      creatureSpecies: "Goblin",
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
      parents: [createParent("female"), createParent("female")],
      birthdate: new Date().toString(),
      inCombat: false,
      ...getStartingBaseStats({ playerClass: PlayerClassOptions.mage }),
    });

    const minionObj = summons.find((summon) => summon.name == "skeleton")!;
    minion = new Minion({
      creatureSpecies: minionObj.name,
      health: minionObj.health,
      healthMax: minionObj.health,
      attackPower: minionObj.attackPower,
      attacks: minionObj.attacks,
      turnsLeftAlive: minionObj.turns,
      beingType: minionObj.beingType as BeingType,
      parent: player,
    });
  });

  test("takeTurn should target highest aggro character", () => {
    enemy.damageHealth({ attackerId: player.id, damage: 10 });
    enemy.damageHealth({ attackerId: minion.id, damage: 5 });

    enemy.takeTurn({ player });

    expect(enemy.aggroTable.getHighestAggroTarget([player, minion])!.id).toBe(
      player.id,
    );
  });

  test("stun aggro points should make shift", () => {
    enemy.damageHealth({ attackerId: player.id, damage: 10 });
    enemy.damageHealth({ attackerId: minion.id, damage: 5 });
    const debuffObj = conditions.find((cond) => cond.name == "stun")!;
    const stunCondition = new Condition({
      name: debuffObj.name,
      style: "debuff",
      turns: 1,
      effect: ["stun"],
      healthDamage: [0],
      sanityDamage: [0],
      effectStyle: ["flat"],
      effectMagnitude: [1],
      placedby: minion.creatureSpecies,
      placedbyID: minion.id,
      icon: debuffObj.icon,
      aura: debuffObj.aura,
      on: null,
    });
    enemy.addCondition(stunCondition);

    const result = enemy.takeTurn({ player });
    expect(result.result).toBe(AttackUse.stunned);
    expect(result.logString).toBe("Goblin was stunned!");
    expect(enemy.aggroTable.getHighestAggroTarget([player, minion])!.id).toBe(
      minion.id,
    );
  });

  it("should correctly handle execute condition", () => {
    const executeCondition = new Condition({
      name: "execute",
      style: "debuff",
      turns: 1,
      effect: ["execute"],
      healthDamage: [9999],
      sanityDamage: [0],
      effectStyle: ["flat"],
      effectMagnitude: [1],
      placedby: "test",
      placedbyID: "testId",
      icon: "",
      aura: false,
      on: null,
    });

    enemy.conditions.push(executeCondition);
    const result = enemy.takeTurn({ player });
    expect(result.result).toBe(AttackUse.stunned);
    expect(result.logString).toBe("Goblin was executed!");
  });
});

describe("Minion takeTurn Tests", () => {
  it("should decrement turnsLeftAlive correctly", () => {
    const player = new PlayerCharacter({
      firstName: "John",
      lastName: "Doe",
      sex: "male",
      playerClass: PlayerClassOptions.mage,
      blessing: Element.fire,
      parents: [createParent("female"), createParent("female")],
      birthdate: new Date().toString(),
      inCombat: false,
      ...getStartingBaseStats({ playerClass: PlayerClassOptions.mage }),
    });
    const minionObj = summons.find((summon) => summon.name == "skeleton")!;
    const minion = new Minion({
      creatureSpecies: minionObj.name,
      health: minionObj.health,
      healthMax: minionObj.health,
      attackPower: minionObj.attackPower,
      attacks: minionObj.attacks,
      turnsLeftAlive: minionObj.turns,
      beingType: minionObj.beingType as BeingType,
      parent: player,
    });

    minion.takeTurn({ target: player });
    expect(minion.turnsLeftAlive).toBe(minionObj.turns - 1);
  });

  it("should throw an error if turnsLeftAlive is 0 and not a pet", () => {
    const player = { id: "player1" } as PlayerCharacter;
    const minionObj = {
      name: "skeleton",
      health: 100,
      attackPower: 10,
      turns: 0,
      beingType: "minion",
    };
    const minion = new Minion({
      creatureSpecies: minionObj.name,
      health: minionObj.health,
      healthMax: minionObj.health,
      attackPower: minionObj.attackPower,
      attacks: ["punch"],
      turnsLeftAlive: minionObj.turns,
      beingType: minionObj.beingType as BeingType,
      parent: player,
    });

    expect(() => minion.takeTurn({ target: player })).toThrow(
      "Minion not properly removed!",
    );
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
