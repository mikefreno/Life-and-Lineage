import NetInfo from "@react-native-community/netinfo";
import { storage } from "../../utility/functions/storage";
import { authStore } from "../authStore";
import { PlayerCharacter } from "../../classes/character";
import { Game } from "../../classes/game";
import jwt from "jsonwebtoken";
jest.mock("../../utility/functions/storage");

describe("AuthStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockJWT = generateMockJWT();
    (storage.getString as jest.Mock).mockImplementation((key) => {
      switch (key) {
        case "userToken":
          return Promise.resolve(mockJWT);
        case "userEmail":
          return Promise.resolve("mock@email.com");
        case "authProvider":
          return Promise.resolve("email");
        case "appleUser":
          return Promise.resolve(null);
        default:
          return Promise.resolve(null);
      }
    });
  });

  it("should initialize network info and set isConnected", async () => {
    const mockState = { isConnected: true };
    (NetInfo.fetch as jest.Mock).mockResolvedValue(mockState);

    authStore.initializeNetInfo();

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

    authStore.initializeNetInfo();

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

function generateMockJWT() {
  const payload = {
    sub: "1234567890",
    name: "John Doe",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
  };
  return jwt.sign(payload, "your_secret_key");
}
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: generateMockJWT() }),
  }),
) as jest.Mock;
