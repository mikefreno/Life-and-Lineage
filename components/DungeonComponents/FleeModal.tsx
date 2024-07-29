import { Modal, Platform, Pressable, View } from "react-native";
import GenericModal from "../GenericModal";
import GenericFlatButton from "../GenericFlatButton";
import { View as ThemedView, Text } from "../Themed";
import { PlayerCharacter } from "../../classes/character";
import { flipCoin } from "../../utility/functions/roll";
import { Enemy, Minion } from "../../classes/creatures";
import { useVibration } from "../../utility/customHooks";
import { router } from "expo-router";
import { enemyTurnCheck } from "../../utility/functions/dungeonInteriorFunctions";
import { Game } from "../../classes/game";
import { Item } from "../../classes/item";
import { DungeonInstance, DungeonLevel } from "../../classes/dungeon";
import { fullSave } from "../../utility/functions/save_load";

interface FleeModalProps {
  playerState: PlayerCharacter;
  fleeModalShowing: boolean;
  fleeRollFailure: boolean;
  setFleeModalShowing: React.Dispatch<React.SetStateAction<boolean>>;
  setFleeRollFailure: React.Dispatch<React.SetStateAction<boolean>>;
  enemyState: Enemy | null;
  setEnemy: React.Dispatch<React.SetStateAction<Enemy | null>>;
  slug: string | string[];
  enemyAttacked: boolean;
  battleLogger: (whatHappened: string) => void;
  playerMinionsTurn: (
    suppliedMinions: Minion[],
    startOfTurnEnemyID: string,
  ) => void;
  attackAnimationOnGoing: boolean;
  fightingBoss: boolean;
  setDroppedItems: (
    value: React.SetStateAction<{
      itemDrops: Item[];
      gold: number;
    } | null>,
  ) => void;
  gameState: Game;
  setFightingBoss: (value: React.SetStateAction<boolean>) => void;
  setAttackAnimationOnGoing: (value: React.SetStateAction<boolean>) => void;
  thisDungeon: DungeonLevel | undefined;
  thisInstance: DungeonInstance | undefined;
  setEnemyAttacked: (value: React.SetStateAction<boolean>) => void;
  setEnemyHealDummy: React.Dispatch<React.SetStateAction<number>>;
  setEnemyAttackDummy: React.Dispatch<React.SetStateAction<number>>;
  setEnemyTextDummy: React.Dispatch<React.SetStateAction<number>>;
  setEnemyTextString: React.Dispatch<React.SetStateAction<string | undefined>>;
  triggerFirstBossKillTutorial: () => void;
}
export default function FleeModal({
  playerState,
  enemyState,
  setEnemy,
  slug,
  enemyAttacked,
  battleLogger,
  playerMinionsTurn,
  attackAnimationOnGoing,
  setFleeRollFailure,
  setFleeModalShowing,
  fleeRollFailure,
  fleeModalShowing,
  setDroppedItems,
  setFightingBoss,
  setEnemyAttacked,
  setEnemyHealDummy,
  setEnemyTextDummy,
  setEnemyTextString,
  setEnemyAttackDummy,
  setAttackAnimationOnGoing,
  fightingBoss,
  thisDungeon,
  thisInstance,
  gameState,
  triggerFirstBossKillTutorial,
}: FleeModalProps) {
  const vibration = useVibration();
  const flee = () => {
    if (playerState) {
      const roll = flipCoin();
      const secondaryRoll = flipCoin();
      if (
        (playerState &&
          ((roll == "Heads" &&
            (slug[0] !== "Activities" || secondaryRoll == "Heads")) ||
            enemyState?.creatureSpecies == "training dummy" ||
            !enemyAttacked)) ||
        !enemyState
      ) {
        vibration({ style: "light" });
        setFleeRollFailure(false);
        setFleeModalShowing(false);
        setTimeout(() => {
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
          fullSave(gameState, playerState);
        }, 200);
      } else {
        setFleeRollFailure(true);
        vibration({ style: "error" });
        battleLogger("You failed to flee!");
        playerMinionsTurn(playerState.minions, enemyState.id);
        setTimeout(() => {
          enemyTurnCheck({
            enemyState: enemyState,
            slug: slug,
            playerState: playerState,
            setEnemy: setEnemy,
            battleLogger: battleLogger,
            fightingBoss: fightingBoss,
            setDroppedItems: setDroppedItems,
            gameState: gameState,
            setFightingBoss: setFightingBoss,
            setAttackAnimationOnGoing: setAttackAnimationOnGoing,
            thisDungeon: thisDungeon,
            thisInstance: thisInstance,
            setEnemyAttacked: setEnemyAttacked,
            setEnemyHealDummy: setEnemyHealDummy,
            setEnemyAttackDummy: setEnemyAttackDummy,
            setEnemyTextDummy: setEnemyTextDummy,
            setEnemyTextString: setEnemyTextString,
            triggerFirstBossKillTutorial: triggerFirstBossKillTutorial,
          });
        }, 1000 * playerState.minions.length);
      }
    }
  };

  return Platform.OS == "ios" ? (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={fleeModalShowing}
        onRequestClose={() => setFleeModalShowing(false)}
      >
        <Pressable
          onPress={() => setFleeModalShowing(false)}
          className="-mt-[100vh] h-[200vh] w-screen items-center justify-center bg-[rgba(0,0,0,.2)]"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="mt-[100vh] w-full py-4"
          >
            <ThemedView
              className="mx-auto w-2/3 rounded-xl bg-zinc-50 px-6 py-4 dark:border dark:border-zinc-500 dark:bg-zinc-700"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 5,
              }}
            >
              <ThemedView className="flex items-center justify-evenly">
                <Text className="text-center text-lg">
                  {!enemyState ? "Ready to Leave?" : "Attempt to Flee?"}
                </Text>
                {playerState.isStunned() ? (
                  <Text className="italic" style={{ color: "#ef4444" }}>
                    You are stunned!
                  </Text>
                ) : null}
                <ThemedView className="flex w-full flex-row justify-evenly pt-8">
                  <GenericFlatButton
                    onPressFunction={flee}
                    disabledCondition={
                      enemyState
                        ? attackAnimationOnGoing || playerState.isStunned()
                        : false
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
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  ) : (
    <GenericModal
      isVisibleCondition={fleeModalShowing}
      backFunction={() => setFleeModalShowing(false)}
    >
      <ThemedView className="flex items-center justify-evenly">
        <Text className="text-center text-lg">
          {enemyState ? "Attempt to Flee?" : "Ready to Leave?"}
        </Text>
        <ThemedView className="flex w-full flex-row justify-evenly">
          <Pressable
            disabled={attackAnimationOnGoing}
            onPress={flee}
            className="mb-4 mt-8 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text className="text-lg">{enemyState ? "Run!" : "Leave"}</Text>
          </Pressable>
          <Pressable
            className="mb-4 mt-8 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
            onPress={(e) => {
              e.stopPropagation();
              setFleeModalShowing(false);
              setFleeRollFailure(false);
            }}
          >
            <Text className="text-lg">Cancel</Text>
          </Pressable>
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
