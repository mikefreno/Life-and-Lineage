import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { easeGradient } from "react-native-easing-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { View, StyleSheet } from "react-native";

export function LinearGradientBlur() {
  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: "transparent" },
      0.25: { color: "rgba(0,0,0,0.99)" },
      1: { color: "black" },
    },
  });

  return (
    <View style={{ height: "100%", width: "100%" }}>
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
        <BlurView intensity={100} style={StyleSheet.absoluteFill} />
      </MaskedView>
    </View>
  );
}
