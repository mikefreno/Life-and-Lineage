import React, { useState, useEffect } from "react";
import { Pressable, Animated, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text } from "./Themed";
import { useRootStore } from "../hooks/stores";
import { useStyles } from "../hooks/styles";

interface CodexCategoryProps {
  category: string;
  scrolling: boolean;
}

export default function CodexCategory({
  category,
  scrolling,
}: CodexCategoryProps) {
  const [animationTriggered, setAnimationtriggered] = useState(false);
  const animatedValue = useState(new Animated.Value(0))[0];
  const { uiStore } = useRootStore();
  const styles = useStyles();

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: animationTriggered ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      if (animationTriggered) {
        setAnimationtriggered(false);
      }
    });
  }, [animationTriggered]);

  const handlePressOut = () => {
    setAnimationtriggered(true);
    setTimeout(() => {
      router.push(`/Options/Codex/${category}`);
    }, 150);
  };

  const chevronAnimatedStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 20],
        }),
      },
    ],
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  return (
    <Pressable
      key={category}
      style={{ width: "100%" }}
      onPressOut={() => {
        if (!scrolling) {
          handlePressOut();
        }
      }}
    >
      {({ pressed }) => (
        <View
          style={[styles.categoryContainer, { opacity: pressed ? 0.5 : 1 }]}
        >
          <View style={styles.categoryContent}>
            <Text style={styles.xl}>{category}</Text>
            <Animated.View style={chevronAnimatedStyle}>
              <Entypo
                name="chevron-thin-right"
                size={24}
                color={uiStore.colorScheme == "dark" ? "white" : "black"}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            </Animated.View>
          </View>
        </View>
      )}
    </Pressable>
  );
}
