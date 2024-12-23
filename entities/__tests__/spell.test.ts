import { Spell } from "../spell";
import { PlayerCharacter } from "../character";
import { Enemy, Minion } from "../creatures";
import { Element, ItemClassType, MasteryLevel } from "../../utility/types";

// Mock dependencies
jest.mock("../character");
jest.mock("../creatures");
jest.mock("../../utility/functions/misc", () => ({
  wait: jest.fn(() => Promise.resolve()),
  toTitleCase: jest.fn((str) => str),
  rollD20: jest.fn(() => 10),
}));

jest.mock("../../utility/functions/conditions", () => ({
  createBuff: jest.fn().mockReturnValue({ name: "strength buff" }),
  createDebuff: jest.fn().mockReturnValue({ name: "weakness debuff" }),
}));

// Mock RootStore instead of importing it
const mockRootStore = {
  playerState: null,
  enemyStore: {},
  dungeonStore: {
    inCombat: true,
  },
};

describe("Spell", () => {
  let mockPlayer: jest.Mocked<PlayerCharacter>;
  let mockEnemy: jest.Mocked<Enemy>;
  let mockMinion: jest.Mocked<Minion>;

  beforeEach(() => {
    mockPlayer = new PlayerCharacter({
      root: mockRootStore,
    }) as jest.Mocked<PlayerCharacter>;
    mockEnemy = new Enemy({}) as jest.Mocked<Enemy>;
    mockMinion = new Minion({}) as jest.Mocked<Minion>;

    // Setup default mock values
    Object.assign(mockPlayer, {
      id: "player1",
      fullName: "Test Player",
      currentMana: 100,
      magicPower: 10,
      equipmentStats: { damage: 5 },
      attackPower: 15,
      equipment: {
        mainHand: { itemClass: ItemClassType.Staff },
      },
      currentMasteryLevel: jest.fn().mockReturnValue(MasteryLevel.Expert),
      hasEnoughBloodOrbs: jest.fn().mockReturnValue(true),
      useMana: jest.fn(),
      restoreHealth: jest.fn(),
      damageHealth: jest.fn(),
      damageSanity: jest.fn(),
      addCondition: jest.fn(),
      removeBloodOrbs: jest.fn(),
      createMinion: jest.fn(),
      summonPet: jest.fn(),
      gainProficiency: jest.fn(),
    });

    Object.assign(mockEnemy, {
      id: "enemy1",
      maxHealth: 100,
      maxSanity: 50,
      damageHealth: jest.fn(),
      damageSanity: jest.fn(),
      addCondition: jest.fn(),
    });

    // Reset all mocks between tests
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create a spell with minimal properties", () => {
      const spell = new Spell({
        name: "Test Spell",
        element: "fire",
        manaCost: 10,
        proficiencyNeeded: null,
        effects: { damage: null, buffs: null, debuffs: null },
      });

      expect(spell.name).toBe("Test Spell");
      expect(spell.element).toBe(Element.fire);
      expect(spell.manaCost).toBe(10);
      expect(spell.proficiencyNeeded).toBeNull();
    });

    it("should create a spell with all properties", () => {
      const spell = new Spell({
        name: "Complex Spell",
        attackStyle: "single",
        element: "water",
        proficiencyNeeded: "expert",
        manaCost: 20,
        duration: 3,
        usesWeapon: "Staff",
        effects: {
          damage: 30,
          buffs: ["strength"],
          debuffs: [{ name: "weakness", chance: 0.5 }],
          summon: ["skeleton"],
          pet: "wolf",
          selfDamage: 5,
          sanityDamage: 10,
        },
      });

      expect(spell.name).toBe("Complex Spell");
      expect(spell.attackStyle).toBe("single");
      expect(spell.element).toBe(Element.water);
      expect(spell.proficiencyNeeded).toBe(MasteryLevel.Expert);
      expect(spell.usesWeapon).toBe("Staff");
      expect(spell.duration).toBe(3);
      expect(spell.selfDamage).toBe(5);
      expect(spell.flatSanityDamage).toBe(10);
      expect(spell.buffs).toEqual(["strength"]);
      expect(spell.debuffs).toEqual([{ name: "weakness", chance: 0.5 }]);
      expect(spell.summons).toEqual(["skeleton"]);
      expect(spell.rangerPet).toBe("wolf");
    });
  });

  describe("baseDamage", () => {
    it("should calculate damage with weapon correctly", () => {
      const spell = new Spell({
        name: "Weapon Spell",
        element: "fire",
        manaCost: 10,
        usesWeapon: ItemClassType.Staff, // Use the enum value instead of string
        effects: { damage: 20, buffs: null, debuffs: null },
      });

      const damage = spell.baseDamage(mockPlayer);
      expect(damage).toBe(45);
    });

    it("should return 0 if weapon doesn't match", () => {
      mockPlayer.equipment.mainHand.itemClass = ItemClassType.Melee;

      const spell = new Spell({
        name: "Staff Spell",
        element: "fire",
        manaCost: 10,
        usesWeapon: "Staff",
        effects: { damage: 20, buffs: null, debuffs: null },
      });

      const damage = spell.baseDamage(mockPlayer);
      expect(damage).toBe(0);
    });

    it("should calculate damage without weapon", () => {
      const spell = new Spell({
        name: "Magic Spell",
        element: "fire",
        manaCost: 10,
        effects: { damage: 20, buffs: null, debuffs: null },
      });

      const damage = spell.baseDamage(mockPlayer);
      expect(damage).toBe(30); // 20 + 10 (magicPower)
    });
  });

  describe("canBeUsed", () => {
    it("should return false if player is stunned", () => {
      mockPlayer.isStunned = true;

      const spell = new Spell({
        name: "Test Spell",
        element: "fire",
        manaCost: 10,
        effects: { damage: null, buffs: null, debuffs: null },
      });

      expect(spell.canBeUsed(mockPlayer)).toBeFalsy();
    });

    it("should return false if player doesn't have required weapon", () => {
      mockPlayer.equipment.mainHand.itemClass = ItemClassType.Bow; // Use a different enum value

      const spell = new Spell({
        name: "Staff Spell",
        element: "fire",
        manaCost: 10,
        usesWeapon: ItemClassType.Staff, // Use the enum value
        effects: { damage: null, buffs: null, debuffs: null },
      });

      expect(spell.canBeUsed(mockPlayer)).toBeFalsy();
    });

    it("should return false if player doesn't have enough mana", () => {
      mockPlayer.currentMana = 5;

      const spell = new Spell({
        name: "Test Spell",
        element: "fire",
        manaCost: 10,
        effects: { damage: null, buffs: null, debuffs: null },
      });

      expect(spell.canBeUsed(mockPlayer)).toBeFalsy();
    });

    it("should return false if player doesn't meet proficiency requirement", () => {
      mockPlayer.currentMasteryLevel.mockReturnValue(MasteryLevel.Novice);

      const spell = new Spell({
        name: "Expert Spell",
        element: "fire",
        manaCost: 10,
        proficiencyNeeded: "expert",
        effects: { damage: null, buffs: null, debuffs: null },
      });

      expect(spell.canBeUsed(mockPlayer)).toBeFalsy();
    });

    it("should return false if player doesn't have enough blood orbs", () => {
      mockPlayer.hasEnoughBloodOrbs.mockReturnValue(false);

      const spell = new Spell({
        name: "Blood Spell",
        element: "blood",
        manaCost: 10,
        effects: { damage: null, buffs: null, debuffs: null },
      });

      expect(spell.canBeUsed(mockPlayer)).toBeFalsy();
    });
  });

  describe("use", () => {
    let testSpell: Spell;

    beforeEach(() => {
      testSpell = new Spell({
        name: "Test Spell",
        element: "fire",
        manaCost: 10,
        effects: {
          damage: 20,
          buffs: ["strength"],
          debuffs: [{ name: "weakness", chance: 0.5 }],
          summon: ["skeleton"],
          pet: "wolf",
          selfDamage: 5,
          sanityDamage: 10,
        },
      });
    });

    it("should return failure if spell cannot be used", () => {
      mockPlayer.currentMana = 5;

      const result = testSpell.use({
        targets: [mockEnemy],
        user: mockPlayer,
      });

      expect(result.logString).toBe("failure");
    });

    it("should apply damage and effects correctly", () => {
      const testSpell = new Spell({
        name: "Test Spell",
        element: "fire",
        manaCost: 10,
        effects: {
          damage: 20,
          buffs: ["strength"],
          debuffs: [{ name: "weakness", chance: 1 }],
          summon: ["skeleton"],
          pet: "wolf",
          selfDamage: 5,
          sanityDamage: 10,
        },
      });

      const result = testSpell.use({
        targets: [mockEnemy],
        user: mockPlayer,
      });

      expect(mockPlayer.useMana).toHaveBeenCalledWith(10);
      expect(mockEnemy.damageHealth).toHaveBeenCalled();
      expect(mockEnemy.damageSanity).toHaveBeenCalledWith(10);
      expect(mockEnemy.addCondition).toHaveBeenCalled();
      expect(mockPlayer.addCondition).toHaveBeenCalled();
      expect(mockPlayer.createMinion).toHaveBeenCalledWith("skeleton");
      expect(mockPlayer.summonPet).toHaveBeenCalledWith("wolf");
      expect(mockPlayer.damageHealth).toHaveBeenCalledWith({
        damage: 5,
        attackerId: mockPlayer.id,
      });
      expect(mockPlayer.gainProficiency).toHaveBeenCalledWith(testSpell);
      expect(result.logString).toContain("You used Test Spell.");
    });

    it("should handle lifesteal correctly", () => {
      const lifestealSpell = new Spell({
        name: "Lifesteal",
        element: "blood",
        manaCost: 10,
        effects: {
          damage: 20,
          buffs: null,
          debuffs: [{ name: "lifesteal", chance: 1 }],
        },
      });

      lifestealSpell.use({
        targets: [mockEnemy],
        user: mockPlayer,
      });

      expect(mockPlayer.restoreHealth).toHaveBeenCalled();
    });
  });
});
