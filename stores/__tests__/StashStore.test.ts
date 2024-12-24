import { StashStore } from "../StashStore";
import { RootStore } from "../RootStore";
import { Item } from "../../entities/item";
import { storage } from "../../utility/functions/storage";
import { ItemClassType, Rarity } from "../../utility/types";

jest.mock("../../utility/functions/storage");

describe("StashStore", () => {
  let stashStore: StashStore;
  let mockRootStore: jest.Mocked<RootStore>;

  beforeEach(() => {
    mockRootStore = {
      playerState: {
        removeFromInventory: jest.fn(),
        addToInventory: jest.fn(),
      },
    } as unknown as jest.Mocked<RootStore>;

    stashStore = new StashStore({ root: mockRootStore });
  });

  test("initializes with empty items array", () => {
    expect(stashStore.items).toEqual([]);
  });

  test("addItem adds an item to the stash", () => {
    const testItem = new Item({
      name: "Test Item",
      description: "Test Description",
      icon: "sword",
      rarity: Rarity.NORMAL,
      itemClass: ItemClassType.Melee,
      baseValue: 100,
      root: mockRootStore,
    });

    stashStore.addItem([testItem]);

    expect(stashStore.items).toHaveLength(1);
    expect(stashStore.items[0].item[0]).toBe(testItem);
    expect(mockRootStore.playerState?.removeFromInventory).toHaveBeenCalledWith(
      [testItem],
    );
  });

  test("removeItem removes an item from the stash", () => {
    const testItem = new Item({
      name: "Test Item",
      description: "Test Description",
      icon: "sword",
      rarity: Rarity.NORMAL,
      itemClass: ItemClassType.Melee,
      baseValue: 100,
      root: mockRootStore,
    });

    stashStore.addItem([testItem]);
    stashStore.removeItem([testItem]);

    expect(stashStore.items).toHaveLength(0);
    expect(mockRootStore.playerState?.addToInventory).toHaveBeenCalledWith([
      testItem,
    ]);
  });

  test("saveStash saves items to storage", () => {
    const testItem = new Item({
      name: "Test Item",
      description: "Test Description",
      icon: "sword",
      rarity: Rarity.NORMAL,
      itemClass: ItemClassType.Melee,
      baseValue: 100,
      root: mockRootStore,
    });

    stashStore.addItem([testItem]);
    stashStore.saveStash();

    expect(storage.set).toHaveBeenCalled();
  });
});
