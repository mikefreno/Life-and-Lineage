import React from "react";
import LaborTask from "@/components/LaborTask";
import { View, ScrollView } from "react-native";
import { useMemo, useState } from "react";
import { toTitleCase } from "@/utility/functions/misc";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "@/components/TutorialModal";
import { useHeaderHeight } from "@react-navigation/elements";
import { TutorialOption } from "@/utility/types";
import { observer } from "mobx-react-lite";
import { Text } from "@/components/Themed";
import GenericModal from "@/components/GenericModal";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import GenericFlatButton from "@/components/GenericFlatButton";
import { useStyles } from "@/hooks/styles";

const LaborScreen = observer(() => {
  const { playerState, uiStore } = useRootStore();
  const [showingRejection, setShowingRejection] = useState<boolean>(false);
  const [missingPreReqs, setMissingPreReqs] = useState<string[]>([]);
  const styles = useStyles();
  const router = useRouter();

  const vibration = useVibration();

  function applyToJob(title: string) {
    if (playerState) {
      const found = playerState.jobs.get(title);
      if (!found) throw new Error("Missing job is playerState.jobs!");
      const res = playerState.missingPreReqs(found.qualifications);
      if (res) {
        setMissingPreReqs(res);
        setShowingRejection(true);
      } else {
        playerState.setJob(title);
      }
    }
  }

  const sortedJobs = useMemo(() => {
    if (!playerState?.jobs) return [];
    return Array.from(playerState.jobs).sort(
      ([, jobA], [, jobB]) => jobA.reward.gold - jobB.reward.gold,
    );
  }, [playerState?.jobs]);

  const headerHeight = useHeaderHeight();
  const isFocused = useIsFocused();

  if (playerState) {
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
          <View style={{ alignItems: "center" }}>
            <Text style={styles["text-3xl"]}>Rejected!</Text>
            <Text style={styles.rejectionModalText}>
              You are missing the following qualifications:
            </Text>
            {missingPreReqs.map((missing) => (
              <Text key={missing} style={styles["text-2xl"]}>
                {toTitleCase(missing)}
              </Text>
            ))}
          </View>
          <GenericFlatButton
            onPress={() => {
              vibration({ style: "light" });
              setTimeout(() => {
                setShowingRejection(false);
              }, 300);
              router.push("/Education");
            }}
          >
            Gain Qualifications
          </GenericFlatButton>
        </GenericModal>
        <ScrollView
          contentContainerStyle={{
            paddingTop: headerHeight,
            paddingBottom: uiStore.bottomBarHeight,
            width: "90%",
            marginHorizontal: "auto",
            ...styles.notchAvoidingLanscapeMargin,
          }}
          scrollIndicatorInsets={{ top: 48, right: 0, left: 0, bottom: 48 }}
        >
          {sortedJobs.map(([key, jobData]) => (
            <LaborTask
              key={key}
              title={jobData.title}
              reward={jobData.reward.gold}
              cost={jobData.cost}
              experienceToPromote={jobData.experienceToPromote}
              applyToJob={applyToJob}
              focused={isFocused}
              vibration={vibration}
            />
          ))}
        </ScrollView>
      </>
    );
  }
});

export default LaborScreen;
