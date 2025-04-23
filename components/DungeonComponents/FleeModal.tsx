import GenericModal from "@/components/GenericModal";
import GenericFlatButton from "@/components/GenericFlatButton";
import { ThemedView, Text } from "@/components/Themed";
import { wait } from "@/utility/functions/misc";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { useCombatActions, useEnemyManagement } from "@/hooks/combat";
import { savePlayer } from "@/entities/character";
import { observer } from "mobx-react-lite";
import { useStyles } from "@/hooks/styles";
import { calculateFleeChance, fleeRoll } from "@/utility/functions/dungeon";
import { Enemy } from "@/entities/creatures";

const FleeModal = observer(() => {
  const vibration = useVibration();
  const rootStore = useRootStore();
  const { enemyStore, dungeonStore, playerState, uiStore } = rootStore;
  const { playerMinionsTurn } = useCombatActions();
  const { enemyTurn } = useEnemyManagement();
  const styles = useStyles();
  const router = useRouter();

  const [fleeRollFailure, setFleeRollFailure] = useState<boolean>(false);

  useEffect(() => {
    setFleeRollFailure(false);
  }, [dungeonStore.fleeModalShowing]);

  const flee = async () => {
    if (!playerState) return;

    try {
      const canFlee =
        enemyStore.enemies.length === 0 ||
        (enemyStore.enemies[0] instanceof Enemy &&
          enemyStore.enemies[0].creatureSpecies === "training dummy") ||
        !dungeonStore.inCombat ||
        fleeRoll(playerState, dungeonStore);

      if (canFlee) {
        await handleSuccessfulFlee();
      } else {
        await handleFailedFlee();
      }
    } catch (error) {
      console.error("Error during flee attempt:", error);
    }
  };

  const handleSuccessfulFlee = async () => {
    try {
      uiStore.setTotalLoadingSteps(5);

      await wait(150);

      vibration({ style: "light" });
      dungeonStore.setFleeModalShowing(false);
      if (dungeonStore.currentLevel?.isActivity) {
        dungeonStore.clearPersistedActivity();
      }

      uiStore.incrementLoadingStep();

      await Promise.all([
        rootStore.leaveDungeon().then(() => uiStore.incrementLoadingStep()),
        savePlayer(playerState!).then(() => uiStore.incrementLoadingStep()),
      ]);

      if (dungeonStore.currentInstance?.name === "Activities") {
        wait(100)
          .then(() => router.replace("/shops"))
          .then(() => router.push("/Activities"))
          .then(() => wait(200))
          .then(() => uiStore.incrementLoadingStep());
      } else {
        wait(100)
          .then(() => router.replace("/dungeon"))
          .then(() => wait(200))
          .then(() => uiStore.incrementLoadingStep());
      }
      uiStore.incrementLoadingStep();
      wait(150).then(() => {
        rootStore.gameTick();
      });
    } catch (error) {
      console.error("Error during successful flee:", error);
      uiStore.completeLoading();
    }
  };

  const handleFailedFlee = async () => {
    try {
      setFleeRollFailure(true);
      vibration({ style: "error" });
      dungeonStore.addLog("You failed to flee!");

      playerMinionsTurn(() => {
        enemyTurn({ clearanceCallback: () => null });
      });
    } catch (error) {
      console.error("Error during failed flee:", error);
    }
  };

  const fleeChance = useMemo(() => {
    if (!playerState || !dungeonStore.currentInstance) return 100;
    return calculateFleeChance(
      playerState.totalDexterity,
      dungeonStore.currentInstance.difficulty,
    );
  }, [playerState?.totalDexterity, dungeonStore.currentInstance?.difficulty]);

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
          <Text style={{ textAlign: "center", ...styles["text-xl"] }}>
            {enemyStore.enemies.length == 0 ||
            dungeonStore.currentInstance?.name.toLowerCase() ===
              "training grounds"
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
                (enemyStore.enemyTurnOngoing || playerState.isStunned)
              }
            >
              {enemyStore.enemies.length > 0 &&
              dungeonStore.currentInstance?.name.toLowerCase() !==
                "training grounds"
                ? `Run! (${Math.round(fleeChance)}%)`
                : "Leave"}
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
