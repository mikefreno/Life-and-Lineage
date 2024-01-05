import jobs from "../../assets/json/jobs.json";
import LaborTask from "../../components/LaborTask";
import { ScrollView, View, Text } from "../../components/Themed";
import { View as NonThemedView, Pressable } from "react-native";
import PlayerStatus from "../../components/PlayerStatus";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Modal from "react-native-modal";
import { Entypo, EvilIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { toTitleCase } from "../../utility/functions";
import { router } from "expo-router";
import { useVibration } from "../../utility/customHooks";

const LaborScreen = observer(() => {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  const playerCharacter = playerCharacterData?.playerState;
  const [showingRejection, setShowingRejection] = useState<boolean>(false);
  const [missingPreReqs, setMissingPreReqs] = useState<string[]>([]);

  if (!playerCharacter || !gameContext) {
    throw Error("Missing Context");
  }
  const { gameState } = gameContext;
  const vibration = useVibration();

  const { colorScheme } = useColorScheme();
  const [showLaborTutorial, setShowLaborTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("labor")) ?? false,
  );
  const [tutorialStep, setTutorialStep] = useState<number>(1);

  useEffect(() => {
    if (!showLaborTutorial && gameState) {
      gameState.updateTutorialState("labor", true);
    }
  }, [showLaborTutorial]);

  function applyToJob(title: string) {
    if (playerCharacter) {
      const found = jobs.find((job) => job.title == title);
      if (!found) throw new Error("Missing job is JSON!");
      const res = playerCharacter.missingPreReqs(found.qualifications);
      if (res) {
        setMissingPreReqs(res);
        setShowingRejection(true);
      } else {
        playerCharacter.setJob(title);
      }
    }
  }

  return (
    <>
      <Modal
        animationIn="slideInUp"
        animationOut="fadeOut"
        isVisible={showLaborTutorial && gameState?.tutorialsEnabled}
        backdropOpacity={0.2}
        animationInTiming={500}
        onBackdropPress={() => setShowLaborTutorial(false)}
        onBackButtonPress={() => setShowLaborTutorial(false)}
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
              <Text className="text-center text-2xl">Labor Tab</Text>
              <Text className="my-4 text-center text-lg">
                Come here to earn gold in a (mostly) safe way. Certain jobs have
                qualifications which you can earn by going to the training
                school (top right).
              </Text>
              <Pressable
                onPress={() => setTutorialStep((prev) => prev + 1)}
                className="mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Next</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-center text-xl">
                There is another option to earn gold.
              </Text>
              <Text className="my-4 text-center text-lg">
                The dungeon, is far more dangerous than any job, but promises
                great riches.
              </Text>
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  setShowLaborTutorial(false);
                }}
                className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
      <Modal
        animationIn="slideInUp"
        animationOut="fadeOut"
        isVisible={showingRejection}
        backdropOpacity={0.2}
        animationInTiming={500}
        onBackdropPress={() => setShowingRejection(false)}
        onBackButtonPress={() => setShowingRejection(false)}
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
          <NonThemedView className="-mb-2 mt-2">
            <Pressable
              className="-ml-2"
              onPress={() => {
                setShowingRejection(false);
              }}
            >
              <EvilIcons
                name="close"
                size={32}
                color={colorScheme == "dark" ? "#fafafa" : "#18181b"}
              />
            </Pressable>
          </NonThemedView>
          <NonThemedView className="flex items-center">
            <Text className="text-3xl">Rejected!</Text>
            <Text className="my-6 text-center text-lg">
              You are missing the following qualifications:
            </Text>
            {missingPreReqs.map((missing) => (
              <Text key={missing} className="py-1 text-lg">
                {toTitleCase(missing)}
              </Text>
            ))}
          </NonThemedView>
          <View className="mt-4 flex items-center justify-evenly">
            <Pressable
              onPress={() => {
                router.push("/training");
                setTimeout(() => {
                  setShowingRejection(false);
                }, 300);
              }}
              className="rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text className="text-lg">Gain Qualifications</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View className="flex-1">
        <PlayerStatus displayGoldBottom={true} onTop={true} />
        <ScrollView>
          <View className="px-2 pb-24 pt-4">
            {jobs
              .sort((aJob, bJob) => aJob.reward.gold - bJob.reward.gold)
              .map((Job, index) => {
                return (
                  <LaborTask
                    key={index}
                    title={Job.title}
                    reward={Job.reward.gold}
                    cost={Job.cost}
                    experienceToPromote={Job.experienceToPromote}
                    applyToJob={applyToJob}
                  />
                );
              })}
          </View>
        </ScrollView>
      </View>
    </>
  );
});
export default LaborScreen;
