import React, { useMemo } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Text } from "@/components/Themed";
import { useEffect, useState } from "react";
import { toTitleCase } from "@/utility/functions/misc";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { useRouter } from "expo-router";
import GenericRaisedButton from "@/components/GenericRaisedButton";
import { observer } from "mobx-react-lite";
import GenericModal from "@/components/GenericModal";
import { CheckpointRow } from "@/utility/database";
import D20DieAnimation from "@/components/DieRollAnim";
import GenericFlatButton from "@/components/GenericFlatButton";
import { useRootStore } from "@/hooks/stores";
import { useVibration } from "@/hooks/generic";
import { flex, useStyles } from "@/hooks/styles";
import { runInAction } from "mobx";
import Colors from "@/constants/Colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const themeOptions = ["system", "light", "dark"];
const vibrationOptions = ["full", "minimal", "none"];

export const AppSettings = observer(() => {
  let root = useRootStore();
  const { playerState, uiStore, authStore, saveStore, iapStore } = root;
  const isDark = uiStore.colorScheme === "dark";
  const [showRemoteSaveWindow, setShowRemoteSaveWindow] =
    useState<boolean>(false);
  const [showRemoteLoadWidow, setShowRemoteLoadWindow] =
    useState<boolean>(false);
  const [remoteSaves, setRemoteSaves] = useState<CheckpointRow[]>([]);
  const [saveName, setSaveName] = useState<string>("");
  const [loadingDBInfo, setLoadingDBInfo] = useState<boolean>(false);
  const [showAccountDeletedMessage, setShowAccountDeletedMessage] =
    useState(false);

  const vibration = useVibration();
  const styles = useStyles();
  const router = useRouter();

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

  const scrollContentStyle = useMemo(() => {
    return {
      flexGrow: 1,
      justifyContent: "center",
      ...styles.notchMirroredLanscapePad,
    };
  }, [uiStore.insets]);

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
            <Text style={styles["text-xl"]}>Remote Saving</Text>
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
                  style={{
                    paddingTop: 8,
                    textAlign: "center",
                    ...styles["text-xl"],
                  }}
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
          <Text style={styles["text-xl"]}>Load Saves</Text>
          <Text
            style={{
              textAlign: "center",
              color: "#ef4444",
              ...styles["text-xl"],
            }}
          >
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
              <Text
                style={{
                  paddingTop: 8,
                  textAlign: "center",
                  ...styles["text-xl"],
                }}
              >
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
      <ScrollView contentContainerStyle={scrollContentStyle}>
        <View style={styles.settingsContainer}>
          <GenericStrikeAround>
            <Text style={[styles["text-xl"], { textAlign: "center" }]}>
              Remote Backups{!authStore.isAuthenticated && `\n(requires login)`}
            </Text>
          </GenericStrikeAround>
          {authStore.isAuthenticated ? (
            <AccountManagement
              toggleRemoteSaveWindow={toggleRemoteSaveWindow}
              toggleRemoteLoadWindow={toggleRemoteLoadWindow}
              loadingDBInfo={loadingDBInfo}
              logout={logout}
              setShowAccountDeletedMessage={setShowAccountDeletedMessage}
            />
          ) : (
            <>
              {!authStore.isConnectedAndInitialized && (
                <>
                  <Text
                    style={{
                      textAlign: "center",
                      fontStyle: "italic",
                      fontSize: 14,
                    }}
                  >
                    You are not connected to the internet
                  </Text>
                  <GenericFlatButton
                    onPress={() => authStore.initializeNetInfo}
                  >
                    <FontAwesome6
                      name="arrow-rotate-right"
                      size={uiStore.iconSizeXL}
                      color={Colors[uiStore.colorScheme].text}
                    />
                  </GenericFlatButton>
                </>
              )}
              {iapStore.remoteSavesUnlocked ? (
                <View style={{ ...flex.rowEvenly, width: "100%" }}>
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
              ) : (
                <GenericRaisedButton
                  onPress={() => router.push("/Options/iaps")}
                >
                  Unlock
                </GenericRaisedButton>
              )}
            </>
          )}
          {showAccountDeletedMessage && (
            <Text
              style={{
                textAlign: "center",
                color: Colors[uiStore.colorScheme].success,
              }}
            >
              Your account has been successfully deleted.
            </Text>
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
                    selectedThemeOption === index && {
                      backgroundColor:
                        uiStore.colorScheme === "dark" ? "#2563eb" : "#3b82f6",
                    },
                  ]}
                />
                <Text style={styles["text-2xl"]}>{toTitleCase(item)}</Text>
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
                    selectedVibrationOption === index && {
                      backgroundColor:
                        uiStore.colorScheme === "dark" ? "#2563eb" : "#3b82f6",
                    },
                  ]}
                />
                <Text style={styles["text-2xl"]}>{toTitleCase(item)}</Text>
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
              <Text style={styles["text-2xl"]}>On</Text>
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
              <Text style={styles["text-2xl"]}>Off</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          onPress={() => {
            runInAction(() => (uiStore.webviewURL = "contact"));
            router.push("/FrenoDotMeWebview");
          }}
          style={{ paddingVertical: uiStore.dimensions.height * 0.02 }}
        >
          <Text
            style={[
              styles["text-xl"],
              {
                color: Colors[uiStore.colorScheme].tabIconSelected,
                textDecorationLine: "underline",
                textAlign: "center",
              },
            ]}
          >
            Contact
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
});
export default AppSettings;

const AccountManagement = observer(
  ({
    toggleRemoteSaveWindow,
    toggleRemoteLoadWindow,
    loadingDBInfo,
    logout,
    setShowAccountDeletedMessage,
  }: {
    toggleRemoteSaveWindow: () => void;
    toggleRemoteLoadWindow: () => void;
    loadingDBInfo: boolean;
    logout: () => void;
    setShowAccountDeletedMessage: (val: boolean) => void;
  }) => {
    const { authStore, uiStore } = useRootStore();
    const styles = useStyles();

    const [deletionStep, setDeletionStep] = useState<number>(0);
    const [shouldEmailDump, setShouldEmailDump] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [deletionRequestResponse, setDeletionRequestResponse] = useState<
      { ok: boolean; message: string } | undefined
    >(undefined);

    const handleDeletion = async ({
      skipCron,
      sendEmail,
    }: {
      skipCron: boolean;
      sendEmail: boolean;
    }) => {
      setLoading(true);

      const parse = await authStore.deleteAccount({
        sendEmail,
        skipCron,
      });

      setDeletionRequestResponse({ ok: parse.ok, message: parse.message });
      setDeletionStep(0);
      if (parse.ok) {
        if (skipCron) {
          setShowAccountDeletedMessage(true);
          await authStore.logout();
        } else {
          await authStore.deletionCheck();
        }
      }
      setLoading(false);
    };

    const handleCancelation = async () => {
      setLoading(true);

      const parse = await authStore.deletionCancel();

      setDeletionRequestResponse({ ok: parse.ok, message: parse.message });
      setDeletionStep(0);
      await authStore.deletionCheck();
      setLoading(false);
    };

    if (loading) {
      return (
        <D20DieAnimation
          keepRolling={true}
          slowRoll={true}
          showNumber={false}
        />
      );
    }

    return (
      <>
        <Text style={{ textAlign: "center", paddingVertical: 8 }}>
          Logged in as: {authStore.getEmail()}
        </Text>
        {deletionStep === 0 ? (
          <>
            <View style={{ ...flex.rowEvenly, width: "100%" }}>
              <GenericFlatButton
                onPress={toggleRemoteSaveWindow}
                disabled={loadingDBInfo || !authStore.isConnectedAndInitialized}
              >
                {loadingDBInfo ? (
                  <D20DieAnimation size={20} keepRolling />
                ) : (
                  "Make\n Cloud Save"
                )}
              </GenericFlatButton>
              <GenericFlatButton
                onPress={toggleRemoteLoadWindow}
                disabled={loadingDBInfo || !authStore.isConnectedAndInitialized}
              >
                {loadingDBInfo ? (
                  <D20DieAnimation size={20} keepRolling />
                ) : (
                  "Load\n Cloud Save"
                )}
              </GenericFlatButton>
            </View>
            <View
              style={[
                styles.rowEvenly,
                { alignItems: "center", width: "100%" },
              ]}
            >
              <GenericRaisedButton
                style={{ width: uiStore.dimensions.lesser * 0.45 }}
                onPress={logout}
              >
                Sign Out
              </GenericRaisedButton>
              {authStore.deletionScheduled ? (
                <GenericRaisedButton
                  style={{ width: uiStore.dimensions.lesser * 0.45 }}
                  onPress={handleCancelation}
                  backgroundColor={Colors[uiStore.colorScheme].error}
                  textColor="white"
                >
                  Cancel
                </GenericRaisedButton>
              ) : (
                <GenericRaisedButton
                  style={{ width: uiStore.dimensions.lesser * 0.45 }}
                  vibrationStrength={"warning"}
                  onPress={() => {
                    setDeletionStep(1);
                    setDeletionRequestResponse(undefined);
                  }}
                  backgroundColor={Colors[uiStore.colorScheme].error}
                  textColor="white"
                >{`Delete\nAccount`}</GenericRaisedButton>
              )}
            </View>
            {authStore.deletionScheduled && (
              <Text style={{ textAlign: "center" }}>
                Deletion scheduled for: {authStore.deletionScheduled}
              </Text>
            )}
          </>
        ) : deletionStep === 1 ? (
          <>
            <Text style={{ textAlign: "center", ...styles["text-lg"] }}>
              Would you like to receive an email containing your database dump?
              (This will have all your save states - can be used to reinstate
              your db if you decide to recreate an account)
            </Text>
            <View
              style={[
                styles.rowEvenly,
                { alignItems: "center", width: "100%" },
              ]}
            >
              <GenericRaisedButton
                style={{ width: uiStore.dimensions.lesser * 0.45 }}
                onPress={() => {
                  setShouldEmailDump(true);
                  setDeletionStep(2);
                }}
                backgroundColor={Colors[uiStore.colorScheme].interactive}
                textColor="white"
              >
                {`Yes\n(recommended)`}
              </GenericRaisedButton>
              <GenericRaisedButton
                style={{ width: uiStore.dimensions.lesser * 0.45 }}
                onPress={() => setDeletionStep(2)}
              >
                {`Continue\nwithout`}
              </GenericRaisedButton>
            </View>
          </>
        ) : (
          <>
            <Text style={{ textAlign: "center", ...styles["text-lg"] }}>
              By default, your account and database will be deleted in 24-48
              hours, allowing you to cancel within that window. Would you
              instead like to delete immediately?
            </Text>
            <View
              style={[
                styles.rowEvenly,
                { alignItems: "center", width: "100%" },
              ]}
            >
              <GenericRaisedButton
                style={{ width: uiStore.dimensions.lesser * 0.45 }}
                onPress={() =>
                  handleDeletion({ skipCron: true, sendEmail: shouldEmailDump })
                }
              >
                Yes
              </GenericRaisedButton>
              <GenericRaisedButton
                style={{ width: uiStore.dimensions.lesser * 0.45 }}
                onPress={() =>
                  handleDeletion({
                    skipCron: false,
                    sendEmail: shouldEmailDump,
                  })
                }
                backgroundColor={Colors[uiStore.colorScheme].interactive}
                textColor="white"
              >
                No (recommended)
              </GenericRaisedButton>
            </View>
          </>
        )}
        {deletionStep !== 0 && (
          <GenericRaisedButton
            style={{ width: uiStore.dimensions.lesser * 0.45 }}
            onPress={() => {
              setDeletionStep(0);
            }}
          >
            Cancel
          </GenericRaisedButton>
        )}
        {deletionRequestResponse && (
          <Text
            style={{
              textAlign: "center",
              color: deletionRequestResponse.ok
                ? Colors[uiStore.colorScheme].success
                : Colors[uiStore.colorScheme].error,
            }}
          >
            {deletionRequestResponse.message}
          </Text>
        )}
      </>
    );
  },
);
