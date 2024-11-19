import qualifications from "../assets/json/qualifications.json";
import PlayerStatus from "../components/PlayerStatus";
import TrainingCard from "../components/TrainingCard";
import TutorialModal from "../components/TutorialModal";
import { useIsFocused } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { TutorialOption } from "../utility/types";
import { ScrollView, View } from "react-native";
import { useRootStore } from "../hooks/stores";

const JobTraining = () => {
  const isFocused = useIsFocused();
  const header = useHeaderHeight();
  const { gameState, playerState } = useRootStore();
  if (!gameState || !playerState) {
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
      <View className="flex-1">
        <ScrollView
          style={{ paddingTop: header }}
          scrollIndicatorInsets={{ top: 0, right: 0, left: 0, bottom: 48 }}
        >
          <View className="px-2 pt-4">
            {qualifications.map((qual, index) => {
              return (
                <TrainingCard
                  key={index}
                  name={qual.name}
                  ticks={qual.ticks}
                  sanityCostPerTick={qual.sanityCostPerTick}
                  goldCostPerTick={qual.goldCostPerTick}
                  preRequisites={qual.prerequisites}
                  playerState={playerState}
                  gameState={gameState}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
      <PlayerStatus tabScreen />
    </>
  );
};
export default JobTraining;
