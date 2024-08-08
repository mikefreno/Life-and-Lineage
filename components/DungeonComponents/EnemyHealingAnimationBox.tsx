import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Animated } from "react-native";
import { Easing } from "react-native-reanimated";
import PlusIcon from "../../assets/icons/PlusIcon";
import { DungeonContext } from "./DungeonContext";

const HealingIcon = ({ delay = 0 }) => {
  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateAnim, {
            toValue: -700,
            duration: 4000,
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
  const dungeonData = useContext(DungeonContext);
  if (!dungeonData) throw new Error("missing context");
  const { firstLoad } = dungeonData;
  const [opacityAnim, setOpacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!firstLoad) {
      const newAnim = new Animated.Value(1);
      setOpacityAnim(newAnim);
      Animated.timing(newAnim, {
        toValue: 0,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.out(Easing.poly(5)),
      }).start();
    }
  }, [showHealAnimationDummy]);

  return (
    <Animated.View style={{ opacity: opacityAnim }}>
      <View style={{ height: 120, overflow: "hidden" }} className="-mt-[10vh]">
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            width: 192,
            height: 192,
            position: "absolute",
            top: 0,
          }}
        >
          {Array.from({ length: 6 * 4 }).map((_, i) => (
            <HealingIcon key={i} delay={i * 75} />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};
