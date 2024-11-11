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

  it("should properly handle login with email credentials", async () => {
    const mockCreds = {
      token: "mock-token",
      email: "test@example.com",
      provider: "email" as const,
    };

    await authStore.login(mockCreds);

    expect(storage.set).toHaveBeenCalledWith("userToken", "mock-token");
    expect(storage.set).toHaveBeenCalledWith("userEmail", "test@example.com");
    expect(storage.set).toHaveBeenCalledWith("authProvider", "email");
    expect(authStore.getEmail()).toBe("test@example.com");
    expect(authStore.isAuthenticated).toBe(true);
  });

  it("should properly handle logout", async () => {
    await authStore.logout();

    expect(storage.delete).toHaveBeenCalledWith("userToken");
    expect(storage.delete).toHaveBeenCalledWith("userEmail");
    expect(storage.delete).toHaveBeenCalledWith("authProvider");
    expect(storage.delete).toHaveBeenCalledWith("appleUser");
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.getEmail()).toBeNull();
  });

  it("should properly format dates", () => {
    const testDate = new Date("2024-01-01T12:30:45");
    const formattedDate = authStore["formatDate"](testDate);
    expect(formattedDate).toBe("2024-01-01 12:30:45");
  });

  it("should correctly identify argument types", () => {
    expect(authStore["argCheck"]("123")).toBe("integer");
    expect(authStore["argCheck"]("123.45")).toBe("float");
    expect(authStore["argCheck"]("data:image/png;base64,abc")).toBe("blob");
    expect(authStore["argCheck"]("null")).toBe("null");
    expect(authStore["argCheck"]("regular text")).toBe("text");
  });

  it("should properly build database arguments", () => {
    const args = ["123", "test", "3.14"];
    const built = authStore["argBuilder"](args);

    expect(built).toEqual([
      { type: "integer", value: "123" },
      { type: "text", value: "test" },
      { type: "float", value: "3.14" },
    ]);
  });

  it("should handle database URL generation", () => {
    authStore["db_name"] = "test-db";
    const url = authStore.getDbURL();
    expect(url).toBe("https://test-db-mikefreno.turso.io/v2/pipeline");

    authStore["db_name"] = null;
    const nullUrl = authStore.getDbURL();
    expect(nullUrl).toBeUndefined();
  });

  it("should convert HTTP response save rows correctly", () => {
    const mockRows = [
      [
        { value: "1" },
        { value: "save1" },
        { value: "{}" },
        { value: "{}" },
        { value: "2024-01-01 12:00:00" },
        { value: "2024-01-01 12:00:00" },
      ],
    ];

    const converted = authStore["convertHTTPResponseSaveRow"](mockRows);

    expect(converted).toEqual([
      {
        id: 1,
        name: "save1",
        game_state: "{}",
        player_state: "{}",
        created_at: "2024-01-01 12:00:00",
        last_updated_at: "2024-01-01 12:00:00",
      },
    ]);
  });

  it("should handle database credential setting", () => {
    authStore.setDBCredentials("test-db", "test-token");

    expect(authStore["db_name"]).toBe("test-db");
    expect(authStore["db_token"]).toBe("test-token");
  });

  it("should validate tokens correctly", async () => {
    const validToken = generateMockJWT();
    const isValid = await authStore.validateToken(validToken);
    expect(isValid).toBe(true);

    const expiredToken = jwt.sign(
      { exp: Math.floor(Date.now() / 1000) - 3600 },
      "your_secret_key",
    );
    const isInvalid = await authStore.validateToken(expiredToken);
    expect(isInvalid).toBe(false);
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
