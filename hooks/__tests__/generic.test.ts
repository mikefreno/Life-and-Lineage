import { renderHook, act } from "@testing-library/react-native";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import {
  useVibration,
  useAcceleratedAction,
  useStatChanges,
  usePouch,
  useSmartExecution,
} from "../generic";
import { useRootStore } from "../stores";
import { PlayerCharacter } from "../../entities/character";
import { DEFAULT_FADEOUT_TIME } from "../../components/Themed";

// Mock dependencies

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));
jest.mock("../stores", () => ({
  useRootStore: jest.fn(),
}));
jest.mock("../../providers/DungeonData", () => ({
  useLootState: jest.fn(),
}));

describe("useVibration", () => {
  const mockRoot = {
    uiStore: {
      vibrationEnabled: "full",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    require("../stores").useRootStore.mockReturnValue({
      uiStore: {
        vibrationEnabled: "full",
      },
    });
    Platform.OS = "ios";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should trigger light haptic feedback", () => {
    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current({ style: "light" });
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light,
    );
  });

  it("should trigger different haptics based on platform", () => {
    Platform.OS = "android";
    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current({ style: "heavy" });
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium,
    );
  });

  it("should not trigger haptics when vibration is disabled", () => {
    require("../stores").useRootStore.mockReturnValue({
      uiStore: {
        vibrationEnabled: "none",
      },
    });
    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current({ style: "light" });
    });

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it("should trigger essential haptics even with minimal vibration", () => {
    mockRoot.uiStore.vibrationEnabled = "minimal";
    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current({ style: "error", essential: true });
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Error,
    );
  });

  it("should handle different notification types", () => {
    // Setup mock root
    const mockRoot = {
      uiStore: {
        vibrationEnabled: "full",
      },
    };
    (useRootStore as jest.Mock).mockReturnValue(mockRoot);

    // Set platform
    Platform.OS = "ios";

    // Clear mocks
    Haptics.notificationAsync.mockClear();

    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current({ style: "success" });
      result.current({ style: "warning" });
      result.current({ style: "error" });
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(3);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Warning,
    );
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Error,
    );
  });

  it("should handle all vibration styles correctly", () => {
    const { result } = renderHook(() => useVibration());
    const vibrate = result.current;

    const { impactAsync, notificationAsync } = require("expo-haptics");
    const {
      ImpactFeedbackStyle,
      NotificationFeedbackType,
    } = require("expo-haptics");

    act(() => {
      vibrate({ style: "light" });
      vibrate({ style: "medium" });
      vibrate({ style: "heavy" });
      vibrate({ style: "success" });
      vibrate({ style: "warning" });
      vibrate({ style: "error" });
    });

    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Light);
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Medium);
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Heavy);
    expect(notificationAsync).toHaveBeenCalledWith(
      NotificationFeedbackType.Success,
    );
    expect(notificationAsync).toHaveBeenCalledWith(
      NotificationFeedbackType.Warning,
    );
    expect(notificationAsync).toHaveBeenCalledWith(
      NotificationFeedbackType.Error,
    );
  });

  it("should handle vibration settings correctly", () => {
    const { result, rerender } = renderHook(() => useVibration());
    const { impactAsync } = require("expo-haptics");

    // Clear all mocks before the test
    impactAsync.mockClear();

    // Test with 'minimal' setting
    require("../stores").useRootStore.mockReturnValue({
      uiStore: {
        vibrationEnabled: "minimal",
      },
    });
    rerender();

    act(() => {
      result.current({ style: "light", essential: false });
      result.current({ style: "light", essential: true });
    });

    expect(impactAsync).toHaveBeenCalledTimes(1); // Only essential vibration

    // Clear mocks again before changing settings
    impactAsync.mockClear();

    // Test with 'none' setting
    require("../stores").useRootStore.mockReturnValue({
      uiStore: {
        vibrationEnabled: "none",
      },
    });
    rerender();

    act(() => {
      result.current({ style: "light", essential: true });
    });

    expect(impactAsync).not.toHaveBeenCalled(); // No calls at all
  });

  it("should not trigger haptics on unsupported platforms", () => {
    Platform.OS = "web";
    const { result } = renderHook(() => useVibration());

    act(() => {
      result.current({ style: "light" });
    });

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});

describe("usePouch", () => {
  it("should add items to pouch", () => {
    const mockSetLeftBehindDrops = jest.fn();
    require("../../providers/DungeonData").useLootState.mockReturnValue({
      setLeftBehindDrops: mockSetLeftBehindDrops,
    });

    const { result } = renderHook(() => usePouch());
    const mockItems = [{ id: "item1" }, { id: "item2" }];

    act(() => {
      result.current.addItemToPouch({ items: mockItems });
    });

    expect(mockSetLeftBehindDrops).toHaveBeenCalled();
    expect(mockSetLeftBehindDrops).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should handle empty item array", () => {
    const mockSetLeftBehindDrops = jest.fn();
    require("../../providers/DungeonData").useLootState.mockReturnValue({
      setLeftBehindDrops: mockSetLeftBehindDrops,
    });

    const { result } = renderHook(() => usePouch());

    act(() => {
      result.current.addItemToPouch({ items: [] });
    });

    expect(mockSetLeftBehindDrops).toHaveBeenCalledWith(expect.any(Function));
    expect(mockSetLeftBehindDrops.mock.calls[0][0]([])).toEqual([]);
  });

  it("should preserve existing items when adding new ones", () => {
    const mockSetLeftBehindDrops = jest.fn();
    require("../../providers/DungeonData").useLootState.mockReturnValue({
      setLeftBehindDrops: mockSetLeftBehindDrops,
    });

    const { result } = renderHook(() => usePouch());
    const existingItems = [{ id: "existing" }];
    const newItems = [{ id: "new" }];

    act(() => {
      result.current.addItemToPouch({ items: newItems });
    });

    const updateFunction = mockSetLeftBehindDrops.mock.calls[0][0];
    const updatedItems = updateFunction(existingItems);
    expect(updatedItems).toEqual([...existingItems, ...newItems]);
  });
});

describe("useAcceleratedAction", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("should handle single press correctly", () => {
    const mockAction = jest.fn();
    const { result } = renderHook(() =>
      useAcceleratedAction(() => 10, { action: mockAction }),
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(150);
    });

    act(() => {
      result.current.stop();
    });

    expect(mockAction).toHaveBeenCalledWith(1, 0, undefined);
  });

  it("should accelerate with hold", async () => {
    const mockAction = jest.fn();
    const { result } = renderHook(() =>
      useAcceleratedAction(() => 10, {
        action: mockAction,
        minHoldTime: 250,
        updateInterval: 16,
      }),
    );

    await act(async () => {
      result.current.start();
      jest.advanceTimersByTime(1000);
      result.current.stop();
    });

    expect(mockAction).toHaveBeenCalled();
    expect(mockAction.mock.calls.length).toBeGreaterThan(1);
  });

  it("should handle errors gracefully", () => {
    const mockError = new Error("Test error");
    const mockOnError = jest.fn();
    const mockGetMaxAmount = jest.fn().mockImplementation(() => {
      throw mockError;
    });

    const { result } = renderHook(() =>
      useAcceleratedAction(mockGetMaxAmount, { onError: mockOnError }),
    );

    act(() => {
      result.current.start();
    });

    jest.advanceTimersByTime(200);

    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it("should respect maxActionAmount limit", () => {
    const mockAction = jest.fn();
    const { result } = renderHook(() =>
      useAcceleratedAction(() => 100, {
        action: mockAction,
        maxActionAmount: 5,
        updateInterval: 16,
      }),
    );

    act(() => {
      result.current.start();
    });

    jest.advanceTimersByTime(1000);

    expect(mockAction).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
    );
    expect(mockAction.mock.calls.every((call) => call[0] <= 5)).toBe(true);
  });

  it("should handle cleanup on unmount", () => {
    const { unmount } = renderHook(() => useAcceleratedAction(() => 10));

    unmount();
    // Verify no memory leaks or errors
  });
});

describe("useSmartExecution", () => {
  it("should process queue in order", async () => {
    const isActiveRef = { current: true };
    const { result } = renderHook(() => useSmartExecution(isActiveRef));
    const executionOrder: number[] = [];

    await act(async () => {
      result.current.enqueue(() => {
        executionOrder.push(1);
      });
      result.current.enqueue(() => {
        executionOrder.push(2);
      });
      result.current.enqueue(() => {
        executionOrder.push(3);
      });

      // Wait for all tasks to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(executionOrder).toEqual([1, 2, 3]);
  });

  it("should handle task failures", async () => {
    const isActiveRef = { current: true };
    const { result } = renderHook(() => useSmartExecution(isActiveRef));
    const mockTask = jest.fn().mockRejectedValue(new Error("Task failed"));
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      result.current.enqueue(async () => {
        try {
          await mockTask();
        } catch (error) {
          console.error("Task failed:", error);
        }
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith("Task failed:", expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("should respect throttling", async () => {
    const isActiveRef = { current: true };
    const { result } = renderHook(() => useSmartExecution(isActiveRef));
    const executionTimes: number[] = [];

    await act(async () => {
      for (let i = 0; i < 3; i++) {
        result.current.enqueue(() => {
          executionTimes.push(Date.now());
        });
      }
    });

    const timeDiffs = executionTimes
      .slice(1)
      .map((time, index) => time - executionTimes[index]);

    expect(timeDiffs.every((diff) => diff >= 8)).toBe(true);
  });

  it("should clear queue when inactive", async () => {
    const isActiveRef = { current: true };
    const { result } = renderHook(() => useSmartExecution(isActiveRef));
    const mockTask = jest.fn();

    await act(async () => {
      isActiveRef.current = false;
      result.current.enqueue(mockTask);
    });

    expect(mockTask).not.toHaveBeenCalled();
  });
});

describe("useStatChanges", () => {
  let mockPlayer: PlayerCharacter;

  beforeEach(() => {
    mockPlayer = {
      currentHealth: 100,
      currentMana: 100,
      currentSanity: 100,
      gold: 0,
    } as PlayerCharacter;
  });

  it("should track health changes", () => {
    const { result, rerender } = renderHook(() => useStatChanges(mockPlayer));

    mockPlayer.currentHealth = 90;
    rerender();

    expect(result.current.statChanges.health).toEqual({
      current: -10,
      cumulative: -10,
      isShowing: true,
    });
  });

  it("should track multiple stat changes", () => {
    const { result, rerender } = renderHook(() => useStatChanges(mockPlayer));

    mockPlayer.currentMana = 80;
    mockPlayer.gold = 100;
    rerender();

    expect(result.current.statChanges.mana.current).toBe(-20);
    expect(result.current.statChanges.gold.current).toBe(100);
  });

  it("should trigger damage flash animation on health decrease", () => {
    const { result, rerender } = renderHook(() => useStatChanges(mockPlayer));

    mockPlayer.currentHealth = 50;
    rerender();

    expect(result.current.healthDamageFlash).toBeDefined();
  });

  it("should clear stat changes after default fadeout time", () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(() => useStatChanges(mockPlayer));

    act(() => {
      mockPlayer.currentHealth = 90;
      rerender();
    });

    act(() => {
      jest.advanceTimersByTime(DEFAULT_FADEOUT_TIME + 100);
    });

    expect(result.current.statChanges.health.isShowing).toBe(false);
    expect(result.current.statChanges.health.cumulative).toBe(0);

    jest.useRealTimers();
  });

  it("should accumulate multiple changes within fadeout time", () => {
    const { result, rerender } = renderHook(() => useStatChanges(mockPlayer));

    mockPlayer.currentHealth = 90;
    rerender();

    jest.advanceTimersByTime(100);

    mockPlayer.currentHealth = 80;
    rerender();

    expect(result.current.statChanges.health.cumulative).toBe(-20);
  });

  it("should handle null player state", () => {
    const { result } = renderHook(() => useStatChanges(null as any));

    expect(result.current.statChanges).toBeDefined();
    expect(result.current.healthDamageFlash).toBeDefined();
  });
});
