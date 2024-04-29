import { Stack } from "expo-router";
import { Platform, Pressable, View } from "react-native";
import { toTitleCase } from "../../utility/functions/misc/words";
import { Text } from "../Themed";
import SackIcon from "../../assets/icons/SackIcon";
import BattleTab from "./BattleTab";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PlayerStatus from "../PlayerStatus";
import { DungeonInstance, DungeonLevel } from "../../classes/dungeon";
import { AttackObj } from "../../utility/types";
import { Enemy, Minion } from "../../classes/creatures";
import { Item } from "../../classes/item";
import { PlayerCharacter } from "../../classes/character";
import ProgressBar from "../ProgressBar";
import BattleTabControls from "./BattleTabControls";

interface NoEnemyComponentProps {
  level: number;
  slug: string | string[];
  setFleeRollFailure: (value: React.SetStateAction<boolean>) => void;
  setFleeModalShowing: (value: React.SetStateAction<boolean>) => void;
  thisInstance?: DungeonInstance;
  thisDungeon?: DungeonLevel;
  colorScheme: "light" | "dark";
  fightingBoss: boolean;
  loadBoss: () => void;
  battleTab: "attacks" | "equipment" | "log";
  setBattleTab: React.Dispatch<
    React.SetStateAction<"attacks" | "equipment" | "log">
  >;
  useAttack: (attack: AttackObj, target: Enemy | Minion) => void;
  setShowLeftBehindItemsScreen: React.Dispatch<React.SetStateAction<boolean>>;
  useSpell: (
    spell: {
      name: string;
      element: string;
      proficiencyNeeded: number;
      manaCost: number;
      effects: {
        damage: number | null;
        buffs: string[] | null;
        debuffs:
          | {
              name: string;
              chance: number;
            }[]
          | null;
        summon?: string[] | undefined;
        selfDamage?: number | undefined;
      };
    },
    target: Enemy | Minion,
  ) => void;
  pass: () => void;
  setAttackAnimationOnGoing: React.Dispatch<React.SetStateAction<boolean>>;
  attackAnimationOnGoing: boolean;
  setShowTargetSelection: React.Dispatch<
    React.SetStateAction<{
      showing: boolean;
      chosenAttack: any;
      spell: boolean | null;
    }>
  >;
  addItemToPouch: (item: Item) => void;
  playerState: PlayerCharacter;
}

export default function NoEnemyComponent({
  level,
  slug,
  setFleeRollFailure,
  setFleeModalShowing,
  thisInstance,
  thisDungeon,
  colorScheme,
  fightingBoss,
  loadBoss,
  battleTab,
  setBattleTab,
  useAttack,
  setShowLeftBehindItemsScreen,
  useSpell,
  pass,
  setAttackAnimationOnGoing,
  attackAnimationOnGoing,
  setShowTargetSelection,
  addItemToPouch,
  playerState,
}: NoEnemyComponentProps) {
  return (
    <>
      <Stack.Screen
        options={{
          animationTypeForReplace: "push",
          title:
            level == 0 || slug[0] == "Activities"
              ? slug[0] == "Activities"
                ? slug[1]
                : "Training Grounds"
              : `${toTitleCase(thisInstance?.name as string)} Level ${level}`,

          headerLeft: () => (
            <Pressable
              onPress={() => {
                setFleeRollFailure(false);
                setFleeModalShowing(true);
              }}
            >
              {({ pressed }) => (
                <MaterialCommunityIcons
                  name="run-fast"
                  size={28}
                  color={colorScheme == "light" ? "#18181b" : "#fafafa"}
                  style={{
                    opacity: pressed ? 0.5 : 1,
                    marginRight: Platform.OS == "android" ? 8 : 0,
                  }}
                />
              )}
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 px-2" style={{ paddingBottom: 88 }}>
        {thisDungeon?.stepsBeforeBoss !== 0 && !fightingBoss ? (
          <View className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50">
            <Text className="my-auto text-xl">
              {`Steps Completed: ${thisDungeon?.step} / ${thisDungeon?.stepsBeforeBoss}`}
            </Text>
            {thisDungeon &&
            thisDungeon.step >= thisDungeon.stepsBeforeBoss &&
            !thisDungeon?.bossDefeated ? (
              <Pressable
                onPress={loadBoss}
                className="my-auto rounded bg-red-500 px-4 py-2 active:scale-95 active:opacity-50"
              >
                <Text style={{ color: "white" }}>Fight Boss</Text>
              </Pressable>
            ) : null}
          </View>
        ) : fightingBoss ? (
          <View className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50">
            <Text className="my-auto text-center text-xl">Fighting Boss!</Text>
          </View>
        ) : (
          <View className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50" />
        )}
        <Pressable
          className="absolute ml-4 mt-4"
          onPress={() => setShowLeftBehindItemsScreen(true)}
        >
          <SackIcon height={32} width={32} />
        </Pressable>
        <View className="-mb-1 flex-1 justify-between">
          <View className="flex-1">
            <BattleTab
              useAttack={useAttack}
              battleTab={battleTab}
              useSpell={useSpell}
              pass={pass}
              setAttackAnimationOnGoing={setAttackAnimationOnGoing}
              attackAnimationOnGoing={attackAnimationOnGoing}
              setShowTargetSelection={setShowTargetSelection}
              addItemToPouch={addItemToPouch}
            />
          </View>
          {playerState.minions.length > 0 ? (
            <View className="flex flex-row flex-wrap justify-evenly">
              {playerState.minions.map((minion, index) => (
                <View
                  key={minion.id}
                  className={`${
                    index == playerState.minions.length - 1 &&
                    playerState.minions.length % 2 !== 0
                      ? "w-full"
                      : "w-2/5"
                  } py-1`}
                >
                  <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                  <ProgressBar
                    filledColor="#ef4444"
                    unfilledColor="#fee2e2"
                    value={minion.health}
                    maxValue={minion.healthMax}
                  />
                </View>
              ))}
            </View>
          ) : null}
        </View>
        <BattleTabControls battleTab={battleTab} setBattleTab={setBattleTab} />
      </View>
      <View className="absolute z-50 w-full" style={{ bottom: 85 }}>
        <PlayerStatus hideGold />
      </View>
    </>
  );
}
