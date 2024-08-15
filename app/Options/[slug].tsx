import { Link, Stack, useLocalSearchParams } from "expo-router";
import { View } from "../../components/Themed";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useColorScheme } from "nativewind";
import {
  CombatCodex,
  DungeonCodex,
  GearCodex,
  LaborCodex,
  MagicCodex,
  MonstersCodex,
  PlayerCodex,
  RelationshipsCodex,
  ShopsCodex,
} from "../../components/CodexPages";

const ContextMap: { [key: string]: React.JSX.Element } = {
  Combat: <CombatCodex />,
  Dungeon: <DungeonCodex />,
  Gear: <GearCodex />,
  Labor: <LaborCodex />,
  Magic: <MagicCodex />,
  Monsters: <MonstersCodex />,
  Player: <PlayerCodex />,
  Relationships: <RelationshipsCodex />,
  Shops: <ShopsCodex />,
};

export default function CodexInfo() {
  let { slug } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();

  if (Array.isArray(slug)) {
    slug = slug[0];
  }

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
      <View className="flex-1">{ContextMap[slug]}</View>
    </>
  );
}
