import { useContext } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { AppContext } from "../app/_layout";

export interface VibrateProps {
  style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
  essential?: boolean;
}

export const useVibration = () => {
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { gameState } = appData;

  const vibrate = ({ style, essential }: VibrateProps) => {
    const platform = Platform.OS;

    if (
      gameState &&
      (gameState.vibrationEnabled == "full" ||
        (gameState.vibrationEnabled == "minimal" && essential)) &&
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
