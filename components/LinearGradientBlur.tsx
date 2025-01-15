import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { easeGradient } from "react-native-easing-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { View, StyleSheet, Platform, ViewStyle } from "react-native";
import { useRootStore } from "../hooks/stores";

export function LinearGradientBlur({
  intensity = 50,
  style,
}: {
  intensity?: number;
  style?: ViewStyle;
}) {
  const { uiStore } = useRootStore();
  const { colors, locations } = easeGradient(
    Platform.OS == "ios"
      ? {
          colorStops: {
            0: { color: "transparent" },
            0.25: { color: "rgba(0,0,0,0.99)" },
            1: { color: "black" },
          },
        }
      : {
          colorStops: {
            0: { color: "transparent" },
            0.35: { color: "rgba(0,0,0,0.99)" },
            1: { color: "black" },
          },
        },
  );

  return (
    <View style={[{ height: "100%", width: "100%" }, style]}>
      <MaskedView
        maskElement={
          <LinearGradient
            locations={[locations[0], locations[1], ...locations]}
            colors={[colors[0], colors[1], ...colors]}
            style={StyleSheet.absoluteFill}
          />
        }
        style={[StyleSheet.absoluteFill]}
      >
        {Platform.OS == "ios" ? (
          <BlurView
            intensity={intensity}
            style={StyleSheet.absoluteFill}
            tint={uiStore.colorScheme}
          />
        ) : (
          <BlurView
            intensity={100}
            style={StyleSheet.absoluteFill}
            tint={uiStore.colorScheme}
          >
            <View
              style={[
                StyleSheet.absoluteFill,
                uiStore.colorScheme === "dark"
                  ? {
                      backgroundColor: "#f4f4f5",
                    }
                  : {
                      backgroundColor: "rgba(39, 39, 42, 0.9)",
                    },
              ]}
            />
          </BlurView>
        )}
      </MaskedView>
    </View>
  );
}
