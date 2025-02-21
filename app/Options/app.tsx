import React from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Text } from "../../components/Themed";
import { useEffect, useState } from "react";
import { toTitleCase } from "../../utility/functions/misc";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import { router } from "expo-router";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import { observer } from "mobx-react-lite";
import GenericModal from "../../components/GenericModal";
import { CheckpointRow } from "../../utility/database";
import D20DieAnimation from "../../components/DieRollAnim";
import GenericFlatButton from "../../components/GenericFlatButton";
import { useRootStore } from "../../hooks/stores";
import { useVibration } from "../../hooks/generic";
import { flex, text, tw, useStyles } from "../../hooks/styles";

const themeOptions = ["system", "light", "dark"];
const vibrationOptions = ["full", "minimal", "none"];

export const AppSettings = observer(() => {
  let root = useRootStore();
  const { playerState, uiStore, authStore, saveStore } = root;
  const isDark = uiStore.colorScheme === "dark";
  const [showRemoteSaveWindow, setShowRemoteSaveWindow] =
    useState<boolean>(false);
  const [showRemoteLoadWidow, setShowRemoteLoadWindow] =
    useState<boolean>(false);
  const [remoteSaves, setRemoteSaves] = useState<CheckpointRow[]>([]);
  const [saveName, setSaveName] = useState<string>("");
  const [loadingDBInfo, setLoadingDBInfo] = useState<boolean>(false);

  const vibration = useVibration();
  const styles = useStyles();

  const [selectedThemeOption, setSelectedThemeOption] = useState<number>(
    themeOptions.indexOf(uiStore.preferedColorScheme),
  );

  const [selectedVibrationOption, setSelectedVibrationOption] =
    useState<number>(vibrationOptions.indexOf(uiStore.vibrationEnabled));

  function setColorTheme(index: number, option: "system" | "light" | "dark") {
    vibration({ style: "light" });
    uiStore.setPreferedColorScheme(option);
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
      saveStore.getRemoteCheckpoints().then((rows) => {
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
      await saveStore.makeRemoteSave(saveName);
      const res = await saveStore.getRemoteCheckpoints();
      setRemoteSaves(res);

      setLoadingDBInfo(false);
    }
  };

  const overwriteSave = async (chosenCheckpoint: CheckpointRow) => {
    if (playerState) {
      setLoadingDBInfo(true);
      saveStore.overwriteRemoteSave(chosenCheckpoint.id);
      const res = await saveStore.getRemoteCheckpoints();
      setRemoteSaves(res);
      setLoadingDBInfo(false);
    }
  };

  const deleteRemoteSave = async (chosenCheckpoint: CheckpointRow) => {
    setLoadingDBInfo(true);
    await saveStore.deleteRemoteCheckpoint(chosenCheckpoint.id);
    const res = await saveStore.getRemoteCheckpoints();
    setRemoteSaves(res);
    setLoadingDBInfo(false);
  };

  async function loadRemoteCheckpoint(id: number) {
    setLoadingDBInfo(true);
    await saveStore.loadRemoteCheckpoint(id);
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
          <View style={styles.px2}>
            <Text style={text.xl}>Remote Saving</Text>
            <GenericStrikeAround>Make New Save</GenericStrikeAround>
            <TextInput
              style={styles.modalTextInput}
              placeholderTextColor={isDark ? "#d4d4d8" : "#71717a"}
              onChangeText={(text) => setSaveName(text)}
              placeholder={"New Save Name"}
              autoCorrect={false}
              value={saveName}
            />
            <Text style={{ textAlign: "center", fontSize: 14 }}>
              Min Length: 3
            </Text>
            <GenericFlatButton
              onPress={newRemoteSave}
              disabled={saveName.length < 3}
            >
              Save
            </GenericFlatButton>
            <GenericStrikeAround>Current Saves</GenericStrikeAround>
            {remoteSaves.map((save) => (
              <View key={save.id} style={styles.remoteSaveContainer}>
                <Pressable
                  style={styles.remoteSaveDeleteButton}
                  onPress={() => {
                    vibration({ essential: true, style: "warning" });
                    deleteRemoteSave(save);
                  }}
                >
                  <Text style={{ textAlign: "center" }}>X</Text>
                </Pressable>
                <Text
                  style={{ paddingTop: 8, textAlign: "center", ...text.xl }}
                >
                  {save.name}
                </Text>
                <View style={styles.remoteSaveInfo}>
                  <Text>Last updated: {save.last_updated}</Text>
                  <Text>Created at: {save.created_at}</Text>
                </View>
                <GenericFlatButton
                  backgroundColor={isDark ? "black" : "white"}
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
        <ScrollView style={styles.px2}>
          <Text style={text.xl}>Load Saves</Text>
          <Text style={{ textAlign: "center", color: "#ef4444", ...text.xl }}>
            Make sure to backup first!
          </Text>
          {remoteSaves.map((save) => (
            <View key={save.id} style={styles.remoteSaveContainer}>
              <Pressable
                style={styles.remoteSaveDeleteButton}
                onPress={() => {
                  vibration({ essential: true, style: "warning" });
                  deleteRemoteSave(save);
                }}
              >
                <Text style={{ textAlign: "center" }}>X</Text>
              </Pressable>
              <Text style={{ paddingTop: 8, textAlign: "center", ...text.xl }}>
                {save.name}
              </Text>
              <View style={styles.remoteSaveInfo}>
                <Text>Last updated: {save.last_updated}</Text>
                <Text>Created at: {save.created_at}</Text>
              </View>
              <GenericFlatButton
                backgroundColor={isDark ? "black" : "white"}
                onPress={() => loadRemoteCheckpoint(save.id)}
              >
                Load Save
              </GenericFlatButton>
            </View>
          ))}
        </ScrollView>
      </GenericModal>

      <ScrollView>
        <View style={styles.settingsContainer}>
          <GenericStrikeAround>
            <Text style={[text.xl, { textAlign: "center" }]}>
              Remote Backups{!authStore.isAuthenticated && `\n(requires login)`}
            </Text>
          </GenericStrikeAround>
          {authStore.isAuthenticated ? (
            <>
              <Text style={{ textAlign: "center", paddingVertical: 8 }}>
                Logged in as: {authStore.getEmail()}
              </Text>
              <View
                style={{
                  ...flex.rowEvenly,
                  width: "100%",
                }}
              >
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
                <Text
                  style={{
                    textAlign: "center",
                    fontStyle: "italic",
                    fontSize: 14,
                  }}
                >
                  You are not connected to the internet
                </Text>
              )}
              <View
                style={{
                  ...flex.rowEvenly,
                  width: "100%",
                }}
              >
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
          <View style={styles.optionContainer}>
            {themeOptions.map((item, index) => (
              <Pressable
                key={index}
                style={styles.optionRow}
                onPress={() =>
                  setColorTheme(index, item as "system" | "light" | "dark")
                }
              >
                <View
                  style={[
                    styles.optionCircle,
                    selectedThemeOption == index && {
                      backgroundColor:
                        uiStore.colorScheme === "dark" ? "#2563eb" : "#3b82f6",
                    },
                  ]}
                />
                <Text style={text["2xl"]}>{toTitleCase(item)}</Text>
              </Pressable>
            ))}
          </View>
          <GenericStrikeAround>Vibration Settings</GenericStrikeAround>
          <View style={styles.optionContainer}>
            {vibrationOptions.map((item, index) => (
              <Pressable
                key={index}
                style={styles.optionRow}
                onPress={() =>
                  setVibrationLevel(index, item as "full" | "minimal" | "none")
                }
              >
                <View
                  style={[
                    styles.optionCircle,
                    selectedVibrationOption == index && {
                      backgroundColor:
                        uiStore.colorScheme === "dark" ? "#2563eb" : "#3b82f6",
                    },
                  ]}
                />
                <Text style={text["2xl"]}>{toTitleCase(item)}</Text>
              </Pressable>
            ))}
          </View>

          <GenericStrikeAround>Reduce Motion</GenericStrikeAround>
          <View style={styles.optionContainer}>
            <Pressable
              style={styles.optionRow}
              onPress={() => setReduceMotion(true)}
            >
              <View
                style={[
                  styles.optionCircle,
                  uiStore.reduceMotion && {
                    backgroundColor:
                      uiStore.colorScheme === "dark" ? "#2563eb" : "#3b82f6",
                  },
                ]}
              />
              <Text style={text["2xl"]}>On</Text>
            </Pressable>
            <Pressable
              style={styles.optionRow}
              onPress={() => setReduceMotion(false)}
            >
              <View
                style={[
                  styles.optionCircle,
                  !uiStore.reduceMotion && {
                    backgroundColor:
                      uiStore.colorScheme === "dark" ? "#2563eb" : "#3b82f6",
                  },
                ]}
              />
              <Text style={text["2xl"]}>Off</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
});
export default AppSettings;
