import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface FadeOutTextProps {
  className?: string;
  text?: string;
  duration?: number;
  animationCycler?: number; //dummy prop to re-trigger animation
}

export default function FadeOutText({
  className,
  text,
  duration = 3000,
  animationCycler,
}: FadeOutTextProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(1);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }, [text, fadeAnim, duration, animationCycler]);

  return (
    <Animated.Text
      className={className}
      style={{
        opacity: fadeAnim,
      }}
    >
      {text}
    </Animated.Text>
  );
}
