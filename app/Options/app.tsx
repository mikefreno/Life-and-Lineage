import { Pressable, View as NonThemedView, StyleSheet } from "react-native";
import { View, Text } from "../../components/Themed";
import { useContext, useState } from "react";
import { useColorScheme } from "nativewind";
import { toTitleCase } from "../../utility/functions";
import { GameContext } from "../_layout";
import { useVibration } from "../../utility/customHooks";

export default function AppSettings() {
  const themeOptions = ["system", "light", "dark"];
  const vibrationOptions = ["full", "minimal", "none"];
  const { setColorScheme } = useColorScheme();

  const gameData = useContext(GameContext);
  const game = gameData?.gameState;

  const vibration = useVibration();

  if (game) {
    const [selectedThemeOption, setSelectedThemeOption] = useState<number>(
      themeOptions.indexOf(game?.colorScheme),
    );
    const [selectedVibrationOption, setSelectedVibrationOption] =
      useState<number>(vibrationOptions.indexOf(game?.vibrationEnabled));

    function setColorTheme(index: number, option: "system" | "light" | "dark") {
      if (game) {
        vibration({ style: "light" });
        game.setColorScheme(option);
        setSelectedThemeOption(index);
        setColorScheme(option);
      }
    }

    function setVibrationLevel(
      index: number,
      option: "full" | "minimal" | "none",
    ) {
      if (game) {
        game.modifyVibrationSettings(option);
        setSelectedVibrationOption(index);
        vibration({ style: "light" });
      }
    }

    return (
      <>
        <View className="flex-1 items-center justify-center px-4">
          <View style={styles.container}>
            <View style={styles.line} />
            <View style={styles.content}>
              <Text className="text-xl">Select Color Theme</Text>
            </View>
            <View style={styles.line} />
          </View>
          <NonThemedView
            className="rounded px-4 py-2"
            style={{ marginLeft: -48, marginTop: 12 }}
          >
            {themeOptions.map((item, index) => (
              <Pressable
                key={index}
                className="mb-4 ml-10 flex flex-row"
                onPress={() =>
                  setColorTheme(index, item as "system" | "light" | "dark")
                }
              >
                <NonThemedView
                  className={
                    selectedThemeOption == index
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
          <View style={styles.container}>
            <View style={styles.line} />
            <View style={styles.content}>
              <Text className="text-xl">Vibration Settings</Text>
            </View>
            <View style={styles.line} />
          </View>
          <NonThemedView
            className="rounded px-4 py-2"
            style={{ marginLeft: -48, marginTop: 12 }}
          >
            {vibrationOptions.map((item, index) => (
              <Pressable
                key={index}
                className="mb-4 ml-10 flex flex-row"
                onPress={() => {
                  setVibrationLevel(index, item as "full" | "minimal" | "none");
                }}
              >
                <NonThemedView
                  className={
                    selectedVibrationOption == index
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
      </>
    );
  }
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
