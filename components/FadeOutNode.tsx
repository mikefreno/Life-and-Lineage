import React, { type ReactNode, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { DEFAULT_FADEOUT_TIME } from "@/components/Themed";
import { type ViewStyle } from "react-native";

interface FadeOutChildProps {
  children: ReactNode;
  style?: ViewStyle;
  duration?: number;
  clearingFunction?: () => void;
  animationCycler?: number;
  animateWidth?: boolean;
  initialWidth?: number;
}

const FadeOutNode = React.memo(
  ({
    style,
    duration = DEFAULT_FADEOUT_TIME,
    children,
    clearingFunction,
    animationCycler,
    animateWidth = false,
    initialWidth = 100,
  }: FadeOutChildProps) => {
    const opacity = useSharedValue(1);
    const width = useSharedValue(initialWidth);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        width: animateWidth ? `${width.value}%` : undefined,
        overflow: animateWidth ? "hidden" : undefined,
      };
    });

    useEffect(() => {
      opacity.value = 1;
      if (animateWidth) {
        width.value = initialWidth;
      }

      opacity.value = withTiming(
        0,
        {
          duration,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished && clearingFunction) {
            runOnJS(clearingFunction)();
          }
        },
      );

      if (animateWidth) {
        width.value = withTiming(0, {
          duration: duration * 0.8,
          easing: Easing.in(Easing.cubic),
        });
      }
    }, [
      opacity,
      width,
      duration,
      clearingFunction,
      animationCycler,
      animateWidth,
      initialWidth,
    ]);

    return (
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    );
  },
);

export default FadeOutNode;
