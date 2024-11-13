import GenericModal from "../GenericModal";
import GenericFlatButton from "../GenericFlatButton";
import { ThemedView, Text } from "../Themed";
import { rollD20, wait } from "../../utility/functions/misc";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useEnemyAnimation } from "../../stores/DungeonData";
import { useBattleLogger, useVibration } from "../../hooks/generic";
import { useRootStore } from "../../hooks/stores";
import { useCombatActions, useEnemyManagement } from "../../hooks/combat";
import { savePlayer } from "../../entities/character";

export default function FleeModal({
  fleeModalShowing,
  setFleeModalShowing,
}: {
  fleeModalShowing: boolean;
  setFleeModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const vibration = useVibration();
  const { playerState, enemyStore, gameState, dungeonStore } = useRootStore();
  const { inCombat, currentInstance } = dungeonStore;
  const { attackAnimationOnGoing, setAttackAnimationOnGoing } =
    useEnemyAnimation();
  const { battleLogger } = useBattleLogger();
  const { playerMinionsTurn } = useCombatActions();
  const { enemyTurn } = useEnemyManagement();

  const [fleeRollFailure, setFleeRollFailure] = useState<boolean>(false);

  useEffect(() => {
    setFleeRollFailure(false);
  }, [fleeModalShowing]);

  const flee = () => {
    if (playerState && gameState) {
      setAttackAnimationOnGoing(true);
      const roll = rollD20();
      if (
        enemyStore.enemies[0].creatureSpecies == "training dummy" ||
        roll > 13 ||
        !inCombat
      ) {
        vibration({ style: "light" });
        setFleeRollFailure(false);
        setFleeModalShowing(false);
        setAttackAnimationOnGoing(false);
        wait(500).then(() => {
          playerState.clearMinions();
          while (router.canGoBack()) {
            router.back();
          }
          if (currentInstance?.name == "Activities") {
            router.replace("/shops");
          } else {
            router.replace("/dungeon");
          }
          playerState.setInDungeon({ state: false });
          enemyStore.enemies = [];
          if (currentInstance?.name == "Activities") {
            router.push("/Activities");
          }
          savePlayer(playerState);
        });
      } else {
        setFleeRollFailure(true);
        vibration({ style: "error" });
        battleLogger("You failed to flee!");

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
            <GenericFlatButton
              onPress={flee}
              disabled={
                inCombat && (attackAnimationOnGoing || playerState.isStunned)
              }
            >
              {enemyStore.enemies.length == 0 ? "Run! (50%)" : "Leave"}
            </GenericFlatButton>
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
