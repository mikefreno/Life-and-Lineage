import { useEffect, useRef, useState } from "react";
import { Animated, type ColorValue } from "react-native";
import { Text } from "@/components/Themed";
import React from "react";

const AnimatedText = Animated.createAnimatedComponent(Text);

const AnimatedButtonText = ({
  currentText,
  disabled,
  textColor,
  styles,
  onLayout,
  textSize = "md",
}: {
  currentText: string;
  disabled: boolean;
  textColor?: ColorValue;
  styles: any;
  onLayout?: (event: any) => void;
  textSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}) => {
  const [displayText, setDisplayText] = useState(currentText);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (displayText !== currentText) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 5,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDisplayText(currentText);
        translateY.setValue(-5);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [currentText]);

  return (
    <AnimatedText
      onLayout={onLayout}
      style={[
        styles.flatButtonText,
        styles[`text-${textSize}`],
        disabled ? { color: "#d4d4d8" } : textColor ? { color: textColor } : {},
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {displayText}
    </AnimatedText>
  );
};
export default AnimatedButtonText;
