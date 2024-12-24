import { Shop } from "../shop";
import { Character } from "../character";
import { Item } from "../item";
import { Personality } from "../../utility/types";

// Mock dependencies
jest.mock("../character");
jest.mock("../item", () => {
  const mockIsStackable = jest.fn((type) => {
    const stackableTypes = ["consumable", "ingredient", "scroll", "ammunition"];
    return stackableTypes.includes(type.toLowerCase());
  });

  const MockItem = jest.fn().mockImplementation((props) => ({
    id: props.id || Math.random().toString(),
    ...props,
    equals: jest.fn((other) => other.id === props.id),
    toJSON: jest.fn(() => ({ ...props })),
    getSellPrice: jest.fn().mockReturnValue(100),
  }));

  // Add static fromJSON method
  // @ts-ignore
  MockItem.fromJSON = jest.fn((json) => new MockItem(json));

  return {
    Item: MockItem,
    isStackable: mockIsStackable,
  };
});

jest.mock("../../assets/json/shopLines.json", () => ({
  wise: {
    neutral: ["The winds whisper of your arrival."],
    "slightly positive": ["Ah, your path returns to me."],
    positive: ["Your presence brightens these ancient halls, %p."],
    warm: ["The ancient ones smile upon you, %p."],
    "very warm": ["The cosmos itself celebrates you, %p."],
  },
}));

const mockPlayerState = {
  fullName: "Test Player",
  playerClass: "mage",
  gold: 1000,
  baseInventory: [] as Item[],
  addGold: jest.fn(),
  removeFromInventory: jest.fn(),
};

const mockRootStore = {
  time: {
    currentDate: { year: 2023, week: 1 },
    generateBirthDateInRange: jest
      .fn()
      .mockReturnValue({ year: 1990, week: 1 }),
  },
  playerState: mockPlayerState,
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
      personality: Personality.WISE,
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
      shop.addGold(-500);
      const mockItem = new Item({} as any);
      shop.baseInventory.push(mockItem);

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

  describe("createGreeting", () => {
    it("should create very warm greeting for high affection", () => {
      mockShopKeeper.affection = 95;
      expect(shop.createGreeting).toContain("Test Player");
    });

    it("should create warm greeting for good affection", () => {
      mockShopKeeper.affection = 80;
      expect(shop.createGreeting).toContain("Test Player");
    });

    it("should create neutral greeting for low affection", () => {
      mockShopKeeper.affection = 20;
      expect(shop.createGreeting).not.toContain("Test Player");
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
      const mockItem = new Item({
        equals: jest.fn().mockImplementation(function (
          this: Item,
          otherItem: Item,
        ) {
          return this.id === otherItem.id;
        }),
        getSellPrice: jest.fn().mockReturnValue(100),
      } as any);

      shop.baseInventory = [mockItem];

      shop.sellItem(mockItem, 100);

      expect(shop.currentGold).toBe(1100);
      expect(shop.baseInventory).toHaveLength(0);
    });

    it("should sell multiple items", () => {
      const mockItems = [
        new Item({ equals: jest.fn() } as any),
        new Item({ equals: jest.fn() } as any),
      ];
      shop.baseInventory = [...mockItems];

      shop.sellItem(mockItems, 100);

      expect(shop.currentGold).toBe(1200);
      expect(shop.baseInventory).toHaveLength(0);
    });
  });

  describe("purchaseStack", () => {
    let initialPlayerGold: number;
    let mockItems: Item[];

    beforeEach(() => {
      initialPlayerGold = mockRootStore.playerState.gold;
      mockRootStore.playerState.addGold.mockClear();
      mockRootStore.playerState.baseInventory = [];

      mockItems = Array(20)
        .fill(null)
        .map((_, index) => {
          const item = new Item({
            id: `item-${index}`,
          } as any);

          item.getSellPrice = jest.fn().mockReturnValue(100);

          mockRootStore.playerState.baseInventory.push(item);
          return item;
        });
    });

    it("should purchase as many items as shop can afford", () => {
      shop.setGold(1500);

      const purchasedCount = shop.purchaseStack(mockItems);

      expect(shop.baseInventory.length).toBe(15);
      expect(purchasedCount).toBe(15);
      expect(shop.currentGold).toBe(0);
      expect(mockRootStore.playerState.addGold).toHaveBeenCalledWith(1500);
      expect(mockRootStore.playerState.baseInventory).toHaveLength(5); // 20 - 15
    });

    it("should update player inventory and gold", () => {
      const itemPrice = 100;
      const mockItems = [
        new Item({
          id: "test-item-1",
        } as any),
      ];

      mockRootStore.playerState.baseInventory = [...mockItems];

      shop.setGold(itemPrice * 2);

      shop.purchaseStack(mockItems);

      expect(mockRootStore.playerState.addGold).toHaveBeenCalledWith(itemPrice);
      expect(mockRootStore.playerState.baseInventory).toHaveLength(0);
    });
  });
});
