import {
  AccelerationCurves,
  cleanRoundToTenths,
  getRandomPersonality,
  deathProbabilityByAge,
  rollToLiveByAge,
  getCharacterImage,
  getItemJSONMap,
  numberToRoman,
  asReadableGold,
  damageReduction,
  wait,
  toTitleCase,
  getRandomInt,
  flipCoin,
  rollD20,
  checkReleasePosition,
  generateEnemyFromNPC,
} from "../misc";
import { Personality, PlayerClassOptions } from "../../types";
import { Character } from "../../../entities/character";

jest.mock("../../../assets/json/items/artifacts.json", () => []);
jest.mock("../../../assets/json/items/arrows.json", () => []);
jest.mock("../../../assets/json/items/bows.json", () => []);
jest.mock("../../../assets/json/items/bodyArmor.json", () => []);
jest.mock("../../../assets/json/items/mageBooks.json", () => [
  {
    id: "mage-book-1",
    name: "Mage Book",
  },
]);

jest.mock("../../../assets/json/items/paladinBooks.json", () => [
  {
    id: "paladin-book-1",
    name: "Paladin Book",
  },
]);

jest.mock("../../../assets/json/items/necroBooks.json", () => [
  {
    id: "necro-book-1",
    name: "Necro Book",
  },
]);

jest.mock("../../../assets/json/items/rangerBooks.json", () => [
  {
    id: "ranger-book-1",
    name: "Ranger Book",
  },
]);

jest.mock("../../../assets/json/names.json", () => [
  { firstName: "John", lastName: "Doe", sex: "male" },
  { firstName: "Jane", lastName: "Smith", sex: "female" },
]);

describe("Misc Utility Functions", () => {
  describe("AccelerationCurves", () => {
    it("should calculate linear acceleration correctly", () => {
      expect(AccelerationCurves.linear(2)).toBe(3);
    });

    it("should calculate quadratic acceleration correctly", () => {
      expect(AccelerationCurves.quadratic(2)).toBe(5);
    });

    it("should calculate cubic acceleration correctly", () => {
      expect(AccelerationCurves.cubic(2)).toBe(9);
    });

    it("should calculate exponential acceleration correctly", () => {
      expect(AccelerationCurves.exponential(1)).toBeCloseTo(1.718281828);
    });
  });

  describe("cleanRoundToTenths", () => {
    it("should round whole numbers correctly", () => {
      expect(cleanRoundToTenths(5)).toBe("5");
    });

    it("should round decimals to tenths", () => {
      expect(cleanRoundToTenths(5.26)).toBe("5.3");
    });
  });

  describe("getRandomPersonality", () => {
    it("should return a valid personality", () => {
      const personality = getRandomPersonality();
      expect(Object.values(Personality)).toContain(personality);
    });
  });

  describe("deathProbabilityByAge", () => {
    it("should return higher probability for older age", () => {
      const youngProb = deathProbabilityByAge(20);
      const oldProb = deathProbabilityByAge(80);
      expect(oldProb).toBeGreaterThan(youngProb);
    });

    it("should return value between 0 and 1", () => {
      const prob = deathProbabilityByAge(50);
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    });
  });

  describe("rollToLiveByAge", () => {
    it("should return higher values for older ages", () => {
      const youngRoll = rollToLiveByAge(20);
      const oldRoll = rollToLiveByAge(80);
      expect(oldRoll).toBeGreaterThan(youngRoll);
    });
  });

  describe("getCharacterImage", () => {
    it("should return toddler image for very young age", () => {
      const image = getCharacterImage(2, "Male", Personality.CALM);
      expect(image).toBeDefined();
    });

    it("should return appropriate age group image", () => {
      const elderImage = getCharacterImage(70, "Male", Personality.CALM);
      const adultImage = getCharacterImage(30, "Male", Personality.CALM);
      const youthImage = getCharacterImage(18, "Male", Personality.CALM);

      expect(elderImage).toBeDefined();
      expect(adultImage).toBeDefined();
      expect(youthImage).toBeDefined();
      expect(elderImage).not.toBe(adultImage);
      expect(adultImage).not.toBe(youthImage);
    });
  });

  describe("getItemJSONMap", () => {
    it("should return correct item map for each class", () => {
      const mageItems = getItemJSONMap(PlayerClassOptions.mage);
      const paladinItems = getItemJSONMap(PlayerClassOptions.paladin);

      expect(mageItems).toBeDefined();
      expect(paladinItems).toBeDefined();
      expect(mageItems.book).not.toEqual(paladinItems.book);
    });
  });

  describe("numberToRoman", () => {
    it("should convert numbers to roman numerals", () => {
      expect(numberToRoman(1)).toBe("I");
      expect(numberToRoman(4)).toBe("IV");
      expect(numberToRoman(9)).toBe("IX");
      expect(numberToRoman(49)).toBe("XLIX");
    });

    it("should return empty string for 0", () => {
      expect(numberToRoman(0)).toBe("");
    });
  });

  describe("asReadableGold", () => {
    it("should format billions correctly", () => {
      expect(asReadableGold(1500000000)).toBe("2B");
    });

    it("should format millions correctly", () => {
      expect(asReadableGold(1500000)).toBe("2M");
    });

    it("should format thousands correctly", () => {
      expect(asReadableGold(15000)).toBe("15K");
    });

    it("should format small numbers with decimals", () => {
      expect(asReadableGold(15.5)).toBe("15.5");
    });
  });

  describe("damageReduction", () => {
    it("should cap reduction at 92.5%", () => {
      expect(damageReduction(1000)).toBe(0.925);
    });

    it("should calculate reduction correctly for normal values", () => {
      const reduction = damageReduction(100);
      expect(reduction).toBeGreaterThan(0);
      expect(reduction).toBeLessThan(0.925);
    });
  });

  describe("wait", () => {
    it("should wait for specified time", async () => {
      const start = Date.now();
      await wait(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });

  describe("toTitleCase", () => {
    it("should handle undefined input", () => {
      expect(toTitleCase(undefined)).toBe("");
    });

    it("should capitalize words correctly", () => {
      expect(toTitleCase("hello world")).toBe("Hello World");
      expect(toTitleCase("hello-world")).toBe("Hello-World");
    });
  });

  describe("getRandomInt", () => {
    it("should return number within range", () => {
      const result = getRandomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });
  });

  describe("flipCoin", () => {
    it("should return either Heads or Tails", () => {
      const result = flipCoin();
      expect(["Heads", "Tails"]).toContain(result);
    });
  });

  describe("rollD20", () => {
    it("should return number between 1 and 20", () => {
      const result = rollD20();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(20);
    });
  });

  describe("checkReleasePosition", () => {
    it("should call success callback when position is within bounds", () => {
      const successCallback = jest.fn();
      const snapBackCallback = jest.fn();
      const bounds = [
        {
          key: "test",
          bounds: { x: 0, y: 0, width: 100, height: 100 },
        },
      ];
      const position = { x: 50, y: 50 };

      checkReleasePosition({
        bounds,
        position,
        runOnSuccess: successCallback,
        handleSnapBack: snapBackCallback,
      });

      expect(successCallback).toHaveBeenCalledWith("test");
      expect(snapBackCallback).not.toHaveBeenCalled();
    });

    it("should call snapBack when position is out of bounds", () => {
      const successCallback = jest.fn();
      const snapBackCallback = jest.fn();
      const bounds = [
        {
          key: "test",
          bounds: { x: 0, y: 0, width: 100, height: 100 },
        },
      ];
      const position = { x: 150, y: 150 };

      checkReleasePosition({
        bounds,
        position,
        runOnSuccess: successCallback,
        handleSnapBack: snapBackCallback,
      });

      expect(successCallback).not.toHaveBeenCalled();
      expect(snapBackCallback).toHaveBeenCalled();
    });
  });

  describe("generateEnemyFromNPC", () => {
    it("should generate enemy with correct properties", () => {
      // Create mock root with time
      const mockRoot = {
        time: {
          year: 1300,
          week: 26,
        },
      };

      // Create mock character with all required properties
      const mockCharacter = {
        firstName: "John",
        lastName: "Doe",
        fullName: "John Doe",
        sex: "male",
        birthdate: {
          year: 1270,
          week: 1,
        },
        root: mockRoot,
        age: 30,
      };

      // Mock Math.random to return predictable values for stat generation
      const originalRandom = Math.random;
      Math.random = jest
        .fn()
        .mockReturnValueOnce(0.5) // for health
        .mockReturnValueOnce(0.5) // for energy
        .mockReturnValueOnce(0.5) // for attackPower
        .mockReturnValueOnce(0.5); // for regen

      const enemy = generateEnemyFromNPC(mockCharacter as Character);

      // Restore Math.random
      Math.random = originalRandom;

      expect(enemy.beingType).toBe("human");
      expect(enemy.creatureSpecies).toBe("John Doe");
      expect(enemy.currentHealth).toBeGreaterThan(0);
      expect(enemy.baseHealth).toBeGreaterThan(0);
      expect(enemy.energyRegen).toBeGreaterThan(0);
      expect(enemy.currentEnergy).toBeGreaterThan(0);
      expect(enemy.baseEnergy).toBeGreaterThan(0);
      expect(enemy.attackPower).toBeGreaterThan(0);

      // Verify sprite selection
      expect(enemy.sprite).toBe("npc_man"); // For age 30, male
    });

    it("should select correct sprite based on age and sex", () => {
      const mockRoot = {
        time: {
          year: 1300,
          week: 26,
        },
      };

      // Test elderly male
      const elderlyMale = {
        firstName: "Old",
        lastName: "Man",
        fullName: "Old Man",
        sex: "male",
        birthdate: {
          year: 1240,
          week: 1,
        },
        root: mockRoot,
        age: 60,
      };

      const elderlyMaleEnemy = generateEnemyFromNPC(elderlyMale as Character);
      expect(elderlyMaleEnemy.sprite).toBe("npc_man_old");

      // Test adult female
      const adultFemale = {
        firstName: "Adult",
        lastName: "Woman",
        fullName: "Adult Woman",
        sex: "female",
        birthdate: {
          year: 1270,
          week: 1,
        },
        root: mockRoot,
        age: 30,
      };

      const adultFemaleEnemy = generateEnemyFromNPC(adultFemale as Character);
      expect(adultFemaleEnemy.sprite).toBe("npc_woman");
    });
  });
});
