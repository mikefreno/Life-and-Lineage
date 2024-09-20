import { authStore } from "./authStore";
import NetInfo from "@react-native-community/netinfo";
import { storage } from "../utility/functions/save_load";
import { PlayerCharacter } from "../classes/character";
import { Game } from "../classes/game";

describe("AuthStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize network info and set isConnected", async () => {
    const mockState = { isConnected: true };
    (NetInfo.fetch as jest.Mock).mockResolvedValue(mockState);

    await authStore.initializeNetInfo();

    expect(authStore.isConnected).toBe(true);
  });

  it("should return early in initializeAuth when not connected", async () => {
    authStore.setIsConnected(false);

    await authStore.initializeAuth();

    expect(storage.getString).not.toHaveBeenCalled();
  });

  it("should throw an error when trying to get remote saves while offline", async () => {
    authStore.setIsConnected(false);

    await expect(authStore.getRemoteSaves()).rejects.toThrow(
      "Device is offline",
    );
  });

  it("should correctly set isConnectedAndInitialized", () => {
    authStore.setIsConnected(true);
    authStore.setIsInitialized(true);

    expect(authStore.isConnectedAndInitialized).toBe(true);

    authStore.setIsConnected(false);
    expect(authStore.isConnectedAndInitialized).toBe(false);

    authStore.setIsConnected(true);
    authStore.setIsInitialized(false);
    expect(authStore.isConnectedAndInitialized).toBe(false);
  });

  it("should initialize auth when network status changes to connected", async () => {
    const mockState = { isConnected: true };
    (NetInfo.addEventListener as jest.Mock).mockImplementationOnce(
      (callback) => {
        callback(mockState);
        return jest.fn();
      },
    );

    await authStore.initializeNetInfo();

    expect(authStore.isConnected).toBe(true);
    expect(storage.getString).toHaveBeenCalled();
  });
  it("should throw an error when trying to make remote save while offline", async () => {
    authStore.setIsConnected(false);

    const mockPlayerState = {} as PlayerCharacter;
    const mockGameState = {} as Game;

    await expect(
      authStore.makeRemoteSave({
        name: "testSave",
        playerState: mockPlayerState,
        gameState: mockGameState,
      }),
    ).rejects.toThrow("Device is offline");
  });

  it("should throw an error when trying to overwrite remote save while offline", async () => {
    authStore.setIsConnected(false);

    const mockPlayerState = {} as PlayerCharacter;
    const mockGameState = {} as Game;

    await expect(
      authStore.overwriteRemoteSave({
        name: "testSave",
        id: 1,
        playerState: mockPlayerState,
        gameState: mockGameState,
      }),
    ).rejects.toThrow("Device is offline");
  });
});
