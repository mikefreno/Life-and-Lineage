import React, { ReactNode, useEffect, useRef } from "react";
import { Animated } from "react-native";

interface FadeOutChildProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  animationCycler?: number; //dummy prop to re-trigger animation
}

export default function FadeOutNode({
  className,
  duration = 2500,
  animationCycler,
  children,
}: FadeOutChildProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(1);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }, [children, fadeAnim, duration, animationCycler]);

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
}
