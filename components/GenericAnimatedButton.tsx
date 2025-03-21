import { type ReactNode, useRef } from "react";
import { Pressable, Animated, View } from "react-native";
import { ThemedView } from "@/components/Themed";
import { useStyles } from "@/hooks/styles";

const AnimatedThemedView = Animated.createAnimatedComponent(View);

export default function GenericAnimatedPressable({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress?: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const styles = useStyles();

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
      style={{ width: "100%" }}
    >
      <AnimatedThemedView
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <ThemedView style={styles.raisedCard}>{children}</ThemedView>
      </AnimatedThemedView>
    </Pressable>
  );
}
