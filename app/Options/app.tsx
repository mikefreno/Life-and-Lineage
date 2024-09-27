import { Platform, Pressable, TextInput, View } from "react-native";
import { View as ThemedView, Text } from "../../components/Themed";
import { useContext, useEffect, useState } from "react";
import { toTitleCase } from "../../utility/functions/misc";
import { useVibration } from "../../utility/customHooks";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import { AppContext } from "../_layout";
import { router } from "expo-router";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import { useAuth } from "../../auth/AuthContext";
import { observer } from "mobx-react-lite";
import GenericModal from "../../components/GenericModal";
import { useColorScheme } from "nativewind";
import { SaveRow } from "../../utility/database";
import D20DieAnimation from "../../components/DieRollAnim";
import GenericFlatButton from "../../components/GenericFlatButton";
import { Game } from "../../classes/game";
import { PlayerCharacter } from "../../classes/character";
import { parse, stringify } from "flatted";
import { createShops } from "../../classes/shop";
import { PlayerClassOptions } from "../../utility/types";

const themeOptions = ["system", "light", "dark"];
const vibrationOptions = ["full", "minimal", "none"];

export const AppSettings = observer(() => {
  const user = useAuth();

  const { colorScheme } = useColorScheme();
  const [showRemoteSaveWindow, setShowRemoteSaveWindow] =
    useState<boolean>(false);
  const [showRemoteLoadWidow, setShowRemoteLoadWindow] =
    useState<boolean>(false);
  const [remoteSaves, setRemoteSaves] = useState<SaveRow[]>([]);
  const [saveName, setSaveName] = useState<string>("");
  const [loadingDBInfo, setLoadingDBInfo] = useState<boolean>(false);

  const appData = useContext(AppContext);
  if (!appData) {
    throw new Error("Missing context");
  }
  const { playerState, gameState, setPlayerCharacter, setGameData } = appData;

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

    useEffect(() => {
      if (user.isAuthenticated) {
        setLoadingDBInfo(true);
        user.getRemoteSaves().then((rows) => {
          setRemoteSaves(rows);
          setLoadingDBInfo(false);
        });
      } else {
        setRemoteSaves([]);
      }
    }, [user.isAuthenticated]);

    const logout = async () => {
      await user.logout();
    };

    const toggleRemoteSaveWindow = () => {
      setShowRemoteSaveWindow(!showRemoteSaveWindow);
    };

    const toggleRemoteLoadWindow = () => {
      setShowRemoteLoadWindow(!showRemoteLoadWidow);
    };

    const newRemoteSave = async () => {
      if (playerState && gameState && saveName.length >= 3) {
        setLoadingDBInfo(true);
        await user.makeRemoteSave({ name: saveName, playerState, gameState });
        const res = await user.getRemoteSaves();
        setRemoteSaves(res);

        setLoadingDBInfo(false);
      }
    };

    const overwriteSave = async (chosenSave: SaveRow) => {
      if (playerState && gameState) {
        setLoadingDBInfo(true);
        user.overwriteRemoteSave({
          name: chosenSave.name,
          id: chosenSave.id,
          playerState,
          gameState,
        });
        const res = await user.getRemoteSaves();
        setRemoteSaves(res);
        setLoadingDBInfo(false);
      }
    };

    const profiling = () => {
      function stringifyCircular(obj: any) {
        const seen = new WeakSet();

        return JSON.stringify(obj, (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return; // Ignore circular references
            }
            seen.add(value);
          }
          return value;
        });
      }
      const shops = createShops(PlayerClassOptions.mage);
      const game = new Game({
        shops: shops,
        vibrationEnabled: "full",
      });

      const runTest = (
        name: string,
        testFn: (iteration: number) => void,
        iterations: number = 1000,
      ) => {
        const start = Date.now();
        for (let i = 0; i < iterations; i++) {
          testFn(i);
        }
        const end = Date.now();
        const duration = end - start;
        console.log(
          `(${Platform.OS}) ${name}: ${duration} ms for ${iterations} iterations`,
        );
        return duration;
      };

      const unclearedTime = runTest("Uncleared inventory", (iteration) => {
        const serialized = stringify(game);
        if (iteration % 25 == 0) {
          Game.fromJSON(parse(serialized));
        }
      });

      const clearedTime = runTest("Cleared inventory", (iteration) => {
        const serialized = stringify(Game.forSaving(game));
        if (iteration % 25 == 0) {
          Game.fromJSON(parse(serialized));
        }
      });

      const customCircularTime = runTest("Cleared and custom", (iteration) => {
        const serialized = stringifyCircular(Game.forSaving(game));
        if (iteration % 25 == 0) {
          Game.fromJSON(JSON.parse(serialized));
        }
      });

      let ratio = unclearedTime / clearedTime;
      console.log(
        `(${Platform.OS}) Uncleared inventory is ${ratio.toFixed(
          2,
        )}x slower than cleared inventory`,
      );
      ratio = clearedTime / customCircularTime;
      console.log(
        `(${Platform.OS}) cleared inventory is ${ratio.toFixed(
          2,
        )}x slower than Cleared and custom`,
      );
      ratio = unclearedTime / customCircularTime;
      console.log(
        `(${Platform.OS}) uncleared inventory is ${ratio.toFixed(
          2,
        )}x slower than Cleared and custom`,
      );
    };

    const loadRemoteSave = async (chosenSave: SaveRow) => {
      setGameData(Game.fromJSON(JSON.parse(chosenSave.game_state)));
      setPlayerCharacter(
        PlayerCharacter.fromJSON(JSON.parse(chosenSave.player_state)),
      );
      while (router.canGoBack()) {
        router.back();
      }
    };

    const deleteRemoteSave = async (chosenSave: SaveRow) => {
      setLoadingDBInfo(true);
      await user.deleteRemoteSave({ id: chosenSave.id });
      const res = await user.getRemoteSaves();
      setRemoteSaves(res);
      setLoadingDBInfo(false);
    };

    return (
      <>
        <GenericModal
          isVisibleCondition={showRemoteSaveWindow}
          backFunction={() => setShowRemoteSaveWindow(false)}
          backdropCloses
          size={95}
        >
          {loadingDBInfo ? (
            <D20DieAnimation keepRolling />
          ) : (
            <View className="p-2">
              <Text className="text-xl">Remote Saving</Text>
              <GenericStrikeAround>Make New Save</GenericStrikeAround>
              <TextInput
                className="mx-4 mt-6 rounded border  border-zinc-800 pl-2 text-xl text-black dark:border-zinc-100 dark:text-zinc-50"
                placeholderTextColor={
                  colorScheme == "light" ? "#d4d4d8" : "#71717a"
                }
                onChangeText={(text) => setSaveName(text)}
                placeholder={"New Save Name"}
                autoCorrect={false}
                value={saveName}
                style={{
                  fontFamily: "PixelifySans",
                  paddingVertical: 8,
                  minWidth: "50%",
                  fontSize: 20,
                }}
              />
              <Text className="text-center text-sm">Min Length: 3</Text>
              <GenericFlatButton
                onPressFunction={newRemoteSave}
                disabledCondition={saveName.length < 3}
              >
                Save
              </GenericFlatButton>
              <GenericStrikeAround>Current Saves</GenericStrikeAround>
              {remoteSaves.map((save) => (
                <View
                  key={save.id}
                  className="w-full bg-zinc-300 dark:bg-zinc-700 border rounded border-zinc-900 dark:border-zinc-50 pb-2"
                >
                  <Pressable
                    className="w-8 h-8 -mb-8 z-top items-center justify-center m-1 border bg-zinc-50 dark:bg-zinc-900 rounded-full border-zinc-900 dark:border-zinc-50"
                    onPress={() => {
                      vibration({ essential: true, style: "warning" });
                      deleteRemoteSave(save);
                    }}
                  >
                    <Text className="text-center">X</Text>
                  </Pressable>
                  <Text className="text-xl pt-2 text-center">{save.name}</Text>
                  <View className="flex flex-col w-full items-end py-2">
                    <Text className="">
                      Last updated: {save.last_updated_at}
                    </Text>
                    <Text className="">Created at: {save.created_at}</Text>
                  </View>
                  <GenericFlatButton
                    backgroundColor={colorScheme == "dark" ? "black" : "white"}
                    onPressFunction={() => overwriteSave(save)}
                  >
                    Overwrite save
                  </GenericFlatButton>
                </View>
              ))}
            </View>
          )}
        </GenericModal>
        <GenericModal
          isVisibleCondition={showRemoteLoadWidow}
          backFunction={() => setShowRemoteLoadWindow(false)}
          backdropCloses
          size={95}
        >
          <View className="p-2">
            <Text className="text-xl">Load Saves</Text>
            <Text className="text-xl text-center" style={{ color: "#ef4444" }}>
              Make sure to backup first!
            </Text>
            {remoteSaves.map((save) => (
              <View
                key={save.id}
                className="w-full bg-zinc-300 dark:bg-zinc-700 border rounded border-zinc-900 dark:border-zinc-50 pb-2"
              >
                <Pressable
                  className="w-8 h-8 absolute items-center justify-center m-1 border bg-zinc-50 dark:bg-zinc-900 rounded-full border-zinc-900 dark:border-zinc-50"
                  onPress={() => {
                    vibration({ essential: true, style: "warning" });
                    deleteRemoteSave(save);
                  }}
                >
                  <Text className="text-center">X</Text>
                </Pressable>
                <Text className="text-xl pt-2 text-center">{save.name}</Text>
                <View className="flex flex-col w-full items-end py-2">
                  <Text className="">Last updated: {save.last_updated_at}</Text>
                  <Text className="">Created at: {save.created_at}</Text>
                </View>
                <GenericFlatButton
                  backgroundColor={colorScheme == "dark" ? "black" : "white"}
                  onPressFunction={() => loadRemoteSave(save)}
                >
                  Load Save
                </GenericFlatButton>
              </View>
            ))}
          </View>
        </GenericModal>
        <ThemedView className="flex-1 items-center justify-center px-4">
          <GenericStrikeAround>
            <Text className="text-xl">
              Remote Backups{!user.isAuthenticated && ` (requires login)`}
            </Text>
          </GenericStrikeAround>
          {user.isAuthenticated ? (
            <>
              <Text className="text-center py-2">
                Logged in as: {user.getEmail()}
              </Text>
              <View className="flex flex-row justify-evenly w-full">
                <GenericFlatButton
                  onPressFunction={toggleRemoteSaveWindow}
                  disabledCondition={
                    loadingDBInfo || !user.isConnectedAndInitialized
                  }
                >
                  {loadingDBInfo ? (
                    <D20DieAnimation size={20} keepRolling />
                  ) : (
                    "Make\n Cloud Save"
                  )}
                </GenericFlatButton>
                <GenericFlatButton
                  onPressFunction={toggleRemoteLoadWindow}
                  disabledCondition={
                    loadingDBInfo || !user.isConnectedAndInitialized
                  }
                >
                  {loadingDBInfo ? (
                    <D20DieAnimation size={20} keepRolling />
                  ) : (
                    "Load\n Cloud Save"
                  )}
                </GenericFlatButton>
              </View>
              <GenericRaisedButton onPressFunction={logout}>
                Sign Out
              </GenericRaisedButton>
            </>
          ) : (
            <>
              {!user.isConnectedAndInitialized && (
                <Text className="text-center italic text-sm">
                  You are not connected to the internet
                </Text>
              )}
              <View className="flex flex-row justify-evenly w-full">
                <GenericRaisedButton
                  onPressFunction={() => router.push("/Auth/sign-in")}
                  disabledCondition={!user.isConnectedAndInitialized}
                >
                  Sign In
                </GenericRaisedButton>
                <GenericRaisedButton
                  onPressFunction={() => router.push("/Auth/sign-up")}
                  backgroundColor={"#2563eb"}
                  textColor={"#fafafa"}
                  disabledCondition={!user.isConnectedAndInitialized}
                >
                  Sign Up
                </GenericRaisedButton>
              </View>
            </>
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
          {__DEV__ && (
            <View className="w-full flex items-center">
              <GenericRaisedButton onPressFunction={profiling}>
                <Text>Run Profiling</Text>
              </GenericRaisedButton>
            </View>
          )}
        </ThemedView>
      </>
    );
  }
});
export default AppSettings;
