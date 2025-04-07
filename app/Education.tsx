import React from "react";
import TrainingCard from "@/components/TrainingCard";
import TutorialModal from "@/components/TutorialModal";
import { useIsFocused } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { TutorialOption } from "@/utility/types";
import { ScrollView, View } from "react-native";
import { useRootStore } from "@/hooks/stores";
import { tw, useStyles } from "@/hooks/styles";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";
import { jsonServiceStore } from "@/stores/SingletonSource";

const JobTraining = () => {
  const isFocused = useIsFocused();
  const header = useHeaderHeight();
  const { playerState, uiStore } = useRootStore();
  const styles = useStyles();

  if (!playerState) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <TutorialModal
        isFocused={isFocused}
        tutorial={TutorialOption.training}
        pageOne={{
          title: "Labor Training",
          body: "Here you can gain access to better jobs, just keep a careful eye on your sanity.",
        }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingTop: header,
          paddingBottom: uiStore.playerStatusHeightSecondary,
          ...styles.notchAvoidingLanscapeMargin,
        }}
      >
        <View style={[tw.px2, tw.pt4]}>
          {jsonServiceStore
            .readJsonFileSync("qualifications")
            .map((qual, index) => (
              <TrainingCard
                key={index}
                name={qual.name}
                ticks={qual.ticks}
                sanityCostPerTick={qual.sanityCostPerTick}
                goldCostPerTick={qual.goldCostPerTick}
                preRequisites={qual.prerequisites}
              />
            ))}
        </View>
      </ScrollView>
      <PlayerStatusForSecondary />
    </View>
  );
};
export default JobTraining;
