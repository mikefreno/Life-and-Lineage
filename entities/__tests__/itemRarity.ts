import { Affix, ItemRarityService } from "../item";

const MOCK_PREFIXES: Affix[] = [
  {
    name: {
      "5": "healthy",
      "4": "hearty",
      "3": "hearty",
      "2": "vital",
      "1": "invigorating",
    },
    modifier: {
      health: [
        {
          "5": { min: 10, max: 14 },
          "4": { min: 15, max: 19 },
          "3": { min: 20, max: 24 },
          "2": { min: 25, max: 29 },
          "1": { min: 30, max: 35 },
        },
      ],
    },
    tiers: 5,
  },
  {
    name: {
      "5": "sturdy",
      "4": "robust",
      "3": "robust",
      "2": "vigorous",
      "1": "flourishing",
    },
    modifier: {
      health: [
        {
          "5": { min: 8, max: 11 },
          "4": { min: 12, max: 15 },
          "3": { min: 16, max: 19 },
          "2": { min: 20, max: 23 },
          "1": { min: 24, max: 28 },
        },
      ],
      healthRegen: [
        {
          "5": { min: 1, max: 1 },
          "4": { min: 1, max: 2 },
          "3": { min: 2, max: 2 },
          "2": { min: 2, max: 3 },
          "1": { min: 3, max: 4 },
        },
      ],
    },
    tiers: 5,
  },
];

describe("ItemRarityService", () => {
  let originalMathRandom: () => number;

  beforeEach(() => {
    originalMathRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalMathRandom;
  });

  describe("isEquipable", () => {
    it("should return true for valid equipment slots", () => {
      expect(ItemRarityService.isEquipable("head")).toBe(true);
      expect(ItemRarityService.isEquipable("body")).toBe(true);
      expect(ItemRarityService.isEquipable("one-hand")).toBe(true);
      expect(ItemRarityService.isEquipable("two-hand")).toBe(true);
      expect(ItemRarityService.isEquipable("off-hand")).toBe(true);
      expect(ItemRarityService.isEquipable("quiver")).toBe(true);
    });

    it("should return false for invalid equipment slots", () => {
      expect(ItemRarityService.isEquipable("invalid")).toBe(false);
      expect(ItemRarityService.isEquipable(null)).toBe(false);
    });
  });

  describe("rollRarity", () => {
    it("should return rare for rolls <= RARE chance", () => {
      Math.random = jest.fn().mockReturnValue(0.05);
      expect(ItemRarityService.rollRarity()).toBe("rare");
    });

    it("should return magic for rolls between RARE and MAGIC+RARE chance", () => {
      Math.random = jest.fn().mockReturnValue(0.15);
      expect(ItemRarityService.rollRarity()).toBe("magic");
    });

    it("should return normal for rolls > MAGIC+RARE chance", () => {
      Math.random = jest.fn().mockReturnValue(0.5);
      expect(ItemRarityService.rollRarity()).toBe("normal");
    });

    it("should maintain proper distribution over many rolls", () => {
      const rolls = 10000;
      const results = { rare: 0, magic: 0, normal: 0 };

      for (let i = 0; i < rolls; i++) {
        const rarity = ItemRarityService.rollRarity();
        results[rarity]++;
      }

      expect(results.rare / rolls).toBeCloseTo(0.1, 1);
      expect(results.magic / rolls).toBeCloseTo(0.25, 1);
      expect(results.normal / rolls).toBeCloseTo(0.65, 1);
    });
  });

  describe("getRandomAffix", () => {
    it("should return a random affix with a tier", () => {
      Math.random = jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(0.95);

      const result = ItemRarityService.getRandomAffix(MOCK_PREFIXES);

      expect(result).toHaveProperty("affix");
      expect(result).toHaveProperty("tier");
      expect(result.affix).toBe(MOCK_PREFIXES[0]);
      expect(result.tier).toBeLessThanOrEqual(MOCK_PREFIXES[0].tiers);
    });
  });

  describe("rollTier", () => {
    it("should always return a valid tier number", () => {
      const maxTier = 5;
      const rolls = 1000;

      for (let i = 0; i < rolls; i++) {
        const tier = ItemRarityService.rollTier(maxTier);
        expect(tier).toBeGreaterThanOrEqual(1);
        expect(tier).toBeLessThanOrEqual(maxTier);
      }
    });

    it("should have lower probability for lower tiers", () => {
      const maxTier = 5;
      const rolls = 100000;
      const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      for (let i = 0; i < rolls; i++) {
        const tier = ItemRarityService.rollTier(maxTier);
        tierCounts[tier]++;
      }

      // Lower tiers should be less common
      expect(tierCounts[1]).toBeLessThan(tierCounts[2]);
      expect(tierCounts[2]).toBeLessThan(tierCounts[3]);
      expect(tierCounts[3]).toBeLessThan(tierCounts[4]);
      expect(tierCounts[4]).toBeLessThan(tierCounts[5]);
    });
  });

  describe("generateAffixes", () => {
    it("should generate both prefix and suffix for rare items", () => {
      const result = ItemRarityService.generateAffixes("rare");
      expect(result.prefix).not.toBeNull();
      expect(result.suffix).not.toBeNull();
    });

    it("should generate either prefix or suffix for magic items", () => {
      Math.random = jest.fn().mockReturnValue(0.3);
      let result = ItemRarityService.generateAffixes("magic");
      expect(result.prefix).not.toBeNull();
      expect(result.suffix).toBeNull();

      Math.random = jest.fn().mockReturnValue(0.7);
      result = ItemRarityService.generateAffixes("magic");
      expect(result.prefix).toBeNull();
      expect(result.suffix).not.toBeNull();
    });

    it("should generate no affixes for normal items", () => {
      const result = ItemRarityService.generateAffixes("normal");
      expect(result.prefix).toBeNull();
      expect(result.suffix).toBeNull();
    });
  });

  describe("rollStatValue", () => {
    it("should return a value within the given range", () => {
      const range = { min: 5, max: 10 };
      const rolls = 1000;

      for (let i = 0; i < rolls; i++) {
        const value = ItemRarityService.rollStatValue(range);
        expect(value).toBeGreaterThanOrEqual(range.min);
        expect(value).toBeLessThanOrEqual(range.max);
      }
    });

    it("should have roughly uniform distribution", () => {
      const range = { min: 1, max: 4 };
      const rolls = 10000;
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };

      for (let i = 0; i < rolls; i++) {
        const value = ItemRarityService.rollStatValue(range);
        counts[value]++;
      }

      const expectedCount = rolls / 4;
      Object.values(counts).forEach((count) => {
        expect(count).toBeGreaterThan(expectedCount * 0.9);
        expect(count).toBeLessThan(expectedCount * 1.1);
      });
    });
  });

  describe("applyAffixesToStats", () => {
    it("should correctly apply prefix and suffix modifiers", () => {
      const baseStats = { health: 100, healthRegen: 1 };
      const prefix = {
        affix: MOCK_PREFIXES[0],
        tier: 1,
      };
      const suffix = {
        affix: MOCK_PREFIXES[1], // Using the second mock prefix as a suffix
        tier: 1,
      };

      Math.random = jest.fn().mockReturnValue(0); // Will always return minimum values

      const result = ItemRarityService.applyAffixesToStats(
        baseStats,
        prefix,
        suffix,
      );

      expect(result.health).toBe(baseStats.health + 30 + 24); // min values from tier 1
      expect(result.healthRegen).toBe(baseStats.healthRegen + 3); // min value from tier 1
    });

    it("should work with null base stats", () => {
      const prefix = {
        affix: MOCK_PREFIXES[0],
        tier: 1,
      };

      Math.random = jest.fn().mockReturnValue(0); // Will always return minimum values

      const result = ItemRarityService.applyAffixesToStats(null, prefix, null);

      expect(result.health).toBe(30); // min value from tier 1
    });
  });

  describe("calculateValueModifier", () => {
    it("should return decreasing modifiers for increasing tiers", () => {
      const tier1Mod = ItemRarityService.calculateValueModifier(1);
      const tier2Mod = ItemRarityService.calculateValueModifier(2);
      const tier3Mod = ItemRarityService.calculateValueModifier(3);
      const tier4Mod = ItemRarityService.calculateValueModifier(4);
      const tier5Mod = ItemRarityService.calculateValueModifier(5);

      expect(tier1Mod).toBeGreaterThan(tier2Mod);
      expect(tier2Mod).toBeGreaterThan(tier3Mod);
      expect(tier3Mod).toBeGreaterThan(tier4Mod);
      expect(tier4Mod).toBeGreaterThan(tier5Mod);
    });
  });

  describe("calculateModifiedValue", () => {
    it("should increase value based on affixes", () => {
      const baseValue = 100;
      const prefix = {
        affix: MOCK_PREFIXES[0],
        tier: 1,
      };
      const suffix = {
        affix: MOCK_PREFIXES[1],
        tier: 1,
      };

      const result = ItemRarityService.calculateModifiedValue(
        baseValue,
        prefix,
        suffix,
      );

      expect(result).toBeGreaterThan(baseValue);
    });

    it("should return base value when no affixes are present", () => {
      const baseValue = 100;
      const result = ItemRarityService.calculateModifiedValue(
        baseValue,
        null,
        null,
      );

      expect(result).toBe(baseValue);
    });
  });
});
