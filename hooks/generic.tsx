import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "./stores";
import { useLootState } from "../stores/DungeonData";
import type { Item } from "../entities/item";

export const useVibration = () => {
  const gameState = useGameStore();
  /**
   * requires a `style` for the vibration, `essential`(optional) is a signal for if the user has set in-app vibrations to 'minimal', defaults to false
   */
  const vibrate = ({
    style,
    essential = false,
  }: {
    style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
    essential?: boolean;
  }) => {
    const platform = Platform.OS;

    if (
      (gameState &&
        (gameState.vibrationEnabled == "full" ||
          (gameState.vibrationEnabled == "minimal" && essential)) &&
        (platform === "android" || platform === "ios")) ||
      (!gameState && platform == "ios")
    ) {
      switch (style) {
        case "light":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          if (platform == "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          break;
        case "heavy":
          if (platform == "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          break;
        case "success":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case "warning":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case "error":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    }
  };

  // Return vibration function from Hook
  return vibrate;
};

export const usePouch = () => {
  const { setLeftBehindDrops } = useLootState();

  const addItemToPouch = useCallback(({ items }: { items: Item[] }) => {
    setLeftBehindDrops((prev) => [...prev, ...items]);
  }, []);

  return { addItemToPouch };
};

export const useBattleLogger = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const battleLogger = useCallback((whatHappened: string) => {
    const timeOfLog = new Date().toLocaleTimeString();
    const log = `${timeOfLog}: ${whatHappened}`;
    setLogs((prev) => [...prev, log]);
  }, []);

  useEffect(() => {
    if (logs.length > 100) {
      setLogs((prev) => prev.slice(-100));
    }
  }, [logs]);

  return {
    logs,
    battleLogger,
  };
};
