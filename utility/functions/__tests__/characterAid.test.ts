import {
  generateNewCharacter,
  generateNewAdoptee,
  getRandomJobTitle,
  getSexFromName,
  getStartingBaseStats,
  createParent,
  createPlayerCharacter,
} from "../characterAid";
import { flipCoin, getRandomName, getRandomPersonality } from "../misc";
import { PlayerClassOptions, Element } from "../../types";
import { RootStore } from "../../../stores/RootStore";
import { Character, PlayerCharacter } from "../../../entities/character";
import { TimeStore } from "../../../stores/TimeStore";

// Mock dependencies
jest.mock("../misc", () => ({
  flipCoin: jest.fn(),
  getRandomName: jest.fn(),
  getRandomPersonality: jest.fn(),
}));

// Mock jobs.json
jest.mock("../../../assets/json/jobs.json", () => [
  { title: "Baker" },
  { title: "Smith" },
]);

// Mock names.json
jest.mock("../../../assets/json/names.json", () => [
  { firstName: "John", lastName: "Doe", sex: "male" },
  { firstName: "Jane", lastName: "Doe", sex: "female" },
]);

describe("Character Generation Functions", () => {
  let mockRoot: jest.Mocked<RootStore>;
  let mockTimeStore: jest.Mocked<TimeStore>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock TimeStore
    mockTimeStore = {
      generateBirthDateInRange: jest
        .fn()
        .mockReturnValue({ year: 1300, week: 0 }),
      generateBirthDateForAge: jest
        .fn()
        .mockReturnValue({ year: 1285, week: 0 }),
    } as unknown as jest.Mocked<TimeStore>;

    // Setup mock RootStore
    mockRoot = {
      time: mockTimeStore,
      characterStore: {
        addCharacter: jest.fn(),
      },
    } as unknown as jest.Mocked<RootStore>;

    // Setup default mock returns
    (flipCoin as jest.Mock).mockReturnValue("Heads");
    (getRandomName as jest.Mock).mockReturnValue({
      firstName: "John",
      lastName: "Doe",
    });
    (getRandomPersonality as jest.Mock).mockReturnValue("CALM");
  });

  describe("generateNewCharacter", () => {
    it("should generate a character with correct properties", () => {
      const character = generateNewCharacter(mockRoot);

      expect(character).toBeInstanceOf(Character);
      expect(character.sex).toBe("male");
      expect(character.firstName).toBe("John");
      expect(character.lastName).toBe("Doe");
      expect(mockRoot.time.generateBirthDateInRange).toHaveBeenCalledWith(
        18,
        65,
      );
    });

    it("should handle female character generation", () => {
      (flipCoin as jest.Mock).mockReturnValue("Tails");
      (getRandomName as jest.Mock).mockReturnValue({
        firstName: "Jane",
        lastName: "Doe",
      });

      const character = generateNewCharacter(mockRoot);

      expect(character.sex).toBe("female");
      expect(character.firstName).toBe("Jane");
    });
  });

  describe("generateNewAdoptee", () => {
    it("should generate an adoptee with correct age range", () => {
      const adoptee = generateNewAdoptee(mockRoot);

      expect(adoptee).toBeInstanceOf(Character);
      expect(mockTimeStore.generateBirthDateInRange).toHaveBeenCalledWith(
        1,
        17,
      );
    });
  });

  describe("getRandomJobTitle", () => {
    it("should return a valid job title", () => {
      const job = getRandomJobTitle();
      expect(["Baker", "Smith"]).toContain(job);
    });
  });

  describe("getSexFromName", () => {
    it("should return correct sex for known name", () => {
      expect(getSexFromName("John")).toBe("male");
      expect(getSexFromName("Jane")).toBe("female");
    });

    it("should return male for unknown name", () => {
      expect(getSexFromName("Unknown")).toBe("male");
    });
  });

  describe("getStartingBaseStats", () => {
    it("should return correct stats for necromancer", () => {
      const stats = getStartingBaseStats({
        classSelection: PlayerClassOptions.necromancer,
      });
      expect(stats).toEqual({
        baseHealth: 80,
        baseMana: 120,
        baseStrength: 3,
        baseIntelligence: 6,
        baseDexterity: 4,
        baseManaRegen: 6,
        baseSanity: 40,
      });
    });

    it("should return correct stats for paladin", () => {
      const stats = getStartingBaseStats({
        classSelection: PlayerClassOptions.paladin,
      });
      expect(stats).toEqual({
        baseHealth: 120,
        baseMana: 80,
        baseStrength: 6,
        baseIntelligence: 4,
        baseDexterity: 3,
        baseManaRegen: 5,
        baseSanity: 60,
      });
    });

    // Add similar tests for mage and ranger
  });

  describe("createParent", () => {
    it("should create a parent with correct properties", () => {
      const parent = createParent("male", mockRoot, "Smith");

      expect(parent).toBeInstanceOf(Character);
      expect(parent.sex).toBe("male");
      expect(parent.lastName).toBe("Smith");
      expect(parent.affection).toBe(85);
      expect(mockRoot.time.generateBirthDateInRange).toHaveBeenCalledWith(
        32,
        55,
      );
    });
  });
});
