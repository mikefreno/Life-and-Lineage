import GenericModal from "../GenericModal";
import GenericFlatButton from "../GenericFlatButton";
import { ThemedView, Text } from "../Themed";
import { rollD20, wait } from "../../utility/functions/misc";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useVibration } from "../../hooks/generic";
import { useGameStore, usePlayerStore, useRootStore } from "../../hooks/stores";
import { useCombatActions, useEnemyManagement } from "../../hooks/combat";
import { PlayerCharacter, savePlayer } from "../../entities/character";
import { observer } from "mobx-react-lite";
import EnemyStore from "../../stores/EnemyStore";

export default function FleeModal({
  fleeModalShowing,
  setFleeModalShowing,
}: {
  fleeModalShowing: boolean;
  setFleeModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const vibration = useVibration();
  const rootStore = useRootStore();
  const { enemyStore, dungeonStore } = rootStore;
  const playerState = usePlayerStore();
  const gameState = useGameStore();
  const { playerMinionsTurn } = useCombatActions();
  const { enemyTurn } = useEnemyManagement();

  const [fleeRollFailure, setFleeRollFailure] = useState<boolean>(false);

  useEffect(() => {
    setFleeRollFailure(false);
  }, [fleeModalShowing]);

  const flee = () => {
    if (playerState && gameState) {
      enemyStore.setAttackAnimationOngoing(true);
      const roll = rollD20();
      if (
        enemyStore.enemies.length == 0 ||
        enemyStore.enemies[0].creatureSpecies == "training dummy" ||
        roll > 13 ||
        !dungeonStore.inCombat
      ) {
        vibration({ style: "light" });
        setFleeRollFailure(false);
        setFleeModalShowing(false);
        rootStore.leaveDungeon();
        wait(500).then(() => {
          while (router.canGoBack()) {
            router.back();
          }
          if (dungeonStore.currentInstance?.name == "Activities") {
            router.replace("/shops");
          } else {
            router.replace("/dungeon");
          }
          if (dungeonStore.currentInstance?.name == "Activities") {
            router.push("/Activities");
          }
          savePlayer(playerState);
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
        isVisibleCondition={fleeModalShowing}
        backFunction={() => {
          setFleeModalShowing(false);
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
            <FleeButton
              enemyStore={enemyStore}
              playerState={playerState}
              inCombat={dungeonStore.inCombat}
              flee={flee}
            />
            <GenericFlatButton
              onPress={() => {
                setFleeModalShowing(false);
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
}

const FleeButton = observer(
  ({
    enemyStore,
    playerState,
    inCombat,
    flee,
  }: {
    enemyStore: EnemyStore;
    playerState: PlayerCharacter;
    inCombat: boolean;
    flee: () => void;
  }) => {
    return (
      <GenericFlatButton
        onPress={flee}
        disabled={
          inCombat &&
          (enemyStore.attackAnimationsOnGoing || playerState.isStunned)
        }
      >
        {enemyStore.enemies.length > 0 ? "Run! (50%)" : "Leave"}
      </GenericFlatButton>
    );
  },
);
