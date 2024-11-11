import { Pressable, View } from "react-native";
import { ThemedView, Text } from "../Themed";
import { Enemy, Minion } from "../../classes/creatures";
import { EnemyImage } from "../EnemyImage";
import ProgressBar from "../ProgressBar";
import { toTitleCase } from "../../utility/functions/misc";
import { useGameState } from "../../stores/AppData";
import { useCombatState } from "../../stores/DungeonData";
import { useCombatActions } from "../../utility/customHooks";

export default function TargetSelectionRender() {
  const { enemyState } = useGameState();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { useAttack } = useCombatActions();

  if (enemyState) {
    let targets: (Enemy | Minion)[] = [];
    targets.push(enemyState);
    enemyState.minions.forEach((minion) => {
      targets.push(minion);
    });

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
                    value={target.health}
                    maxValue={target.healthMax}
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
}
