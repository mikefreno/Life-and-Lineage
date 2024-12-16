import { RootStore } from "../../stores/RootStore";
import { PlayerCharacter } from "../character";
import { Enemy, Minion } from "../creatures";
import { ThreatTable } from "../threatTable";

// Mock dependencies
jest.mock("../character");
jest.mock("../creatures");
jest.mock("../../stores/RootStore");

describe("ThreatTable", () => {
  let threatTable: ThreatTable;
  let mockPlayer: jest.Mocked<PlayerCharacter>;
  let mockEnemy: jest.Mocked<Enemy>;
  let mockMinion: jest.Mocked<Minion>;

  beforeEach(() => {
    threatTable = new ThreatTable();

    // Setup mocks
    mockPlayer = new PlayerCharacter({
      root: new RootStore(),
    }) as jest.Mocked<PlayerCharacter>;
    mockEnemy = new Enemy({}) as jest.Mocked<Enemy>;
    mockMinion = new Minion({}) as jest.Mocked<Minion>;

    // Default mock values
    Object.assign(mockPlayer, {
      id: "player1",
      currentHealth: 100,
      attackPower: 10,
    });
    Object.assign(mockEnemy, {
      id: "enemy1",
      currentHealth: 80,
      attackPower: 8,
    });
    Object.assign(mockMinion, {
      id: "minion1",
      currentHealth: 50,
      attackPower: 5,
    });
  });

  describe("addThreat", () => {
    it("should add threat points for a new attacker", () => {
      threatTable.addThreat("player1", 10);
      expect(threatTable["baseThreatPoints"].get("player1")).toBe(10);
    });

    it("should accumulate threat points for an existing attacker", () => {
      threatTable.addThreat("player1", 10);
      threatTable.addThreat("player1", 15);
      expect(threatTable["baseThreatPoints"].get("player1")).toBe(25);
    });
  });

  describe("getHighestThreatTargets", () => {
    it("should throw an error when no targets are provided", () => {
      expect(() => threatTable.getHighestThreatTargets([], 1)).toThrow(
        "No targets provided",
      );
    });

    it("should return targets based on threat points", () => {
      threatTable.addThreat(mockPlayer.id, 20);
      threatTable.addThreat(mockEnemy.id, 10);

      const targets = threatTable.getHighestThreatTargets(
        [mockPlayer, mockEnemy],
        2,
      );
      expect(targets[0]).toBe(mockPlayer);
      expect(targets[1]).toBe(mockEnemy);
    });

    it("should adjust threat based on relative HP", () => {
      mockPlayer.currentHealth = 20; // Low HP should increase threat
      mockEnemy.currentHealth = 100;

      threatTable.addThreat(mockPlayer.id, 10);
      threatTable.addThreat(mockEnemy.id, 10);

      const targets = threatTable.getHighestThreatTargets(
        [mockPlayer, mockEnemy],
        2,
      );
      expect(targets[0]).toBe(mockPlayer);
    });

    it("should adjust threat based on relative attack power", () => {
      mockPlayer.attackPower = 20; // High attack power should increase threat
      mockEnemy.attackPower = 5;

      threatTable.addThreat(mockPlayer.id, 10);
      threatTable.addThreat(mockEnemy.id, 10);

      const targets = threatTable.getHighestThreatTargets(
        [mockPlayer, mockEnemy],
        2,
      );
      expect(targets[0]).toBe(mockPlayer);
    });

    it("should handle fallback logic when no threat points exist", () => {
      const targets = threatTable.getHighestThreatTargets(
        [mockPlayer, mockEnemy, mockMinion],
        2,
      );
      expect(targets.length).toBe(2);
      // Verify that it prioritizes players and enemies with minions
    });

    it("should limit returned targets to requested number", () => {
      threatTable.addThreat(mockPlayer.id, 20);
      threatTable.addThreat(mockEnemy.id, 10);
      threatTable.addThreat(mockMinion.id, 5);

      const targets = threatTable.getHighestThreatTargets(
        [mockPlayer, mockEnemy, mockMinion],
        2,
      );
      expect(targets.length).toBe(2);
    });
  });

  describe("totalThreatPoints", () => {
    it("should calculate threat points correctly", () => {
      threatTable.addThreat(mockPlayer.id, 100);

      const points = threatTable.totalThreatPoints(mockPlayer, 100, 10);
      expect(points).toBe(200); // 100 * 2.0 due to full HP and AP
    });

    it("should return 0 if no base threat exists", () => {
      const points = threatTable.totalThreatPoints(mockPlayer, 100, 10);
      expect(points).toBe(0);
    });

    it("should apply correct multipliers based on HP percentage", () => {
      threatTable.addThreat(mockPlayer.id, 100);

      // Low HP test
      mockPlayer.currentHealth = 5; // Very low HP
      const lowHPPoints = threatTable.totalThreatPoints(mockPlayer, 100, 10);
      expect(lowHPPoints).toBe(1600);

      // Medium-low HP test
      mockPlayer.currentHealth = 30;
      const mediumLowHPPoints = threatTable.totalThreatPoints(
        mockPlayer,
        100,
        10,
      );

      expect(mediumLowHPPoints).toBe(600);
    });

    it("should apply correct multipliers based on attack power percentage", () => {
      threatTable.addThreat(mockPlayer.id, 100);

      // High AP test
      mockPlayer.attackPower = 10;
      const highAPPoints = threatTable.totalThreatPoints(mockPlayer, 100, 10);
      expect(highAPPoints).toBe(200);

      // Low AP test
      mockPlayer.attackPower = 1;
      const lowAPPoints = threatTable.totalThreatPoints(mockPlayer, 100, 10);
      expect(lowAPPoints).toBe(25);
    });

    it("should apply both HP and AP multipliers correctly", () => {
      threatTable.addThreat(mockPlayer.id, 100);

      mockPlayer.currentHealth = 5; // Very low HP
      mockPlayer.attackPower = 1; // Very low AP
      const points = threatTable.totalThreatPoints(mockPlayer, 100, 10);
      expect(points).toBe(200); // 100 * 4.0 * 0.5
    });
  });
});
