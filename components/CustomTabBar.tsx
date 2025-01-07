import React from "react";
import { Platform } from "react-native";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import PlayerStatus from "./PlayerStatus";
import { LinearGradientBlur } from "./LinearGradientBlur";
import { useRootStore } from "../hooks/stores";

const CustomTabBar = React.memo(() => {
  const { uiStore } = useRootStore();

  return (
    <>
      <PlayerStatus home hideGold />
      {Platform.OS == "ios" ? (
        <LinearGradientBlur />
      ) : (
        <BlurView
          tint={
            uiStore.colorScheme == "light"
              ? "systemMaterial"
              : "systemMaterialDark"
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
