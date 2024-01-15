import { observer } from "mobx-react-lite";
import { ScrollView, View } from "../components/Themed";
import qualifications from "../assets/json/qualifications.json";
import PlayerStatus from "../components/PlayerStatus";
import TrainingCard from "../components/TrainingCard";
import { Stack } from "expo-router";
import TutorialModal from "../components/TutorialModal";
import { GameContext } from "./_layout";
import { useContext, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";

const JobTraining = observer(() => {
  const gameContext = useContext(GameContext);
  if (!gameContext) {
    throw new Error("missing context");
  }
  const { gameState } = gameContext;
  const [showTrainingTutorial, setShowTrainingTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("training")) ?? false,
  );
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!showTrainingTutorial && gameState) {
      gameState.updateTutorialState("training", true);
    }
  }, [showTrainingTutorial]);

  return (
    <>
      <Stack.Screen options={{ title: "Training School" }} />
      <TutorialModal
        isVisibleCondition={
          (showTrainingTutorial && gameState?.tutorialsEnabled && isFocused) ??
          false
        }
        backFunction={() => setShowTrainingTutorial(false)}
        onCloseFunction={() => setShowTrainingTutorial(false)}
        pageOne={{
          title: "Labor Training",
          body: "Here you can gain access to better jobs, just keep a careful eye on your sanity.",
        }}
      />
      <View className="flex-1">
        <PlayerStatus displayGoldBottom={true} onTop={true} />
        <ScrollView>
          <View className="px-2 pb-24 pt-4">
            {qualifications.map((qual, index) => {
              return (
                <TrainingCard
                  key={index}
                  name={qual.name}
                  ticks={qual.ticks}
                  sanityCostPerTick={qual.sanityCostPerTick}
                  goldCostPerTick={qual.goldCostPerTick}
                  preRequisites={qual.prerequisites}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
    </>
  );
});
export default JobTraining;
