import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "../../../components/Themed";
import { useEffect, useState } from "react";
import CodexCategory from "../../../components/CodexCategory";
import { useColorScheme } from "nativewind";
import { CodexEntry, searchCodex } from "../../../utility/codex";
import { router } from "expo-router";
import ThemedCard from "../../../components/ThemedCard";

const categories = [
  "Player",
  "Relationships",
  "Labor",
  "Combat",
  "Magic",
  "Gear",
];

export default function Codex() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<CodexEntry[]>([]);
  const { colorScheme } = useColorScheme();
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const results = searchCodex(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  return (
    <View className="flex-1">
      <Text className="mx-auto pt-12 text-center text-2xl">
        {`Welcome to the Codex.\nHere you will find information to every part of the game`}
      </Text>
      <TextInput
        className="mx-16 my-6 rounded border border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
        placeholderTextColor={colorScheme == "light" ? "#d4d4d8" : "#71717a"}
        onChangeText={setSearchTerm}
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
        {searchTerm ? (
          // Show search results
          <View>
            {searchResults.map((result) => (
              <ThemedCard>
                <TouchableOpacity
                  key={result.id}
                  onPress={() => {
                    router.push(result.route);
                  }}
                >
                  <Text className="text-xl">{result.title}</Text>
                  <Text className="text-lg" numberOfLines={1}>
                    {result.content}
                  </Text>
                  <Text className="text-sm">{result.category}</Text>
                </TouchableOpacity>
              </ThemedCard>
            ))}
          </View>
        ) : (
          <View className="flex items-center">
            {categories.map((category) => (
              <CodexCategory
                key={category}
                category={category}
                scrolling={scrolling}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
