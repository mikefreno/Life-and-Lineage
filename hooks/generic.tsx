import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { useRootStore } from "./stores";
import { useLootState } from "../stores/DungeonData";
import type { Item } from "../entities/item";

export const useVibration = () => {
  const { uiStore } = useRootStore();
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
      (uiStore.vibrationEnabled == "full" ||
        (uiStore.vibrationEnabled == "minimal" && essential)) &&
      (platform === "android" || platform === "ios")
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
