import { Pressable, View as NonThemedView, Switch } from "react-native";
import { View, Text } from "../../components/Themed";
import { useContext, useEffect, useState } from "react";
import { toTitleCase } from "../../utility/functions/misc/words";
import { useVibration } from "../../utility/customHooks";
import * as Updates from "expo-updates";
import GenericModal from "../../components/GenericModal";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import { AppContext } from "../_layout";

export default function AppSettings() {
  const themeOptions = ["system", "light", "dark"];
  const vibrationOptions = ["full", "minimal", "none"];
  const [showTutorialResetConfirm, setShowTutorialResetConfirm] =
    useState<boolean>(false);

  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("Missing context");
  }
  const { gameState } = appData;

  const vibration = useVibration();
  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );

  if (gameState) {
    const [selectedThemeOption, setSelectedThemeOption] = useState<number>(
      themeOptions.indexOf(gameState.colorScheme),
    );
    const [selectedVibrationOption, setSelectedVibrationOption] =
      useState<number>(vibrationOptions.indexOf(gameState.vibrationEnabled));

    function setColorTheme(index: number, option: "system" | "light" | "dark") {
      if (gameState) {
        vibration({ style: "light" });
        gameState.setColorScheme(option);
        setSelectedThemeOption(index);
      }
    }

    function setVibrationLevel(
      index: number,
      option: "full" | "minimal" | "none",
    ) {
      if (gameState) {
        gameState.modifyVibrationSettings(option);
        setSelectedVibrationOption(index);
        vibration({ style: "light" });
      }
    }

    useEffect(() => {
      if (tutorialState == false) {
        gameState.disableTutorials();
      } else {
        gameState.enableTutorials();
      }
    }, [tutorialState]);

    return (
      <>
        <GenericModal
          isVisibleCondition={showTutorialResetConfirm}
          backFunction={() => setShowTutorialResetConfirm(false)}
        >
          <>
            <Text className="text-center text-lg">
              This will reset all tutorials, some may not make sense based on
              your current game/player/inventory state (And restart the app).
            </Text>
            <Text className="text-center text-2xl">Are you sure?</Text>
            <View className="flex flex-row">
              <Pressable
                onPress={() => {
                  vibration({ style: "warning" });
                  gameState.resetTutorialState();
                  gameState.enableTutorials();
                  setShowTutorialResetConfirm(false);
                  Updates.reloadAsync();
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
            </View>
          </>
        </GenericModal>
        <View className="flex-1 items-center justify-center px-4">
          <GenericStrikeAround>Select Color Theme</GenericStrikeAround>
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
          <GenericStrikeAround>Vibration Settings</GenericStrikeAround>
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
          <GenericStrikeAround>Tutorials</GenericStrikeAround>
          <NonThemedView className="mt-3 rounded px-4 py-2">
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
            <GenericRaisedButton
              onPressFunction={() => {
                vibration({ style: "light" });
                setShowTutorialResetConfirm(true);
              }}
            >
              Reset Tutorials
            </GenericRaisedButton>
          </NonThemedView>
        </View>
      </>
    );
  }
}
