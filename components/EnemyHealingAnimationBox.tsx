import React, { useEffect, useRef, useState } from "react";
import PlusIcon from "../assets/icons/PlusIcon";
import { View, Animated } from "react-native";
import { Easing } from "react-native-reanimated";

const HealingIcon = ({ delay = 0 }) => {
  const translateAnim = useRef(new Animated.Value(320)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateAnim, {
            toValue: -320,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        height: 48,
        width: 48,
        opacity: opacityAnim,
        transform: [{ translateY: translateAnim }],
      }}
    >
      <PlusIcon width={24} height={24} />
    </Animated.View>
  );
};

interface EnemyHealingAnimationBoxProps {
  showHealAnimationDummy: number;
}

export const EnemyHealingAnimationBox = ({
  showHealAnimationDummy,
}: EnemyHealingAnimationBoxProps) => {
  const [opacityAnim, setOpacityAnim] = useState(new Animated.Value(0));
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  useEffect(() => {
    if (!firstLoad) {
      const newAnim = new Animated.Value(1);
      setOpacityAnim(newAnim);
      Animated.timing(newAnim, {
        toValue: 0,
        duration: 5000,
        useNativeDriver: true,
        easing: Easing.out(Easing.poly(5)),
      }).start();
    } else {
      setFirstLoad(false);
    }
  }, [showHealAnimationDummy]);

  return (
    <Animated.View
      style={{ opacity: opacityAnim }}
      className="absolute right-52 mt-32"
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          width: 192,
          position: "absolute",
        }}
      >
        {Array.from({ length: 6 * 4 }).map((_, i) => (
          <HealingIcon key={i} delay={i * 75} />
        ))}
      </View>
    </Animated.View>
  );
};
