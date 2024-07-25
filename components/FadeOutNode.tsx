import React, { type ReactNode, useEffect, useRef } from "react";
import { Animated } from "react-native";
import { DEFAULT_FADEOUT_TIME } from "./Themed";

interface FadeOutChildProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  clearingFunction?: () => void;
  animationCycler?: number; //dummy prop to re-trigger animation
}

const FadeOutNode = React.memo(
  ({
    className,
    duration = DEFAULT_FADEOUT_TIME,
    children,
    clearingFunction,
    animationCycler,
  }: FadeOutChildProps) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      fadeAnim.setValue(1);

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: duration,
        useNativeDriver: true,
      }).start(clearingFunction);
    }, [fadeAnim, duration, clearingFunction, animationCycler]);

    return (
      <Animated.View
        className={className}
        style={{
          opacity: fadeAnim,
        }}
      >
        {children}
      </Animated.View>
    );
  },
);
export default FadeOutNode;
