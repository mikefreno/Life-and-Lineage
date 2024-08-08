import { Pressable, View } from "react-native";
import { View as ThemedView, Text } from "../Themed";
import { Enemy, Minion } from "../../classes/creatures";
import { EnemyImage } from "../EnemyImage";
import ProgressBar from "../ProgressBar";
import { toTitleCase } from "../../utility/functions/misc/words";
import { AttackObj } from "../../utility/types";
import { useContext } from "react";
import { AppContext } from "../../app/_layout";

interface TargetSelectionRenderProps {
  useAttack: (attack: AttackObj, target: Enemy | Minion) => void;
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
  setShowTargetSelection: React.Dispatch<
    React.SetStateAction<{
      showing: boolean;
      chosenAttack: any;
      spell: boolean | null;
    }>
  >;
  showTargetSelection: {
    showing: boolean;
    chosenAttack: any;
    spell: boolean | null;
  };
}
export default function TargetSelectionRender({
  useSpell,
  useAttack,
  setShowTargetSelection,
  showTargetSelection,
}: TargetSelectionRenderProps) {
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { enemyState } = appData;
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
              const attack = { ...showTargetSelection.chosenAttack };
              const spell = showTargetSelection.spell;
              setShowTargetSelection({
                showing: false,
                chosenAttack: null,
                spell: null,
              });
              if (spell) {
                useSpell(attack, target);
              } else {
                useAttack(attack, target);
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
