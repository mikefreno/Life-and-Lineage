import { Enemy, Minion } from "../creatures";

describe("Minion", () => {
  let enemy: Enemy;
  let minion: Minion;

  beforeEach(() => {
    enemy = new Enemy({
      id: "enemy1",
      beingType: "beast",
      creatureSpecies: "Orc",
      health: 100,
      healthMax: 100,
      sanity: 100,
      sanityMax: 100,
      attackPower: 10,
      baseArmor: 5,
      energy: 50,
      energyMax: 50,
      energyRegen: 5,
      attacks: [],
      conditions: [],
      minions: [],
    });

    minion = new Minion({
      id: "minion1",
      beingType: "beast",
      creatureSpecies: "Imp",
      health: 50,
      healthMax: 50,
      sanity: 50,
      sanityMax: 50,
      attackPower: 5,
      baseArmor: 2,
      energy: 20,
      energyMax: 20,
      energyRegen: 2,
      attacks: [],
      conditions: [],
      turnsLeftAlive: 3,
      parent: enemy,
    });

    enemy.addMinion(minion);
  });

  it("should remove the minion when turnsLeftAlive reaches 0", () => {
    expect(enemy.minions).toHaveLength(1);
    minion.turnsLeftAlive = 1;
    minion.takeTurn({ target: enemy });

    expect(enemy.minions).toHaveLength(0);
  });

  it("should throw an error if minion lifespan reaches zero and it is not removed", () => {
    minion.turnsLeftAlive = 0;

    expect(() => minion.takeTurn({ target: enemy })).toThrow(
      "Minion not properly removed!",
    );
  });

  it("should not throw an error if minion lifespan is greater than zero", () => {
    minion.turnsLeftAlive = 1;

    expect(() => minion.takeTurn({ target: enemy })).not.toThrow();
  });
});
