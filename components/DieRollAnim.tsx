import React, { useState, useRef, useEffect } from "react";
import { View, Animated, Easing } from "react-native";
import { Text } from "@/components/Themed";
import { rollD20 } from "@/utility/functions/misc";
import { D20SVG } from "@/assets/icons/SVGIcons";
import { useRootStore } from "@/hooks/stores";
import { observer } from "mobx-react-lite";

interface D20DieAnimationProps {
  keepRolling?: boolean;
  size?: number;
  slowRoll?: boolean;
  showNumber?: boolean;
  replaceNum?: string;
}

const D20DieAnimation = observer(
  ({
    keepRolling = false,
    size = 220,
    slowRoll = false,
    showNumber = false,
    replaceNum,
  }: D20DieAnimationProps) => {
    const [diceValue, setDiceValue] = useState<number | undefined>();
    const spinValue = useRef(new Animated.Value(0)).current;
    const { uiStore } = useRootStore();

    const roll = () => {
      spinValue.setValue(0);
      setDiceValue(undefined);
      setTimeout(() => setDiceValue(rollD20()), 750);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: slowRoll ? 5000 : 2500,
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

    const animatedStyle = uiStore.reduceMotion
      ? { height: size, width: size }
      : {
          transform: slowRoll
            ? [{ rotateY: spin }]
            : [{ rotateY: spin }, { scale: scale }],
          height: size,
          width: size,
        };

    useEffect(() => {
      if (keepRolling) {
        roll();
      }
    }, [keepRolling]);

    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Animated.View
          style={[
            animatedStyle,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <D20SVG />
          {showNumber ? (
            <Text
              style={{
                paddingTop: size / 24,
                fontSize: size / 6,
                position: "absolute",
              }}
            >
              {replaceNum ? replaceNum : diceValue ?? ""}
            </Text>
          ) : null}
        </Animated.View>
      </View>
    );
  },
);

export default D20DieAnimation;
