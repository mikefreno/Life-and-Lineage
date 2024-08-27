import React, { useState, useRef, useEffect } from "react";
import { View, Animated, Easing } from "react-native";
import { rollD20 } from "../utility/functions/roll";
import { D20SVG } from "../assets/icons/SVGIcons";
import { Text } from "./Themed";

interface D20DieAnimationProps {
  keepRolling?: boolean;
  size?: number;
}

export const D20DieAnimation = ({
  keepRolling = false,
  size = 220,
}: D20DieAnimationProps) => {
  const [diceValue, setDiceValue] = useState<number | undefined>();
  const spinValue = useRef(new Animated.Value(0)).current;

  const roll = () => {
    spinValue.setValue(0);
    setDiceValue(undefined);
    setTimeout(() => setDiceValue(rollD20()), 750);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      if (keepRolling) {
        setTimeout(() => roll(), 500);
      }
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  const scale = spinValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 1],
  });

  useEffect(() => {
    if (keepRolling) {
      roll();
    }
  }, [keepRolling]);

  return (
    <View className="flex justify-center items-center">
      <Animated.View
        className="justify-center items-center"
        style={{
          transform: [{ rotateZ: spin }, { rotateY: spin }, { scale: scale }],
          height: size,
          width: size,
        }}
      >
        <D20SVG />
        <Text
          className="absolute"
          style={{ paddingTop: size / 24, fontSize: size / 6 }}
        >
          {diceValue ?? ""}
        </Text>
      </Animated.View>
    </View>
  );
};
export default D20DieAnimation;
