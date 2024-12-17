import { Item } from "../item";
import { Investment } from "../investment";
import { RootStore } from "../../stores/RootStore";
import { Character, PlayerCharacter } from "../character";
import { Attribute, Element } from "../../utility/types";
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
      player.bossDefeated();
      expect(player.unAllocatedSkillPoints).toBe(3);

      player.addSkillPoint({ amount: 2, to: Attribute.strength });
      expect(player.allocatedSkillPoints[Attribute.strength]).toBe(2);
      expect(player.unAllocatedSkillPoints).toBe(3);

      player.removeSkillPoint({ amount: 1, from: Attribute.strength });
      expect(player.allocatedSkillPoints[Attribute.strength]).toBe(1);
      expect(player.unAllocatedSkillPoints).toBe(4);
    });
  });

  describe("inventory and equipment", () => {
    it("should add and remove items from inventory", () => {
      const mockItem = new Item({
        name: "Test Item",
      } as any);
      player.addToInventory(mockItem);
      expect(player.baseInventory).toContain(mockItem);

      player.removeFromInventory(mockItem);
      expect(player.baseInventory).not.toContain(mockItem);
    });

    it("should equip and unequip items correctly", () => {
      const mockWeapon = new Item({
        name: "Test Weapon",
        slot: "one-hand",
        itemClass: "melee",
      } as any);

      player.equipItem([mockWeapon], "main-hand");
      expect(player.equipment.mainHand.name).toBe("Test Weapon");

      player.unEquipItem([mockWeapon]);
      expect(player.equipment.mainHand.name).toBe("unarmored");
      expect(player.baseInventory).toContain(mockWeapon);
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
        effect: ["stun"],
      } as any);

      expect(player.isStunned).toBe(false);

      player.addCondition(stunCondition);
      expect(player.isStunned).toBe(true);
    });
  });

  describe("minions and pets", () => {
    beforeEach(() => {
      (global as any).summons = [
        {
          name: "Skeleton",
          health: 50,
          attackPower: 10,
          attackStrings: ["slash"],
          turns: 5,
          beingType: "undead",
        },
        {
          name: "Wolf",
          health: 75,
          attackPower: 15,
          attackStrings: ["bite"],
          turns: 10,
          beingType: "beast",
        },
      ];
    });
    it("should create and manage minions", () => {
      (global as any).summons = [
        {
          name: "Skeleton",
          health: 50,
          attackPower: 10,
          attackStrings: ["slash"],
          turns: 5,
          beingType: "undead",
        },
      ];

      const minionName = player.createMinion("Skeleton");
      expect(minionName).toBe("Skeleton");
      expect(player.minions).toHaveLength(1);

      player.clearMinions();
      expect(player.minions).toHaveLength(0);
    });

    it("should handle ranger pets separately", () => {
      (global as any).summons = [
        {
          name: "Wolf",
          health: 75,
          attackPower: 15,
          attackStrings: ["bite"],
          turns: 10,
          beingType: "beast",
        },
      ];

      const petName = player.summonPet("Wolf");
      expect(petName).toBe("Wolf");
      expect(player.rangerPet).toBeDefined();
      expect(player.minionsAndPets).toHaveLength(1);
    });
  });

  describe("investments", () => {
    it("should purchase and manage investments", () => {
      const mockInvestmentType = {
        name: "Test Investment",
        cost: 1000,
        goldReturnRange: { min: 50, max: 100 },
        turnsPerReturn: 7,
        maxGoldStockPile: 5000,
        requires: { removes: false },
      };

      player.addGold(2000);
      player.purchaseInvestmentBase(mockInvestmentType);

      expect(player.investments).toHaveLength(1);
      expect(player.gold).toBe(1500);

      player.collectFromInvestment("Test Investment");
      expect(Investment.prototype.collectGold).toHaveBeenCalled();
    });
  });

  describe("relationships", () => {
    it("should manage known characters and partners", () => {
      const mockCharacter = new Character({
        firstName: "Jane",
        lastName: "Doe",
        sex: "female",
        personality: "jovial",
        birthdate: { year: 2001, week: 1 },
        root: mockRootStore as unknown as RootStore,
      });

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
