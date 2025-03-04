import { ReactNode, useEffect, useRef, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useRootStore } from "../hooks/stores";
import { Animated } from "react-native";
import { observer } from "mobx-react-lite";
import D20DieAnimation from "./DieRollAnim";
import ProgressBar from "./ProgressBar";
import Colors from "../constants/Colors";
import { Text } from "./Themed";
import { useStyles } from "@/hooks/styles";

export const LoadingBoundary = observer(
  ({ children }: { children: ReactNode }) => {
    const { uiStore } = useRootStore();
    const styles = useStyles();

    const fadeAnim = useRef(
      new Animated.Value(uiStore.allResourcesLoaded ? 0 : 1),
    ).current;

    // Track if this is the first render after mount
    const isInitialMount = useRef(true);

    // Memoize the loading state
    const isLoading = useMemo(
      () => !uiStore.allResourcesLoaded,
      [uiStore.allResourcesLoaded],
    );

    useEffect(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        if (!isLoading) {
          fadeAnim.setValue(0);
        }
        return;
      }

      // Animate the transition
      Animated.timing(fadeAnim, {
        toValue: isLoading ? 1 : 0,
        duration: 350,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }, [isLoading, fadeAnim]);

    // Force an update on fast refresh
    useEffect(() => {
      // This will run on hot reload/fast refresh
      const timeout = setTimeout(() => {
        if (!isLoading && fadeAnim._value !== 0) {
          fadeAnim.setValue(0);
        }
      }, 50);

      return () => clearTimeout(timeout);
    }, []);

    const loadingContent = useMemo(
      () => (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              maxWidth: 400,
              width: "100%",
            }}
          >
            <D20DieAnimation
              keepRolling={true}
              slowRoll={true}
              showNumber={false}
            />
            <View
              style={{
                width: "100%",
                alignItems: "center",
                marginTop: 32,
              }}
            >
              <ProgressBar
                value={Math.round(uiStore.displayedProgress)}
                maxValue={100}
                skipInitialAnimation={false}
              />
              <Text
                style={[
                  {
                    marginTop: 16,
                    textAlign: "center",
                  },
                  styles["text-md"],
                ]}
              >
                {uiStore.getCurrentTip()}
              </Text>
            </View>
          </View>
        </View>
      ),
      [uiStore.displayedProgress, uiStore.getCurrentTip],
    );

    return (
      <View
        style={{
          flex: 1,
          zIndex: 1000,
          backgroundColor: Colors[uiStore.colorScheme].background,
        }}
      >
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity: fadeAnim,
            zIndex: isLoading ? 1 : 0,
            backgroundColor: Colors[uiStore.colorScheme].background,
          }}
          pointerEvents={isLoading ? "auto" : "none"}
        >
          {loadingContent}
        </Animated.View>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            backgroundColor: Colors[uiStore.colorScheme].background,
          }}
        >
          {children}
        </Animated.View>
      </View>
    );
  },
);
