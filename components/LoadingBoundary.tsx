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

    const isInitialMount = useRef(true);
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      Animated.timing(fadeAnim, {
        toValue: isLoading ? 1 : 0,
        duration: 350,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
    }, [isLoading, fadeAnim]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (!isLoading && fadeAnim._value !== 0) {
          fadeAnim.setValue(0);
        }
      }, 50);

      return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
      if (isLoading) {
        // Set a timeout to log the loading status if it takes longer than 10 seconds
        loadingTimeoutRef.current = setTimeout(() => {
          console.warn(
            "Loading taking longer than expected. Current loading status:",
            JSON.stringify(uiStore.storeLoadingStatus, null, 2),
          );
        }, 5000);
      } else {
        // Clear the timeout if loading completes
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      }

      return () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
      };
    }, [isLoading, uiStore.storeLoadingStatus]);

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
