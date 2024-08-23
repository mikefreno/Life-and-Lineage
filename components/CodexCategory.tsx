import React, { useState, useEffect } from "react";
import { Text } from "./Themed";
import { Pressable, Animated, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";

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

  const { colorScheme } = useColorScheme();

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
      className="w-full"
      onPressOut={() => {
        if (!scrolling) {
          handlePressOut();
        }
      }}
    >
      {({ pressed }) => (
        <View
          className="mx-2 my-6 w-full border-b-[0.5px] border-zinc-700 py-2 dark:border-zinc-100"
          style={{ maxWidth: 512, opacity: pressed ? 0.5 : 1 }}
        >
          <View className="flex flex-row justify-between px-2">
            <Text className="my-auto text-xl">{category}</Text>
            <Animated.View style={chevronAnimatedStyle}>
              <Entypo
                name="chevron-thin-right"
                size={24}
                color={colorScheme == "dark" ? "white" : "black"}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            </Animated.View>
          </View>
        </View>
      )}
    </Pressable>
  );
}
