import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { easeGradient } from "react-native-easing-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { View, StyleSheet, Platform, ViewStyle } from "react-native";

export function LinearGradientBlur({
  intensity = 50,
  style,
}: {
  intensity?: number;
  style?: ViewStyle;
}) {
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
            locations={locations}
            colors={colors}
            style={StyleSheet.absoluteFill}
          />
        }
        style={[StyleSheet.absoluteFill]}
      >
        {Platform.OS == "ios" ? (
          <BlurView intensity={intensity} style={StyleSheet.absoluteFill} />
        ) : (
          <BlurView intensity={100} style={StyleSheet.absoluteFill}>
            <View
              style={StyleSheet.absoluteFill}
              className="bg-zinc-100 dark:bg-zinc-800/90"
            ></View>
          </BlurView>
        )}
      </MaskedView>
    </View>
  );
}
