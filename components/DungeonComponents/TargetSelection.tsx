import { Pressable, View } from "react-native";
import { ThemedView, Text } from "../Themed";
import { EnemyImage } from "../EnemyImage";
import ProgressBar from "../ProgressBar";
import { toTitleCase } from "../../utility/functions/misc";
import { useCombatState } from "../../providers/DungeonData";
import { useCombatActions } from "../../hooks/combat";
import type { Enemy, Minion } from "../../entities/creatures";
import { useRootStore } from "../../hooks/stores";

export default function TargetSelectionRender() {
  const { enemyStore } = useRootStore();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { useAttack } = useCombatActions();

  let targets: (Enemy | Minion)[] = enemyStore.enemies;

  enemyStore.enemies.forEach((enemy) =>
    enemy.minions.forEach((minion) => targets.push(minion)),
  );

  return (
    <ThemedView className="w-full">
      {targets.map((target) => (
        <Pressable
          key={target.id}
          onPress={() => {
            if (showTargetSelection.chosenAttack) {
              useAttack({
                attackOrSpell: showTargetSelection.chosenAttack,
                target,
              });
              setShowTargetSelection({
                showing: false,
                chosenAttack: null,
              });
            }
          }}
          className="m-4 rounded-lg border border-zinc-400 px-4 py-2 shadow-lg active:scale-95 active:opacity-50 dark:border-zinc-700"
        >
          <View className="flex flex-row justify-evenly">
            <View className="my-auto">
              <EnemyImage creatureSpecies={target.creatureSpecies} />
            </View>
            <View className="my-auto flex w-1/3">
              <View className="">
                <Text className="text-center">
                  {toTitleCase(target.creatureSpecies)}
                </Text>
                <ProgressBar
                  filledColor="#ef4444"
                  unfilledColor="#fee2e2"
                  value={target.currentHealth}
                  maxValue={target.maxHealth}
                  displayNumber={false}
                />
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </ThemedView>
  );
}
