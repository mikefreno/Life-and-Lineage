import { ScrollView, View, Text } from "../../components/Themed";
import medicalOptions from "../../assets/json/medicalOptions.json";
import MedicalOption from "../../components/MedicalOptions";
import PlayerStatus from "../../components/PlayerStatus";
import Modal from "react-native-modal/dist/modal";
import { useContext, useEffect, useState } from "react";
import { GameContext } from "../_layout";
import { Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { Entypo } from "@expo/vector-icons";
import { useVibration } from "../../utility/customHooks";

export default function MedicalScreen() {
  const gameContext = useContext(GameContext);
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const { colorScheme } = useColorScheme();
  const vibration = useVibration();

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
      <Modal
        animationIn="slideInUp"
        animationOut="fadeOut"
        isVisible={showMedicalTutorial && gameState?.tutorialsEnabled}
        backdropOpacity={0.2}
        animationInTiming={500}
        onBackdropPress={() => setShowMedicalTutorial(false)}
        onBackButtonPress={() => setShowMedicalTutorial(false)}
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
              <Text className="text-center text-2xl">Medical Tab</Text>
              <Text className="my-4 text-center text-lg">
                Here you can aquire various forms of medical treatment.
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
                Note: These tick the game clock forward
              </Text>
              <Text className="my-4 text-center">
                Using items such as potions, or using spells will not tick the
                clock forward.
              </Text>
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  setShowMedicalTutorial(false);
                }}
                className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
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
