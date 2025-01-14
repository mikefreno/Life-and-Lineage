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

  const flee = () => {
    if (playerState) {
      enemyStore.setAttackAnimationOngoing(true);
      const roll = rollD20();
      if (
        enemyStore.enemies.length == 0 ||
        enemyStore.enemies[0].creatureSpecies == "training dummy" ||
        roll > 10 ||
        !dungeonStore.inCombat
      ) {
        vibration({ style: "light" });
        dungeonStore.setFleeModalShowing(false);
        wait(100).then(() => {
          uiStore.setTotalLoadingSteps(3);

          rootStore.leaveDungeon();
          uiStore.incrementLoadingStep();

          if (dungeonStore.currentInstance?.name == "Activities") {
            router.replace("/shops");
          } else {
            router.replace("/dungeon");
          }
          uiStore.incrementLoadingStep();

          if (dungeonStore.currentInstance?.name == "Activities") {
            router.push("/Activities");
          }
          uiStore.incrementLoadingStep();

          savePlayer(playerState);
          uiStore.incrementLoadingStep();
        });
      } else {
        setFleeRollFailure(true);
        vibration({ style: "error" });
        dungeonStore.addLog("You failed to flee!");

        playerMinionsTurn(() => {
          enemyTurn();
        });
      }
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
