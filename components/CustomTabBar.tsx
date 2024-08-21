import React from "react";
import { Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useColorScheme } from "nativewind";
import { StyleSheet } from "react-native";
import PlayerStatus from "./PlayerStatus";
import { LinearGradientBlur } from "./LinearGradientBlur";

const CustomTabBar = React.memo(() => {
  const { colorScheme } = useColorScheme();

  return (
    <>
      <PlayerStatus home hideGold />
      {Platform.OS == "ios" ? (
        <LinearGradientBlur />
      ) : (
        <BlurView
          tint={
            colorScheme == "light" ? "systemMaterial" : "systemMaterialDark"
          }
          intensity={100}
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod={"dimezisBlurView"}
        />
      )}
    </>
  );
});

export default CustomTabBar;
