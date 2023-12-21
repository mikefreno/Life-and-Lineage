import React, { useState, useEffect } from "react";
import { Text } from "./Themed";
import { Pressable, Animated, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";

interface CodexCategoryProps {
  category: string;
}

export default function CodexCategory({ category }: CodexCategoryProps) {
  const [animationTriggered, setAnimationtriggered] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const animatedValue = useState(new Animated.Value(0))[0];
  const [pressed, setPressed] = useState<boolean>(false);

  const { colorScheme } = useColorScheme();

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: animationTriggered ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      if (animationTriggered && !isPressing) {
        setAnimationtriggered(false);
      }
    });
  }, [animationTriggered, isPressing]);

  const onPressIn = () => {
    setIsPressing(true);
    setAnimationtriggered(true);
  };

  const onPressOut = () => {
    router.push(`/Options/${category}`);
    setIsPressing(false);
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
    <View
      key={category}
      className="mx-2 my-4 w-full border-y-[0.5px] border-zinc-700 py-4 dark:border-zinc-100"
      style={{ maxWidth: 512 }}
    >
      <View className="flex flex-row justify-between px-2">
        <Text
          className="my-auto text-xl"
          style={{ opacity: pressed ? 0.5 : 1 }}
        >
          {category}
        </Text>
        <Pressable
          className="flex w-1/4 items-end justify-end"
          onPressIn={() => {
            setPressed(true);
            onPressIn();
          }}
          onPressOut={() => {
            setPressed(false);
            onPressOut();
          }}
        >
          <Animated.View style={chevronAnimatedStyle}>
            <Entypo
              name="chevron-thin-right"
              size={24}
              color={colorScheme == "dark" ? "white" : "black"}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}
