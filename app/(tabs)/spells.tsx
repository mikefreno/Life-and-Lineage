import SpellDetails from "../../components/SpellDetails";
import { useColorScheme } from "nativewind";
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

const SpellsScreen = observer(() => {
  const { colorScheme } = useColorScheme();

  const bottomTab = useBottomTabBarHeight();
  const header = useHeaderHeight();
  const { playerState, uiStore } = useRootStore();

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
        <View className="my-2 px-8 flex w-full flex-col" key={idx}>
          <Text
            style={{
              color:
                magicProficiency.school == Element.air && colorScheme == "light"
                  ? "#71717a"
                  : magicProficiency.school == Element.assassination
                  ? colorScheme == "dark"
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
            className="mx-auto text-sm"
            style={{
              color:
                magicProficiency.school == Element.air && colorScheme == "light"
                  ? "#71717a"
                  : magicProficiency.school == Element.assassination
                  ? colorScheme == "dark"
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
        className="flex-1"
        style={{
          marginTop: header,
          paddingBottom:
            bottomTab + (uiStore.playerStatusIsCompact ? 0 : EXPANDED_PAD),
        }}
      >
        {playerState?.spells && playerState.spells.length > 0 ? (
          <ScrollView
            contentContainerStyle={{
              flex: 1,
            }}
          >
            {playerState.spells.map((spell) => (
              <View key={spell.name} className="my-1 mx-auto">
                <SpellDetails spell={spell} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-xl tracking-wide">No Known Spells.</Text>
            <Text className="text-center tracking-wide">
              (Books can be studied on the top right)
            </Text>
          </View>
        )}
        <GenericStrikeAround>Proficiencies</GenericStrikeAround>
        <View className="flex-1 items-center">
          {magicProficiencySection(playerState?.magicProficiencies)}
        </View>
      </View>
    </>
  );
});
export default SpellsScreen;
