import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import { ThemedView } from "./Themed";
import { useRootStore } from "../hooks/stores";

export default function PlatformDependantBlurView(props) {
  const { uiStore } = useRootStore();
  if (Platform.OS == "ios") {
    return <BlurView {...props} tint={uiStore.colorScheme} />;
  }
  return <ThemedView {...props} />;
}
