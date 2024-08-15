import { TextInput } from "react-native";
import { View, Text, ScrollView } from "../../components/Themed";
import { useState } from "react";
import CodexCategory from "../../components/CodexCategory";
import { useColorScheme } from "nativewind";

const categories = [
  "Player",
  "Relationships",
  "Magic",
  "Labor",
  "Dungeon",
  "Combat",
  "Monsters",
  "Gear",
  "Shops",
];

export default function Codex() {
  const [searchTerm, setSearchTerm] = useState<string>();
  const { colorScheme } = useColorScheme();
  const [scrolling, setScrolling] = useState(false);

  return (
    <View className="flex-1">
      <Text className="mx-auto pt-12 text-center text-2xl">
        {`Welcome to the Codex.\nHere you will find information to every part of the game`}
      </Text>
      <TextInput
        className="mx-16 my-6 rounded border border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
        placeholderTextColor={colorScheme == "light" ? "#d4d4d8" : "#71717a"}
        onChangeText={(text) => setSearchTerm(text)}
        placeholder={"Search Codex"}
        autoCorrect={false}
        value={searchTerm}
        maxLength={16}
        style={{
          fontFamily: "PixelifySans",
          paddingVertical: 8,
          minWidth: "50%",
          fontSize: 20,
        }}
      />

      <ScrollView
        className="mx-4"
        scrollEventThrottle={16}
        onScrollBeginDrag={() => setScrolling(true)}
        onScrollEndDrag={() => setScrolling(false)}
      >
        <View className="flex items-center">
          {categories.map((category) => (
            <CodexCategory
              key={category}
              category={category}
              scrolling={scrolling}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
