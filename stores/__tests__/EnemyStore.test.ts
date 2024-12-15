import { Enemy } from "../../entities/creatures";
import EnemyStore from "../EnemyStore";
import { RootStore } from "../RootStore";

describe("EnemyStore", () => {
  let enemyStore: EnemyStore;
  let mockRootStore: RootStore;

  beforeEach(() => {
    mockRootStore = {
      enemyStore: { enemies: [] },
      dungeonStore: { setInCombat: jest.fn() },
    } as unknown as jest.Mocked<RootStore>;
    enemyStore = new EnemyStore({ root: mockRootStore });
  });

  test("initialization", () => {
    expect(enemyStore.enemies).toEqual([]);
    expect(enemyStore.animationStoreMap).toBeDefined();
    expect(enemyStore.attackAnimationsOnGoing).toBe(false);
    expect(enemyStore.deathAnimationsOnGoing).toBe(false);
    expect(enemyStore.attackAnimationCount).toBe(0);
    expect(enemyStore.deathAnimationsCount).toBe(0);
  });

  test("addToEnemyList", () => {
    const mockEnemy = { id: "1" } as Enemy;
    enemyStore.addToEnemyList(mockEnemy);

    expect(enemyStore.enemies).toContainEqual(mockEnemy);
    expect(enemyStore.animationStoreMap.get("1")).toBeDefined();
  });

  test("removeEnemy", () => {
    const mockEnemy = { id: "1" } as Enemy;
    enemyStore.addToEnemyList(mockEnemy);
    enemyStore.removeEnemy(mockEnemy);

    expect(enemyStore.enemies).not.toContain(mockEnemy);
    expect(enemyStore.animationStoreMap.get("1")).toBeUndefined();
  });

  test("clearEnemyList", () => {
    const mockEnemy = { id: "1" } as Enemy;
    enemyStore.addToEnemyList(mockEnemy);
    enemyStore.clearEnemyList();

    expect(enemyStore.enemies).toEqual([]);
    expect(enemyStore.animationStoreMap.size).toBe(0);
    expect(enemyStore.attackAnimationsOnGoing).toBe(false);
  });

  test("incrementAttackAnimations and decrementAttackAnimations", () => {
    enemyStore.incrementAttackAnimations();
    expect(enemyStore.attackAnimationCount).toBe(1);
    expect(enemyStore.attackAnimationsOnGoing).toBe(true);

    enemyStore.decrementAttackAnimations();
    expect(enemyStore.attackAnimationCount).toBe(0);
    expect(enemyStore.attackAnimationsOnGoing).toBe(false);
  });

  test("incrementDeathAnimations and decrementDeathAnimations", () => {
    enemyStore.incrementDeathAnimations();
    expect(enemyStore.deathAnimationsCount).toBe(1);
    expect(enemyStore.deathAnimationsOnGoing).toBe(true);

    enemyStore.decrementDeathAnimations();
    expect(enemyStore.deathAnimationsCount).toBe(0);
    expect(enemyStore.deathAnimationsOnGoing).toBe(false);
  });
});
