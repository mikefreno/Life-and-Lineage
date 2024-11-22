import GenericModal from "../GenericModal";
import GenericFlatButton from "../GenericFlatButton";
import { ThemedView, Text } from "../Themed";
import { rollD20 } from "../../utility/functions/misc";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { useCombatActions, useEnemyManagement } from "../../hooks/combat";
import { savePlayer } from "../../entities/character";
import { observer } from "mobx-react-lite";

const FleeModal = observer(() => {
  const vibration = useVibration();
  const rootStore = useRootStore();
  const { enemyStore, dungeonStore, playerState, uiStore } = rootStore;
  const { playerMinionsTurn } = useCombatActions();
  const { enemyTurn } = useEnemyManagement();

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
        setFleeRollFailure(false);
        rootStore.leaveDungeon();
        dungeonStore.setFleeModalShowing(false);
        if (dungeonStore.currentInstance?.name == "Activities") {
          router.replace("/shops");
        } else {
          router.replace("/dungeon");
        }
        if (dungeonStore.currentInstance?.name == "Activities") {
          router.push("/Activities");
        }

        savePlayer(playerState);
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
        <ThemedView className="flex items-center justify-evenly">
          <Text className="text-center text-lg">
            {enemyStore.enemies.length == 0
              ? "Ready to Leave?"
              : "Attempt to Flee?"}
          </Text>
          {playerState.isStunned ? (
            <Text style={{ color: "#ef4444" }}>You are stunned!</Text>
          ) : null}
          <ThemedView className="flex w-full flex-row justify-evenly pt-8">
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
            <Text className="text-center" style={{ color: "#ef4444" }}>
              Roll Failure!
            </Text>
          ) : null}
        </ThemedView>
      </GenericModal>
    );
  }
});

export default FleeModal;
