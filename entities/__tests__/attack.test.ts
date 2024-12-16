import { AttackUse, ItemClassType } from "../../utility/types";
import { Attack } from "../attack";
import { PlayerCharacter } from "../character";
import { Enemy } from "../creatures";

jest.mock("../conditions", () => ({
  createBuff: jest.fn(),
  createDebuff: jest.fn(),
  getConditionEffectsOnAttacks: jest.fn(),
  getConditionDamageToAttacker: jest.fn(),
}));

describe("Attack", () => {
  let mockUser: PlayerCharacter;
  let mockEnemy: Enemy;

  beforeEach(() => {
    mockUser = {
      id: "player1",
      fullName: "Test Player",
      attackPower: 10,
      conditions: [],
      isStunned: false,
      baseEnergy: 100,
      expendEnergy: jest.fn(),
      addCondition: jest.fn(),
      damageHealth: jest.fn(),
      damageSanity: jest.fn(),
      equipment: {
        mainHand: {
          itemClass: ItemClassType.Melee,
          activePoison: null,
          stats: new Map(),
          playerHasRequirements: true,
        },
      },
      totalStrength: 15,
      endTurn: jest.fn(),
      totalPhysicalDamage: 10,
      totalFireDamage: 5,
      totalColdDamage: 3,
      totalLightningDamage: 4,
      totalPoisonDamage: 2,
      equipmentStats: new Map(),
    } as unknown as PlayerCharacter;

    mockEnemy = {
      id: "enemy1",
      creatureSpecies: "Test Enemy",
      conditions: [],
      attackPower: 8,
      isStunned: false,
      addCondition: jest.fn(),
      damageHealth: jest.fn(),
      damageSanity: jest.fn(),
      getPhysicalDamageReduction: jest.fn().mockReturnValue(0),
      fireResistance: 0,
      coldResistance: 0,
      lightningResistance: 0,
      poisonResistance: 0,
    } as unknown as Enemy;
  });

  describe("constructor", () => {
    it("should create an Attack instance with default values", () => {
      const attack = new Attack({
        name: "Test Attack",
        user: mockUser,
      });

      expect(attack.name).toBe("Test Attack");
      expect(attack.energyCost).toBe(0);
      expect(attack.baseHitChance).toBe(1.0);
      expect(attack.attackStyle).toBe("single");
      expect(attack.damageMult).toBe(0);
    });

    it("should create an Attack instance with custom values", () => {
      const attack = new Attack({
        name: "Power Strike",
        energyCost: 20,
        hitChance: 0.8,
        targets: "aoe",
        damageMult: 1.5,
        user: mockUser,
      });

      expect(attack.name).toBe("Power Strike");
      expect(attack.energyCost).toBe(20);
      expect(attack.baseHitChance).toBe(0.8);
      expect(attack.attackStyle).toBe("aoe");
      expect(attack.damageMult).toBe(1.5);
    });
  });

  describe("canBeUsed", () => {
    it("should return false when user is stunned", () => {
      const attack = new Attack({ name: "Test Attack", user: mockUser });
      mockUser.isStunned = true;
      expect(attack.canBeUsed).toBe(false);
    });

    it("should return false when user has insufficient energy", () => {
      const attack = new Attack({
        name: "Test Attack",
        energyCost: 150,
        user: mockUser,
      });
      expect(attack.canBeUsed).toBe(false);
    });

    it("should return true when conditions are met", () => {
      const attack = new Attack({
        name: "Test Attack",
        energyCost: 50,
        user: mockUser,
      });
      expect(attack.canBeUsed).toBe(true);
    });
  });

  describe("use", () => {
    it("should handle stunned state", () => {
      mockUser.isStunned = true;
      const attack = new Attack({ name: "Test Attack", user: mockUser });

      const result = attack.use({ targets: [mockEnemy] });

      expect(result.result[0].result).toBe(AttackUse.stunned);
    });

    it("should handle successful hit", () => {
      const attack = new Attack({
        name: "Test Attack",
        damageMult: 1.5,
        user: mockUser,
        hitChance: 1.0,
      });

      jest
        .requireMock("../conditions")
        .getConditionEffectsOnAttacks.mockReturnValue({
          hitChanceMultiplier: 1,
          damageFlat: 0,
          damageMult: 1,
        });

      const result = attack.use({ targets: [mockEnemy] });

      expect(result.result[0].result).toBe(AttackUse.success);
      expect(mockEnemy.damageHealth).toHaveBeenCalled();
    });

    it("should handle miss", () => {
      const attack = new Attack({
        name: "Test Attack",
        hitChance: 0,
        user: mockUser,
      });

      const result = attack.use({ targets: [mockEnemy] });

      expect(result.result[0].result).toBe(AttackUse.miss);
    });
  });

  describe("damageBasedOnWeapon", () => {
    it("should calculate weapon-based damage correctly", () => {
      const attack = new Attack({
        name: "Test Attack",
        damageMult: 1.5,
        flatHealthDamage: 5,
        user: mockUser,
      });

      const damage = attack.damageBasedOnWeapon(mockUser, 20);
      expect(damage).toBe(42.5);
    });
  });

  describe("fromJSON", () => {
    it("should create Attack instance from JSON", () => {
      const json = {
        name: "Test Attack",
        energyCost: 10,
        hitChance: 0.8,
        targets: "single",
        damageMult: 1.2,
        user: mockUser,
      };

      const attack = Attack.fromJSON(json);

      expect(attack).toBeInstanceOf(Attack);
      expect(attack.name).toBe("Test Attack");
      expect(attack.energyCost).toBe(10);
    });

    it("should throw error if name is missing", () => {
      const json = {
        energyCost: 10,
        user: mockUser,
      };

      expect(() => Attack.fromJSON(json)).toThrow("Attack name is required");
    });
  });

  describe("damage calculations", () => {
    it("should calculate damage for all damage types", () => {
      const attack = new Attack({
        name: "Test Attack",
        damageMult: 1.5,
        flatHealthDamage: 5,
        user: mockUser,
        hitChance: 1.0,
      });

      const result = attack.use({ targets: [mockEnemy] });
      const damages = result.result[0].damages!;

      expect(damages.physical).toBe(20); // (10 * 1.5 + 5) * 1
      expect(damages.fire).toBe(12.5); // (5 * 1.5 + 5) * 1
      expect(damages.cold).toBe(9.5); // (3 * 1.5 + 5) * 1
      expect(damages.lightning).toBe(11); // (4 * 1.5 + 5) * 1
      expect(damages.poison).toBe(8); // (2 * 1.5 + 5) * 1
      expect(damages.total).toBe(61); // sum of all damages
    });

    it("should apply resistances correctly", () => {
      const attack = new Attack({
        name: "Test Attack",
        damageMult: 1.0,
        flatHealthDamage: 0,
        user: mockUser,
        hitChance: 1.0,
      });

      mockEnemy.fireResistance = 75; // 75% fire resistance
      mockEnemy.coldResistance = 25; // 25% cold resistance
      mockEnemy.lightningResistance = 0; // 0% lightning resistance
      mockEnemy.poisonResistance = 100; // 100% poison resistance

      const result = attack.use({ targets: [mockEnemy] });
      const damages = result.result[0].damages!;

      expect(damages.physical).toBe(10);
      expect(damages.fire).toBe(1.25); // 5 * 0.25 (75% reduction)
      expect(damages.cold).toBe(2.25); // 3 * 0.75 (25% reduction)
      expect(damages.lightning).toBe(4); // 4 * 1.0 (0% reduction)
      expect(damages.poison).toBe(0); // 2 * 0 (100% reduction)
      expect(damages.total).toBe(17.5); // sum of all reduced damages
    });

    it("should handle multiple hits correctly", () => {
      const attack = new Attack({
        name: "Test Attack",
        damageMult: 1.0,
        flatHealthDamage: 0,
        hits: 2,
        user: mockUser,
      });

      const result = attack.use({ targets: [mockEnemy] });
      const damages = result.result[0].damages!;

      expect(damages.total).toBe(48); // (10 + 5 + 3 + 4 + 2) * 2 hits
    });
  });
});
