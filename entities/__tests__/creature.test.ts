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
    // Properly mock the dungeonStore
    mockRootStore.dungeonStore = {
      currentInstance: undefined,
      currentLevel: undefined,
    } as any;

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
    const mockRoot = {
      dungeonStore: {
        currentInstance: undefined,
        currentLevel: undefined,
      },
    };

    const mockStore = {
      root: mockRoot,
      getAnimationStore: jest.fn().mockReturnValue({
        setDialogueString: jest.fn(),
        triggerDialogue: jest.fn(),
      }),
      saveEnemy: jest.fn(),
    };

    const testEnemy = new Enemy({
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
      enemyStore: mockStore as any,
    });

    const mockPlayer = { playerClass: "mage" } as PlayerCharacter;
    const drops = testEnemy.getDrops(mockPlayer, false);

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
    const enemyWithResistances = new Enemy({
      beingType: "undead",
      creatureSpecies: "Zombie",
      currentHealth: 100,
      baseHealth: 100,
      attackPower: 10,
      sprite: "zombie",
      attackStrings: ["bite"],
      enemyStore: mockEnemyStore,
      baseFireResistance: 10,
      baseColdResistance: 15,
      baseLightningResistance: 20,
      basePoisonResistance: 25,
    });

    expect(enemyWithResistances.baseFireResistance).toBe(10);
    expect(enemyWithResistances.baseColdResistance).toBe(15);
    expect(enemyWithResistances.baseLightningResistance).toBe(20);
    expect(enemyWithResistances.basePoisonResistance).toBe(25);

    expect(enemyWithResistances.fireResistance).toBe(10);
    expect(enemyWithResistances.coldResistance).toBe(15);
    expect(enemyWithResistances.lightningResistance).toBe(20);
    expect(enemyWithResistances.poisonResistance).toBe(25);
  });

  test("Enemy damage type calculations", () => {
    const enemyWithDamageTypes = new Enemy({
      beingType: "undead",
      creatureSpecies: "Zombie",
      currentHealth: 100,
      baseHealth: 100,
      attackPower: 10,
      sprite: "zombie",
      attackStrings: ["bite"],
      enemyStore: mockEnemyStore,
      basePhysicalDamage: 10,
      baseFireDamage: 5,
      baseColdDamage: 5,
      baseLightningDamage: 5,
      basePoisonDamage: 5,
    });

    expect(enemyWithDamageTypes.basePhysicalDamage).toBe(10);
    expect(enemyWithDamageTypes.baseFireDamage).toBe(5);
    expect(enemyWithDamageTypes.baseColdDamage).toBe(5);
    expect(enemyWithDamageTypes.baseLightningDamage).toBe(5);
    expect(enemyWithDamageTypes.basePoisonDamage).toBe(5);

    expect(enemyWithDamageTypes.totalPhysicalDamage).toBe(10);
    expect(enemyWithDamageTypes.totalFireDamage).toBe(5);
    expect(enemyWithDamageTypes.totalColdDamage).toBe(5);
    expect(enemyWithDamageTypes.totalLightningDamage).toBe(5);
    expect(enemyWithDamageTypes.totalPoisonDamage).toBe(5);
  });

  test("Enemy condition stacking", () => {
    enemy = new Enemy({
      beingType: "undead",
      creatureSpecies: "Zombie",
      currentHealth: 100,
      baseHealth: 100,
      attackPower: 10,
      sprite: "zombie",
      attackStrings: ["bite"],
      enemyStore: mockEnemyStore,
    });

    const condition1 = new Condition({
      name: "Poison",
      turns: 3,
      style: "debuff",
      effect: ["health damage"],
      healthDamage: [5],
      effectStyle: ["flat"],
      placedbyID: "test",
    });

    const condition2 = new Condition({
      name: "Poison",
      turns: 2,
      style: "debuff",
      effect: ["health damage"],
      healthDamage: [3],
      effectStyle: ["flat"],
      placedbyID: "test",
    });

    enemy.addCondition(condition1);
    enemy.addCondition(condition2);

    enemy.conditionTicker();
    expect(enemy.currentHealth).toBe(92); // 100 - 5 - 3
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

  describe("Drop System", () => {
    let mockDungeonStore: any;

    beforeEach(() => {
      // Setup mock dungeon store with instance and level drops
      mockDungeonStore = {
        currentInstance: {
          instanceDrops: [
            { item: "vampiric tooth", itemType: ItemClassType.Junk, chance: 1 },
          ],
        },
        currentLevel: {
          levelDrops: [
            { item: "bat wing", itemType: ItemClassType.Ingredient, chance: 1 },
          ],
        },
      };

      mockRootStore.dungeonStore = mockDungeonStore;
      mockEnemyStore.root = mockRootStore;
    });

    test("Enemy generates all types of drops", () => {
      const mockPlayer = { playerClass: "mage" } as PlayerCharacter;
      const drops = enemy.getDrops(mockPlayer, false);

      // Check enemy-specific drops
      expect(drops.itemDrops).toContainEqual(
        expect.objectContaining({ name: "patch of fur" }),
      );

      // Check instance drops
      expect(drops.itemDrops).toContainEqual(
        expect.objectContaining({ name: "vampiric tooth" }),
      );

      // Check level drops
      expect(drops.itemDrops).toContainEqual(
        expect.objectContaining({ name: "bat wing" }),
      );

      // Total drops should be sum of all sources
      expect(drops.itemDrops.length).toBe(3);
    });

    test("Enemy only generates drops once", () => {
      const mockPlayer = { playerClass: "mage" } as PlayerCharacter;
      const firstDrops = enemy.getDrops(mockPlayer, false);
      const secondDrops = enemy.getDrops(mockPlayer, false);

      expect(firstDrops.itemDrops.length).toBe(3);
      expect(secondDrops.itemDrops.length).toBe(0);
    });

    test("Enemy handles missing instance drops", () => {
      mockDungeonStore.currentInstance.instanceDrops = undefined;

      const mockPlayer = { playerClass: "mage" } as PlayerCharacter;
      const drops = enemy.getDrops(mockPlayer, false);

      // Should still get enemy and level drops
      expect(drops.itemDrops.length).toBe(2);
      expect(drops.itemDrops).toContainEqual(
        expect.objectContaining({ name: "patch of fur" }),
      );
      expect(drops.itemDrops).toContainEqual(
        expect.objectContaining({ name: "bat wing" }),
      );
    });

    test("Enemy handles missing level drops", () => {
      mockDungeonStore.currentLevel.levelDrops = undefined;

      const mockPlayer = { playerClass: "mage" } as PlayerCharacter;
      const drops = enemy.getDrops(mockPlayer, false);

      // Should still get enemy and instance drops
      expect(drops.itemDrops.length).toBe(2);
      expect(drops.itemDrops).toContainEqual(
        expect.objectContaining({ name: "patch of fur" }),
      );
      expect(drops.itemDrops).toContainEqual(
        expect.objectContaining({ name: "vampiric tooth" }),
      );
    });

    test("Enemy handles drop chance calculations correctly", () => {
      const iterations = 50000;
      const enemyDropChance = 0.1;
      const instanceDropChance = 0.1;
      const levelDropChance = 0.1;

      // Set up drop chances
      enemy.drops = [
        {
          item: "patch of fur",
          chance: enemyDropChance,
          itemType: ItemClassType.Junk,
        },
      ];
      mockDungeonStore.currentInstance.instanceDrops = [
        {
          item: "vampiric tooth",
          chance: instanceDropChance,
          itemType: ItemClassType.Junk,
        },
      ];
      mockDungeonStore.currentLevel.levelDrops = [
        {
          item: "chunk of flesh",
          chance: levelDropChance,
          itemType: ItemClassType.Junk,
        },
      ];

      const mockPlayer = { playerClass: "mage" } as PlayerCharacter;

      let enemyDropCount = 0;
      let instanceDropCount = 0;
      let levelDropCount = 0;

      for (let i = 0; i < iterations; i++) {
        const drops = enemy.getDrops(mockPlayer, false);

        // Reset gotDrops flag for next iteration
        enemy.gotDrops = false;

        enemyDropCount += drops.itemDrops.filter(
          (item) => item.name === "patch of fur",
        ).length;
        instanceDropCount += drops.itemDrops.filter(
          (item) => item.name === "vampiric tooth",
        ).length;
        levelDropCount += drops.itemDrops.filter(
          (item) => item.name === "chunk of flesh",
        ).length;

        if (i === 0) {
          console.log("First iteration drops:", drops.itemDrops);
        }
      }

      const enemyDropRate = enemyDropCount / iterations;
      const instanceDropRate = instanceDropCount / iterations;
      const levelDropRate = levelDropCount / iterations;

      console.log("Drop rates:", {
        enemyDropRate,
        instanceDropRate,
        levelDropRate,
        enemyDropCount,
        instanceDropCount,
        levelDropCount,
      });

      // Use toBeCloseTo for floating point comparison
      expect(enemyDropRate).toBeCloseTo(enemyDropChance, 2);
      expect(instanceDropRate).toBeCloseTo(instanceDropChance, 2);
      expect(levelDropRate).toBeCloseTo(levelDropChance, 2);
    });
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
      root: mockRootStore,
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
      currentEnergy: 30,
      baseEnergy: 30,
      energyRegen: 5,
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
      root: mockRootStore,
      phases: [],
    });

    expect(minion.parent).toBe(newParent);
  });
});
