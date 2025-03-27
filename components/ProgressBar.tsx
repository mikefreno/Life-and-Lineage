import React, { useEffect, useRef } from "react";
import { View, Platform, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Text } from "@/components/Themed";
import { useStyles } from "@/hooks/styles";
import { useScaling } from "@/hooks/scaling";

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
  skipInitialAnimation?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
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
  skipInitialAnimation = true,
  containerStyle = undefined,
}: ProgressBarProps) => {
  const width = useSharedValue(0);
  const styles = useStyles();
  const isFirstRender = useRef(true);
  const { getNormalizedLineSize } = useScaling();

  useEffect(() => {
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    const adjustedWidth = !removeAtZero && percentage < 8 ? 8 : percentage;

    if (isFirstRender.current && skipInitialAnimation) {
      width.value = adjustedWidth;
      isFirstRender.current = false;
    } else {
      width.value = withTiming(adjustedWidth, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [value, minValue, maxValue, removeAtZero, animationDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value}%`,
    };
  });

  return (
    <View
      style={[
        {
          backgroundColor: unfilledColor,
          borderColor: borderColor,
          borderWidth: borderColor ? 1 : 0,
          width: "100%",
          borderRadius: 50,
          height: getNormalizedLineSize(14),
        },
        containerStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            backgroundColor: filledColor,
            position: "absolute",
            marginTop: Platform.OS == "android" ? -0.1 : 0,
            marginLeft: Platform.OS == "android" ? -0.1 : 0,
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 50,
          },
          animatedStyle,
        ]}
      >
        {displayNumber && (
          <View
            style={{
              marginHorizontal: "auto",
              flex: 1,
              flexWrap: "wrap",
              overflow: "visible",
            }}
          >
            <Text
              style={{
                marginTop: borderColor ? -2 : -1,
                color: textColor,
                ...styles["text-sm"],
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
