import { PlayerCharacter } from "../../entities/character";
import { createPlayerCharacter } from "../../utility/functions/characterAid";
import { Element, PlayerClassOptions } from "../../utility/types";
import { RootStore } from "../RootStore";

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(null),
  }),
}));

describe("RootStore", () => {
  let rootStore: RootStore;

  beforeEach(() => {
    rootStore = new RootStore();
    rootStore.setPlayer;
  });

  test("initialization", () => {
    expect(rootStore.playerState).toBeDefined();
    expect(rootStore.time).toBeDefined();
    expect(rootStore.authStore).toBeDefined();
    expect(rootStore.uiStore).toBeDefined();
    expect(rootStore.shopsStore).toBeDefined();
    expect(rootStore.enemyStore).toBeDefined();
    expect(rootStore.dungeonStore).toBeDefined();
    expect(rootStore.characterStore).toBeDefined();
    expect(rootStore.tutorialStore).toBeDefined();
    expect(rootStore.constructed).toBe(true);
  });

  test("gameTick", () => {
    const mockPlayerState = {
      currentSanity: 10,
      gameTurnHandler: jest.fn(),
      partners: [],
      class: PlayerClassOptions.mage,
      blessing: Element.fire,
    };
    rootStore.playerState = mockPlayerState as unknown as PlayerCharacter;
    rootStore.time.tick = jest.fn();

    rootStore.gameTick();

    expect(rootStore.time.tick).toHaveBeenCalled();
    expect(mockPlayerState.gameTurnHandler).toHaveBeenCalled();
  });

  test("inheritance", () => {
    rootStore.dungeonStore.dungeonInstances = [
      { levels: [{ bossDefeated: true }, { bossDefeated: false }] },
      { levels: [{ bossDefeated: true }, { bossDefeated: true }] },
    ] as any;

    expect(rootStore.inheritance()).toBe(9);
  });

  test("newGame", () => {
    const player = createPlayerCharacter({
      root: rootStore,
      firstName: "test",
      lastName: "player",
      blessingSelection: Element.fire,
      classSelection: PlayerClassOptions.mage,
      sex: "male",
    });
    rootStore.newGame(player);

    expect(rootStore.playerState).toBe(player);
    expect(rootStore.atDeathScreen).toBe(false);
  });

  test("hitDeathScreen and clearDeathScreen", () => {
    rootStore.hitDeathScreen();
    expect(rootStore.atDeathScreen).toBe(true);

    rootStore.clearDeathScreen();
    expect(rootStore.atDeathScreen).toBe(false);
  });
});
