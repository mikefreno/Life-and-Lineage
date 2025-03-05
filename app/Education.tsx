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
  const { playerState } = useRootStore();

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
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ paddingTop: header }}
          scrollIndicatorInsets={{ top: 0, right: 0, left: 0, bottom: 48 }}
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
      </View>
      <PlayerStatusForSecondary />
    </>
  );
};
export default JobTraining;
