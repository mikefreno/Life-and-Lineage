import React, { type ReactNode, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { DEFAULT_FADEOUT_TIME } from "./Themed";

interface FadeOutChildProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  clearingFunction?: () => void;
  animationCycler?: number; // dummy prop to re-trigger animation
}

const FadeOutNode = React.memo(
  ({
    className,
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
      <Animated.View className={className} style={animatedStyle}>
        {children}
      </Animated.View>
    );
  },
);

export default FadeOutNode;
