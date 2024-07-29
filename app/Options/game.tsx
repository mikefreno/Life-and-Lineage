import { Text, View } from "../../components/Themed";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { AppContext } from "../_layout";
import { toTitleCase } from "../../utility/functions/misc/words";
import { Pressable, View as NonThemedView, StyleSheet } from "react-native";
import { useVibration } from "../../utility/customHooks";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import GenericStrikeAround from "../../components/GenericStrikeAround";

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
  const { gameState } = appData;
  const vibration = useVibration();

  const [selectedHealthWarning, setSelectedHealthWarning] = useState<string>(
    gameState ? healthWarningOptions[gameState?.healthWarning] : "25%",
  );

  const startNewGame = () => {
    vibration({ style: "warning" });
    while (router.canGoBack()) {
      router.back();
    }
    router.push("/NewGame");
  };

  const healthWarningSetter = (choice: number) => {
    gameState?.setHealthWarning(choice);
    setSelectedHealthWarning(healthWarningOptions[choice]);
  };

  return (
    <View className="flex-1 items-center justify-center px-4">
      <GenericStrikeAround>Game Restart</GenericStrikeAround>
      <GenericRaisedButton onPressFunction={startNewGame}>
        Start New Game
      </GenericRaisedButton>
      <GenericStrikeAround>Health Warning</GenericStrikeAround>
      <NonThemedView className="mt-3 rounded px-4 py-2">
        {healthWarningVals.map((item, idx) => (
          <Pressable
            key={idx}
            className="mb-2 ml-10 flex flex-row"
            onPress={() => healthWarningSetter(healthWarningKeys[idx])}
          >
            <NonThemedView
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
      </NonThemedView>
    </View>
  );
}
