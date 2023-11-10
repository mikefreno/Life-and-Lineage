import React from "react";
import { View, Text, Pressable } from "react-native";

interface LearnSpellProps {
  title: string;
  desciption: string;
  proficiencyRequirement: string;
  element: "fire" | "earth" | "air" | "water";
}
const bgColorMap = {
  fire: "#fdba74",
  earth: "#B1A89B",
  air: "#f8fafc",
  water: "#a5f3fc",
};
const buttonColorMap = {
  fire: "#f97316",
  earth: "#937D62",
  air: "#e2e8f0",
  water: "#67e8f9",
};

export default function LearnSpellComponent({
  title,
  desciption,
  element,
}: LearnSpellProps) {
  return (
    <View
      className="mx-2 my-2 flex justify-between rounded-xl px-4 py-2 text-zinc-950"
      style={{ backgroundColor: bgColorMap[element] }}
    >
      <View className="flex flex-row justify-between">
        <Text className="bold my-auto w-1/3 text-xl dark:text-zinc-50">
          {title}
        </Text>
        <Text className="flex w-2/3 flex-wrap font-semibold">{desciption}</Text>
      </View>
      <Pressable className="mx-auto mb-2 mt-4">
        {({ pressed }) => (
          <View
            style={{ backgroundColor: buttonColorMap[element] }}
            className={`my-auto rounded-xl px-8 py-4 ${
              pressed ? "scale-95 opacity-30" : null
            }`}
          >
            <Text className="text-center">Study</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
