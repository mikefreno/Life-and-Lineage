import { CharacterStore } from "../CharacterStore";
import { RootStore } from "../RootStore";
import { Character } from "../../entities/character";

jest.mock("../../utility/functions/storage");

describe("CharacterStore", () => {
  let characterStore: CharacterStore;
  let mockRootStore: jest.Mocked<RootStore>;

  beforeEach(() => {
    mockRootStore = {
      time: {
        generateBirthDateInRange: jest
          .fn()
          .mockReturnValue({ year: 2000, week: 1 }),
      },
    } as unknown as jest.Mocked<RootStore>;
    characterStore = new CharacterStore({ root: mockRootStore });
  });

  test("initialization", () => {
    expect(characterStore.characters).toEqual([]);
    expect(characterStore.independentChildren).toEqual([]);
  });

  test("addCharacter", () => {
    const character = new Character({ root: mockRootStore } as any);
    characterStore.addCharacter(character);
    expect(characterStore.characters).toContain(character);
  });

  test("removeCharacter", () => {
    const character = new Character({ id: "123", root: mockRootStore } as any);
    characterStore.addCharacter(character);
    characterStore.removeCharacter("123");
    expect(characterStore.characters).not.toContain(character);
  });

  test("createIndependantChild", () => {
    characterStore.createIndependantChild();
    expect(characterStore.independentChildren.length).toBe(1);
  });

  test("adopt", () => {
    characterStore.createIndependantChild();
    characterStore.createIndependantChild();
    const child = characterStore.independentChildren[0];
    const partner = new Character({ root: mockRootStore } as any);

    mockRootStore.playerState = { adopt: jest.fn() } as any;

    characterStore.adopt({ child, partner });

    expect(characterStore.independentChildren).not.toContain(child);
    expect(mockRootStore.playerState?.adopt).toHaveBeenCalledWith({
      child,
      partner,
    });
  });

  // Add more tests for other methods...
});
