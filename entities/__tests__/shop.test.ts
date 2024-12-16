import { Shop } from "../shop";
import { Character } from "../character";
import { Item } from "../item";
import { Personality } from "../../utility/types";

// Mock dependencies
jest.mock("../character");
jest.mock("../item");
jest.mock("../../assets/json/shopLines.json", () => ({
  cheerful: {
    "very warm": ["Very warm greeting %p"],
    warm: ["Warm greeting %p"],
    positive: ["Positive greeting %p"],
    "slightly positive": ["Slightly positive greeting %p"],
    neutral: ["Neutral greeting %p"],
  },
}));

const mockRootStore = {
  time: {
    currentDate: { year: 2023, week: 1 },
    generateBirthDateInRange: jest
      .fn()
      .mockReturnValue({ year: 1990, week: 1 }),
  },
  playerState: {
    fullName: "Test Player",
    playerClass: "mage",
    gold: 1000,
    baseInventory: [],
  },
};

describe("Shop", () => {
  let shop: Shop;
  let mockShopKeeper: jest.Mocked<Character>;

  beforeEach(() => {
    mockShopKeeper = new Character({
      sex: "male",
      firstName: "John",
      lastName: "Doe",
      birthdate: { year: 1990, week: 1 },
      personality: Personality.JOVIAL,
      job: "Merchant",
      root: mockRootStore,
    }) as jest.Mocked<Character>;

    shop = new Shop({
      baseGold: 1000,
      shopKeeper: mockShopKeeper,
      archetype: "armorer",
      root: mockRootStore,
    });
    jest.spyOn(shop, "addGold");
  });

  describe("constructor", () => {
    it("should create a shop with default values", () => {
      expect(shop.baseGold).toBe(1000);
      expect(shop.currentGold).toBe(1000);
      expect(shop.archetype).toBe("armorer");
      expect(shop.baseInventory).toEqual([]);
      expect(shop.lastStockRefresh).toEqual(mockRootStore.time.currentDate);
    });

    it("should create a shop with provided values", () => {
      const customShop = new Shop({
        baseGold: 2000,
        currentGold: 1500,
        lastStockRefresh: { year: 2022, week: 52 },
        baseInventory: [new Item({} as any)],
        shopKeeper: mockShopKeeper,
        archetype: "weaponsmith",
        root: mockRootStore,
      });

      expect(customShop.baseGold).toBe(2000);
      expect(customShop.currentGold).toBe(1500);
      expect(customShop.archetype).toBe("weaponsmith");
      expect(customShop.baseInventory).toHaveLength(1);
      expect(customShop.lastStockRefresh).toEqual({ year: 2022, week: 52 });
    });
  });

  describe("addGold", () => {
    it("should add gold to the shop", () => {
      shop.addGold(500);
      expect(shop.currentGold).toBe(1500);
    });
  });

  describe("deathCheck", () => {
    it("should replace shopkeeper if dead", () => {
      mockShopKeeper.deathdate = { year: 2023, week: 1 };
      const originalShopKeeper = shop.shopKeeper;

      shop.deathCheck();

      expect(shop.shopKeeper).not.toBe(originalShopKeeper);
      expect(shop.shopKeeper.deathdate).toBeUndefined();
    });

    it("should not replace shopkeeper if alive", () => {
      const originalShopKeeper = shop.shopKeeper;

      shop.deathCheck();

      expect(shop.shopKeeper).toBe(originalShopKeeper);
    });
  });

  describe("refreshInventory", () => {
    it("should refresh inventory and reset gold", () => {
      shop.addGold(-500); // Use action instead of direct assignment
      const mockItem = new Item({} as any);
      shop.baseInventory.push(mockItem); // Use push instead of reassignment

      shop.refreshInventory();

      expect(shop.currentGold).toBe(shop.baseGold);
      expect(shop.lastStockRefresh).toEqual(mockRootStore.time.currentDate);
      expect(shop.baseInventory.length).toBeGreaterThan(0);
    });
  });

  describe("changeAffection", () => {
    it("should not change affection above max", () => {
      mockShopKeeper.affection = 100;
      shop.changeAffection(10);
      expect(mockShopKeeper.affection).toBe(100);
    });

    it("should change affection with diminishing returns", () => {
      mockShopKeeper.affection = 50;
      shop.changeAffection(10);
      expect(mockShopKeeper.updateAffection).toHaveBeenCalled();
    });
  });

  describe("buyItem", () => {
    it("should buy a single item if shop has enough gold", () => {
      const mockItem = new Item({} as any);
      shop.buyItem(mockItem, 100);

      expect(shop.currentGold).toBe(900);
      expect(shop.baseInventory).toContain(mockItem);
    });

    it("should buy multiple items if shop has enough gold", () => {
      const mockItems = [new Item({} as any), new Item({} as any)];
      shop.buyItem(mockItems, 100);

      expect(shop.currentGold).toBe(800);
      expect(shop.baseInventory).toHaveLength(2);
    });

    it("should throw error if shop doesn't have enough gold", () => {
      const mockItem = new Item({} as any);
      expect(() => shop.buyItem(mockItem, 2000)).toThrow("Not enough gold");
    });
  });

  describe("sellItem", () => {
    it("should sell a single item", () => {
      const mockItem = new Item({} as any);
      shop.baseInventory = [mockItem];

      shop.sellItem(mockItem, 100);

      expect(shop.currentGold).toBe(1100);
      expect(shop.baseInventory).not.toContain(mockItem);
    });

    it("should sell multiple items", () => {
      const mockItems = [new Item({} as any), new Item({} as any)];
      shop.baseInventory = [...mockItems];

      shop.sellItem(mockItems, 100);

      expect(shop.currentGold).toBe(1200);
      expect(shop.baseInventory).toHaveLength(0);
    });
  });

  describe("purchaseStack", () => {
    it("should purchase as many items as shop can afford", () => {
      const mockItems = Array(20).fill(new Item({} as any));
      shop.addGold(1000);

      const purchasedCount = shop.purchaseStack(mockItems);

      expect(purchasedCount).toBeLessThan(20);
      expect(shop.currentGold).toBeLessThan(500);
    });

    it("should update player inventory and gold", () => {
      const mockItems = [new Item({} as any)];
      const initialPlayerGold = mockRootStore.playerState.gold;

      shop.purchaseStack(mockItems);

      expect(mockRootStore.playerState.gold).toBeGreaterThan(initialPlayerGold);
      expect(mockRootStore.playerState.baseInventory).not.toContain(
        mockItems[0],
      );
    });
  });
});
