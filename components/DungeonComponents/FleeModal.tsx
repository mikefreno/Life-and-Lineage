import GenericModal from "../GenericModal";
import GenericFlatButton from "../GenericFlatButton";
import { ThemedView, Text } from "../Themed";
import { rollD20, wait } from "../../utility/functions/misc";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { useCombatActions, useEnemyManagement } from "../../hooks/combat";
import { savePlayer } from "../../entities/character";
import { observer } from "mobx-react-lite";
import { useStyles } from "../../hooks/styles";

const FleeModal = observer(() => {
  const vibration = useVibration();
  const rootStore = useRootStore();
  const { enemyStore, dungeonStore, playerState, uiStore } = rootStore;
  const { playerMinionsTurn } = useCombatActions();
  const { enemyTurn } = useEnemyManagement();
  const styles = useStyles();

  const [fleeRollFailure, setFleeRollFailure] = useState<boolean>(false);

  useEffect(() => {
    setFleeRollFailure(false);
  }, [dungeonStore.fleeModalShowing]);

  const flee = async () => {
    if (!playerState) return;

    try {
      enemyStore.setAttackAnimationOngoing(true);
      const roll = rollD20();

      const canFlee =
        enemyStore.enemies.length === 0 ||
        enemyStore.enemies[0].creatureSpecies === "training dummy" ||
        roll > 10 ||
        !dungeonStore.inCombat;

      if (canFlee) {
        await handleSuccessfulFlee();
      } else {
        await handleFailedFlee();
      }
    } catch (error) {
      console.error("Error during flee attempt:", error);
      uiStore.setError("Failed to process flee attempt");
      enemyStore.setAttackAnimationOngoing(false);
    }
  };

  const handleSuccessfulFlee = async () => {
    try {
      vibration({ style: "light" });
      dungeonStore.setFleeModalShowing(false);

      await wait(250);
      uiStore.setTotalLoadingSteps(3);

      // Handle dungeon exit and player save in parallel
      await Promise.all([
        rootStore.leaveDungeon().then(() => uiStore.incrementLoadingStep()),
        savePlayer(playerState!).then(() => uiStore.incrementLoadingStep()),
      ]);

      if (dungeonStore.currentInstance?.name === "Activities") {
        router.replace("/shops");
        router.push("/Activities");
      } else {
        router.replace("/dungeon");
      }

      uiStore.incrementLoadingStep();
    } catch (error) {
      console.error("Error during successful flee:", error);
    }
  };

  const handleFailedFlee = async () => {
    try {
      setFleeRollFailure(true);
      vibration({ style: "error" });
      dungeonStore.addLog("You failed to flee!");

      playerMinionsTurn(() => {
        enemyTurn();
      });
    } catch (error) {
      console.error("Error during failed flee:", error);
    }
  };

  if (playerState) {
    return (
      <GenericModal
        isVisibleCondition={dungeonStore.fleeModalShowing}
        backFunction={() => {
          dungeonStore.setFleeModalShowing(false);
          setFleeRollFailure(false);
        }}
      >
        <ThemedView
          style={{
            ...styles.columnCenter,
            justifyContent: "space-evenly",
          }}
        >
          <Text style={{ textAlign: "center", ...styles.xl }}>
            {enemyStore.enemies.length == 0
              ? "Ready to Leave?"
              : "Attempt to Flee?"}
          </Text>
          {playerState.isStunned ? (
            <Text style={{ color: "#ef4444" }}>You are stunned!</Text>
          ) : null}
          <ThemedView style={styles.fleeButtonRow}>
            <GenericFlatButton
              onPress={flee}
              disabled={
                dungeonStore.inCombat &&
                (enemyStore.attackAnimationsOnGoing || playerState.isStunned)
              }
            >
              {enemyStore.enemies.length > 0 ? "Run! (50%)" : "Leave"}
            </GenericFlatButton>
            <GenericFlatButton
              onPress={() => {
                dungeonStore.setFleeModalShowing(false);
                setFleeRollFailure(false);
              }}
            >
              Cancel
            </GenericFlatButton>
          </ThemedView>
          {fleeRollFailure ? (
            <Text style={{ textAlign: "center", color: "#ef4444" }}>
              Roll Failure!
            </Text>
          ) : null}
        </ThemedView>
      </GenericModal>
    );
  }
});

export default FleeModal;
