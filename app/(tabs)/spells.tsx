import { ScrollView, Text, View } from "../../components/Themed";
import SpellDetails from "../../components/SpellDetails";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { Pressable, StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";
import ProgressBar from "../../components/ProgressBar";
import { elementalColorMap } from "../../utility/elementColors";
import PlayerStatus from "../../components/PlayerStatus";
import Modal from "react-native-modal";
import { Entypo } from "@expo/vector-icons";
import { useVibration } from "../../utility/customHooks";

const SpellsScreen = observer(() => {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameData = useContext(GameContext);
  const { colorScheme } = useColorScheme();
  const vibration = useVibration();

  if (!playerCharacterData || !gameData) throw new Error("missing contexts");

  const { playerState } = playerCharacterData;
  const { gameState } = gameData;
  const [spells, setSpells] = useState(playerState?.getSpells());
  const [showSpellTutorial, setShowSpellTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("spell")) ?? false,
  );
  const [tutorialStep, setTutorialStep] = useState<number>(1);

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
      <Modal
        animationIn="slideInUp"
        animationOut="fadeOut"
        isVisible={showSpellTutorial && gameState?.tutorialsEnabled}
        backdropOpacity={0.2}
        animationInTiming={500}
        onBackdropPress={() => setShowSpellTutorial(false)}
        onBackButtonPress={() => setShowSpellTutorial(false)}
      >
        <View
          className="mx-auto w-5/6 rounded-xl bg-zinc-50 px-6 py-4 dark:bg-zinc-700"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },

            shadowOpacity: 0.25,
            shadowRadius: 5,
          }}
        >
          <View
            className={`flex flex-row ${
              tutorialStep == 2 ? "justify-between" : "justify-end"
            }`}
          >
            {tutorialStep == 2 ? (
              <Pressable onPress={() => setTutorialStep((prev) => prev - 1)}>
                <Entypo
                  name="chevron-left"
                  size={24}
                  color={colorScheme == "dark" ? "#f4f4f5" : "black"}
                />
              </Pressable>
            ) : null}
            <Text>{tutorialStep}/2</Text>
          </View>
          {tutorialStep == 1 ? (
            <>
              <Text className="text-center text-2xl">Magic Tab</Text>
              <Text className="text-center text-lg">
                Here you can see your known spells, and proficiencies with each
                school of magic.
              </Text>
              <Pressable
                onPress={() => setTutorialStep((prev) => prev + 1)}
                className="mx-auto mt-4 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Next</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-center text-xl">
                More powerful spells require higher proficiencies
              </Text>
              <Text className="my-4 text-center text-lg">
                Using spells will increase your proficiency in their school.
              </Text>
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  setShowSpellTutorial(false);
                }}
                className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
      <View className="flex-1">
        <PlayerStatus onTop={true} />
        <Text className="py-8 text-center text-xl tracking-wide">
          Known Spells
        </Text>
        <View className="flex-1 justify-evenly px-4">
          {spells && spells.length > 0 ? (
            <ScrollView className="h-1/2">
              {spells.map((spell) => (
                <SpellDetails spell={spell} key={spell.name} />
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
            <View style={styles.container}>
              <View style={styles.line} />
              <View style={styles.content}>
                <Text className="text-lg">Proficiencies</Text>
              </View>
              <View style={styles.line} />
            </View>
            <View className="flex items-center px-12 pb-4">
              {magicProficiencySection(playerState?.magicProficiencies)}
            </View>
          </View>
        </View>
      </View>
    </>
  );
});
export default SpellsScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
