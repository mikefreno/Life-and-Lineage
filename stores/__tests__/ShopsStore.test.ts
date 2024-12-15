import { ShopStore } from "../ShopsStore";
import { RootStore } from "../RootStore";

describe("ShopStore", () => {
  let shopStore: ShopStore;
  let mockRootStore: RootStore;

  beforeEach(() => {
    mockRootStore = {
      time: {
        currentDate: { year: 2023, week: 1 },
        generateBirthDateInRange: jest
          .fn()
          .mockReturnValue({ year: 2000, week: 1 }),
      },
    } as unknown as RootStore;
    shopStore = new ShopStore({ root: mockRootStore });
  });

  test("initialization", () => {
    expect(shopStore.shopsMap).toBeDefined();
    expect(shopStore.shopsMap.size).toBeGreaterThan(0);
  });

  test("getShop", () => {
    const armorerShop = shopStore.getShop("armorer");
    expect(armorerShop).toBeDefined();
    expect(armorerShop?.archetype).toBe("armorer");
  });

  test("toCheckpointData", () => {
    const checkpointData = shopStore.toCheckpointData();
    expect(Array.isArray(checkpointData)).toBe(true);
    expect(checkpointData.length).toBeGreaterThan(0);
    expect(checkpointData[0].root).toBeNull();
    expect(checkpointData[0].shopKeeper.root).toBeNull();
  });

  test("fromCheckpointData", () => {
    const mockCheckpointData = [{ archetype: "testShop", shopKeeper: {} }];
    shopStore.fromCheckpointData(mockCheckpointData);

    expect(shopStore.shopsMap.get("testShop")).toBeDefined();
  });
});
