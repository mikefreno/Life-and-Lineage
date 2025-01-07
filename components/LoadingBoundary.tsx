import { View, Animated, StyleSheet } from "react-native";
import D20DieAnimation from "./DieRollAnim";
import { useRootStore } from "../hooks/stores";
import { type ReactNode, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useStyles } from "../hooks/styles";

export const LoadingBoundary = observer(
  ({ children }: { children: ReactNode }) => {
    const { uiStore } = useRootStore();
    const fadeAnim = useRef(
      new Animated.Value(uiStore.isLoading ? 1 : 0),
    ).current;

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: uiStore.isLoading ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [uiStore.isLoading]);

    return (
      <View style={{ flex: 1 }}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity: fadeAnim,
            zIndex: uiStore.isLoading ? 1 : 0,
          }}
          pointerEvents={uiStore.isLoading ? "auto" : "none"}
        >
          <View
            style={{
              paddingHorizontal: 64,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1, justifyContent: "space-evenly" }}>
              <D20DieAnimation
                keepRolling={true}
                slowRoll={true}
                showNumber={false}
              />
            </View>
          </View>
        </Animated.View>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          }}
        >
          {children}
        </Animated.View>
      </View>
    );
  },
);
