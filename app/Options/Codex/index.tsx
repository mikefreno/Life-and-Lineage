import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "../../../components/Themed";
import { useEffect, useState } from "react";
import CodexCategory from "../../../components/CodexCategory";
import { useRouter } from "expo-router";
import ThemedCard from "../../../components/ThemedCard";
import { CodexEntry, searchCodex } from "../../../utility/functions/codex";
import { useRootStore } from "../../../hooks/stores";
import { useStyles } from "../../../hooks/styles";

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
  const [scrolling, setScrolling] = useState(false);
  const { uiStore } = useRootStore();
  const styles = useStyles();
  const router = useRouter();

  useEffect(() => {
    if (searchTerm) {
      const results = searchCodex(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          marginHorizontal: "auto",
          paddingTop: 48,
          textAlign: "center",
          ...styles["text-2xl"],
        }}
      >
        {`Welcome to the Codex.\nHere you will find information to every part of the game`}
      </Text>
      <TextInput
        style={[
          styles.codexInput,
          {
            fontSize: 20,
            color: uiStore.colorScheme == "light" ? "#09090b" : "#fafafa",
          },
        ]}
        placeholderTextColor={
          uiStore.colorScheme == "light" ? "#d4d4d8" : "#71717a"
        }
        onChangeText={setSearchTerm}
        placeholder={"Search Codex"}
        autoCorrect={false}
        value={searchTerm}
        maxLength={16}
      />

      <ScrollView
        style={{ marginHorizontal: 16 }}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => setScrolling(true)}
        onScrollEndDrag={() => setScrolling(false)}
      >
        {searchTerm ? (
          <View>
            {searchResults.map((result) => (
              <ThemedCard key={result.id}>
                <TouchableOpacity
                  onPress={() => {
                    router.push(result.route);
                  }}
                >
                  <Text style={styles["text-xl"]}>{result.title}</Text>
                  <Text style={styles["text-lg"]} numberOfLines={1}>
                    {result.content}
                  </Text>
                  <Text style={{ fontSize: 14, lineHeight: 20 }}>
                    {result.category}
                  </Text>
                </TouchableOpacity>
              </ThemedCard>
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: "column", alignItems: "center" }}>
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
