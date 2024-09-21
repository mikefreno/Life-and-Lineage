import { Text, View as ThemedView } from "../../components/Themed";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../_layout";
import { toTitleCase, wait } from "../../utility/functions/misc";
import { Pressable, Switch, View } from "react-native";
import { useVibration } from "../../utility/customHooks";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import GenericModal from "../../components/GenericModal";
import * as Updates from "expo-updates";
import { fullSave } from "../../utility/functions/save_load";
import D20DieAnimation from "../../components/DieRollAnim";

const healthWarningOptions: Record<number, string> = {
  0.5: "50%",
  0.25: "25%",
  0.2: "20% (default)",
  0.15: "15%",
  0.1: "10%",
  0: "disabled",
};
const healthWarningVals = [
  "50%",
  "25%",
  "20% (default)",
  "15%",
  "10%",
  "disabled",
];
const healthWarningKeys = [0.5, 0.25, 0.2, 0.15, 0.1, 0];

export default function GameSettings() {
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context!");
  const { gameState, playerState } = appData;
  const vibration = useVibration();
  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedHealthWarning, setSelectedHealthWarning] = useState<string>(
    gameState ? healthWarningOptions[gameState?.healthWarning] : "25%",
  );
  const [showTutorialResetConfirm, setShowTutorialResetConfirm] =
    useState<boolean>(false);

  const startNewGame = () => {
    vibration({ style: "warning" });
    while (router.canGoBack()) {
      router.back();
    }
    router.push("/NewGame");
  };

  useEffect(() => {
    if (gameState) {
      if (tutorialState == false) {
        gameState.disableTutorials();
      } else {
        gameState.enableTutorials();
      }
    }
  }, [tutorialState]);

  const healthWarningSetter = (choice: number) => {
    gameState?.setHealthWarning(choice);
    setSelectedHealthWarning(healthWarningOptions[choice]);
  };

  return (
    <>
      <GenericModal
        isVisibleCondition={showTutorialResetConfirm}
        backFunction={() => setShowTutorialResetConfirm(false)}
      >
        {loading ? (
          <D20DieAnimation keepRolling={true} />
        ) : (
          <>
            <Text className="text-center text-lg">
              This will reset all tutorials, some may not make sense based on
              your current game/player/inventory state (And restart the app).
            </Text>
            <Text className="text-center text-2xl">Are you sure?</Text>
            <ThemedView className="flex flex-row">
              <Pressable
                onPress={() => {
                  vibration({ style: "warning" });
                  gameState?.resetTutorialState();
                  gameState?.enableTutorials();
                  setLoading(true);
                  wait(1000).then(() => {
                    setShowTutorialResetConfirm(false);
                    fullSave(gameState, playerState);
                    setLoading(false);
                    Updates.reloadAsync();
                  });
                }}
                className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Reset</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowTutorialResetConfirm(false)}
                className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Cancel</Text>
              </Pressable>
            </ThemedView>
          </>
        )}
      </GenericModal>
      <ThemedView className="flex-1 items-center justify-center px-4">
        <GenericStrikeAround>Game Restart</GenericStrikeAround>
        <GenericRaisedButton onPressFunction={startNewGame}>
          Start New Game
        </GenericRaisedButton>
        <GenericStrikeAround>Health Warning</GenericStrikeAround>
        <View className="mt-3 rounded px-4 py-2">
          {healthWarningVals.map((item, idx) => (
            <Pressable
              key={idx}
              className="mb-2 ml-10 flex flex-row"
              onPress={() => healthWarningSetter(healthWarningKeys[idx])}
            >
              <View
                className={
                  selectedHealthWarning == healthWarningVals[idx]
                    ? "my-auto mr-4 h-4 w-4 rounded-full border border-zinc-900 bg-blue-500 dark:border-zinc-50 dark:bg-blue-600"
                    : "my-auto mr-4 h-4 w-4 rounded-full border border-zinc-900 dark:border-zinc-50"
                }
              />
              <Text className="text-2xl tracking-widest">
                {toTitleCase(item)}
              </Text>
            </Pressable>
          ))}
        </View>
        <GenericStrikeAround>Tutorials</GenericStrikeAround>
        <View className="mt-3 rounded px-4 py-2">
          <ThemedView className="mx-auto flex flex-row">
            <Text className="my-auto text-lg">Tutorials Enabled: </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#3b82f6" }}
              ios_backgroundColor="#3e3e3e"
              thumbColor={"white"}
              onValueChange={(bool) => setTutorialState(bool)}
              value={tutorialState}
            />
          </ThemedView>
          <GenericRaisedButton
            onPressFunction={() => {
              vibration({ style: "light" });
              setShowTutorialResetConfirm(true);
            }}
          >
            Reset Tutorials
          </GenericRaisedButton>
        </View>
      </ThemedView>
    </>
  );
}
