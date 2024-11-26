import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Text } from "./Themed";

interface ProgressBarProps {
  value: number;
  minValue?: number;
  maxValue: number;
  borderColor?: string;
  filledColor?: string;
  unfilledColor?: string;
  textColor?: string;
  displayNumber?: boolean;
  removeAtZero?: boolean;
  showMax?: boolean;
  animationDuration?: number;
}

const ProgressBar = ({
  value,
  minValue = 0,
  maxValue,
  borderColor,
  filledColor = "#007BFF",
  unfilledColor = "#f3f3f3",
  textColor = "#fff",
  displayNumber = true,
  removeAtZero = false,
  showMax = false,
  animationDuration = 300,
}: ProgressBarProps) => {
  const width = useSharedValue(0);

  useEffect(() => {
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const adjustedWidth = !removeAtZero && percentage < 8 ? 8 : percentage;

    width.value = withTiming(adjustedWidth, {
      duration: animationDuration,
      easing: Easing.out(Easing.ease),
    });
  }, [value, minValue, maxValue, removeAtZero, animationDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value}%`,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: unfilledColor,
          borderColor: borderColor,
          borderWidth: borderColor ? 1 : 0,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.inner,
          {
            backgroundColor: filledColor,
            position: "absolute",
          },
          animatedStyle,
        ]}
      >
        {displayNumber && (
          <View className={`mx-auto flex-1 flex-wrap overflow-visible`}>
            <Text
              style={{
                marginTop: borderColor ? -2 : -1,
                color: textColor,
              }}
            >
              {value}
              {showMax ? ` / ${maxValue}` : ""}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 14,
    borderRadius: 50,
  },
  inner: {
    marginTop: Platform.OS == "android" ? -0.1 : 0,
    marginLeft: Platform.OS == "android" ? -0.1 : 0,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
});
