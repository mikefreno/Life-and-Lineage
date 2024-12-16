import {
  createDebuff,
  createBuff,
  lowSanityDebuffGenerator,
  getConditionEffectsOnAttacks,
  getConditionDamageToAttacker,
  getConditionEffectsOnDefenses,
  getConditionEffectsOnMisc,
  getMagnitude,
} from "../conditions";
import { Condition } from "../../../entities/conditions";
import { PlayerCharacter } from "../../../entities/character";

// Mock the JSON imports
jest.mock("../../../assets/json/conditions.json", () => [
  {
    name: "burn",
    turns: 3,
    effect: ["health damage"],
    effectAmount: [0.1],
    effectStyle: ["percentage"],
    icon: "burn-icon",
    aura: "red",
  },
  {
    name: "strengthen",
    turns: 2,
    effect: ["strengthen"],
    effectAmount: [0.2],
    effectStyle: ["multiplier"],
    icon: "strengthen-icon",
    aura: "yellow",
  },
  {
    name: "thorns",
    turns: 3,
    effect: ["thorns"],
    effectAmount: [10],
    effectStyle: ["flat"],
    icon: "thorns-icon",
    aura: "green",
  },
]);

jest.mock("../../../assets/json/sanityDebuffs.json", () => [
  {
    name: "hallucination",
    turns: 2,
    effect: ["sanity damage"],
    effectAmount: [0.1],
    effectStyle: ["percentage"],
    icon: "hallucination-icon",
    aura: "purple",
  },
]);

describe("Conditions Functions", () => {
  describe("createDebuff", () => {
    it("should create a debuff with percentage-based damage", () => {
      const debuff = createDebuff({
        debuffName: "burn",
        enemyMaxHP: 100,
        enemyMaxSanity: 50,
        primaryAttackDamage: 20,
        applierNameString: "Test Applier",
        applierID: "test-id",
      });

      expect(debuff).toBeInstanceOf(Condition);
      expect(debuff.name).toBe("burn");
      expect(debuff.turns).toBe(3);
      expect(debuff.healthDamage).toEqual([10]); // 10% of 100 HP
      expect(debuff.placedby).toBe("Test Applier");
    });

    it("should throw error for non-existent debuff", () => {
      expect(() =>
        createDebuff({
          debuffName: "nonexistent",
          enemyMaxHP: 100,
          enemyMaxSanity: 50,
          primaryAttackDamage: 20,
          applierNameString: "Test Applier",
          applierID: "test-id",
        }),
      ).toThrow("Failed to find debuff in createDebuff()");
    });
  });

  describe("createBuff", () => {
    it("should create a buff with multiplier-based effect", () => {
      const buff = createBuff({
        buffName: "strengthen",
        attackPower: 50,
        maxHealth: 100,
        maxSanity: 50,
        applierNameString: "Test Applier",
        applierID: "test-id",
      });

      expect(buff).toBeInstanceOf(Condition);
      expect(buff.name).toBe("strengthen");
      expect(buff.turns).toBe(2);
      expect(buff.effectMagnitude).toEqual([0.2]);
    });
  });

  describe("lowSanityDebuffGenerator", () => {
    let mockPlayer: jest.Mocked<PlayerCharacter>;

    beforeEach(() => {
      mockPlayer = {
        currentSanity: 10,
        nonConditionalMaxHealth: 100,
        nonConditionalMaxSanity: 50,
        addCondition: jest.fn(),
      } as unknown as jest.Mocked<PlayerCharacter>;
    });

    it("should not generate debuff if sanity is positive", () => {
      mockPlayer.currentSanity = 10;
      lowSanityDebuffGenerator(mockPlayer);
      expect(mockPlayer.addCondition).not.toHaveBeenCalled();
    });

    it("should potentially generate debuff if sanity is negative", () => {
      jest
        .spyOn(global.Math, "random")
        .mockReturnValueOnce(0.95) // for rollD20
        .mockReturnValueOnce(0.5); // for sanityDebuffs array index

      mockPlayer.currentSanity = -10;
      lowSanityDebuffGenerator(mockPlayer);

      expect(mockPlayer.addCondition).toHaveBeenCalledWith(
        expect.objectContaining({
          style: "debuff",
          placedby: "low sanity",
          placedbyID: "low sanity",
        }),
      );
    });

    it("should not generate debuff on low roll even with negative sanity", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(0.5);
      mockPlayer.currentSanity = -10;
      lowSanityDebuffGenerator(mockPlayer);
      expect(mockPlayer.addCondition).not.toHaveBeenCalled();
    });

    it("should create debuff with correct damage calculations", () => {
      jest
        .spyOn(global.Math, "random")
        .mockReturnValueOnce(0.95) // for rollD20
        .mockReturnValueOnce(0); // Always select first debuff for predictable testing

      mockPlayer.currentSanity = -10;
      lowSanityDebuffGenerator(mockPlayer);

      expect(mockPlayer.addCondition).toHaveBeenCalledWith(
        expect.objectContaining({
          healthDamage: expect.any(Array),
          sanityDamage: expect.any(Array),
        }),
      );
    });

    it("should handle null player state", () => {
      lowSanityDebuffGenerator(null as unknown as PlayerCharacter);
      expect(mockPlayer.addCondition).not.toHaveBeenCalled();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe("getConditionEffectsOnAttacks", () => {
    it("should calculate correct attack modifiers", () => {
      const mockConditions = [
        new Condition({
          name: "strengthen",
          style: "buff",
          turns: 2,
          effect: ["strengthen"],
          healthDamage: [0],
          sanityDamage: [0],
          effectStyle: ["multiplier"],
          effectMagnitude: [0.2],
          placedby: "Test",
          placedbyID: "test-id",
          icon: "test-icon",
          aura: "test-aura",
          on: null,
        }),
      ];

      const effects = getConditionEffectsOnAttacks({
        selfConditions: mockConditions,
        enemyConditions: [],
      });

      expect(effects.damageMult).toBe(1.2);
      expect(effects.hitChanceMultiplier).toBe(1);
    });
  });

  describe("getConditionDamageToAttacker", () => {
    it("should calculate thorns damage", () => {
      const mockConditions = [
        new Condition({
          name: "thorns",
          style: "buff",
          turns: 3,
          effect: ["thorns"],
          healthDamage: [10],
          sanityDamage: [0],
          effectStyle: ["flat"],
          effectMagnitude: [10],
          placedby: "Test",
          placedbyID: "test-id",
          icon: "test-icon",
          aura: "test-aura",
          on: null,
        }),
      ];

      const damage = getConditionDamageToAttacker(mockConditions);
      expect(damage.healthDamage).toBe(10);
    });
  });

  describe("getConditionEffectsOnDefenses", () => {
    it("should calculate defense modifiers correctly", () => {
      const mockConditions = [
        new Condition({
          name: "armor boost",
          style: "buff",
          turns: 2,
          effect: ["armor increase"],
          healthDamage: [0],
          sanityDamage: [0],
          effectStyle: ["multiplier"],
          effectMagnitude: [0.5],
          placedby: "Test",
          placedbyID: "test-id",
          icon: "test-icon",
          aura: "test-aura",
          on: null,
        }),
      ];

      const effects = getConditionEffectsOnDefenses(mockConditions);
      expect(effects.armorMult).toBe(1.5);
    });
  });

  describe("getConditionEffectsOnMisc", () => {
    it("should detect stun condition", () => {
      const mockConditions = [
        new Condition({
          name: "stun",
          style: "debuff",
          turns: 1,
          effect: ["stun"],
          healthDamage: [0],
          sanityDamage: [0],
          effectStyle: ["flat"],
          effectMagnitude: [1],
          placedby: "Test",
          placedbyID: "test-id",
          icon: "test-icon",
          aura: "test-aura",
          on: null,
        }),
      ];

      const effects = getConditionEffectsOnMisc(mockConditions);
      expect(effects.isStunned).toBe(true);
    });
  });

  describe("getMagnitude", () => {
    it("should calculate average of valid magnitudes", () => {
      expect(getMagnitude([1, 2, null, 3])).toBe(2);
    });

    it("should return 1 for empty or all null magnitudes", () => {
      expect(getMagnitude([null, null])).toBe(1);
      expect(getMagnitude([])).toBe(1);
    });
  });
});
