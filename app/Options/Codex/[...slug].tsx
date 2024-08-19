import { Link, Stack, useLocalSearchParams } from "expo-router";
import { View } from "../../../components/Themed";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
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
} from "../../../components/CodexPages";
import {
  Air,
  Blood,
  Bones,
  Earth,
  Fire,
  Mage,
  Necromancer,
  Pestilence,
  Summoner,
  Water,
} from "../../../components/CodexSecondaries";
import { useEffect } from "react";
import { toTitleCase } from "../../../utility/functions/misc/words";

const CategoryMap: { [key: string]: React.JSX.Element } = {
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

const SecondaryMap: { [key: string]: React.JSX.Element } = {
  Mage: <Mage />,
  Water: <Water />,
  Fire: <Fire />,
  Earth: <Earth />,
  Air: <Air />,
  Necromancer: <Necromancer />,
  Blood: <Blood />,
  Pestilence: <Pestilence />,
  Bones: <Bones />,
  Summoner: <Summoner />,
};

export default function CodexInfo() {
  let { slug } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  let category: string;
  let secondary: string | undefined = undefined;

  if (Array.isArray(slug)) {
    category = slug[0];
    secondary = slug[1];
  } else {
    category = slug;
  }

  useEffect(() => console.log(secondary), [secondary]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Link
              href={
                secondary
                  ? `/Options/Codex/${toTitleCase(category)}`
                  : "/Options/Codex"
              }
              asChild
            >
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
          title: `${secondary ? secondary : category} Codex`,
        }}
      />
      {secondary ? (
        <View className="flex-1">{SecondaryMap[toTitleCase(category)]}</View>
      ) : (
        <View className="flex-1">{CategoryMap[toTitleCase(category)]}</View>
      )}
    </>
  );
}
