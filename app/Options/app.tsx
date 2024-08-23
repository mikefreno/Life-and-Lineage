import { Pressable, View } from "react-native";
import { View as ThemedView, Text } from "../../components/Themed";
import { useContext, useState } from "react";
import { toTitleCase } from "../../utility/functions/misc/words";
import { useVibration } from "../../utility/customHooks";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import { AppContext } from "../_layout";
import { router } from "expo-router";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import { useAuth } from "../../auth/AuthContext";
import { observer } from "mobx-react-lite";

export const AppSettings = observer(() => {
  const auth = useAuth();
  const themeOptions = ["system", "light", "dark"];
  const vibrationOptions = ["full", "minimal", "none"];

  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("Missing context");
  }
  const { gameState } = appData;

  const vibration = useVibration();

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
    const logout = async () => {
      await auth.logout();
    };

    return (
      <>
        <ThemedView className="flex-1 items-center justify-center px-4">
          <GenericStrikeAround>
            <Text className="text-xl">
              Remote Backups{!auth.isAuthenticated && ` (requires login)`}
            </Text>
          </GenericStrikeAround>
          {auth.isAuthenticated ? (
            <View>
              <Text>Logged in as: {auth.email}</Text>
              <GenericRaisedButton onPressFunction={logout}>
                Sign Out
              </GenericRaisedButton>
            </View>
          ) : (
            <View className="flex flex-row justify-evenly w-full">
              <GenericRaisedButton
                onPressFunction={() => router.push("/Auth/sign-in")}
              >
                Sign In
              </GenericRaisedButton>
              <GenericRaisedButton
                onPressFunction={() => router.push("/Auth/sign-up")}
                backgroundColor={"#2563eb"}
                textColor={"#fafafa"}
              >
                Sign Up
              </GenericRaisedButton>
            </View>
          )}
          <GenericStrikeAround>Select Color Theme</GenericStrikeAround>
          <View
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
                <View
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
          </View>
          <GenericStrikeAround>Vibration Settings</GenericStrikeAround>
          <View
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
                <View
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
          </View>
        </ThemedView>
      </>
    );
  }
});
export default AppSettings;
