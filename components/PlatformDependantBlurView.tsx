import { BlurView } from "expo-blur";
import { Platform } from "react-native";
import { View as ThemedView } from "./Themed";

export default function PlatformDependantBlurView(props) {
  if (Platform.OS == "ios") {
    return <BlurView {...props} />;
  }
  return <ThemedView {...props} />;
}
