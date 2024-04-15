import { Stack } from "expo-router";
import { Platform, Pressable, View } from "react-native";
import { toTitleCase } from "../../utility/functions/misc/words";
import { View as ThemedView, Text } from "../Themed";
import SackIcon from "../../assets/icons/SackIcon";
import BattleTab from "./BattleTab";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PlayerStatus from "../PlayerStatus";
import { DungeonInstance, DungeonLevel } from "../../classes/dungeon";
import { useVibration } from "../../utility/customHooks";
import { AttackObj } from "../../utility/types";
import { Enemy, Minion } from "../../classes/creatures";
import { Item } from "../../classes/item";

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
}: NoEnemyComponentProps) {
  const vibration = useVibration();

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
      <ThemedView className="flex-1 px-2" style={{ paddingBottom: 88 }}>
        <View className="flex h-[40%]" />
        {thisDungeon?.stepsBeforeBoss !== 0 && !fightingBoss ? (
          <ThemedView className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50">
            <Text className="my-auto text-xl">
              {`Steps Completed: ${thisDungeon?.step} / ${thisDungeon?.stepsBeforeBoss}`}
            </Text>
            {thisDungeon &&
            thisDungeon?.step >= thisDungeon.stepsBeforeBoss &&
            !thisDungeon.bossDefeated ? (
              <Pressable
                onPress={loadBoss}
                className="my-auto rounded bg-red-500 px-4 py-2 active:scale-95 active:opacity-50"
              >
                <Text style={{ color: "white" }}>Fight Boss</Text>
              </Pressable>
            ) : null}
          </ThemedView>
        ) : fightingBoss ? (
          <ThemedView className="">
            <Text className="my-auto text-center text-xl">Fighting Boss!</Text>
          </ThemedView>
        ) : (
          <ThemedView className="flex flex-row justify-evenly border-b border-zinc-900 pb-1 dark:border-zinc-50" />
        )}
        <Pressable
          className="absolute ml-4 mt-4"
          onPress={() => setShowLeftBehindItemsScreen(true)}
        >
          <SackIcon height={32} width={32} />
        </Pressable>
        <ThemedView className="flex-1 justify-between">
          <ThemedView className="flex-1">
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
          </ThemedView>
          <ThemedView className="flex w-full flex-row justify-around">
            <Pressable
              className={`mx-2 w-32 rounded py-4 ${
                battleTab == "attacks"
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : "active:bg-zinc-200 dark:active:bg-zinc-700"
              }`}
              onPress={() => {
                vibration({ style: "light" });
                setBattleTab("attacks");
              }}
            >
              <Text className="text-center text-xl">Attacks</Text>
            </Pressable>
            <Pressable
              className={`mx-2 w-32 rounded py-4 ${
                battleTab == "equipment"
                  ? "border-zinc-200 bg-zinc-100 dark:border-zinc-900 dark:bg-zinc-800"
                  : "active:bg-zinc-200 dark:active:bg-zinc-700"
              }`}
              onPress={() => {
                vibration({ style: "light" });
                setBattleTab("equipment");
              }}
            >
              <Text className="text-center text-xl">Equipment</Text>
            </Pressable>
            <Pressable
              className={`align mx-2 w-32 rounded py-4 ${
                battleTab == "log"
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : "active:bg-zinc-200 dark:active:bg-zinc-700"
              }`}
              onPress={() => {
                vibration({ style: "light" });
                setBattleTab("log");
              }}
            >
              <Text className="text-center text-xl">Log</Text>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <View className="absolute z-50 w-full" style={{ bottom: 85 }}>
        <PlayerStatus hideGold />
      </View>
    </>
  );
}
