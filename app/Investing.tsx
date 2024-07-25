import investments from "../assets/json/investments.json";
import { ScrollView, View } from "../components/Themed";
import "../assets/styles/globals.css";
import { InvestmentType } from "../utility/types";
import InvestmentCard from "../components/InvestmentCard";
import PlayerStatus from "../components/PlayerStatus";
import { useContext, useEffect, useState } from "react";
import { GameContext } from "./_layout";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../components/TutorialModal";
import { View as NonThemedView, Platform, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { BlurView } from "expo-blur";
import { useColorScheme } from "nativewind";
import { useHeaderHeight } from "@react-navigation/elements";

export default function InvestingScreen() {
  const gameContext = useContext(GameContext);
  if (!gameContext) {
    throw new Error("missing context");
  }
  const { gameState } = gameContext;
  const [showInvestingTutorial, setShowingInvestingTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("investing")) ?? false,
    );
  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (!showInvestingTutorial && gameState) {
      gameState.updateTutorialState("investing", true);
    }
  }, [showInvestingTutorial]);

  useEffect(() => {
    setShowingInvestingTutorial(
      (gameState && !gameState.getTutorialState("investing")) ?? false,
    );
  }, [gameState?.tutorialsShown]);

  return (
    <>
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerTransparent: true,
          headerTitleStyle: { fontFamily: "PixelifySans", fontSize: 22 },
          headerBackground: () => (
            <BlurView
              blurReductionFactor={12}
              tint={
                Platform.OS == "android"
                  ? colorScheme == "light"
                    ? "light"
                    : "dark"
                  : "default"
              }
              intensity={100}
              style={StyleSheet.absoluteFill}
              experimentalBlurMethod={"dimezisBlurView"}
            />
          ),
        }}
      />
      <TutorialModal
        isVisibleCondition={
          (showInvestingTutorial && gameState?.tutorialsEnabled && isFocused) ??
          false
        }
        backFunction={() => setShowingInvestingTutorial(false)}
        onCloseFunction={() => setShowingInvestingTutorial(false)}
        pageOne={{
          title: "Investing",
          body: "Put your gold to work and make time work for you.",
        }}
        pageTwo={{
          title: "Note:",
          body: "You will need to clear out dungeons to unlock the purchasing of these investments.",
        }}
        pageThree={{
          body: "Each investment base has a number of upgrades, some with significant consequences on your character.",
        }}
      />
      <View className="flex-1">
        <View className="flex-1">
          <ScrollView>
            <View style={{ paddingTop: useHeaderHeight() }}>
              {investments.map((investment: InvestmentType, idx) => (
                <InvestmentCard key={idx} investment={investment} />
              ))}
            </View>
          </ScrollView>
        </View>
        <View className="pb-6">
          <PlayerStatus positioning={"relative"} />
        </View>
      </View>
    </>
  );
}
