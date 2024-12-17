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
      getPhysicalDamageReduction: jest.fn().mockReturnValue(0), // Add this
      fireResistance: 0,
      coldResistance: 0,
      lightningResistance: 0,
      poisonResistance: 0,
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
      totalPhysicalDamage: 8,
      totalFireDamage: 4,
      totalColdDamage: 3,
      totalLightningDamage: 2,
      totalPoisonDamage: 1,
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

  describe("player damage calculations", () => {
    it("should calculate player damage for all damage types", () => {
      const attack = new Attack({
        name: "Test Attack",
        damageMult: 1.5,
        flatHealthDamage: 5,
        user: mockUser,
        hitChance: 1.0,
      });

      const result = attack.use({ targets: [mockEnemy] });
      const damages = result.result[0].damages!;

      expect(damages.physical).toBe(20);
      expect(damages.fire).toBe(12.5);
      expect(damages.cold).toBe(9.5);
      expect(damages.lightning).toBe(11);
      expect(damages.poison).toBe(8);
      expect(damages.total).toBe(61);
    });

    it("should apply enemy resistances correctly", () => {
      const attack = new Attack({
        name: "Test Attack",
        damageMult: 1.0,
        flatHealthDamage: 0,
        user: mockUser,
        hitChance: 1.0,
      });

      mockEnemy.fireResistance = 75;
      mockEnemy.coldResistance = 25;
      mockEnemy.lightningResistance = 0;
      mockEnemy.poisonResistance = 100;

      const result = attack.use({ targets: [mockEnemy] });
      const damages = result.result[0].damages!;

      expect(damages.physical).toBe(10);
      expect(damages.fire).toBe(1.25);
      expect(damages.cold).toBe(2.25);
      expect(damages.lightning).toBe(4);
      expect(damages.poison).toBe(0);
      expect(damages.total).toBe(17.5);
    });

    it("should handle multiple player hits correctly", () => {
      const attack = new Attack({
        name: "Test Attack",
        damageMult: 1.0,
        flatHealthDamage: 0,
        hits: 2,
        user: mockUser,
      });

      const result = attack.use({ targets: [mockEnemy] });
      const damages = result.result[0].damages!;

      expect(damages.total).toBe(48);
    });
  });

  describe("enemy damage calculations", () => {
    it("should calculate enemy damage for all damage types", () => {
      const attack = new Attack({
        name: "Enemy Attack",
        damageMult: 1.5,
        flatHealthDamage: 5,
        user: mockEnemy,
        hitChance: 1.0,
      });

      mockEnemy.totalPhysicalDamage = 8;
      mockEnemy.totalFireDamage = 4;
      mockEnemy.totalColdDamage = 3;
      mockEnemy.totalLightningDamage = 2;
      mockEnemy.totalPoisonDamage = 1;

      const result = attack.use({ targets: [mockUser] });
      const damages = result.result[0].damages!;

      expect(damages.physical).toBe(17); // (8 * 1.5 + 5) * 1
      expect(damages.fire).toBe(11); // (4 * 1.5 + 5) * 1
      expect(damages.cold).toBe(9.5); // (3 * 1.5 + 5) * 1
      expect(damages.lightning).toBe(8); // (2 * 1.5 + 5) * 1
      expect(damages.poison).toBe(6.5); // (1 * 1.5 + 5) * 1
      expect(damages.total).toBe(52);
    });

    it("should apply player resistances correctly", () => {
      const attack = new Attack({
        name: "Enemy Attack",
        damageMult: 1.0,
        flatHealthDamage: 0,
        user: mockEnemy,
        hitChance: 1.0,
      });

      mockUser.fireResistance = 75;
      mockUser.coldResistance = 25;
      mockUser.lightningResistance = 0;
      mockUser.poisonResistance = 100;
      mockUser.getPhysicalDamageReduction = jest.fn().mockReturnValue(50);

      mockEnemy.totalPhysicalDamage = 8;
      mockEnemy.totalFireDamage = 4;
      mockEnemy.totalColdDamage = 3;
      mockEnemy.totalLightningDamage = 2;
      mockEnemy.totalPoisonDamage = 1;

      const result = attack.use({ targets: [mockUser] });
      const damages = result.result[0].damages!;

      expect(damages.physical).toBe(4); // 8 * (1 - 50/100)
      expect(damages.fire).toBe(1); // 4 * (1 - 75/100)
      expect(damages.cold).toBe(2.25); // 3 * (1 - 25/100)
      expect(damages.lightning).toBe(2); // 2 * (1 - 0/100)
      expect(damages.poison).toBe(0); // 1 * (1 - 100/100)
      expect(damages.total).toBe(9.25);
    });

    it("should handle multiple enemy hits correctly", () => {
      const attack = new Attack({
        name: "Enemy Attack",
        damageMult: 1.0,
        flatHealthDamage: 0,
        hits: 2,
        user: mockEnemy,
      });

      mockEnemy.totalPhysicalDamage = 8;
      mockEnemy.totalFireDamage = 4;
      mockEnemy.totalColdDamage = 3;
      mockEnemy.totalLightningDamage = 2;
      mockEnemy.totalPoisonDamage = 1;

      const result = attack.use({ targets: [mockUser] });
      const damages = result.result[0].damages!;

      expect(damages.total).toBe(36); // (8 + 4 + 3 + 2 + 1) * 2 hits
    });
  });
});
