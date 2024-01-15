import investments from "../assets/json/investments.json";
import { ScrollView, View } from "../components/Themed";
import "../assets/styles/globals.css";
import { InvestmentType } from "../utility/types";
import InvestmentCard from "../components/InvestmentCard";
import PlayerStatus from "../components/PlayerStatus";
import { useContext, useEffect, useState } from "react";
import { GameContext, PlayerCharacterContext } from "./_layout";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../components/TutorialModal";

export default function InvestingScreen() {
  const playerCharacterContext = useContext(PlayerCharacterContext);
  const gameContext = useContext(GameContext);
  if (!gameContext || !playerCharacterContext) {
    throw new Error("missing context");
  }
  const { playerState } = playerCharacterContext;
  const { gameState } = gameContext;
  const [showInvestingTutorial, setShowingInvestingTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("investing")) ?? false,
    );
  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );
  const isFocused = useIsFocused();

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
          body: "Each investment base has a number of upgrades, some with significant consequences on your character.",
        }}
      />
      <View className="flex-1">
        <PlayerStatus onTop displayGoldBottom />
        <View className="flex-1 items-center justify-center">
          <ScrollView>
            {investments.map((investment: InvestmentType, idx) => (
              <InvestmentCard key={idx} investment={investment} />
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
}
