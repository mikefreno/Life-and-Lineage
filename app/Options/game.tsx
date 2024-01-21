import { StatusBar } from "expo-status-bar";
import { Text, View } from "../../components/Themed";
import { router } from "expo-router";
import { useContext, useState } from "react";
import { GameContext } from "../_layout";
import { toTitleCase } from "../../utility/functions/misc";
import {
  Pressable,
  View as NonThemedView,
  StyleSheet,
  Platform,
} from "react-native";
import { useVibration } from "../../utility/customHooks";
import { useColorScheme } from "nativewind";

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
  const gameData = useContext(GameContext);
  const game = gameData?.gameState;
  const vibration = useVibration();

  const [selectedHealthWarning, setSelectedHealthWarning] = useState<string>(
    game ? healthWarningOptions[game?.healthWarning] : "25%",
  );

  const startNewGame = () => {
    vibration({ style: "warning" });
    while (router.canGoBack()) {
      router.back();
    }
    router.push("/NewGame");
  };

  const { colorScheme } = useColorScheme();

  const healthWarningSetter = (choice: number) => {
    game?.setHealthWarning(choice);
    setSelectedHealthWarning(healthWarningOptions[choice]);
  };

  return (
    <View className="flex-1 items-center justify-center px-4">
      <View style={styles.container}>
        <View style={styles.line} />
        <View style={styles.content}>
          <Text className="text-xl">Game Restart</Text>
        </View>
        <View style={styles.line} />
      </View>
      <Pressable className="mx-auto mt-4" onPress={startNewGame}>
        {({ pressed }) => (
          <View
            className={`rounded-xl px-8 py-4 ${
              pressed ? "scale-95 opacity-50" : ""
            }`}
            style={{
              shadowColor: "#000",
              elevation: 2,
              backgroundColor: colorScheme == "light" ? "white" : "#71717a",
              shadowOpacity: 0.1,
              shadowRadius: 5,
            }}
          >
            <Text className="text-center text-zinc-900 dark:text-zinc-50">
              Start New Game
            </Text>
          </View>
        )}
      </Pressable>
      <View style={styles.container} className="mt-8">
        <View style={styles.line} />
        <View style={styles.content}>
          <Text className="text-xl">Health Warning</Text>
        </View>
        <View style={styles.line} />
      </View>
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
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
