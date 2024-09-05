import { Text, View as ThemedView } from "../../components/Themed";
import SpellDetails from "../../components/SpellDetails";
import { useContext } from "react";
import { useColorScheme } from "nativewind";
import { View, ScrollView } from "react-native";
import { observer } from "mobx-react-lite";
import ProgressBar from "../../components/ProgressBar";
import { elementalColorMap } from "../../utility/elementColors";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import { toTitleCase } from "../../utility/functions/misc/words";
import { Element, MasteryLevel, TutorialOption } from "../../utility/types";
import {
  convertMasteryToNumber,
  convertMasteryToString,
} from "../../utility/spellHelper";
import { AppContext } from "../_layout";

const SpellsScreen = observer(() => {
  const appData = useContext(AppContext);
  const { colorScheme } = useColorScheme();
  const isFocused = useIsFocused();

  if (!appData) throw new Error("missing contexts");

  const { isCompact, playerState, gameState } = appData;

  function magicProficiencySection(
    proficiencies:
      | {
          school: Element;
          proficiency: number;
        }[]
      | undefined,
  ) {
    if (!proficiencies) return;
    return (
      <ScrollView
        className="w-full"
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {proficiencies.map((magicProficiency, idx) => {
          const color = elementalColorMap[magicProficiency.school];
          return (
            <View className="my-4 px-8 flex w-full flex-col" key={idx}>
              <Text
                style={{
                  color:
                    magicProficiency.school == "air" && colorScheme == "light"
                      ? "#71717a"
                      : color.dark,
                }}
              >
                {`${toTitleCase(magicProficiency.school)} (${toTitleCase(
                  playerState?.currentMasteryLevel(
                    magicProficiency.school,
                    true,
                  ) as string,
                )})`}
              </Text>
              <ProgressBar
                value={magicProficiency.proficiency}
                minValue={
                  convertMasteryToNumber[
                    playerState?.currentMasteryLevel(
                      magicProficiency.school,
                    ) as MasteryLevel
                  ]
                }
                maxValue={
                  convertMasteryToNumber[
                    ((playerState?.currentMasteryLevel(
                      magicProficiency.school,
                    ) as MasteryLevel) + 1) as MasteryLevel
                  ]
                }
                unfilledColor={color.light}
                filledColor={color.dark}
                borderColor={color.dark}
              />
              <Text
                className="mx-auto text-sm"
                style={{
                  color:
                    magicProficiency.school == "air" && colorScheme == "light"
                      ? "#71717a"
                      : color.dark,
                }}
              >
                Progression to{" "}
                {
                  convertMasteryToString[
                    ((playerState?.currentMasteryLevel(
                      magicProficiency.school,
                    ) as MasteryLevel) + 1) as MasteryLevel
                  ]
                }
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <>
      <TutorialModal
        isVisibleCondition={
          (!gameState?.tutorialsShown.spell &&
            gameState?.tutorialsEnabled &&
            isFocused) ??
          false
        }
        tutorial={TutorialOption.spell}
        pageOne={{
          title: "Magic Tab",
          body: "Here you can see your known spells, and proficiencies with each school of magic.",
        }}
        pageTwo={{
          title: "More powerful spells require higher proficiencies",
          body: "Using spells will increase your proficiency in their school.",
        }}
      />
      <ThemedView
        className="flex-1"
        style={{
          paddingTop: useHeaderHeight(),
          paddingBottom: useBottomTabBarHeight() + (isCompact ? 0 : 28),
        }}
      >
        <View className="flex-1 pt-4 justify-evenly px-4">
          {playerState?.spells && playerState.spells.length > 0 ? (
            <ScrollView className="h-1/2">
              {playerState.spells.map((spell) => (
                <View key={spell.name} className="my-1 mx-auto">
                  <SpellDetails spell={spell} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="h-1/2 items-center justify-center">
              <Text className="text-xl tracking-wide">No Known Spells.</Text>
              <Text className="text-center tracking-wide">
                (Books can be studied on the top right)
              </Text>
            </View>
          )}
          <View className="h-[60%]">
            <GenericStrikeAround>Proficiencies</GenericStrikeAround>
            <View className="flex-1 items-center">
              {magicProficiencySection(playerState?.magicProficiencies)}
            </View>
          </View>
        </View>
      </ThemedView>
    </>
  );
});
export default SpellsScreen;
