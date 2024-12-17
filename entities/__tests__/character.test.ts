import { Character } from "../character";

// Mock dependencies
jest.mock("../../stores/RootStore");

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

const mockUUID = "12345678-1234-1234-1234-123456789012";
global.Crypto = {
  randomUUID: jest.fn(() => mockUUID),
} as any;

describe("Character", () => {
  let character: Character;

  beforeEach(() => {
    character = new Character({
      id: "hippityhop",
      firstName: "John",
      lastName: "Doe",
      sex: "male",
      personality: "wise",
      birthdate: { year: 2000, week: 1 },
      root: mockRootStore as any,
    });
  });

  it("should create a character with default values", () => {
    expect(character.id).toBeDefined();
    expect(character.firstName).toBe("John");
    expect(character.lastName).toBe("Doe");
    expect(character.sex).toBe("male");
    expect(character.personality).toBe("wise");
    expect(character.alive).toBe(true);
    expect(character.deathdate).toBeNull();
    expect(character.job).toBe("Unemployed");
    expect(character.affection).toBe(0);
    expect(character.qualifications).toEqual([]);
  });

  describe("equals", () => {
    it("should return false for characters with different ids", () => {
      (global.Crypto.randomUUID as jest.Mock).mockReturnValueOnce(
        "different-uuid",
      );

      const differentCharacter = new Character({
        firstName: "Jane",
        lastName: "Smith",
        sex: "female",
        personality: "aggressive",
        birthdate: { year: 2001, week: 1 },
        root: mockRootStore as any,
      });

      expect(character.equals(differentCharacter)).toBe(false);
    });

    it("should return false for characters with different ids", () => {
      const differentCharacter = new Character({
        firstName: "Jane",
        lastName: "Smith",
        sex: "female",
        personality: "aggressive",
        birthdate: { year: 2001, week: 1 },
        root: mockRootStore as any,
      });

      expect(character.equals(differentCharacter)).toBe(false);
    });
  });

  describe("age", () => {
    it("should calculate age correctly when birth week is earlier", () => {
      expect(character.age).toBe(23);
    });

    it("should calculate age correctly when birth week is later", () => {
      character = new Character({
        firstName: "John",
        lastName: "Doe",
        sex: "male",
        personality: "wise",
        birthdate: { year: 2000, week: 26 },
        root: mockRootStore as any,
      });

      expect(character.age).toBe(22);
    });
  });

  describe("fullName", () => {
    it("should return the correct full name", () => {
      expect(character.fullName).toBe("John Doe");
    });
  });

  describe("addQualification", () => {
    it("should add a qualification to the list", () => {
      character.addQualification("Blacksmith");
      expect(character.qualifications).toContain("Blacksmith");
    });
  });

  describe("setJob", () => {
    it("should update the job", () => {
      character.setJob("Knight");
      expect(character.job).toBe("Knight");
    });
  });

  describe("setDateCooldownStart", () => {
    it("should set the date cooldown start to current date", () => {
      character.setDateCooldownStart();
      expect(character.dateCooldownStart).toEqual(
        mockRootStore.time.currentDate,
      );
    });
  });

  describe("kill", () => {
    it("should set alive to false and set death date", () => {
      character.kill();
      expect(character.alive).toBe(false);
      expect(character.deathdate).toEqual(mockRootStore.time.currentDate);
    });
  });

  describe("updateAffection", () => {
    it("should increase affection", () => {
      character.updateAffection(50);
      expect(character.affection).toBe(50);
    });

    it("should not exceed max affection (100)", () => {
      character.updateAffection(150);
      expect(character.affection).toBe(100);
    });

    it("should not go below min affection (-100)", () => {
      character.updateAffection(-150);
      expect(character.affection).toBe(-100);
    });
  });

  describe("updateLastName", () => {
    it("should update the last name", () => {
      character.updateLastName("Smith");
      expect(character.lastName).toBe("Smith");
    });
  });

  describe("pregnancy", () => {
    let femaleCharacter: Character;

    beforeEach(() => {
      femaleCharacter = new Character({
        firstName: "Jane",
        lastName: "Doe",
        sex: "female",
        personality: "wise",
        birthdate: { year: 2000, week: 1 },
        root: mockRootStore as any,
      });
    });

    it("should initiate pregnancy for female characters", () => {
      const result = femaleCharacter.initiatePregnancy();
      expect(result).toBe(true);
      expect(femaleCharacter.isPregnant).toBe(true);
      expect(femaleCharacter.pregnancyDueDate).toBeDefined();
    });

    it("should not initiate pregnancy for male characters", () => {
      const result = character.initiatePregnancy();
      expect(result).toBe(false);
      expect(character.isPregnant).toBe(false);
    });

    it("should give birth when due date is reached", () => {
      femaleCharacter.initiatePregnancy();
      mockRootStore.time.currentDate = femaleCharacter.pregnancyDueDate!;

      const baby = femaleCharacter.giveBirth();

      expect(baby).toBeDefined();
      expect(femaleCharacter.isPregnant).toBe(false);
      expect(femaleCharacter.pregnancyDueDate).toBeUndefined();
    });

    it("should not give birth before due date", () => {
      femaleCharacter.initiatePregnancy();
      mockRootStore.time.currentDate = {
        year: femaleCharacter.pregnancyDueDate!.year,
        week: femaleCharacter.pregnancyDueDate!.week - 1,
      };

      const baby = femaleCharacter.giveBirth();

      expect(baby).toBeNull();
      expect(femaleCharacter.isPregnant).toBe(true);
    });
  });

  describe("fromJSON", () => {
    it("should create a character from JSON", () => {
      const json = {
        id: "test-id",
        firstName: "Test",
        lastName: "User",
        sex: "female",
        personality: "aggressive",
        birthdate: { year: 1990, week: 1 },
        alive: true,
        job: "Warrior",
        affection: 50,
        qualifications: ["Combat"],
        root: mockRootStore,
      };

      const newCharacter = Character.fromJSON(json);

      expect(newCharacter.id).toBe("test-id");
      expect(newCharacter.firstName).toBe("Test");
      expect(newCharacter.lastName).toBe("User");
      expect(newCharacter.sex).toBe("female");
      expect(newCharacter.personality).toBe("aggressive");
      expect(newCharacter.job).toBe("Warrior");
      expect(newCharacter.affection).toBe(50);
      expect(newCharacter.qualifications).toEqual(["Combat"]);
    });
  });
});
