import { Personality } from "@/utility/types";
import { ShopStore } from "../ShopsStore";
import { exclusionMapping } from "@/entities/shop";

jest.mock("../../utility/functions/storage");

jest.mock("@/assets/json/shops.json", () => [
  { type: "armorer", baseGold: 100, possiblePersonalities: ["AGGRESSIVE"] },
  { type: "weaponsmith", baseGold: 100, possiblePersonalities: ["ARROGANT"] },
  { type: "weaver", baseGold: 100, possiblePersonalities: ["CALM"] },
  { type: "archanist", baseGold: 100, possiblePersonalities: ["CREEPY"] },
  { type: "junk dealer", baseGold: 100, possiblePersonalities: ["JOVIAL"] },
  { type: "fletcher", baseGold: 100, possiblePersonalities: ["OPEN"] },
  { type: "apothecary", baseGold: 100, possiblePersonalities: ["WISE"] },
  { type: "librarian", baseGold: 100, possiblePersonalities: ["RESERVED"] },
]);

describe("ShopStore", () => {
  let rootStore: any;
  let shopStore: ShopStore;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Create a more realistic character store that actually tracks characters
    const charactersMap = new Map();
    const mockCharacterStore = {
      addCharacter: jest.fn((character) => {
        charactersMap.set(character.id, character);
      }),
      characters: charactersMap,
    };

    // Mock Player state
    const mockPlayerState = {
      addKnownCharacter: jest.fn(),
    };

    // Mock Time store
    const mockTimeStore = {
      currentDate: new Date(),
      generateBirthDateInRange: jest.fn().mockImplementation((min, max) => {
        const now = new Date();
        const years = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Date(
          now.getFullYear() - years,
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1,
        );
      }),
    };

    // Setup root store
    rootStore = {
      characterStore: mockCharacterStore,
      playerState: mockPlayerState,
      time: mockTimeStore,
    };

    // Create shop store instance
    shopStore = new ShopStore({ root: rootStore });

    // Replace the hydrateShopState method to always use getInitShopsState
    shopStore.hydrateShopState = jest.fn().mockImplementation(() => {
      return shopStore.getInitShopsState();
    });
  });

  describe("getInitShopsState", () => {
    it("should generate shopkeepers with personalities that respect exclusion mapping (2000 iterations)", () => {
      // Run the test 100 times to ensure consistency
      for (let iteration = 0; iteration < 2000; iteration++) {
        // Reset character store for each iteration
        rootStore.characterStore.characters.clear();

        // Force initialization to use getInitShopsState
        const shops = shopStore.getInitShopsState();

        // Get all shopkeepers
        const shopkeepers = Array.from(shops.values()).map(
          (shop) => shop.shopKeeper,
        );

        // Check for duplicate personalities within the same sex
        const malePersonalities = new Set();
        const femalePersonalities = new Set();

        for (const shopkeeper of shopkeepers) {
          const sex = shopkeeper.sex;
          const personality = shopkeeper.personality;

          if (sex === "male") {
            // Check if this personality is already used by another male
            expect(malePersonalities.has(personality)).toBe(false);
            malePersonalities.add(personality);
          } else {
            // Check if this personality is already used by another female
            expect(femalePersonalities.has(personality)).toBe(false);
            femalePersonalities.add(personality);
          }
        }

        // Check that no two shopkeepers have conflicting personalities
        for (let i = 0; i < shopkeepers.length; i++) {
          const shopkeeper1 = shopkeepers[i];
          const sex1 = shopkeeper1.sex;
          const personality1 = shopkeeper1.personality as Personality;

          for (let j = i + 1; j < shopkeepers.length; j++) {
            const shopkeeper2 = shopkeepers[j];
            const sex2 = shopkeeper2.sex;
            const personality2 = shopkeeper2.personality as Personality;

            // If same sex, check exclusion mapping
            if (sex1 === sex2) {
              const exclusions1 = exclusionMapping[sex1][personality1] || [];
              const exclusions2 = exclusionMapping[sex2][personality2] || [];

              // Verify personality2 is not in exclusions of personality1
              expect(exclusions1.includes(personality2)).toBe(
                false,
                `Iteration ${iteration}: ${sex1} shopkeeper with personality ${personality1} should not coexist with ${personality2}`,
              );

              // Verify personality1 is not in exclusions of personality2
              expect(exclusions2.includes(personality1)).toBe(
                false,
                `Iteration ${iteration}: ${sex2} shopkeeper with personality ${personality2} should not coexist with ${personality1}`,
              );
            }
          }
        }

        // Log the personalities for debugging
        if (iteration === 0) {
          console.log("Shop personalities for first iteration:");
          shopkeepers.forEach((sk) => {
            console.log(`${sk.job} ${sk.sex} ${sk.personality}`);
          });
        }
      }
    });

    it("should create shops for all merchant types", () => {
      const shops = shopStore.getInitShopsState();

      // Check that all merchant types have a shop
      const merchantTypes = Array.from(shops.keys());
      expect(merchantTypes.sort()).toEqual(
        [
          "armorer",
          "weaponsmith",
          "weaver",
          "archanist",
          "junk dealer",
          "fletcher",
          "apothecary",
          "librarian",
        ].sort(),
      );
    });

    it("should handle the case when unique combinations are exhausted", () => {
      // Mock console.warn
      const originalWarn = console.warn;
      console.warn = jest.fn();

      // Create a custom implementation of Set to simulate exhausted combinations
      const originalSet = global.Set;
      const MockSet = function () {
        const set = new originalSet();

        // Override the has method to always return true after first call
        // This simulates all combinations being used
        let hasCallCount = 0;
        set.has = function (key) {
          hasCallCount++;
          return hasCallCount > 1; // First call returns false, rest return true
        };

        // Override size to force the warning path
        Object.defineProperty(set, "size", {
          get: function () {
            return 25;
          },
        });

        return set;
      };

      global.Set = MockSet as any;

      shopStore.getInitShopsState();

      // Verify warning was logged
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "Couldn't generate unique sex-archetype combination",
        ),
      );

      // Restore mocks
      console.warn = originalWarn;
      global.Set = originalSet;
    });
  });
});
