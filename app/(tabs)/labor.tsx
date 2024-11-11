import jobs from "../../assets/json/jobs.json";
import LaborTask from "../../components/LaborTask";
import { View, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { toTitleCase } from "../../utility/functions/misc";
import { router } from "expo-router";
import { useVibration } from "../../utility/customHooks";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { TutorialOption } from "../../utility/types";
import { observer } from "mobx-react-lite";
import { Text } from "../../components/Themed";
import { useGameState, useLayout } from "../../stores/AppData";
import GenericModal from "../../components/GenericModal";
import { EXPANDED_PAD } from "../../components/PlayerStatus";

const EarnScreen = observer(() => {
  const { playerState } = useGameState();
  const { isCompact } = useLayout();
  const [showingRejection, setShowingRejection] = useState<boolean>(false);
  const [missingPreReqs, setMissingPreReqs] = useState<string[]>([]);

  const vibration = useVibration();

  function applyToJob(title: string) {
    if (playerState) {
      const found = jobs.find((job) => job.title == title);
      if (!found) throw new Error("Missing job is JSON!");
      const res = playerState.missingPreReqs(found.qualifications);
      if (res) {
        setMissingPreReqs(res);
        setShowingRejection(true);
      } else {
        playerState.setJob(title);
      }
    }
  }
  const headerHeight = useHeaderHeight();
  const bottomBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.labor}
        isFocused={isFocused}
        pageOne={{
          title: "Labor Tab",
          body: "Come here to earn gold in a (mostly) safe way. Certain jobs have qualifications which you can earn by going to the training school (top left).",
        }}
        pageTwo={{
          title: "There are other options to earn gold.",
          body: "If you have a stockpile, you can invest to earn passively (top right). And the dungeon, which is far more dangerous than any job, but promises great riches.",
        }}
      />
      <GenericModal
        isVisibleCondition={showingRejection}
        backFunction={() => setShowingRejection(false)}
      >
        <View className="flex items-center">
          <Text className="text-3xl">Rejected!</Text>
          <Text className="my-6 text-center text-lg">
            You are missing the following qualifications:
          </Text>
          {missingPreReqs.map((missing) => (
            <Text key={missing} className="py-1 text-lg">
              {toTitleCase(missing)}
            </Text>
          ))}
        </View>
        <View className="mt-4 flex items-center justify-evenly">
          <Pressable
            onPress={() => {
              vibration({ style: "light" });
              setTimeout(() => {
                setShowingRejection(false);
              }, 300);
              router.push("/Training");
            }}
            className="rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text className="text-lg">Gain Qualifications</Text>
          </Pressable>
        </View>
      </GenericModal>
      <View>
        <ScrollView
          scrollIndicatorInsets={{ top: 48, right: 0, left: 0, bottom: 48 }}
        >
          <View
            className="px-2"
            style={{
              paddingTop: headerHeight,
              paddingBottom: bottomBarHeight + (isCompact ? 0 : EXPANDED_PAD),
            }}
          >
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
                    focused={isFocused}
                    vibration={vibration}
                  />
                );
              })}
          </View>
        </ScrollView>
      </View>
    </>
  );
});
export default EarnScreen;
