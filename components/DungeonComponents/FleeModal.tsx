import GenericModal from "../GenericModal";
import GenericFlatButton from "../GenericFlatButton";
import { ThemedView, Text } from "../Themed";
import { rollD20, wait } from "../../utility/functions/misc";
import {
  useBattleLogger,
  useCombatActions,
  useEnemyManagement,
  useVibration,
} from "../../utility/customHooks";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useGameState } from "../../stores/AppData";
import { useDungeonCore, useEnemyAnimation } from "../../stores/DungeonData";
import { savePlayer } from "../../utility/functions/save_load";

export default function FleeModal({
  fleeModalShowing,
  setFleeModalShowing,
}: {
  fleeModalShowing: boolean;
  setFleeModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const vibration = useVibration();
  const { playerState, enemyState, setEnemy, gameState } = useGameState();
  const { inCombat, slug } = useDungeonCore();
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
        enemyState?.creatureSpecies == "training dummy" ||
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
          if (slug[0] == "Activities") {
            router.replace("/shops");
          } else {
            router.replace("/dungeon");
          }
          playerState.setInDungeon({ state: false });
          setEnemy(null);
          if (slug[0] == "Activities") {
            router.push("/Activities");
          }
          //gameState.gameTick({ playerState });
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
            {!enemyState ? "Ready to Leave?" : "Attempt to Flee?"}
          </Text>
          {playerState.isStunned ? (
            <Text style={{ color: "#ef4444" }}>You are stunned!</Text>
          ) : null}
          <ThemedView className="flex w-full flex-row justify-evenly pt-8">
            <GenericFlatButton
              onPressFunction={flee}
              disabledCondition={
                inCombat && (attackAnimationOnGoing || playerState.isStunned)
              }
            >
              {enemyState ? "Run! (50%)" : "Leave"}
            </GenericFlatButton>
            <GenericFlatButton
              onPressFunction={() => {
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
