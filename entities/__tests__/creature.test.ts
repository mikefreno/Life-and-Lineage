import EnemyStore from "../../stores/EnemyStore";
import { RootStore } from "../../stores/RootStore";
import { ItemClassType } from "../../utility/types";
import { PlayerCharacter } from "../character";
import { Condition } from "../conditions";
import { Enemy, Minion } from "../creatures";

jest.mock("../../stores/EnemyStore", () => {
  return jest.fn().mockImplementation(() => ({
    getAnimationStore: jest.fn().mockReturnValue({
      setDialogueString: jest.fn(),
      triggerDialogue: jest.fn(),
    }),
    saveEnemy: jest.fn(),
  }));
});
jest.mock("../../stores/RootStore");

// Also mock the random functions
jest.mock("../../utility/functions/misc", () => ({
  ...jest.requireActual("../../utility/functions/misc"),
  rollD20: jest.fn().mockReturnValue(20), // Always succeed
  getRandomInt: jest.fn().mockReturnValue(10), // Return minimum value
}));

describe("Enemy Class", () => {
  let enemy: Enemy;
  let mockEnemyStore: jest.Mocked<EnemyStore>;
  let mockRootStore: jest.Mocked<RootStore>;

  beforeEach(() => {
    mockRootStore = new RootStore() as jest.Mocked<RootStore>;
    mockEnemyStore = new EnemyStore({
      root: mockRootStore,
    }) as jest.Mocked<EnemyStore>;

    // Mock the getAnimationStore method
    mockEnemyStore.getAnimationStore = jest.fn().mockReturnValue({
      setDialogueString: jest.fn(),
      triggerDialogue: jest.fn(),
    });

    enemy = new Enemy({
      beingType: "undead",
      creatureSpecies: "Zombie",
      currentHealth: 100,
      baseHealth: 100,
      attackPower: 10,
      sprite: "zombie",
      attackStrings: ["bite"],
      drops: [
        { item: "patch of fur", itemType: ItemClassType.Junk, chance: 1 },
      ],
      goldDropRange: { minimum: 10, maximum: 20 },
      enemyStore: mockEnemyStore,
      phases: [
        {
          triggerHealth: 0.5,
          dialogue: "You'll regret this!",
          attackPower: 15,
        },
        {
          triggerHealth: 0.25,
          dialogue: "This isn't even my final form!",
          attackPower: 20,
        },
      ],
    });
  });

  test("Enemy initialization", () => {
    expect(enemy.creatureSpecies).toBe("Zombie");
    expect(enemy.currentHealth).toBe(100);
    expect(enemy.attackPower).toBe(10);
    expect(enemy.sprite).toBe("zombie");
  });

  test("Enemy phase transition", () => {
    enemy.damageHealth({ damage: 51, attackerId: "player1" });
    expect(enemy.currentHealth).toBe(49);
    expect(enemy.attackPower).toBe(15);
    expect(mockEnemyStore.getAnimationStore).toHaveBeenCalled();
    expect(
      mockEnemyStore.getAnimationStore(enemy.id).setDialogueString,
    ).toHaveBeenCalledWith("You'll regret this!");
    expect(
      mockEnemyStore.getAnimationStore(enemy.id).triggerDialogue,
    ).toHaveBeenCalled();
  });

  test("Enemy final phase transition", () => {
    enemy.damageHealth({ damage: 76, attackerId: "player1" });
    expect(enemy.currentHealth).toBe(24);
    expect(enemy.attackPower).toBe(20);
    expect(
      mockEnemyStore.getAnimationStore(enemy.id).setDialogueString,
    ).toHaveBeenCalledWith("This isn't even my final form!");
  });

  test("Enemy attack selection", () => {
    const mockPlayer = { id: "player1" } as PlayerCharacter;
    const result = enemy.takeTurn({ player: mockPlayer });
    expect(result).toBeDefined();
    expect(result.attack).toBeDefined();
    expect(result.logString).toBeDefined();
  });

  test("Enemy drop generation", () => {
    const mockPlayer = { playerClass: "mage" } as PlayerCharacter;
    const drops = enemy.getDrops(mockPlayer, false);
    expect(drops.gold).toBeGreaterThanOrEqual(10);
    expect(drops.gold).toBeLessThanOrEqual(20);
    expect(drops.itemDrops.length).toBe(1);
    expect(drops.itemDrops[0].name).toBe("patch of fur");
  });

  test("Enemy minion management", () => {
    const minion = enemy.createMinion("Skeleton");
    expect(enemy.minions.length).toBe(1);
    expect(enemy.minions[0].creatureSpecies).toBe("skeleton");

    enemy.removeMinion(minion);
    expect(enemy.minions.length).toBe(0);
  });

  test("Enemy condition management", () => {
    const condition = new Condition({
      name: "Poison",
      turns: 3,
      style: "debuff",
      effect: ["health damage"],
      healthDamage: [5],
      effectStyle: ["flat"],
      placedbyID: enemy.id,
    });
    enemy.addCondition(condition);
    expect(enemy.conditions.length).toBe(1);

    enemy.conditionTicker();
    expect(enemy.currentHealth).toBeLessThan(100);
  });

  test("Enemy energy management", () => {
    enemy = new Enemy({
      // ... basic properties ...
      currentEnergy: 50,
      baseEnergy: 100,
      energyRegen: 10,
    });

    enemy.expendEnergy(20);
    expect(enemy.currentEnergy).toBe(30);

    enemy.regenerate();
    expect(enemy.currentEnergy).toBe(40);
  });

  test("Enemy resistance calculations", () => {
    enemy = new Enemy({
      // ... basic properties ...
      baseFireResistance: 10,
      baseColdResistance: 15,
      baseLightningResistance: 20,
      basePoisonResistance: 25,
    });

    expect(enemy.fireResistance).toBe(10);
    expect(enemy.coldResistance).toBe(15);
    expect(enemy.lightningResistance).toBe(20);
    expect(enemy.poisonResistance).toBe(25);
  });

  test("Enemy damage type calculations", () => {
    enemy = new Enemy({
      // ... basic properties ...
      basePhysicalDamage: 10,
      baseFireDamage: 5,
      baseColdDamage: 5,
      baseLightningDamage: 5,
      basePoisonDamage: 5,
    });

    expect(enemy.totalPhysicalDamage).toBe(10);
    expect(enemy.totalFireDamage).toBe(5);
    expect(enemy.totalColdDamage).toBe(5);
    expect(enemy.totalLightningDamage).toBe(5);
    expect(enemy.totalPoisonDamage).toBe(5);
  });

  test("Enemy condition stacking", () => {
    const condition1 = new Condition({
      name: "Poison",
      turns: 3,
      style: "debuff",
      effect: ["health damage"],
      healthDamage: [5],
      effectStyle: ["flat"],
      placedbyID: enemy.id,
    });

    const condition2 = new Condition({
      name: "Poison",
      turns: 2,
      style: "debuff",
      effect: ["health damage"],
      healthDamage: [3],
      effectStyle: ["flat"],
      placedbyID: enemy.id,
    });

    enemy.addCondition(condition1);
    enemy.addCondition(condition2);
    expect(enemy.conditions.length).toBe(2);

    enemy.conditionTicker();
    expect(enemy.currentHealth).toBeLessThan(92); // 100 - 5 - 3
  });

  test("Enemy story drops", () => {
    enemy = new Enemy({
      // ... basic properties ...
      storyDrops: [{ item: "head of goblin shaman" }],
    });

    const mockPlayer = { playerClass: "mage" } as PlayerCharacter;
    const drops = enemy.getDrops(mockPlayer, true); // true for boss fight
    expect(drops.storyDrops?.length).toBe(1);
    expect(drops.storyDrops?.[0].name).toBe("head of goblin shaman");
  });
});

describe("Minion Class", () => {
  let minion: Minion;
  let mockParent: Enemy;
  let mockRootStore: jest.Mocked<RootStore>;
  let mockEnemyStore: jest.Mocked<EnemyStore>;

  beforeEach(() => {
    mockRootStore = new RootStore() as jest.Mocked<RootStore>;
    mockEnemyStore = new EnemyStore({
      root: mockRootStore,
    }) as jest.Mocked<EnemyStore>;

    // Mock the getAnimationStore method
    mockEnemyStore.getAnimationStore = jest.fn().mockReturnValue({
      setDialogueString: jest.fn(),
      triggerDialogue: jest.fn(),
    });

    mockParent = new Enemy({
      beingType: "undead",
      creatureSpecies: "Necromancer",
      currentHealth: 200,
      baseHealth: 200,
      attackPower: 20,
      attackStrings: ["bite"],
      sprite: "necromancer",
      enemyStore: mockEnemyStore,
      phases: [],
    });

    minion = new Minion({
      beingType: "undead",
      creatureSpecies: "Skeleton",
      currentHealth: 50,
      baseHealth: 50,
      attackPower: 5,
      attackStrings: ["bite"],
      turnsLeftAlive: 3,
      parent: mockParent,
    });
  });

  test("Minion initialization", () => {
    expect(minion.creatureSpecies).toBe("Skeleton");
    expect(minion.currentHealth).toBe(50);
    expect(minion.attackPower).toBe(5);
    expect(minion.turnsLeftAlive).toBe(3);
  });

  test("Minion turn taking", () => {
    const mockPlayer = { id: "player1" } as PlayerCharacter;
    const result = minion.takeTurn({ target: mockPlayer });
    expect(result).toBeDefined();
    expect(result.attack).toBeDefined();
    expect(result.logString).toBeDefined();
    expect(minion.turnsLeftAlive).toBe(2);
  });

  test("Minion expiration", () => {
    const mockPlayer = { id: "player1" } as PlayerCharacter;
    minion.takeTurn({ target: mockPlayer });
    minion.takeTurn({ target: mockPlayer });
    minion.takeTurn({ target: mockPlayer });
    expect(() => minion.takeTurn({ target: mockPlayer })).toThrow();
  });

  test("Minion death", () => {
    mockParent.addMinion(minion);
    minion.damageHealth({ damage: 50, attackerId: "player1" });
    expect(mockParent.minions.length).toBe(0);
  });

  test("Minion energy management", () => {
    minion = new Minion({
      beingType: "undead",
      creatureSpecies: "Skeleton",
      currentHealth: 50,
      baseHealth: 50,
      attackPower: 5,
      attackStrings: ["bite"],
      turnsLeftAlive: 3,
      parent: mockParent,
    });

    minion.expendEnergy(10);
    expect(minion.currentEnergy).toBe(20);

    minion.regenerate();
    expect(minion.currentEnergy).toBe(25);
  });

  test("Minion parent relationship", () => {
    expect(minion.parent).toBe(mockParent);

    newParent = new Enemy({
      beingType: "undead",
      creatureSpecies: "Necromancer",
      currentHealth: 200,
      baseHealth: 200,
      attackPower: 20,
      attackStrings: ["bite"],
      sprite: "necromancer",
      enemyStore: mockEnemyStore,
      phases: [],
    });

    minion.reinstateParent(newParent);
    expect(minion.parent).toBe(newParent);
  });
});
