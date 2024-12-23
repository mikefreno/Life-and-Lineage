import { DungeonInstance, DungeonLevel, SpecialEncounter } from "../dungeon";
import { Enemy } from "../creatures";
import { DungeonStore } from "../../stores/DungeonStore";
import { runInAction } from "mobx";

// Mock dependencies
jest.mock("../creatures");
jest.mock("../../stores/DungeonStore");
jest.mock("../../utility/enemyHelpers", () => ({
  EnemyImageMap: {
    testSprite: "testSpriteValue",
  },
}));

jest.mock("../../assets/json/enemy.json", () => [
  {
    name: "Enemy",
    beingType: "undead",
    sanity: null,
    healthRange: {
      minimum: 50,
      maximum: 100,
    },
    attackPowerRange: {
      minimum: 5,
      maximum: 10,
    },
    energy: {
      maximum: 30,
      regen: 5,
    },
    attackStrings: ["attack1", "attack2"],
    drops: [],
    goldDropRange: {
      minimum: 10,
      maximum: 20,
    },
    defaultSprite: "testSprite",
  },
  {
    name: "bandit", // Add the bandit enemy
    beingType: "human",
    sanity: 100,
    healthRange: {
      minimum: 30,
      maximum: 60,
    },
    attackPowerRange: {
      minimum: 3,
      maximum: 7,
    },
    energy: {
      maximum: 20,
      regen: 3,
    },
    attackStrings: ["bandit attack 1", "bandit attack 2"],
    drops: [],
    goldDropRange: {
      minimum: 5,
      maximum: 15,
    },
    sprite: "testSprite", // Make sure this matches a key in your EnemyImageMap mock
  },
]);

jest.mock("../../assets/json/bosses.json", () => [
  {
    name: "Boss",
    beingType: "undead",
    sanity: null,
    health: 200,
    attackPower: 20,
    energy: {
      maximum: 100,
      regen: 10,
    },
    attackStrings: ["bossAttack1", "bossAttack2"],
    sprite: "testSprite",
    drops: [],
    goldDropRange: {
      minimum: 100,
      maximum: 200,
    },
  },
]);

jest.mock("../../assets/json/specialEncounters.json", () => [
  {
    name: "camp",
    image: "camp",
    prompt: "Set up camp?",
    goodOutcome: {
      chance: 0.25,
      message: "Rested well",
      result: { effect: { sanity: 50, health: 50 } },
    },
    neutralOutcome: {
      chance: 0.65,
      message: "Somewhat rested",
      result: { effect: { sanity: 10, health: 10 } },
    },
    badOutcome: {
      chance: 0.1,
      message: "Ambushed!",
      result: { battle: ["bandit"] },
    },
  },
  // Add more mock special encounters as needed
]);

const mockDungeonStore = {
  root: {
    enemyStore: {
      addToEnemyList: jest.fn().mockImplementation((enemy) => enemy),
    },
    playerState: {
      addGold: jest.fn(),
      restoreHealth: jest.fn(),
      restoreMana: jest.fn(),
      restoreSanity: jest.fn(),
      playerClass: "mage", // or whatever default class you use
    },
    time: {
      currentDate: { year: 2023, week: 1 },
    },
  },
} as unknown as DungeonStore;

describe("DungeonInstance", () => {
  let dungeonInstance: DungeonInstance;

  beforeEach(() => {
    dungeonInstance = new DungeonInstance({
      id: 1,
      bgName: "Cave",
      name: "Test Dungeon",
      difficulty: 1,
      unlocks: ["Test Unlock"],
      levels: [],
      dungeonStore: mockDungeonStore,
    });
  });

  it("should create a dungeon instance with provided values", () => {
    expect(dungeonInstance.id).toBe(1);
    expect(dungeonInstance.bgName).toBe("Cave");
    expect(dungeonInstance.name).toBe("Test Dungeon");
    expect(dungeonInstance.difficulty).toBe(1);
    expect(dungeonInstance.unlocks).toEqual(["Test Unlock"]);
    expect(dungeonInstance.levels).toEqual([]);
  });

  it("should unlock next level", () => {
    const level1 = new DungeonLevel({
      level: 1,
      bossEncounter: [],
      normalEncounters: [],
      tiles: 10,
      unlocked: true,
      parent: dungeonInstance,
      dungeonStore: mockDungeonStore,
    });

    const level2 = new DungeonLevel({
      level: 2,
      bossEncounter: [],
      normalEncounters: [],
      tiles: 10,
      unlocked: false,
      parent: dungeonInstance,
      dungeonStore: mockDungeonStore,
    });

    runInAction(() => {
      dungeonInstance.levels = [level1, level2];
    });

    expect(dungeonInstance.unlockNextLevel()).toBe(true);
    expect(level2.unlocked).toBe(true);
  });

  it("should not unlock next level if all levels are already unlocked", () => {
    const level1 = new DungeonLevel({
      level: 1,
      bossEncounter: [],
      normalEncounters: [],
      tiles: 10,
      unlocked: true,
      parent: dungeonInstance,
      dungeonStore: mockDungeonStore,
    });

    runInAction(() => {
      dungeonInstance.levels = [level1];
    });

    expect(dungeonInstance.unlockNextLevel()).toBe(false);
  });
});

describe("DungeonLevel", () => {
  let dungeonInstance: DungeonInstance;
  let dungeonLevel: DungeonLevel;

  beforeEach(() => {
    dungeonInstance = new DungeonInstance({
      id: 1,
      bgName: "Cave",
      name: "Test Dungeon",
      difficulty: 1,
      unlocks: [],
      levels: [],
      dungeonStore: mockDungeonStore,
    });

    dungeonLevel = new DungeonLevel({
      level: 1,
      bossEncounter: [{ name: "Boss", scaler: 1 }],
      normalEncounters: [[{ name: "Enemy", scaler: 1 }]],
      tiles: 10,
      parent: dungeonInstance,
      dungeonStore: mockDungeonStore,
    });
  });

  it("should create a dungeon level with provided values", () => {
    expect(dungeonLevel.level).toBe(1);
    expect(dungeonLevel.tiles).toBe(10);
    expect(dungeonLevel.unlocked).toBe(false);
    expect(dungeonLevel.bossDefeated).toBe(false);
  });

  it("should unlock the level", () => {
    dungeonLevel.unlock();
    expect(dungeonLevel.unlocked).toBe(true);
  });

  it("should set boss as defeated", () => {
    dungeonLevel.setBossDefeated();
    expect(dungeonLevel.bossDefeated).toBe(true);
  });

  describe("generateNormalEncounter", () => {
    beforeEach(() => {
      (Enemy as jest.Mock).mockImplementation((props) => ({
        ...props,
        id: "mockEnemyId",
      }));
    });

    it("should generate enemies for a normal encounter", () => {
      const enemies = dungeonLevel.generateNormalEncounter;
      expect(enemies).toBeDefined();
      expect(enemies?.length).toBe(1);
      expect(enemies?.[0]).toHaveProperty("creatureSpecies", "Enemy");
      expect(enemies?.[0]).toHaveProperty("beingType", "undead");
    });

    it("should apply scaler to enemy stats", () => {
      dungeonLevel = new DungeonLevel({
        level: 1,
        bossEncounter: [],
        normalEncounters: [[{ name: "Enemy", scaler: 2 }]],
        tiles: 10,
        parent: dungeonInstance,
        dungeonStore: mockDungeonStore,
      });

      const enemies = dungeonLevel.generateNormalEncounter;
      let enemy = enemies?.[0];
      expect(enemy).toBeDefined();
      expect(enemy?.goldDropRange.minimum).toBe(20); // Original 10 * scaler 2
      expect(enemy?.goldDropRange.maximum).toBe(40); // Original 20 * scaler 2
    });
  });

  describe("generateBossEncounter", () => {
    beforeEach(() => {
      (Enemy as jest.Mock).mockImplementation((props) => ({
        ...props,
        id: "mockBossId",
      }));
    });

    it("should generate a boss encounter", () => {
      const bosses = dungeonLevel.generateBossEncounter;
      expect(bosses).toBeDefined();
      expect(bosses.length).toBe(1);
      expect(bosses[0]).toHaveProperty("creatureSpecies", "Boss");
      expect(bosses[0]).toHaveProperty("beingType", "undead");
    });

    it("should apply scaler to boss stats", () => {
      dungeonLevel = new DungeonLevel({
        level: 1,
        bossEncounter: [{ name: "Boss", scaler: 2 }],
        normalEncounters: [],
        tiles: 10,
        parent: dungeonInstance,
        dungeonStore: mockDungeonStore,
      });

      const bosses = dungeonLevel.generateBossEncounter;
      const boss = bosses[0];
      expect(boss).toBeDefined();
      expect(boss.goldDropRange.minimum).toBe(200); // Original 100 * scaler 2
      expect(boss.goldDropRange.maximum).toBe(400); // Original 200 * scaler 2
      expect(boss.baseHealth).toBe(400); // Original 200 * scaler 2
      expect(boss.attackPower).toBe(40); // Original 20 * scaler 2
    });
  });
});

describe("fromJSON", () => {
  it("should create a DungeonInstance from JSON", () => {
    const jsonData = {
      id: 2,
      bgName: "Forest",
      name: "JSON Dungeon",
      difficulty: 2,
      unlocks: ["JSON Unlock"],
      levels: [
        {
          level: 1,
          bossEncounter: [],
          normalEncounters: [],
          tiles: 5,
          unlocked: true,
          bossDefeated: false,
        },
      ],
      dungeonStore: mockDungeonStore,
    };

    const instance = DungeonInstance.fromJSON(jsonData);
    expect(instance.id).toBe(2);
    expect(instance.name).toBe("JSON Dungeon");
    expect(instance.levels[0]).toBeInstanceOf(DungeonLevel);
  });

  it("should create a DungeonLevel from JSON", () => {
    const jsonData = {
      level: 3,
      bossEncounter: [],
      normalEncounters: [],
      tiles: 7,
      unlocked: true,
      bossDefeated: true,
      parent: new DungeonInstance({
        id: 1,
        bgName: "Cave",
        name: "Parent Dungeon",
        difficulty: 1,
        unlocks: [],
        levels: [],
        dungeonStore: mockDungeonStore,
      }),
      dungeonStore: mockDungeonStore,
    };

    const level = DungeonLevel.fromJSON(jsonData);
    expect(level.level).toBe(3);
    expect(level.unlocked).toBe(true);
    expect(level.bossDefeated).toBe(true);
  });
});

describe("Special Encounters", () => {
  let dungeonInstance: DungeonInstance;
  let dungeonLevel: DungeonLevel;

  beforeEach(() => {
    dungeonInstance = new DungeonInstance({
      id: 1,
      bgName: "Cave",
      name: "Test Dungeon",
      difficulty: 1,
      unlocks: [],
      levels: [],
      dungeonStore: mockDungeonStore,
    });

    dungeonLevel = new DungeonLevel({
      level: 1,
      bossEncounter: [],
      normalEncounters: [],
      specialEncounters: [
        { name: "camp", scaler: 1, countChances: { "1": 1.0 } },
      ],
      tiles: 10,
      parent: dungeonInstance,
      dungeonStore: mockDungeonStore,
    });
  });

  it("should create special encounters from JSON", () => {
    expect(dungeonLevel.specialEncounters.length).toBe(1);
    const encounter = dungeonLevel.specialEncounters[0];
    expect(encounter.name).toBe("camp");
    expect(encounter.scaler).toBe(1);
    expect(encounter.countChances).toEqual({ "1": 1.0 });
    expect(encounter.prompt).toBe("Set up camp?");
  });

  it("should determine correct count for level based on chances", () => {
    const encounter = dungeonLevel.specialEncounters[0];
    expect(encounter.countForLevel).toBe(1);
  });

  it("should activate special encounter and return outcome", () => {
    const encounter = dungeonLevel.specialEncounters[0];

    // Mock Math.random to force specific outcomes
    const originalRandom = Math.random;

    // Test good outcome
    Math.random = jest.fn().mockReturnValue(0.1);
    let result = encounter.activate();
    expect(result.message).toBe("Rested well");
    expect(result.health).toBe(50);
    expect(result.sanity).toBe(50);
    expect(
      mockDungeonStore.root.playerState?.restoreHealth,
    ).toHaveBeenCalledWith(50);
    expect(
      mockDungeonStore.root.playerState?.restoreSanity,
    ).toHaveBeenCalledWith(50);

    // Reset mock
    jest.clearAllMocks();

    // Test neutral outcome
    Math.random = jest.fn().mockReturnValue(0.5);
    result = encounter.activate();
    expect(result.message).toBe("Somewhat rested");
    expect(result.health).toBe(10);
    expect(result.sanity).toBe(10);
    expect(
      mockDungeonStore.root.playerState?.restoreHealth,
    ).toHaveBeenCalledWith(10);
    expect(
      mockDungeonStore.root.playerState?.restoreSanity,
    ).toHaveBeenCalledWith(10);

    // Reset mock
    jest.clearAllMocks();

    // Test bad outcome
    Math.random = jest.fn().mockReturnValue(0.95);
    result = encounter.activate();
    expect(result.message).toBe("Ambushed!");
    expect(result.enemies).toBeDefined();
    expect(result.enemies?.[0].creatureSpecies).toBe("bandit");
    expect(mockDungeonStore.root.enemyStore.addToEnemyList).toHaveBeenCalled();

    // Restore original Math.random
    Math.random = originalRandom;
  });

  it("should correctly set parent level for special encounters", () => {
    const encounter = dungeonLevel.specialEncounters[0];
    expect(encounter.parentLevel).toBe(dungeonLevel);
  });
});
