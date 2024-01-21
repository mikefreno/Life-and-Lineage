import { Link, Stack, useLocalSearchParams } from "expo-router";
import { toTitleCase } from "../../utility/functions/misc";
import { View, Text } from "../../components/Themed";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useColorScheme } from "nativewind";

export default function CodexInfo() {
  const { slug } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Link href={"/Options/codex"} asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name={"chevron-back"}
                    size={36}
                    color={Colors[colorScheme as "light" | "dark"].tint}
                    style={{ marginLeft: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
          title: `${slug} Codex`,
        }}
      />
      <View className="flex-1">
        <Text>{toTitleCase(slug as string)}</Text>
      </View>
    </>
  );
}
