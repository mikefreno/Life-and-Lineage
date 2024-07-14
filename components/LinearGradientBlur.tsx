import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { easeGradient } from "react-native-easing-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { View, StyleSheet, Platform } from "react-native";
import { useColorScheme } from "nativewind";

export function LinearGradientBlur() {
  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: "transparent" },
      0.25: { color: "rgba(0,0,0,0.99)" },
      1: { color: "black" },
    },
  });

  const { colorScheme } = useColorScheme();
  return (
    <View style={[styles.blurContainer]} pointerEvents="none">
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
        <BlurView
          blurReductionFactor={8}
          tint={
            Platform.OS == "android"
              ? colorScheme == "light"
                ? "light"
                : "dark"
              : "default"
          }
          intensity={100}
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod={"dimezisBlurView"}
        />
      </MaskedView>
    </View>
  );
}
const styles = StyleSheet.create({
  blurContainer: {
    position: "absolute",
    bottom: 0,
    zIndex: 0,
    width: "100%",
    height: "100%",
  },
});
