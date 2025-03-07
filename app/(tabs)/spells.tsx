import React, { useMemo } from "react";
import SpellDetails from "../../components/SpellDetails";
import { View, ScrollView } from "react-native";
import { observer } from "mobx-react-lite";
import ProgressBar from "../../components/ProgressBar";
import TutorialModal from "../../components/TutorialModal";
import { useHeaderHeight } from "@react-navigation/elements";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import {
  Element,
  ElementToString,
  MasteryLevel,
  MasteryToBarrier,
  MasteryToString,
  TutorialOption,
} from "../../utility/types";
import { elementalColorMap } from "../../constants/Colors";
import { useIsFocused } from "@react-navigation/native";
import { Text } from "../../components/Themed";
import { useRootStore } from "../../hooks/stores";
import { normalize, useStyles } from "../../hooks/styles";

const SpellsScreen = observer(() => {
  const header = useHeaderHeight();
  const { playerState, uiStore } = useRootStore();
  const styles = useStyles();

  function magicProficiencySection(
    proficiencies:
      | {
          school: Element;
          proficiency: number;
        }[]
      | undefined,
  ) {
    if (!proficiencies || !playerState) return;
    return proficiencies.map((magicProficiency, idx) => {
      const color = elementalColorMap[magicProficiency.school];
      const currentMastery = playerState?.currentMasteryLevel(
        magicProficiency.school,
      );
      const currentMasteryBarrier = MasteryToBarrier[currentMastery];
      const nextMasteryBarrier =
        MasteryToBarrier[(currentMastery + 1) as MasteryLevel];
      return (
        <View style={[styles.proficiencyContainer]} key={idx}>
          <Text
            style={{
              color:
                magicProficiency.school == Element.air &&
                uiStore.colorScheme == "light"
                  ? "#71717a"
                  : magicProficiency.school == Element.assassination
                  ? uiStore.colorScheme == "dark"
                    ? color.light
                    : color.dark
                  : color.dark,
            }}
          >
            {`${ElementToString[magicProficiency.school]} (${
              MasteryToString[currentMastery]
            })`}
          </Text>
          <ProgressBar
            value={magicProficiency.proficiency}
            minValue={currentMasteryBarrier}
            maxValue={nextMasteryBarrier}
            unfilledColor={color.light}
            filledColor={color.dark}
            borderColor={color.dark}
          />
          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              color:
                magicProficiency.school == Element.air &&
                uiStore.colorScheme == "light"
                  ? "#71717a"
                  : magicProficiency.school == Element.assassination
                  ? uiStore.colorScheme == "dark"
                    ? color.light
                    : color.dark
                  : color.dark,
            }}
          >
            Progression to{" "}
            {MasteryToString[(currentMastery + 1) as MasteryLevel]}
          </Text>
        </View>
      );
    });
  }
  const isFocused = useIsFocused();

  const topViewStyle = useMemo(() => {
    return {
      flex: 1,
      marginTop: header + 20,
      marginBottom: uiStore.compactRoutePadding,
    };
  }, [
    uiStore.playerStatusExpandedOnAllRoutes,
    uiStore.playerStatusCompactHeight,
  ]);

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.spell}
        isFocused={isFocused}
        pageOne={{
          title: "Magic Tab",
          body: "Here you can see your known spells, and proficiencies with each school of magic.",
        }}
        pageTwo={{
          title: "More powerful spells require higher proficiencies",
          body: "Using spells will increase your proficiency in their school.",
        }}
      />
      <View style={topViewStyle}>
        {playerState?.spells && playerState.spells.length > 0 ? (
          <>
            <GenericStrikeAround containerStyles={{ paddingHorizontal: 8 }}>
              Known Spells
            </GenericStrikeAround>
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
              }}
            >
              {playerState.spells.map((spell) => (
                <View key={spell.name} style={styles.spellContainer}>
                  <SpellDetails spell={spell} />
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={[styles["text-xl"], { letterSpacing: 1 }]}>
              No Known Spells.
            </Text>
            <Text
              style={[
                styles["text-md"],
                { textAlign: "center", letterSpacing: 1 },
              ]}
            >
              (Books can be studied on the top right)
            </Text>
          </View>
        )}
        <View>
          <GenericStrikeAround containerStyles={{ paddingHorizontal: 8 }}>
            Proficiencies
          </GenericStrikeAround>
          <View
            style={[
              styles.columnEvenly,
              {
                paddingBottom: normalize(12),
              },
            ]}
          >
            {magicProficiencySection(playerState?.magicProficiencies)}
          </View>
        </View>
      </View>
    </>
  );
});
export default SpellsScreen;
