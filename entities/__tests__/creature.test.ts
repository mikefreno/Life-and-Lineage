import EnemyStore from "../../stores/EnemyStore";
import { RootStore } from "../../stores/RootStore";
import { ItemClassType } from "../../utility/types";
import { PlayerCharacter } from "../character";
import { Condition } from "../conditions";
import { Enemy, Minion } from "../creatures";

jest.mock("../../stores/EnemyStore");
jest.mock("../../stores/RootStore");

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
      drops: [{ item: "Gold Coin", itemType: ItemClassType.Junk, chance: 1 }],
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
    expect(drops.itemDrops[0].name).toBe("Gold Coin");
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
});
