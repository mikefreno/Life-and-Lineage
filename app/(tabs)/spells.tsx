import { ScrollView, Text, View } from "../../components/Themed";
import SpellDetails from "../../components/SpellDetails";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { View as NonThemedView } from "react-native";
import { observer } from "mobx-react-lite";
import ProgressBar from "../../components/ProgressBar";
import { elementalColorMap } from "../../utility/elementColors";
import PlayerStatus from "../../components/PlayerStatus";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import GenericStrikeAround from "../../components/GenericStrikeAround";

const SpellsScreen = observer(() => {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  const { colorScheme } = useColorScheme();
  const isFocused = useIsFocused();

  if (!playerCharacterData || !gameData) throw new Error("missing contexts");

  const { playerState } = playerCharacterData;
  const { gameState } = gameData;
  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );
  const [spells, setSpells] = useState(playerState?.getSpells());
  const [showSpellTutorial, setShowSpellTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("spell")) ?? false,
  );

  useEffect(() => {
    setSpells(playerState?.getSpells());
  }, [playerState?.knownSpells]);

  useEffect(() => {
    setTutorialState(gameState?.tutorialsEnabled ?? true);
  }, [gameState?.tutorialsEnabled]);

  useEffect(() => {
    if (!showSpellTutorial && gameState) {
      gameState.updateTutorialState("spell", true);
    }
  }, [showSpellTutorial]);

  useEffect(() => {
    if (gameState) {
      if (tutorialState == false) {
        gameState.disableTutorials();
      } else {
        gameState.enableTutorials();
      }
    }
  }, [tutorialState]);

  function magicProficiencySection(
    proficiencies:
      | {
          school: string;
          proficiency: number;
        }[]
      | undefined,
  ) {
    if (!proficiencies) return;
    return proficiencies.map((magicProficiency, idx) => {
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
        <View className="my-4 flex w-full flex-col" key={idx}>
          <Text
            className="mx-auto"
            style={{
              color:
                magicProficiency.school == "air" && colorScheme == "light"
                  ? "#71717a"
                  : color.dark,
            }}
          >
            {magicProficiency.school}
          </Text>
          <ProgressBar
            value={magicProficiency.proficiency}
            maxValue={500}
            unfilledColor={color.light}
            filledColor={color.dark}
            borderColor={color.dark}
          />
        </View>
      );
    });
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
      <View
        style={{
          marginTop: useHeaderHeight() / 2,
          height: useHeaderHeight() * 0.5,
          backgroundColor: playerState
            ? elementalColorMap[playerState.blessing].dark
            : undefined,
          opacity: 0.5,
        }}
      />
      <View
        className="flex-1"
        style={{ paddingBottom: useBottomTabBarHeight() + 65 }}
      >
        <Text className="pt-4 text-center text-xl tracking-wide">
          Known Spells
        </Text>
        <View className="flex-1 justify-evenly px-4">
          {spells && spells.length > 0 ? (
            <ScrollView className="h-1/2">
              {spells.map((spell) => (
                <NonThemedView key={spell.name} className="my-1">
                  <SpellDetails spell={spell} />
                </NonThemedView>
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
          <View className="h-1/2">
            <GenericStrikeAround text={"Proficiencies"} />
            <View className="flex items-center px-12 pb-4">
              {magicProficiencySection(playerState?.magicProficiencies)}
            </View>
          </View>
        </View>
      </View>
      <NonThemedView
        className="absolute z-50 w-full"
        style={{ bottom: useBottomTabBarHeight() + 75 }}
      >
        <PlayerStatus />
      </NonThemedView>
    </>
  );
});
export default SpellsScreen;
