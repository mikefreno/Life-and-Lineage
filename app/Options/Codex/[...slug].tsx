import React, { useMemo } from "react";
import { Href, Stack, useRouter, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import {
  CombatCodex,
  DungeonCodex,
  GearCodex,
  LaborCodex,
  MagicCodex,
  PlayerCodex,
  RelationshipsCodex,
  TimeCodex,
  ConditionsCodex,
  InvestmentsCodex,
  PvPCodex,
  StatsCondex,
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
import { useStyles } from "@/hooks/styles";
import { observer } from "mobx-react-lite";
import { HeaderBackButton } from "@react-navigation/elements";
import { ScrollView } from "react-native-gesture-handler";

const CategoryMap: { [key: string]: React.JSX.Element } = {
  Combat: <CombatCodex />,
  Dungeon: <DungeonCodex />,
  Conditions: <ConditionsCodex />,
  Gear: <GearCodex />,
  Labor: <LaborCodex />,
  Magic: <MagicCodex />,
  Player: <PlayerCodex />,
  Relationships: <RelationshipsCodex />,
  Time: <TimeCodex />,
  Investments: <InvestmentsCodex />,
  Stats: <StatsCondex />,
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

const CodexInfo = observer(() => {
  let { slug } = useLocalSearchParams();
  const { uiStore } = useRootStore();
  const styles = useStyles();

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

  const codexPageTopStyling = useMemo(() => {
    return {
      flex: 1,
      padding: 8,
      ...styles.notchMirroredLanscapePad,
    };
  }, [uiStore.orientation, uiStore.insets]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <HeaderBackButton
              onPress={handleBack}
              tintColor={Colors[uiStore.colorScheme].tint}
              displayMode="minimal"
              style={{ marginLeft: 8 }}
            />
          ),
          title: `${secondary ? secondary : category} Codex`,
        }}
      />
      {secondary ? (
        <ScrollView
          style={codexPageTopStyling}
          contentContainerStyle={[styles.mx2, styles.pb8]}
        >
          {SecondaryMap[toTitleCase(secondary)]}
        </ScrollView>
      ) : (
        <ScrollView
          style={codexPageTopStyling}
          contentContainerStyle={[styles.mx2, styles.pb8]}
        >
          {CategoryMap[toTitleCase(category)]}
        </ScrollView>
      )}
    </>
  );
});
export default CodexInfo;
