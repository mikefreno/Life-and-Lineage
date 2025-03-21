import React from "react";
import { Href, Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import {
  CombatCodex,
  DungeonCodex,
  GearCodex,
  LaborCodex,
  MagicCodex,
  PlayerCodex,
  RelationshipsCodex,
} from "@/components/CodexPages";
import {
  AirCodex,
  ArcaneCodex,
  AssassinationCodex,
  BeastMasteryCodex,
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
  RangerCodex,
  SummoningCodex,
  VengeanceCodex,
  WaterCodex,
} from "@/components/CodexSecondaries";
import { toTitleCase } from "@/utility/functions/misc";
import { useEffect, useState } from "react";
import { useRootStore } from "@/hooks/stores";

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
  Summoner: <SummoningCodex />,
  Paladin: <PaladinCodex />,
  Vengeance: <VengeanceCodex />,
  Protection: <ProtectionCodex />,
  Holy: <HolyCodex />,
  Ranger: <RangerCodex />,
  Assassination: <AssassinationCodex />,
  "Beast Mastery": <BeastMasteryCodex />,
  Arcane: <ArcaneCodex />,
};

export default function CodexInfo() {
  let { slug } = useLocalSearchParams();
  const { uiStore } = useRootStore();

  const [history, setHistory] = useState<Href[]>([]);
  let category: string;
  let secondary: string | undefined = undefined;
  const router = useRouter();

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
        return [...prev, currentPath as Href];
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
                  color={Colors[uiStore.colorScheme as "light" | "dark"].tint}
                  style={{ marginLeft: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
          title: `${secondary ? secondary : category} Codex`,
        }}
      />
      {secondary ? (
        <View style={{ flex: 1 }}>{SecondaryMap[toTitleCase(secondary)]}</View>
      ) : (
        <View style={{ flex: 1 }}>{CategoryMap[toTitleCase(category)]}</View>
      )}
    </>
  );
}
