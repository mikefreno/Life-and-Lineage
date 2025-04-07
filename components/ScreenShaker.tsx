import { useRootStore } from "@/hooks/stores";
import React, {
  useRef,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { Animated } from "react-native";

export const ScreenShaker = ({ children }: { children: ReactNode }) => {
  const { dungeonStore } = useRootStore();
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const [isShaking, setIsShaking] = useState(false);

  const { xOutputRange, yOutputRange } = useMemo(() => {
    const xRange = [0];
    const yRange = [0];

    for (let i = 1; i < 100; i++) {
      const xOffset = Math.sin(i * 0.5) * 10;
      const yOffset = Math.cos(i * 0.7) * 5;

      xRange.push(xOffset);
      yRange.push(yOffset);
    }

    return { xOutputRange: xRange, yOutputRange: yRange };
  }, []);

  const shakeScreen = useCallback(
    (duration = 500) => {
      if (isShaking) return;

      setIsShaking(true);

      const numShakes = Math.floor(duration / 50);
      const shakeSequence = [];

      shakeAnimation.setValue(0);

      shakeSequence.push(
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      );

      for (let i = 0; i < numShakes; i++) {
        shakeSequence.push(
          Animated.timing(shakeAnimation, {
            toValue: i + 1,
            duration: 50,
            useNativeDriver: true,
          }),
        );
      }

      shakeSequence.push(
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      );

      Animated.sequence(shakeSequence).start(() => {
        setIsShaking(false);
        shakeAnimation.setValue(0);
      });
    },
    [isShaking, shakeAnimation],
  );

  const translateX = shakeAnimation.interpolate({
    inputRange: Array.from({ length: 100 }, (_, i) => i),
    outputRange: xOutputRange,
    extrapolate: "clamp",
  });

  const translateY = shakeAnimation.interpolate({
    inputRange: Array.from({ length: 100 }, (_, i) => i),
    outputRange: yOutputRange,
    extrapolate: "clamp",
  });

  useEffect(() => {
    dungeonStore.screenShaker = shakeScreen;

    return () => {
      dungeonStore.screenShaker = null;
    };
  }, [shakeScreen, dungeonStore]);

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ translateX }, { translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
};
