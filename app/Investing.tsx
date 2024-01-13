import investments from "../assets/json/investments.json";

import { ScrollView, View, Text } from "../components/Themed";

import "../assets/styles/globals.css";
import { Investment } from "../utility/types";
import InvestmentCard from "../components/InvestmentCard";
import PlayerStatus from "../components/PlayerStatus";
import Modal from "react-native-modal";
import { useContext, useEffect, useState } from "react";
import { GameContext, PlayerCharacterContext } from "./_layout";
import { useIsFocused } from "@react-navigation/native";
import { Pressable, Switch } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useVibration } from "../utility/customHooks";

export default function InvestingScreen() {
  const playerCharacterContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  if (!gameContext || !playerCharacterContext) {
    throw new Error("missing context");
  }
  const vibration = useVibration();
  const { playerState } = playerCharacterContext;
  const { gameState } = gameContext;
  const [showInvestingTutorial, setShowingInvestingTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("investing")) ?? false,
    );
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (!showInvestingTutorial && gameState) {
      gameState.updateTutorialState("investing", true);
    }
  }, [showInvestingTutorial]);

  useEffect(() => {
    setTutorialState(gameState?.tutorialsEnabled ?? true);
  }, [gameState?.tutorialsEnabled]);

  useEffect(() => {
    setShowingInvestingTutorial(
      (gameState && !gameState.getTutorialState("investing")) ?? false,
    );
  }, [gameState?.tutorialsShown]);

  useEffect(() => {
    if (gameState) {
      if (tutorialState == false) {
        gameState.disableTutorials();
      } else {
        gameState.enableTutorials();
      }
    }
  }, [tutorialState]);

  return (
    <>
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.2}
        animationInTiming={500}
        animationOutTiming={300}
        isVisible={
          showInvestingTutorial && gameState?.tutorialsEnabled && isFocused
        }
        onBackdropPress={() => setShowingInvestingTutorial(false)}
        onBackButtonPress={() => setShowingInvestingTutorial(false)}
      >
        <View
          className="mx-auto w-5/6 rounded-xl px-6 py-4"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            elevation: 1,
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
              <Text className="text-center text-2xl">Welcome!</Text>

              <Text className="my-4 text-center text-lg">
                On this page you can view your inventory (tap the bag) and equip
                items to you hands, head, or body.
              </Text>
              <View className="mx-auto flex flex-row">
                <Text className="my-auto text-lg">Tutorials Enabled: </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  ios_backgroundColor="#3e3e3e"
                  thumbColor={"white"}
                  onValueChange={(bool) => setTutorialState(bool)}
                  value={tutorialState}
                />
              </View>
              <Pressable
                onPress={() => setTutorialStep((prev) => prev + 1)}
                className="mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Next</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="mt-2 text-center">
                A great place to start is to open your inventory and study the
                book you were given.
              </Text>
              <View className="mx-auto flex flex-row">
                <Text className="my-auto text-lg">Tutorials Enabled: </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  ios_backgroundColor="#3e3e3e"
                  thumbColor={"white"}
                  onValueChange={(bool) => setTutorialState(bool)}
                  value={tutorialState}
                />
              </View>
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  setShowingInvestingTutorial(false);
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
        <PlayerStatus onTop displayGoldBottom />
        <View className="flex-1 items-center justify-center">
          <ScrollView>
            {investments.map((investment: Investment, idx) => (
              <InvestmentCard key={idx} investment={investment} />
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
}
