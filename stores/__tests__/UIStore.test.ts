import UIStore from "../UIStore";
import { RootStore } from "../RootStore";

jest.mock("../../utility/functions/storage");

describe("UIStore", () => {
  let uiStore: UIStore;
  let mockRootStore: jest.Mocked<RootStore>;

  beforeEach(() => {
    mockRootStore = {
      playerState: {
        unAllocatedSkillPoints: 0,
        conditions: [],
      },
    } as unknown as jest.Mocked<RootStore>;
    uiStore = new UIStore({ root: mockRootStore });
  });

  test("initialization", () => {
    expect(uiStore.playerStatusIsCompact).toBe(true);
    expect(uiStore.dimensions).toBeDefined();
    expect(uiStore.itemBlockSize).toBeDefined();
  });

  test("setColorScheme", () => {
    uiStore.setPreferedColorScheme("dark");
    expect(uiStore.colorScheme).toBe("dark");
  });

  test("setReduceMotion", () => {
    uiStore.setReduceMotion(true);
    expect(uiStore.reduceMotion).toBe(true);
  });

  test("modifyVibrationSettings", () => {
    uiStore.modifyVibrationSettings("minimal");
    expect(uiStore.vibrationEnabled).toBe("minimal");
  });

  test("setHealthWarning", () => {
    uiStore.setHealthWarning(0.3);
    expect(uiStore.healthWarning).toBe(0.3);
  });

  test("handleDimensionChange", () => {
    const newDimensions = { width: 400, height: 800 };
    uiStore.handleDimensionChange({ window: newDimensions });
    expect(uiStore.dimensions.width).toBe(400);
    expect(uiStore.dimensions.height).toBe(800);
  });

  // Add more tests for other methods...
});
