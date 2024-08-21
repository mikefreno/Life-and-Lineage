import { Href, Stack, router, useLocalSearchParams } from "expo-router";
import { View as ThemedView } from "../../../components/Themed";
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
  PlayerCodex,
  RelationshipsCodex,
} from "../../../components/CodexPages";
import {
  AirCodex,
  BloodCodex,
  BoneCodex,
  EarthCodex,
  FireCodex,
  HolyCodex,
  MageCodex,
  NecromancerCodex,
  PaladinCodex,
  PestilenceCodex,
  ProtectionCodex,
  SummonerCodex,
  VengeanceCodex,
  WaterCodex,
} from "../../../components/CodexSecondaries";
import { toTitleCase } from "../../../utility/functions/misc/words";
import { useEffect, useState } from "react";

const CategoryMap: { [key: string]: React.JSX.Element } = {
  Combat: <CombatCodex />,
  Dungeon: <DungeonCodex />,
  Gear: <GearCodex />,
  Labor: <LaborCodex />,
  Magic: <MagicCodex />,
  Player: <PlayerCodex />,
  Relationships: <RelationshipsCodex />,
};

const SecondaryMap: { [key: string]: React.JSX.Element } = {
  Mage: <MageCodex />,
  Water: <WaterCodex />,
  Fire: <FireCodex />,
  Earth: <EarthCodex />,
  Air: <AirCodex />,
  Necromancer: <NecromancerCodex />,
  Blood: <BloodCodex />,
  Pestilence: <PestilenceCodex />,
  Bone: <BoneCodex />,
  Summoner: <SummonerCodex />,
  Paladin: <PaladinCodex />,
  Vengeance: <VengeanceCodex />,
  Protection: <ProtectionCodex />,
  Holy: <HolyCodex />,
};

export default function CodexInfo() {
  let { slug } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();

  const [history, setHistory] = useState<Href<string>[]>([]);
  let category: string;
  let secondary: string | undefined = undefined;

  if (Array.isArray(slug)) {
    category = slug[0];
    secondary = slug[1];
  } else {
    category = slug;
  }

  useEffect(() => {
    const currentPath = secondary
      ? `/Options/Codex/${category}/${secondary}`
      : `/Options/Codex/${category}`;

    setHistory((prev) => {
      if (prev[prev.length - 1] !== currentPath) {
        return [...prev, currentPath as Href<string>];
      }
      return prev;
    });
  }, [category, secondary]);

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      router.push(previousPage);
    } else {
      setHistory([]);
      router.push("/Options/Codex");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={handleBack}>
              {({ pressed }) => (
                <Ionicons
                  name={"chevron-back"}
                  size={36}
                  color={Colors[colorScheme as "light" | "dark"].tint}
                  style={{ marginLeft: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
          title: `${secondary ? secondary : category} Codex`,
        }}
      />
      {secondary ? (
        <ThemedView className="flex-1">
          {SecondaryMap[toTitleCase(secondary)]}
        </ThemedView>
      ) : (
        <ThemedView className="flex-1">
          {CategoryMap[toTitleCase(category)]}
        </ThemedView>
      )}
    </>
  );
}
