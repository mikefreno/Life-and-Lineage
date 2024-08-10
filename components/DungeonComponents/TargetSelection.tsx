import { Pressable, View } from "react-native";
import { View as ThemedView, Text } from "../Themed";
import { Enemy, Minion } from "../../classes/creatures";
import { EnemyImage } from "../EnemyImage";
import ProgressBar from "../ProgressBar";
import { toTitleCase } from "../../utility/functions/misc/words";
import { useContext } from "react";
import { AppContext } from "../../app/_layout";
import { useAttack, useSpell } from "./DungeonInteriorFunctions";
import { DungeonContext } from "./DungeonContext";
import { useIsFocused } from "@react-navigation/native";

export default function TargetSelectionRender() {
  const appData = useContext(AppContext);
  const dungeonData = useContext(DungeonContext);
  if (!appData || !dungeonData) throw new Error("missing context");
  const { enemyState } = appData;
  const { showTargetSelection, setShowTargetSelection } = dungeonData;
  const isFocused = useIsFocused();
  if (enemyState) {
    let targets: (Enemy | Minion)[] = [];
    targets.push(enemyState);
    enemyState.minions.forEach((minion) => {
      targets.push(minion);
    });

    return (
      <ThemedView>
        {targets.map((target) => (
          <Pressable
            key={target.id}
            onPress={() => {
              const attack = showTargetSelection.chosenAttack;
              setShowTargetSelection({
                showing: false,
                chosenAttack: null,
              });
              if (attack) {
                if ("element" in attack) {
                  useSpell({
                    spell: attack,
                    target,
                    appData,
                    dungeonData,
                    isFocused,
                  });
                } else {
                  useAttack({
                    attack,
                    target,
                    appData,
                    dungeonData,
                    isFocused,
                  });
                }
              }
            }}
            className="m-4 rounded-lg border border-zinc-400 px-4 py-2 shadow-lg active:scale-95 active:opacity-50 dark:border-zinc-700"
          >
            <View className="flex flex-row justify-evenly">
              <View className="my-auto">
                <EnemyImage creatureSpecies={target.creatureSpecies} />
              </View>
              <View className="my-auto flex w-1/2">
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
