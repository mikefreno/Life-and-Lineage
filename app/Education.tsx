import React from "react";
import qualifications from "../assets/json/qualifications.json";
import TrainingCard from "../components/TrainingCard";
import TutorialModal from "../components/TutorialModal";
import { useIsFocused } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { TutorialOption } from "../utility/types";
import { ScrollView, View } from "react-native";
import { useRootStore } from "../hooks/stores";
import { tw } from "../hooks/styles";
import PlayerStatusForSecondary from "@/components/PlayerStatus/ForSecondary";

const JobTraining = () => {
  const isFocused = useIsFocused();
  const header = useHeaderHeight();
  const { playerState, uiStore } = useRootStore();

  if (!playerState) {
    return null;
  }

  return (
    <>
      <TutorialModal
        isFocused={isFocused}
        tutorial={TutorialOption.training}
        pageOne={{
          title: "Labor Training",
          body: "Here you can gain access to better jobs, just keep a careful eye on your sanity.",
        }}
      />
      <ScrollView
        style={{
          paddingTop: header,
          paddingBottom: uiStore.playerStatusHeightSecondary,
        }}
      >
        <View style={[tw.px2, tw.pt4]}>
          {qualifications.map((qual, index) => (
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
    </>
  );
};
export default JobTraining;
