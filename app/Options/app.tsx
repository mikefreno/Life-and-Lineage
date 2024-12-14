import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Text } from "../../components/Themed";
import { useEffect, useState } from "react";
import { toTitleCase } from "../../utility/functions/misc";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import { router } from "expo-router";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import { observer } from "mobx-react-lite";
import GenericModal from "../../components/GenericModal";
import { useColorScheme } from "nativewind";
import { CheckpointRow } from "../../utility/database";
import D20DieAnimation from "../../components/DieRollAnim";
import GenericFlatButton from "../../components/GenericFlatButton";
import { useRootStore } from "../../hooks/stores";
import { useVibration } from "../../hooks/generic";

const themeOptions = ["system", "light", "dark"];
const vibrationOptions = ["full", "minimal", "none"];

export const AppSettings = observer(() => {
  let root = useRootStore();
  const { playerState, uiStore, authStore } = root;
  const { colorScheme } = useColorScheme();
  const [showRemoteSaveWindow, setShowRemoteSaveWindow] =
    useState<boolean>(false);
  const [showRemoteLoadWidow, setShowRemoteLoadWindow] =
    useState<boolean>(false);
  const [remoteSaves, setRemoteSaves] = useState<CheckpointRow[]>([]);
  const [saveName, setSaveName] = useState<string>("");
  const [loadingDBInfo, setLoadingDBInfo] = useState<boolean>(false);

  const vibration = useVibration();

  const [selectedThemeOption, setSelectedThemeOption] = useState<number>(
    themeOptions.indexOf(uiStore.colorScheme),
  );

  const [selectedVibrationOption, setSelectedVibrationOption] =
    useState<number>(vibrationOptions.indexOf(uiStore.vibrationEnabled));

  function setColorTheme(index: number, option: "system" | "light" | "dark") {
    vibration({ style: "light" });
    uiStore.setColorScheme(option);
    setSelectedThemeOption(index);
  }

  function setReduceMotion(state: boolean) {
    vibration({ style: "light" });
    uiStore.setReduceMotion(state);
  }

  function setVibrationLevel(
    index: number,
    option: "full" | "minimal" | "none",
  ) {
    uiStore.modifyVibrationSettings(option);
    setSelectedVibrationOption(index);
    vibration({ style: "light" });
  }

  useEffect(() => {
    if (authStore.isAuthenticated) {
      setLoadingDBInfo(true);
      authStore.getRemoteCheckpoints().then((rows) => {
        setRemoteSaves(rows);
        setLoadingDBInfo(false);
      });
    } else {
      setRemoteSaves([]);
    }
  }, [authStore.isAuthenticated]);

  const logout = async () => {
    await authStore.logout();
  };

  const toggleRemoteSaveWindow = () => {
    setShowRemoteSaveWindow(!showRemoteSaveWindow);
  };

  const toggleRemoteLoadWindow = () => {
    setShowRemoteLoadWindow(!showRemoteLoadWidow);
  };

  const newRemoteSave = async () => {
    if (playerState && saveName.length >= 3) {
      setLoadingDBInfo(true);
      await authStore.makeRemoteSave(saveName);
      const res = await authStore.getRemoteCheckpoints();
      setRemoteSaves(res);

      setLoadingDBInfo(false);
    }
  };

  const overwriteSave = async (chosenCheckpoint: CheckpointRow) => {
    if (playerState) {
      setLoadingDBInfo(true);
      authStore.overwriteRemoteSave(chosenCheckpoint.id);
      const res = await authStore.getRemoteCheckpoints();
      setRemoteSaves(res);
      setLoadingDBInfo(false);
    }
  };

  const deleteRemoteSave = async (chosenCheckpoint: CheckpointRow) => {
    setLoadingDBInfo(true);
    await authStore.deleteRemoteCheckpoint(chosenCheckpoint.id);
    const res = await authStore.getRemoteCheckpoints();
    setRemoteSaves(res);
    setLoadingDBInfo(false);
  };

  async function loadRemoteCheckpoint(id: number) {
    setLoadingDBInfo(true);
    await root.loadRemoteCheckpoint(id);
    setLoadingDBInfo(false);
    router.dismissAll();
  }

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
              onPress={newRemoteSave}
              disabled={saveName.length < 3}
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
                  <Text className="">Last updated: {save.last_updated}</Text>
                  <Text className="">Created at: {save.created_at}</Text>
                </View>
                <GenericFlatButton
                  backgroundColor={colorScheme == "dark" ? "black" : "white"}
                  onPress={() => overwriteSave(save)}
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
        <ScrollView className="p-2">
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
                className="w-8 h-8 z-50 absolute items-center justify-center m-1 border bg-zinc-50 dark:bg-zinc-900 rounded-full border-zinc-900 dark:border-zinc-50"
                onPress={() => {
                  vibration({ essential: true, style: "warning" });
                  deleteRemoteSave(save);
                }}
              >
                <Text className="text-center">X</Text>
              </Pressable>
              <Text className="text-xl pt-2 text-center">{save.name}</Text>
              <View className="flex flex-col w-full items-end py-2">
                <Text className="">Last updated: {save.last_updated}</Text>
                <Text className="">Created at: {save.created_at}</Text>
              </View>
              <GenericFlatButton
                backgroundColor={colorScheme == "dark" ? "black" : "white"}
                onPress={() => loadRemoteCheckpoint(save.id)}
              >
                Load Save
              </GenericFlatButton>
            </View>
          ))}
        </ScrollView>
      </GenericModal>
      <ScrollView>
        <View className="flex-1 items-center justify-center px-4 pt-12">
          {/*<GenericRaisedButton
            onPress={() => router.push("/Options/iaps")}
          >
            Go to IAPs
          </GenericRaisedButton>*/}
          <GenericStrikeAround>
            <Text className="text-xl">
              Remote Backups{!authStore.isAuthenticated && ` (requires login)`}
            </Text>
          </GenericStrikeAround>
          {authStore.isAuthenticated ? (
            <>
              <Text className="text-center py-2">
                Logged in as: {authStore.getEmail()}
              </Text>
              <View className="flex flex-row justify-evenly w-full">
                <GenericFlatButton
                  onPress={toggleRemoteSaveWindow}
                  disabled={
                    loadingDBInfo || !authStore.isConnectedAndInitialized
                  }
                >
                  {loadingDBInfo ? (
                    <D20DieAnimation size={20} keepRolling />
                  ) : (
                    "Make\n Cloud Save"
                  )}
                </GenericFlatButton>
                <GenericFlatButton
                  onPress={toggleRemoteLoadWindow}
                  disabled={
                    loadingDBInfo || !authStore.isConnectedAndInitialized
                  }
                >
                  {loadingDBInfo ? (
                    <D20DieAnimation size={20} keepRolling />
                  ) : (
                    "Load\n Cloud Save"
                  )}
                </GenericFlatButton>
              </View>
              <GenericRaisedButton onPress={logout}>
                Sign Out
              </GenericRaisedButton>
            </>
          ) : (
            <>
              {!authStore.isConnectedAndInitialized && (
                <Text className="text-center italic text-sm">
                  You are not connected to the internet
                </Text>
              )}
              <View className="flex flex-row justify-evenly w-full">
                <GenericRaisedButton
                  onPress={() => router.push("/Auth/sign-in")}
                  disabled={!authStore.isConnectedAndInitialized}
                >
                  Sign In
                </GenericRaisedButton>
                <GenericRaisedButton
                  onPress={() => router.push("/Auth/sign-up")}
                  backgroundColor={"#2563eb"}
                  textColor={"#fafafa"}
                  disabled={!authStore.isConnectedAndInitialized}
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
          <GenericStrikeAround>Reduce Motion</GenericStrikeAround>
          <View
            className="rounded px-4 py-2"
            style={{ marginLeft: -48, marginTop: 12 }}
          >
            <Pressable
              className="mb-4 ml-10 flex flex-row"
              onPress={() => {
                setReduceMotion(true);
              }}
            >
              <View
                className={
                  uiStore.reduceMotion
                    ? "my-auto mr-4 h-4 w-4 rounded-full border border-zinc-900 bg-blue-500 dark:border-zinc-50 dark:bg-blue-600"
                    : "my-auto mr-4 h-4 w-4 rounded-full border border-zinc-900 dark:border-zinc-50"
                }
              />
              <Text className="text-2xl tracking-widest">On</Text>
            </Pressable>
            <Pressable
              className="mb-4 ml-10 flex flex-row"
              onPress={() => {
                setReduceMotion(false);
              }}
            >
              <View
                className={
                  !uiStore.reduceMotion
                    ? "my-auto mr-4 h-4 w-4 rounded-full border border-zinc-900 bg-blue-500 dark:border-zinc-50 dark:bg-blue-600"
                    : "my-auto mr-4 h-4 w-4 rounded-full border border-zinc-900 dark:border-zinc-50"
                }
              />
              <Text className="text-2xl tracking-widest">Off</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
});
export default AppSettings;
