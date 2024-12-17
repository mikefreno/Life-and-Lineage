import { Item } from "../item";
import { Investment } from "../investment";
import { RootStore } from "../../stores/RootStore";
import { Character, PlayerCharacter } from "../character";
import { Attribute, Element, ItemClassType, Rarity } from "../../utility/types";
import { Condition } from "../conditions";

// Mock dependencies
jest.mock("../item");
jest.mock("../conditions");
jest.mock("../investment");
jest.mock("../creatures");
jest.mock("../../stores/RootStore");
(global as any).__DEV__ = false;

const mockRootStore = {
  time: {
    currentDate: { year: 2023, week: 1 },
    year: 2023,
    week: 1,
  },
  characterStore: {
    saveCharacter: jest.fn(),
  },
};

describe("PlayerCharacter", () => {
  let player: PlayerCharacter;

  beforeEach(() => {
    player = new PlayerCharacter({
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
      root: mockRootStore as unknown as RootStore,
    });
  });

  describe("stats and attributes", () => {
    it("should calculate max health correctly", () => {
      player.allocatedSkillPoints[Attribute.health] = 5;
      expect(player.maxHealth).toBe(150); // 100 base + (5 * 10) from skill points
    });

    it("should calculate max mana correctly", () => {
      player.allocatedSkillPoints[Attribute.mana] = 3;
      expect(player.maxMana).toBe(130); // 100 base + (3 * 10) from skill points
    });

    it("should calculate total strength correctly", () => {
      player.allocatedSkillPoints[Attribute.strength] = 2;
      expect(player.totalStrength).toBe(12); // 10 base + 2 from skill points
    });

    it("should add and remove skill points correctly", () => {
      player.unAllocatedSkillPoints = 10;

      player.addSkillPoint({ amount: 3, to: "unallocated" });
      expect(player.unAllocatedSkillPoints).toBe(13);

      player.addSkillPoint({ amount: 2, to: Attribute.strength });
      expect(player.allocatedSkillPoints[Attribute.strength]).toBe(2);
      expect(player.unAllocatedSkillPoints).toBe(11);

      player.removeSkillPoint({ amount: 1, from: Attribute.strength });
      expect(player.allocatedSkillPoints[Attribute.strength]).toBe(1);
      expect(player.unAllocatedSkillPoints).toBe(12);
    });
  });

  describe("inventory and equipment", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should add and remove items from inventory", () => {
      const mockItem = new Item({
        name: "Test Item",
        rarity: Rarity.NORMAL,
        prefix: null,
        suffix: null,
        slot: "one-hand",
        baseValue: 10,
        itemClass: ItemClassType.Melee,
        root: mockRootStore,
      });

      player.addToInventory(mockItem);
      expect(player.baseInventory).toContain(mockItem);

      player.removeFromInventory(mockItem);
      expect(player.baseInventory).not.toContain(mockItem);
    });

    it("should equip and unequip items correctly", () => {
      const mockWeapon = new Item({
        name: "Test Weapon",
        rarity: Rarity.NORMAL,
        prefix: null,
        suffix: null,
        slot: "one-hand",
        stats: new Map(),
        baseValue: 10,
        itemClass: ItemClassType.Melee,
        root: mockRootStore,
      });

      player.equipItem([mockWeapon], "main-hand");
      expect(player.equipment.mainHand?.name).toBe("Test Weapon");

      player.unEquipItem([mockWeapon]);
      expect(player.equipment.mainHand.name).toBe("unarmored");
    });
  });

  describe("gold management", () => {
    it("should add and spend gold correctly", () => {
      player.gold = 0; // Reset gold
      player.addGold(1000);
      expect(player.gold).toBe(1000);

      player.spendGold(500);
      expect(player.gold).toBe(500);

      // Test spending more than available
      player.spendGold(1000);
      expect(player.gold).toBe(0);
    });

    it("should format readable gold correctly", () => {
      player.gold = 1500;
      expect(player.readableGold).toBe("1,500");

      player.gold = 10_010_000;
      expect(player.readableGold).toBe("10.01M");

      player.gold = 1_010_000_000;
      expect(player.readableGold).toBe("1,010M");
    });
  });

  describe("conditions and status effects", () => {
    it("should add and remove conditions", () => {
      const mockCondition = new Condition({} as any);
      player.addCondition(mockCondition);
      expect(player.conditions).toContain(mockCondition);

      player.removeCondition(mockCondition);
      expect(player.conditions).not.toContain(mockCondition);
    });

    it("should correctly identify stunned state", () => {
      const stunCondition = new Condition({
        name: "Stunned",
        effect: ["stun"],
        turns: 3,
        style: "debuff",
        placedby: "test",
        placedbyID: "test",
      });

      expect(player.isStunned).toBe(false);
      player.addCondition(stunCondition);
      expect(player.isStunned).toBe(true);
    });
  });

  describe("minions and pets", () => {
    beforeEach(() => {
      (global as any).summons = [
        {
          name: "skeleton",
          beingType: "undead",
          health: 40,
          attackPower: 5,
          energy: { maximum: 50, regen: 5 },
          attackStrings: ["stab", "cleave"],
          turns: 5,
        },
        {
          name: "raven",
          beingType: "beast",
          health: 50,
          attackPower: 2,
          energy: { maximum: 50, regen: 5 },
          attackStrings: ["pluck eye", "scratch"],
          turns: 1000,
        },
      ];
    });

    it("should create and manage minions", () => {
      const minionName = player.createMinion("skeleton");
      expect(player.minions[0].creatureSpecies).toBe("skeleton");
      expect(player.minions).toHaveLength(1);

      player.clearMinions();
      expect(player.minions).toHaveLength(0);
    });

    it("should handle ranger pets separately", () => {
      const petName = player.summonPet("raven");
      expect(player.rangerPet?.creatureSpecies).toBe("raven");
      expect(player.minionsAndPets).toHaveLength(1);
    });
  });

  describe("investments", () => {
    let mockInvestmentType: any;

    beforeEach(() => {
      mockInvestmentType = {
        name: "Test Investment",
        cost: 1000,
        goldReturnRange: { min: 50, max: 100 },
        turnsPerReturn: 7,
        maxGoldStockPile: 5000,
        requires: { removes: false },
      };

      // Mock the Investment prototype method
      Investment.prototype.collectGold = jest.fn().mockReturnValue(75);
    });

    it("should purchase and manage investments", () => {
      player.gold = 0;
      player.addGold(2000);
      player.purchaseInvestmentBase(mockInvestmentType);

      expect(player.investments).toHaveLength(1);
      expect(player.gold).toBe(1000); // 2000 - 1000 (investment cost)

      player.collectFromInvestment("Test Investment");
      expect(Investment.prototype.collectGold).toHaveBeenCalled();
      expect(player.gold).toBe(1075); // 1000 + 75 (collected gold)
    });
  });

  describe("relationships", () => {
    let mockCharacter: Character;

    beforeEach(() => {
      mockCharacter = new Character({
        firstName: "Jane",
        lastName: "Doe",
        sex: "female",
        personality: "jovial",
        birthdate: { year: 2001, week: 1 },
        root: mockRootStore as unknown as RootStore,
      });

      // Mock rollD20 to always return a high value
      (global as any).rollD20 = jest.fn().mockReturnValue(20);
    });

    it("should manage known characters and partners", () => {
      player.addNewKnownCharacter(mockCharacter);
      expect(player.knownCharacters).toContain(mockCharacter);

      mockCharacter.affection = 80;
      const partnershipAccepted = player.askForPartner(mockCharacter);
      expect(partnershipAccepted).toBe(true);
      expect(player.partners).toContain(mockCharacter);
      expect(player.knownCharacters).not.toContain(mockCharacter);
    });
  });

  describe("fromJSON", () => {
    it("should create a PlayerCharacter instance from JSON", () => {
      const json = {
        id: "test-id",
        firstName: "Test",
        lastName: "Player",
        sex: "male",
        playerClass: "mage",
        blessing: "fire",
        baseHealth: 100,
        baseMana: 100,
        baseSanity: 100,
        baseStrength: 10,
        baseIntelligence: 10,
        baseDexterity: 10,
        baseManaRegen: 5,
        parents: [],
        birthdate: { year: 2000, week: 1 },
        gold: 1000,
        equipment: {
          mainHand: {},
          offHand: null,
          body: null,
          head: null,
          quiver: null,
        },
        root: mockRootStore,
      };

      const newPlayer = PlayerCharacter.fromJSON(json);

      expect(newPlayer.id).toBe("test-id");
      expect(newPlayer.firstName).toBe("Test");
      expect(newPlayer.playerClass).toBe("mage");
      expect(newPlayer.blessing).toBe("fire");
      expect(newPlayer.gold).toBe(1000);
    });
  });
});
