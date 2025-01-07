import React from "react";
import SpellDetails from "../../components/SpellDetails";
import { View, ScrollView } from "react-native";
import { observer } from "mobx-react-lite";
import ProgressBar from "../../components/ProgressBar";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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
import { EXPANDED_PAD } from "../../components/PlayerStatus";
import { useStyles } from "../../hooks/styles";

const SpellsScreen = observer(() => {
  const bottomTab = useBottomTabBarHeight();
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
        <View style={styles.proficiencyContainer} key={idx}>
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

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.spell}
        isFocused={useIsFocused()}
        pageOne={{
          title: "Magic Tab",
          body: "Here you can see your known spells, and proficiencies with each school of magic.",
        }}
        pageTwo={{
          title: "More powerful spells require higher proficiencies",
          body: "Using spells will increase your proficiency in their school.",
        }}
      />
      <View
        style={{
          flex: 1,
          marginTop: header,
          paddingBottom:
            bottomTab + (uiStore.playerStatusIsCompact ? 0 : EXPANDED_PAD),
        }}
      >
        {playerState?.spells && playerState.spells.length > 0 ? (
          <ScrollView contentContainerStyle={{ flex: 1 }}>
            {playerState.spells.map((spell) => (
              <View key={spell.name} style={styles.spellContainer}>
                <SpellDetails spell={spell} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noSpellsContainer}>
            <Text style={[styles.textXl, { letterSpacing: 1 }]}>
              No Known Spells.
            </Text>
            <Text style={{ textAlign: "center", letterSpacing: 1 }}>
              (Books can be studied on the top right)
            </Text>
          </View>
        )}
        <GenericStrikeAround>Proficiencies</GenericStrikeAround>
        <View style={{ flex: 1, alignItems: "center" }}>
          {magicProficiencySection(playerState?.magicProficiencies)}
        </View>
      </View>
    </>
  );
});
export default SpellsScreen;
