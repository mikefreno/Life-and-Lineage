import { type ReactNode, useRef } from "react";
import { Pressable, Animated, View } from "react-native";
import { ThemedView } from "./Themed";

const AnimatedThemedView = Animated.createAnimatedComponent(View);

export default function GenericAnimatedPressable({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      className="w-full"
    >
      <AnimatedThemedView
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <ThemedView className="w-full rounded-lg shadow-lg items-center p-4">
          {children}
        </ThemedView>
      </AnimatedThemedView>
    </Pressable>
  );
}
