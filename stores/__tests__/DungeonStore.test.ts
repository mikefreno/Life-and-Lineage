import { Dimensions } from "react-native";
import { DungeonInstance, DungeonLevel } from "../../entities/dungeon";
import { DungeonStore } from "../DungeonStore";
import { RootStore } from "../RootStore";

jest.mock("../SaveStore", () => ({
  SaveStore: jest.fn().mockImplementation(() => ({
    createCheckpoint: jest.fn(),
  })),
}));

// Mock other necessary stores
jest.mock("../EnemyStore", () => ({
  EnemyStore: jest.fn().mockImplementation(() => ({
    clearEnemyList: jest.fn(),
    addToEnemyList: jest.fn(),
  })),
}));

const TILE_SIZE = Math.max(
  Number((Dimensions.get("screen").width / 10).toFixed(0)),
  Number((Dimensions.get("screen").height / 10).toFixed(0)),
);

describe("DungeonStore", () => {
  let dungeonStore: DungeonStore;
  let mockRootStore: RootStore;

  beforeEach(() => {
    mockRootStore = {
      saveStore: {
        createCheckpoint: jest.fn(),
      },
      enemyStore: {
        clearEnemyList: jest.fn(),
        addToEnemyList: jest.fn(),
      },
    };
    dungeonStore = new DungeonStore({ root: mockRootStore });
  });

  test("initialization", () => {
    expect(dungeonStore.dungeonInstances).toBeDefined();
    expect(dungeonStore.inCombat).toBe(false);
    expect(dungeonStore.fightingBoss).toBe(false);
    expect(dungeonStore.logs).toEqual([]);
  });

  test("setUpDungeon", () => {
    const mockInstance = new DungeonInstance({
      name: "Test Dungeon",
      levels: [
        new DungeonLevel({
          level: 1,
          tiles: 10,
          bossEncounter: [],
          normalEncounters: [],
          unlocked: true,
          bossDefeated: false,
          dungeonStore: dungeonStore,
          parent: null as any, // We'll set this after creation
        }),
      ],
      bgName: "Cave",
      unlocks: [],
      id: 1,
      difficulty: 1,
      dungeonStore: dungeonStore,
    });
    mockInstance.levels[0].parent = mockInstance;

    const mockLevel = mockInstance.levels[0];

    dungeonStore.setUpDungeon(mockInstance, mockLevel);

    expect(dungeonStore.currentInstance).toBe(mockInstance);
    expect(dungeonStore.currentLevel).toBe(mockLevel);
    expect(dungeonStore.currentMap).toBeDefined();
    expect(dungeonStore.currentMapDimensions).toBeDefined();
    expect(dungeonStore.currentPosition).toBeDefined();
  });

  test("move", () => {
    const mockEncounter = {
      name: "zombie",
      scaler: 1,
    };

    const mockInstance = new DungeonInstance({
      name: "Test Dungeon",
      levels: [
        new DungeonLevel({
          level: 1,
          tiles: 10,
          bossEncounter: [mockEncounter],
          normalEncounters: [[mockEncounter]],
          unlocked: true,
          bossDefeated: false,
          dungeonStore: dungeonStore,
          parent: null as any,
        }),
      ],
      bgName: "Cave",
      unlocks: [],
      id: 1,
      difficulty: 1,
      dungeonStore: dungeonStore,
    });
    mockInstance.levels[0].parent = mockInstance;

    const mockLevel = mockInstance.levels[0];

    dungeonStore.setUpDungeon(mockInstance, mockLevel);

    const initialPosition = dungeonStore.currentPosition;
    dungeonStore.move("right");

    expect(dungeonStore.currentPosition).not.toBe(initialPosition);
    expect(dungeonStore.currentPosition!.x).toBe(
      initialPosition!.x + TILE_SIZE,
    );
  });

  test("addLog", () => {
    dungeonStore.addLog("Test log");
    expect(dungeonStore.logs.length).toBe(1);
    expect(dungeonStore.logs[0]).toContain("Test log");
  });

  test("clearDungeonState", () => {
    dungeonStore.clearDungeonState();

    expect(dungeonStore.currentInstance).toBeUndefined();
    expect(dungeonStore.currentLevel).toBeUndefined();
    expect(dungeonStore.currentMap).toBeUndefined();
    expect(dungeonStore.currentMapDimensions).toBeUndefined();
    expect(dungeonStore.currentPosition).toBeUndefined();
    expect(dungeonStore.inCombat).toBe(false);
    expect(dungeonStore.fightingBoss).toBe(false);
    expect(dungeonStore.logs).toEqual([]);
  });
});
