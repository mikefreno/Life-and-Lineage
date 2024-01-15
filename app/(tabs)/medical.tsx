import { ScrollView, View } from "../../components/Themed";
import medicalOptions from "../../assets/json/medicalOptions.json";
import MedicalOption from "../../components/MedicalOptions";
import PlayerStatus from "../../components/PlayerStatus";
import { useContext, useEffect, useState } from "react";
import { GameContext } from "../_layout";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";

export default function MedicalScreen() {
  const gameContext = useContext(GameContext);
  const isFocused = useIsFocused();

  if (!gameContext) {
    throw new Error("Missing Context");
  }
  const { gameState } = gameContext;
  const [showMedicalTutorial, setShowMedicalTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("medical")) ?? false,
  );

  useEffect(() => {
    if (!showMedicalTutorial && gameState) {
      gameState.updateTutorialState("medical", true);
    }
  }, [showMedicalTutorial]);

  return (
    <>
      <TutorialModal
        isVisibleCondition={
          (showMedicalTutorial && gameState?.tutorialsEnabled && isFocused) ??
          false
        }
        backFunction={() => setShowMedicalTutorial(false)}
        onCloseFunction={() => setShowMedicalTutorial(false)}
        pageOne={{
          title: "Medical Tab",
          body: "Here you can aquire various forms of medical treatment.",
        }}
        pageTwo={{
          title: "Note: These tick the game clock forward",
          body: "Using items such as potions, or using spells will not tick the clock forward.",
        }}
      />
      <View className="flex-1">
        <PlayerStatus onTop={true} displayGoldBottom={true} />
        <ScrollView>
          <View className="px-2 pb-24 pt-4">
            {medicalOptions.map((medOption, index) => {
              return (
                <MedicalOption
                  key={index}
                  title={medOption.serviceName}
                  cost={medOption.cost}
                  healthRestore={medOption.heathRestore}
                  sanityRestore={medOption.sanityRestore}
                  manaRestore={medOption.manaRestore}
                  removeDebuffs={medOption.removeDebuffs}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
