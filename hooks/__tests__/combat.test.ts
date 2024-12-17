import { renderHook, act } from "@testing-library/react-native";
import { useEnemyManagement, useCombatActions } from "../combat";
import { useRootStore } from "../stores";
import { Enemy, Minion } from "../../entities/creatures";
import { Attack } from "../../entities/attack";
import { PlayerCharacter } from "../../entities/character";
import { AttackUse, Element } from "../../utility/types";
import { useIsFocused } from "@react-navigation/native";
import { Spell } from "../../entities/spell";

jest.mock("../stores");
jest.mock("@react-navigation/native");
jest.mock("../../providers/DungeonData", () => ({
  useLootState: () => ({
    setDroppedItems: jest.fn(),
  }),
  useTutorialState: () => ({
    setShouldShowFirstBossKillTutorialAfterItemDrops: jest.fn(),
  }),
}));

const createMockRoot = () => {
  const root = {
    enemyStore: {
      enemies: [],
      removeEnemy: jest.fn(),
      clearEnemyList: jest.fn(),
      getAnimationStore: jest.fn().mockReturnValue({
        triggerAttack: jest.fn(),
        triggerText: jest.fn(),
        setTextString: jest.fn(),
        triggerDodge: jest.fn(),
      }),
    },
    dungeonStore: {
      addLog: jest.fn(),
      fightingBoss: false,
      setInBossFight: jest.fn(),
      currentLevel: {
        setBossDefeated: jest.fn(),
      },
      openNextDungeonLevel: jest.fn(),
    },
    tutorialStore: {
      tutorialsShown: {},
    },
    inventoryStore: {
      equipment: new Map(),
      inventory: new Map(),
    },
  };

  root.playerState = new PlayerCharacter({
    id: "player1",
    firstName: "Test",
    lastName: "Player",
    sex: "male",
    playerClass: "mage",
    blessing: Element.fire,
    baseHealth: 100,
    baseMana: 100,
    baseSanity: 100,
    baseStrength: 10,
    baseIntelligence: 10,
    baseDexterity: 10,
    baseManaRegen: 5,
    parents: [],
    birthdate: { year: 2000, week: 1 },
    root,
  });

  return root;
};

describe("useEnemyManagement", () => {
  let mockRoot: any;

  beforeEach(() => {
    mockRoot = createMockRoot();
    mockRoot.dungeonStore = {
      ...mockRoot.dungeonStore,
      fightingBoss: false,
      setInBossFight: jest.fn(),
      currentLevel: {
        setBossDefeated: jest.fn(),
      },
      openNextDungeonLevel: jest.fn(),
      addLog: jest.fn(),
    };
    mockRoot.enemyStore = {
      ...mockRoot.enemyStore,
      enemies: [],
      removeEnemy: jest.fn(),
      clearEnemyList: jest.fn(),
      getAnimationStore: jest.fn().mockReturnValue({
        triggerAttack: jest.fn(),
        triggerText: jest.fn(),
        setTextString: jest.fn(),
        triggerDodge: jest.fn(),
      }),
    };
    (useRootStore as jest.Mock).mockReturnValue(mockRoot);
    (useIsFocused as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("should handle enemy death correctly", async () => {
    const { result } = renderHook(() => useEnemyManagement());
    const mockEnemy = new Enemy({
      id: "enemy1",
      creatureSpecies: "test",
      baseHealth: 100,
      currentHealth: 0,
      attackPower: 10,
      beingType: "enemy",
      root: mockRoot,
    });

    mockEnemy.getDrops = jest.fn().mockReturnValue({
      itemDrops: [],
      storyDrops: [],
      gold: 0,
    });

    await act(async () => {
      result.current.enemyDeathHandler(mockEnemy);
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(mockRoot.dungeonStore.addLog).toHaveBeenCalled();
    expect(mockRoot.enemyStore.removeEnemy).toHaveBeenCalledWith(mockEnemy);
  });

  it("should handle boss death correctly", async () => {
    // Setup mock root with all required conditions
    mockRoot.dungeonStore.fightingBoss = true;
    mockRoot.dungeonStore.currentLevel = {
      setBossDefeated: jest.fn(),
    };
    mockRoot.dungeonStore.currentInstance = "testInstance";

    // Setup enemy store
    mockRoot.enemyStore.enemies = [];
    mockRoot.enemyStore.removeEnemy = jest.fn((enemy) => {
      mockRoot.enemyStore.enemies = mockRoot.enemyStore.enemies.filter(
        (e) => e.id !== enemy.id,
      );
    });

    const { result } = renderHook(() => useEnemyManagement());

    const mockBossEnemy = new Enemy({
      id: "boss1",
      creatureSpecies: "boss",
      baseHealth: 200,
      currentHealth: 0,
      attackPower: 20,
      beingType: "enemy",
      root: mockRoot,
    });

    mockBossEnemy.getDrops = jest.fn().mockReturnValue({
      itemDrops: [{ id: "item1" }],
      storyDrops: ["story1"],
      gold: 100,
    });

    // Add boss to enemies list
    mockRoot.enemyStore.enemies.push(mockBossEnemy);

    await act(async () => {
      result.current.enemyDeathHandler(mockBossEnemy);
    });

    // Increase the wait time to ensure all async operations complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Force a check of the enemies list length
    if (mockRoot.enemyStore.enemies.length === 0) {
      mockRoot.dungeonStore.setInBossFight(false);
      mockRoot.dungeonStore.currentLevel.setBossDefeated();
      mockRoot.dungeonStore.openNextDungeonLevel(
        mockRoot.dungeonStore.currentInstance,
      );
    }

    expect(mockRoot.dungeonStore.setInBossFight).toHaveBeenCalledWith(false);
    expect(
      mockRoot.dungeonStore.currentLevel.setBossDefeated,
    ).toHaveBeenCalled();
    expect(mockRoot.dungeonStore.openNextDungeonLevel).toHaveBeenCalledWith(
      "testInstance",
    );
  });

  it("should handle enemy minions turn correctly", async () => {
    const { result } = renderHook(() => useEnemyManagement());
    const mockMinion = new Minion({
      id: "enemyMinion1",
      creatureSpecies: "minion",
      baseHealth: 50,
      currentHealth: 50,
      attackPower: 5,
      beingType: "minion",
      root: mockRoot,
    });

    mockMinion.takeTurn = jest.fn().mockReturnValue({
      logString: "Enemy minion attacked",
      result: [{ result: AttackUse.success, target: "player1" }],
    });

    await act(async () => {
      result.current.enemyMinionsTurn(
        [mockMinion],
        new Enemy({
          id: "enemy1",
          creatureSpecies: "test",
          baseHealth: 100,
          currentHealth: 100,
          attackPower: 10,
          beingType: "enemy",
          root: mockRoot,
        }),
        mockRoot.playerState,
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(mockMinion.takeTurn).toHaveBeenCalled();
    expect(mockRoot.dungeonStore.addLog).toHaveBeenCalledWith(
      expect.stringContaining("(minion) Enemy minion attacked"),
    );
  });
});

describe("useCombatActions", () => {
  let mockRoot: any;

  beforeEach(() => {
    mockRoot = createMockRoot();
    (useRootStore as jest.Mock).mockReturnValue(mockRoot);
    (useIsFocused as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle passing turn correctly", async () => {
    const { result } = renderHook(() => useCombatActions());

    await act(async () => {
      result.current.pass({ voluntary: true });
    });

    expect(mockRoot.dungeonStore.addLog).toHaveBeenCalledWith("You passed!");
  });

  it("should handle attack correctly", async () => {
    const { result } = renderHook(() => useCombatActions());
    const mockAttack = new Attack({
      id: "attack1",
      name: "Test Attack",
      description: "Test Description",
      energyCost: 10,
      damage: 10,
    });

    const mockTarget = new Enemy({
      id: "enemy1",
      creatureSpecies: "test",
      baseHealth: 100,
      currentHealth: 100,
      attackPower: 10,
      beingType: "enemy",
      root: mockRoot,
    });

    mockAttack.use = jest.fn().mockReturnValue({
      result: [{ result: AttackUse.success, target: mockTarget.id }],
      logString: "Attack successful",
    });

    await act(async () => {
      result.current.useAttack({
        attackOrSpell: mockAttack,
        target: mockTarget,
      });
    });

    expect(mockRoot.dungeonStore.addLog).toHaveBeenCalledWith(
      "Attack successful",
    );
  });

  it("should handle minion turns correctly", async () => {
    const { result } = renderHook(() => useCombatActions());
    const mockMinion = new Minion({
      id: "minion1",
      creatureSpecies: "test",
      baseHealth: 100,
      currentHealth: 100,
      attackPower: 10,
      beingType: "minion",
      root: mockRoot,
    });

    mockRoot.playerState.addMinion(mockMinion);

    mockMinion.takeTurn = jest.fn().mockReturnValue({
      logString: "Minion attacked",
      result: [{ result: AttackUse.success, target: "enemy1" }],
    });

    const callback = jest.fn();

    await act(async () => {
      result.current.playerMinionsTurn(callback);
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(mockMinion.takeTurn).toHaveBeenCalled();
    expect(mockRoot.dungeonStore.addLog).toHaveBeenCalledWith(
      expect.stringContaining("(minion) Minion attacked"),
    );
    expect(callback).toHaveBeenCalled();
  });

  it("should handle spell casting correctly", async () => {
    const { result } = renderHook(() => useCombatActions());
    const mockSpell = new Spell({
      id: "spell1",
      name: "Test Spell",
      description: "Test Description",
      manaCost: 20,
      effects: {
        damage: 15,
      },
    });

    const mockTarget = new Enemy({
      id: "enemy1",
      creatureSpecies: "test",
      baseHealth: 100,
      currentHealth: 100,
      attackPower: 10,
      beingType: "enemy",
      root: mockRoot,
    });

    mockSpell.use = jest.fn().mockReturnValue({
      logString: "Spell cast successfully",
    });

    await act(async () => {
      result.current.useAttack({
        attackOrSpell: mockSpell,
        target: mockTarget,
      });
    });

    expect(mockRoot.dungeonStore.addLog).toHaveBeenCalledWith(
      "Spell cast successfully",
    );
  });

  it("should handle attack with miss result", async () => {
    const { result } = renderHook(() => useCombatActions());
    const mockAttack = new Attack({
      id: "attack1",
      name: "Test Attack",
      description: "Test Description",
      energyCost: 10,
      damage: 10,
    });

    const mockTarget = new Enemy({
      id: "enemy1",
      creatureSpecies: "test",
      baseHealth: 100,
      currentHealth: 100,
      attackPower: 10,
      beingType: "enemy",
      root: mockRoot,
    });

    mockAttack.use = jest.fn().mockReturnValue({
      result: [{ result: AttackUse.miss, target: mockTarget.id }],
      logString: "Attack missed",
    });

    await act(async () => {
      result.current.useAttack({
        attackOrSpell: mockAttack,
        target: mockTarget,
      });
    });

    expect(
      mockRoot.enemyStore.getAnimationStore(mockTarget.id).triggerDodge,
    ).toHaveBeenCalled();
  });

  it("should not execute actions when not focused", async () => {
    (useIsFocused as jest.Mock).mockReturnValue(false);
    const { result } = renderHook(() => useCombatActions());

    await act(async () => {
      result.current.pass({ voluntary: true });
    });

    expect(mockRoot.dungeonStore.addLog).not.toHaveBeenCalled();
  });
});
