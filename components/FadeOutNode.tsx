import React, { type ReactNode, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { DEFAULT_FADEOUT_TIME } from "./Themed";
import { type ViewStyle } from "react-native";

interface FadeOutChildProps {
  children: ReactNode;
  style?: ViewStyle;
  duration?: number;
  clearingFunction?: () => void;
  animationCycler?: number; // dummy prop to re-trigger animation
}

const FadeOutNode = React.memo(
  ({
    style,
    duration = DEFAULT_FADEOUT_TIME,
    children,
    clearingFunction,
    animationCycler,
  }: FadeOutChildProps) => {
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
      };
    });

    useEffect(() => {
      opacity.value = 1;

      opacity.value = withTiming(0, { duration }, (finished) => {
        if (finished && clearingFunction) {
          runOnJS(clearingFunction)();
        }
      });
    }, [opacity, duration, clearingFunction, animationCycler]);

    return (
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    );
  },
);

export default FadeOutNode;
