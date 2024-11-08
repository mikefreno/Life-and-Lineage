import { Modal, Platform, Pressable, View } from "react-native";
import GenericModal from "../GenericModal";
import GenericFlatButton from "../GenericFlatButton";
import { View as ThemedView, Text } from "../Themed";
import { rollD20, wait } from "../../utility/functions/misc";
import { useVibration } from "../../utility/customHooks";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app/_layout";
import { DungeonContext } from "./DungeonContext";
import {
  type ContextData,
  enemyPreTurnCheck,
} from "./DungeonInteriorFunctions";

interface FleeModalProps {
  fleeModalShowing: boolean;
  setFleeModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
  playerMinionsTurn: (
    { dungeonData, appData }: ContextData,
    callback: () => void,
  ) => void;
}
export default function FleeModal({
  fleeModalShowing,
  setFleeModalShowing,
  playerMinionsTurn,
}: FleeModalProps) {
  const vibration = useVibration();
  const appData = useContext(AppContext);
  const dungeonData = useContext(DungeonContext);
  if (!appData || !dungeonData) throw new Error("missing context");
  const { playerState, enemyState, setEnemy, gameState } = appData;
  const {
    slug,
    setAttackAnimationOnGoing,
    attackAnimationOnGoing,
    battleLogger,
    inCombat,
  } = dungeonData;

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
        });
      } else {
        setFleeRollFailure(true);
        vibration({ style: "error" });
        battleLogger("You failed to flee!");

        playerMinionsTurn({ appData, dungeonData }, () => {
          enemyPreTurnCheck({ appData, dungeonData });
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
              {enemyState ? "Run!" : "Leave"}
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
