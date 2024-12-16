import { Condition } from "../conditions";
import { PlayerCharacter } from "../character";
import { Enemy } from "../creatures";
import { ConditionType, EffectOptions, EffectStyle } from "../../utility/types";
import * as Crypto from "expo-crypto";

// Mock dependencies
jest.mock("../character");
jest.mock("../creatures");
jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "test-uuid"),
}));

describe("Condition", () => {
  let mockPlayer: jest.Mocked<PlayerCharacter>;
  let mockEnemy: jest.Mocked<Enemy>;

  beforeEach(() => {
    mockPlayer = new PlayerCharacter({} as any) as jest.Mocked<PlayerCharacter>;
    mockEnemy = new Enemy({}) as jest.Mocked<Enemy>;

    Object.assign(mockPlayer, {
      id: "player1",
      removeCondition: jest.fn(),
    });

    Object.assign(mockEnemy, {
      id: "enemy1",
      removeCondition: jest.fn(),
    });
  });

  describe("constructor", () => {
    it("should create a condition with minimal properties", () => {
      const condition = new Condition({
        name: "Test Condition",
        style: "debuff",
        turns: 3,
        effect: ["stun"],
        effectStyle: ["flat"],
        effectMagnitude: [1],
        healthDamage: [],
        sanityDamage: [],
        placedby: "Test Player",
        placedbyID: "player1",
        icon: "stun",
      });

      expect(condition.id).toBe("test-uuid");
      expect(condition.name).toBe("Test Condition");
      expect(condition.style).toBe("debuff");
      expect(condition.turns).toBe(3);
      expect(condition.effect).toEqual(["stun"]);
      expect(condition.aura).toBe(false);
    });

    it("should create a condition with all properties", () => {
      const condition = new Condition({
        id: "custom-id",
        name: "Complex Condition",
        style: "buff",
        turns: 5,
        trapSetupTime: 2,
        effect: ["strengthen"],
        effectStyle: ["percentage"],
        effectMagnitude: [0.5],
        healthDamage: [10],
        sanityDamage: [5],
        placedby: "Test Player",
        placedbyID: "player1",
        aura: true,
        icon: "glow_star",
        on: mockPlayer,
      });

      expect(condition.id).toBe("custom-id");
      expect(condition.trapSetupTime).toBe(2);
      expect(condition.aura).toBe(true);
      expect(condition.on).toBe(mockPlayer);
    });
  });

  describe("getConditionIcon", () => {
    it("should return the correct icon", () => {
      const condition = new Condition({
        name: "Test Condition",
        style: "buff",
        turns: 3,
        effect: ["strengthen"],
        effectStyle: ["flat"],
        effectMagnitude: [1],
        healthDamage: [],
        sanityDamage: [],
        placedby: "Test Player",
        placedbyID: "player1",
        icon: "glow_star",
      });

      const icon = condition.getConditionIcon();
      expect(icon).toBeDefined();
    });
  });

  describe("reinstateParent", () => {
    it("should set the parent and return the condition", () => {
      const condition = new Condition({
        name: "Test Condition",
        style: "buff",
        turns: 3,
        effect: ["strengthen"],
        effectStyle: ["flat"],
        effectMagnitude: [1],
        healthDamage: [],
        sanityDamage: [],
        placedby: "Test Player",
        placedbyID: "player1",
      });

      const result = condition.reinstateParent(mockPlayer);
      expect(result).toBe(condition);
      expect(condition.on).toBe(mockPlayer);
    });
  });

  describe("damage calculations", () => {
    it("should calculate health damage correctly", () => {
      const condition = new Condition({
        name: "Damage Condition",
        style: "debuff",
        turns: 3,
        effect: [],
        effectStyle: [],
        effectMagnitude: [],
        healthDamage: [10, 5],
        sanityDamage: [],
        placedby: "Test Player",
        placedbyID: "player1",
      });

      expect(condition.getHealthDamage()).toBe(15);
    });

    it("should calculate sanity damage correctly", () => {
      const condition = new Condition({
        name: "Sanity Condition",
        style: "debuff",
        turns: 3,
        effect: [],
        effectStyle: [],
        effectMagnitude: [],
        healthDamage: [],
        sanityDamage: [7, 3],
        placedby: "Test Player",
        placedbyID: "player1",
      });

      expect(condition.getSanityDamage()).toBe(10);
    });
  });

  describe("tick", () => {
    it("should decrease turns if not an aura", () => {
      const condition = new Condition({
        name: "Test Condition",
        style: "debuff",
        turns: 3,
        effect: [],
        effectStyle: [],
        effectMagnitude: [],
        healthDamage: [],
        sanityDamage: [],
        placedby: "Test Player",
        placedbyID: "player1",
      });

      condition.tick(mockPlayer);
      expect(condition.turns).toBe(2);
    });

    it("should not decrease turns if it's an aura", () => {
      const condition = new Condition({
        name: "Aura Condition",
        style: "buff",
        turns: 3,
        effect: [],
        effectStyle: [],
        effectMagnitude: [],
        healthDamage: [],
        sanityDamage: [],
        placedby: "Test Player",
        placedbyID: "player1",
        aura: true,
      });

      condition.tick(mockPlayer);
      expect(condition.turns).toBe(3);
    });

    it("should apply damage to the holder", () => {
      const condition = new Condition({
        name: "Damage Condition",
        style: "debuff",
        turns: 3,
        effect: [],
        effectStyle: [],
        effectMagnitude: [],
        healthDamage: [10],
        sanityDamage: [5],
        placedby: "Test Player",
        placedbyID: "player1",
      });

      condition.tick(mockPlayer);
      expect(mockPlayer.damageHealth).toHaveBeenCalledWith({
        attackerId: "player1",
        damage: 10,
      });
      expect(mockPlayer.damageSanity).toHaveBeenCalledWith(5);
    });
  });

  describe("destroyTrap", () => {
    it("should set turns to 0 for trap conditions", () => {
      const condition = new Condition({
        name: "Trap Condition",
        style: "debuff",
        turns: 3,
        effect: ["trap"],
        effectStyle: ["flat"],
        effectMagnitude: [10],
        healthDamage: [],
        sanityDamage: [],
        placedby: "Test Player",
        placedbyID: "player1",
      });

      condition.destroyTrap();
      expect(condition.turns).toBe(0);
    });

    it("should not affect non-trap conditions", () => {
      const condition = new Condition({
        name: "Normal Condition",
        style: "debuff",
        turns: 3,
        effect: ["weaken"],
        effectStyle: ["flat"],
        effectMagnitude: [1],
        healthDamage: [],
        sanityDamage: [],
        placedby: "Test Player",
        placedbyID: "player1",
      });

      condition.destroyTrap();
      expect(condition.turns).toBe(3);
    });
  });

  describe("static effectExplanationString", () => {
    it("should return correct explanation for various effects", () => {
      const effects: EffectOptions[] = [
        "stun",
        "weaken",
        "strengthen",
        "armor increase",
        "accuracy reduction",
      ];

      effects.forEach((effect) => {
        const explanation = Condition.effectExplanationString({
          effect,
          effectStyle: "percentage",
          effectMagnitude: 0.5,
          trapSetupTime: undefined,
        });
        expect(explanation).toBeDefined();
        expect(explanation.length).toBeGreaterThan(0);
      });
    });

    it("should handle trap setup time", () => {
      const explanation = Condition.effectExplanationString({
        effect: "trap",
        effectStyle: "flat",
        effectMagnitude: 10,
        trapSetupTime: 2,
      });
      expect(explanation).toContain("Setting up for 2 more turns");
    });
  });

  describe("fromJSON", () => {
    it("should create a condition from JSON data", () => {
      const jsonData = {
        id: "json-id",
        name: "JSON Condition",
        style: "buff" as const,
        turns: 4,
        effect: ["strengthen" as EffectOptions],
        effectStyle: ["percentage" as EffectStyle],
        effectMagnitude: [0.25],
        healthDamage: [],
        sanityDamage: [],
        placedby: "JSON Player",
        placedbyID: "jsonPlayer1",
        icon: "glow_star",
      };

      const condition = Condition.fromJSON(jsonData);
      expect(condition.id).toBe("json-id");
      expect(condition.name).toBe("JSON Condition");
      expect(condition.turns).toBe(4);
    });
  });
});
