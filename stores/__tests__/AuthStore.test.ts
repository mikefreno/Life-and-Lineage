import { AuthStore } from "../AuthStore";
import { RootStore } from "../RootStore";
import { storage } from "../../utility/functions/storage";
import NetInfo from "@react-native-community/netinfo";

jest.mock("../../utility/functions/storage");

describe("AuthStore", () => {
  let authStore: AuthStore;
  let mockRootStore: jest.Mocked<RootStore>;

  beforeEach(() => {
    mockRootStore = {} as jest.Mocked<RootStore>;
    authStore = new AuthStore({ root: mockRootStore });
  });

  test("initialization", () => {
    expect(authStore.isConnected).toBe(false);
    expect(authStore.isAuthenticated).toBe(false);
  });

  test("setAuthState", () => {
    authStore.setAuthState("token123", "test@example.com", "email");
    expect(authStore.isAuthenticated).toBe(true);
  });

  test("setDBCredentials", () => {
    authStore.setDBCredentials("dbName", "dbToken");
    expect(authStore.getDbURL()).toBe(
      "https://dbName-mikefreno.turso.io/v2/pipeline",
    );
  });

  test("logout", async () => {
    await authStore.logout();
    expect(authStore.isAuthenticated).toBe(false);
    expect(storage.delete).toHaveBeenCalledWith("userToken");
    expect(storage.delete).toHaveBeenCalledWith("userEmail");
    expect(storage.delete).toHaveBeenCalledWith("authProvider");
    expect(storage.delete).toHaveBeenCalledWith("appleUser");
  });

  test("initializeNetInfo", () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    authStore.initializeNetInfo();
    expect(NetInfo.fetch).toHaveBeenCalled();
  });
});
