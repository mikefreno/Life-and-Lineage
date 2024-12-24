import { SaveStore } from "../SaveStore";
import { RootStore } from "../RootStore";
import { storage } from "../../utility/functions/storage";
import * as SQLite from "expo-sqlite";

jest.mock("expo-sqlite");
jest.mock("../../utility/functions/storage");

describe("SaveStore", () => {
  let saveStore: SaveStore;
  let mockRootStore: jest.Mocked<RootStore>;
  let mockDb: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock database
    mockDb = {
      execAsync: jest.fn().mockResolvedValue(undefined),
    };
    (SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);

    // Mock storage
    (storage.getNumber as jest.Mock).mockReturnValue(null);

    mockRootStore = {
      playerState: {
        age: 25,
        jobs: [],
      },
      time: {
        toCheckpointData: jest.fn(),
        fromCheckpointData: jest.fn(),
      },
      dungeonStore: {
        toCheckpointData: jest.fn(),
        fromCheckpointData: jest.fn(),
        resetVolatileState: jest.fn(),
      },
      characterStore: {
        toCheckpointData: jest.fn(),
        fromCheckpointData: jest.fn(),
      },
      shopsStore: {
        toCheckpointData: jest.fn(),
        fromCheckpointData: jest.fn(),
      },
    } as unknown as jest.Mocked<RootStore>;

    saveStore = new SaveStore({ root: mockRootStore });
  });

  test("initializeDatabase creates database and tables", async () => {
    await saveStore.initializeDatabase();

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith("game_data.db");
    expect(mockDb.execAsync).toHaveBeenCalled();
  });

  test("setCurrentGameID updates currentGameId", () => {
    saveStore.setCurrentGameID(1);
    expect(saveStore.currentGameId).toBe(1);
  });

  test("hydrateCurrentGameId sets game ID from storage", () => {
    (storage.getNumber as jest.Mock).mockReturnValue(5);

    // Create a new instance to trigger hydration
    const newSaveStore = new SaveStore({ root: mockRootStore });

    expect(newSaveStore.currentGameId).toBe(5);
  });
});
