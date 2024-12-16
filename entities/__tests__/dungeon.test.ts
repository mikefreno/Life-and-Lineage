import { DungeonInstance, DungeonLevel } from "../dungeon";
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

const mockDungeonStore = {
  root: {
    enemyStore: {},
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
