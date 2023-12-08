import jobs from "../../assets/json/jobs.json";
import LaborTask from "../../components/LaborTask";
import { ScrollView, View, Text } from "../../components/Themed";
import { View as NonThemedView, Pressable } from "react-native";
import PlayerStatus from "../../components/PlayerStatus";
import { PlayerCharacterContext } from "../_layout";
import { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { Modal } from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { toTitleCase } from "../../utility/functions";
import { router } from "expo-router";

const LaborScreen = observer(() => {
  const playerCharacterData = useContext(PlayerCharacterContext);
  const playerCharacter = playerCharacterData?.playerState;
  const [showingRejection, setShowingRejection] = useState<boolean>(false);
  const [missingPreReqs, setMissingPreReqs] = useState<string[]>([]);

  if (!playerCharacter) {
    throw Error("No player character on labor tab");
  }

  const { colorScheme } = useColorScheme();

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
      <View className="flex-1">
        <PlayerStatus displayGoldBottom={true} onTop={true} />
        <Modal
          animationType="slide"
          transparent={true}
          visible={showingRejection}
          onRequestClose={() => setShowingRejection(false)}
        >
          <NonThemedView className="flex-1 items-center justify-center">
            <View
              className=" w-2/3 rounded-xl bg-zinc-50 px-6 py-4 dark:border dark:border-zinc-50 dark:bg-zinc-700"
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
          </NonThemedView>
        </Modal>
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
