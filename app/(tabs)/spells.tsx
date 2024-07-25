import { Text, View as ThemedView } from "../../components/Themed";
import SpellDetails from "../../components/SpellDetails";
import {
  GameContext,
  PlayerCharacterContext,
  PlayerStatusCompactContext,
} from "../_layout";
import { useContext, useEffect, useState } from "react";
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
import { MasteryLevel } from "../../utility/types";
import {
  convertMasteryToNumber,
  convertMasteryToString,
} from "../../utility/spellHelper";

const SpellsScreen = observer(() => {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  const playerStatusCompact = useContext(PlayerStatusCompactContext);

  const { colorScheme } = useColorScheme();
  const isFocused = useIsFocused();

  if (!playerCharacterData || !gameData || !playerStatusCompact)
    throw new Error("missing contexts");

  const { isCompact } = playerStatusCompact;
  const { playerState } = playerCharacterData;
  const { gameState } = gameData;
  const [spells, setSpells] = useState(playerState?.getSpells());
  const [showSpellTutorial, setShowSpellTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("spell")) ?? false,
  );

  useEffect(() => {
    setSpells(playerState?.getSpells());
  }, [playerState?.knownSpells]);

  useEffect(() => {
    if (!showSpellTutorial && gameState) {
      gameState.updateTutorialState("spell", true);
    }
  }, [showSpellTutorial]);

  function magicProficiencySection(
    proficiencies:
      | {
          school: string;
          proficiency: number;
        }[]
      | undefined,
  ) {
    if (!proficiencies) return;
    return (
      <View className="w-full">
        <ScrollView>
          {proficiencies.map((magicProficiency, idx) => {
            const color =
              elementalColorMap[
                magicProficiency.school as
                  | "fire"
                  | "water"
                  | "air"
                  | "earth"
                  | "blood"
                  | "summoning"
                  | "pestilence"
                  | "bone"
                  | "holy"
                  | "vengeance"
                  | "protection"
              ];
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
      </View>
    );
  }

  return (
    <>
      <TutorialModal
        isVisibleCondition={
          (showSpellTutorial && gameState?.tutorialsEnabled && isFocused) ??
          false
        }
        backFunction={() => setShowSpellTutorial(false)}
        pageOne={{
          title: "Magic Tab",
          body: "Here you can see your known spells, and proficiencies with each school of magic.",
        }}
        pageTwo={{
          title: "More powerful spells require higher proficiencies",
          body: "Using spells will increase your proficiency in their school.",
        }}
        onCloseFunction={() => setShowSpellTutorial(false)}
      />
      {/*<View
        style={{
          marginTop: useHeaderHeight() / 2,
          height: useHeaderHeight() * 0.5,
          backgroundColor: playerState
            ? elementalColorMap[playerState.blessing].dark
            : undefined,
          opacity: Platform.OS == "android" ? 1.0 : 0.5,
        }}
      />*/}
      <ThemedView
        className="flex-1"
        style={{
          paddingTop: useHeaderHeight(),
          paddingBottom: useBottomTabBarHeight() + (isCompact ? 0 : 28),
        }}
      >
        <View className="flex-1 pt-4 justify-evenly px-4">
          {spells && spells.length > 0 ? (
            <ScrollView className="h-1/2">
              {spells.map((spell) => (
                <View key={spell.name} className="my-1">
                  <SpellDetails spell={spell} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="h-1/2 items-center justify-center">
              <Text className="text-xl italic tracking-wide">
                No Known Spells.
              </Text>
              <Text className="text-center italic tracking-wide">
                (Books can be studied on the top right)
              </Text>
            </View>
          )}
          <View className="min-h-[280]">
            <GenericStrikeAround text={"Proficiencies"} />
            <View className="flex items-center">
              {magicProficiencySection(playerState?.magicProficiencies)}
            </View>
          </View>
        </View>
      </ThemedView>
    </>
  );
});
export default SpellsScreen;
