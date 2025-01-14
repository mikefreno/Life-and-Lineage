import { ReactNode, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useRootStore } from "../hooks/stores";
import { Animated } from "react-native";
import { observer } from "mobx-react-lite";
import D20DieAnimation from "./DieRollAnim";
import ProgressBar from "./ProgressBar";
import Colors from "../constants/Colors";
import { Text } from "./Themed";

export const LoadingBoundary = observer(
  ({ children }: { children: ReactNode }) => {
    const { uiStore } = useRootStore();
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      fadeAnim.setValue(!uiStore.allResourcesLoaded ? 1 : 0);
      Animated.timing(fadeAnim, {
        toValue: !uiStore.allResourcesLoaded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [
      uiStore.allResourcesLoaded,
      uiStore.displayedProgress,
      uiStore.completedLoadingSteps,
      uiStore.totalLoadingSteps,
    ]);

    return (
      <View style={{ flex: 1 }}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity: fadeAnim,
            zIndex: !uiStore.allResourcesLoaded ? 1 : 0,
            backgroundColor: Colors[uiStore.colorScheme].background,
          }}
          pointerEvents={!uiStore.allResourcesLoaded ? "auto" : "none"}
        >
          <View style={styles.container}>
            <View style={styles.contentContainer}>
              <D20DieAnimation
                keepRolling={true}
                slowRoll={true}
                showNumber={false}
              />
              <View style={styles.progressContainer}>
                <ProgressBar
                  value={Math.round(uiStore.displayedProgress)}
                  maxValue={100}
                />
                <Text style={styles.tipText}>{uiStore.getCurrentTip()}</Text>
              </View>
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 32,
  },
  tipText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
  },
});
