import { Item } from "../item";
import { Investment } from "../investment";
import { RootStore } from "../../stores/RootStore";
import { PlayerCharacter } from "../character";
import { Attribute, Element, ItemClassType, Rarity } from "../../utility/types";
import { Condition } from "../conditions";

// Mock dependencies
jest.mock("../item", () => {
  return {
    Item: jest.fn().mockImplementation((props) => ({
      id: props.id || Math.random().toString(),
      ...props,
      equals: jest.fn((other) => other.id === props.id),
      toJSON: jest.fn(() => ({ ...props })),
    })),
  };
});

jest.mock("../conditions", () => {
  return {
    Condition: jest.fn().mockImplementation((props) => ({
      id: props.id || Math.random().toString(),
      ...props,
    })),
  };
});

jest.mock("../investment", () => ({
  Investment: jest.fn().mockImplementation((props) => ({
    id: props.id || Math.random().toString(),
    ...props,
    collectGold: jest.fn().mockReturnValue(75),
  })),
}));

jest.mock("../creatures", () => ({
  Minion: jest.fn().mockImplementation((props) => ({
    id: props.id || Math.random().toString(),
    ...props,
  })),
}));

(global as any).__DEV__ = true;

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
      parentIds: [],
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
      player.setUnAllocatedSkillPoints(10);

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
    let mockItem: Item;

    beforeEach(() => {
      mockItem = new Item({
        id: "item1",
        name: "Test Item",
        rarity: Rarity.NORMAL,
        prefix: null,
        suffix: null,
        slot: "one-hand",
        baseValue: 10,
        itemClass: ItemClassType.Melee,
<<<<<<< HEAD
        stats: {},
=======
>>>>>>> parent of cb574f9 (dungeon work (specialEncounters))
        root: mockRootStore,
      });
    });

    it("should add and remove items from inventory", () => {
      player.addToInventory(mockItem);
      expect(
        player.baseInventory.find((item) => item.id === mockItem.id),
      ).toBeTruthy();

      player.removeFromInventory(mockItem);
      expect(
        player.baseInventory.find((item) => item.id === mockItem.id),
      ).toBeFalsy();
    });

    it("should equip and unequip items correctly", () => {
      const mockWeapon = new Item({
        id: "weapon1",
        name: "Test Weapon",
        rarity: Rarity.NORMAL,
        prefix: null,
        suffix: null,
        slot: "one-hand",
        stats: {},
        baseValue: 10,
        itemClass: ItemClassType.Melee,
        root: mockRootStore,
      });

      player.equipItem([mockWeapon], "main-hand");
      expect(player.equipment.mainHand?.id).toBe(mockWeapon.id);

      player.unEquipItem([mockWeapon]);
      expect(player.equipment.mainHand?.name).toBe("unarmored");
    });
  });

  describe("gold management", () => {
    it("should add and spend gold correctly", () => {
      player.setGold(0);
      player.addGold(1000);
      expect(player.gold).toBe(1000);

      player.spendGold(500);
      expect(player.gold).toBe(500);

      // Test spending more than available
      player.spendGold(1000);
      expect(player.gold).toBe(0);
    });

    it("should format readable gold correctly", () => {
      player.setGold(1500);
      expect(player.readableGold).toBe("1,500");

      player.setGold(10_010_000);
      expect(player.readableGold).toBe("10.01M");

      player.setGold(1_010_000_000);
      expect(player.readableGold).toBe("1,010M");
    });
  });

  describe("conditions and status effects", () => {
    it("should add and remove conditions", () => {
      const mockCondition = new Condition({ id: "condition1" } as any);
      player.addCondition(mockCondition);

      const addedCondition = player.conditions.find(
        (c) => c.id === mockCondition.id,
      );
      expect(addedCondition).toBeTruthy();

      player.removeCondition(mockCondition);
      const removedCondition = player.conditions.find(
        (c) => c.id === mockCondition.id,
      );
      expect(removedCondition).toBeFalsy();
    });

    it("should correctly identify stunned state", () => {
      const stunCondition = new Condition({
        id: "stun1",
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
      player.setGold(0);
      player.addGold(2000);
      player.purchaseInvestmentBase(mockInvestmentType);

      expect(player.investments).toHaveLength(1);
      expect(player.gold).toBe(1000); // 2000 - 1000 (investment cost)

      player.collectFromInvestment("Test Investment");
      expect(player.gold).toBe(1075); // 1000 + 75 (collected gold)
    });
  });
});
