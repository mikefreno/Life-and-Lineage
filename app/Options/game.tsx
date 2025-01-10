import React from "react";
import { Text } from "../../components/Themed";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { toTitleCase, wait } from "../../utility/functions/misc";
import { Pressable, Switch, View } from "react-native";
import GenericRaisedButton from "../../components/GenericRaisedButton";
import GenericStrikeAround from "../../components/GenericStrikeAround";
import GenericModal from "../../components/GenericModal";
import D20DieAnimation from "../../components/DieRollAnim";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import CheckpointModal from "../../components/CheckpointModal";
import { text, useStyles } from "../../hooks/styles";

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
  const { uiStore, tutorialStore } = useRootStore();
  const styles = useStyles();
  const vibration = useVibration();
  const [tutorialState, setTutorialState] = useState<boolean>(
    tutorialStore.tutorialsEnabled ?? true,
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedHealthWarning, setSelectedHealthWarning] = useState<string>(
    healthWarningOptions[uiStore.healthWarning ?? 0.2],
  );
  const [showTutorialResetConfirm, setShowTutorialResetConfirm] =
    useState<boolean>(false);
  const [showCheckpoints, setShowCheckpoints] = useState<boolean>(false);

  const startNewGame = () => {
    vibration({ style: "warning" });
    router.dismissAll();
    wait(0).then(() => router.push("/NewGame/ClassSelect"));
  };

  useEffect(() => {
    if (tutorialState == false) {
      tutorialStore.disableTutorials();
    } else {
      tutorialStore.enableTutorials();
    }
  }, [tutorialState]);

  const healthWarningSetter = (choice: number) => {
    uiStore.setHealthWarning(choice);
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
            <Text
              style={{
                textAlign: "center",
                ...text.lg,
              }}
            >
              This will reset all tutorials, some may not make sense based on
              your current game/player/inventory state (And restart the app).
            </Text>
            <Text style={{ textAlign: "center", ...text["2xl"] }}>
              Are you sure?
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Pressable
                onPress={() => {
                  vibration({ style: "warning" });
                  setLoading(true);
                  tutorialStore.resetTutorialState(() => {
                    setShowTutorialResetConfirm(false);
                    setLoading(false);
                    router.dismissAll();
                  });
                }}
                style={styles.tutorialResetButton}
              >
                <Text>Reset</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowTutorialResetConfirm(false)}
                style={styles.tutorialResetButton}
              >
                <Text>Cancel</Text>
              </Pressable>
            </View>
          </>
        )}
      </GenericModal>

      <CheckpointModal
        allowSaving
        isVisible={showCheckpoints}
        onClose={() => setShowCheckpoints(false)}
      />

      <View style={styles.gameSettingsContainer}>
        <GenericStrikeAround>Game Saves</GenericStrikeAround>
        <GenericRaisedButton onPress={() => setShowCheckpoints(true)}>
          Manage Game Saves
        </GenericRaisedButton>

        <GenericStrikeAround>Game Restart</GenericStrikeAround>
        <GenericRaisedButton onPress={startNewGame}>
          Start New Game
        </GenericRaisedButton>

        <GenericStrikeAround>Health Warning</GenericStrikeAround>
        <View style={styles.healthWarningContainer}>
          {healthWarningVals.map((item, idx) => (
            <Pressable
              key={idx}
              style={styles.healthWarningOption}
              onPress={() => healthWarningSetter(healthWarningKeys[idx])}
            >
              <View
                style={[
                  styles.optionCircle,
                  selectedHealthWarning == healthWarningVals[idx] && {
                    backgroundColor:
                      uiStore.colorScheme === "dark" ? "#2563eb" : "#3b82f6",
                  },
                ]}
              />
              <Text style={text["2xl"]}>{toTitleCase(item)}</Text>
            </Pressable>
          ))}
        </View>

        <GenericStrikeAround>Tutorials</GenericStrikeAround>
        <View style={[styles.rowItemsCenter, styles.pt4]}>
          <Text style={text.lg}>Tutorials Enabled: </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#3b82f6" }}
            ios_backgroundColor="#3e3e3e"
            thumbColor={"white"}
            onValueChange={(bool) => setTutorialState(bool)}
            value={tutorialState}
          />
        </View>
        <GenericRaisedButton
          onPress={() => {
            vibration({ style: "light" });
            setShowTutorialResetConfirm(true);
          }}
        >
          Reset Tutorials
        </GenericRaisedButton>
      </View>
    </>
  );
}
