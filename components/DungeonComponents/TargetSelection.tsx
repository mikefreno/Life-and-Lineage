import { Pressable, View } from "react-native";
import { Text } from "../Themed";
import ProgressBar from "../ProgressBar";
import { toTitleCase } from "../../utility/functions/misc";
import { useCombatState } from "../../providers/DungeonData";
import { useCombatActions } from "../../hooks/combat";
import type { Enemy, Minion } from "../../entities/creatures";
import { useRootStore } from "../../hooks/stores";
import { AnimatedSprite } from "../AnimatedSprite";
import { EnemyImageMap } from "../../utility/enemyHelpers";
import { flex, useStyles } from "../../hooks/styles";

export default function TargetSelectionRender() {
  const styles = useStyles();
  const { enemyStore, uiStore } = useRootStore();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { useAttack } = useCombatActions();

  let targets: (Enemy | Minion)[] = enemyStore.enemies;

  enemyStore.enemies.forEach((enemy) =>
    enemy.minions.forEach((minion) => targets.push(minion)),
  );

  return (
    <View
      style={{
        marginVertical: "auto",
        width: "33.333%",
      }}
    >
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
          style={[
            styles.targetButton,
            {
              borderColor:
                uiStore.colorScheme === "dark" ? "#404040" : "#a3a3a3",
            },
          ]}
        >
          <View style={flex.rowEvenly}>
            <View style={{ marginVertical: "auto" }}>
              <AnimatedSprite
                spriteSet={EnemyImageMap[target.sprite]}
                currentAnimationState={"idle"}
              />
            </View>
            <View style={[styles.myAuto, { width: "33%" }]}>
              <Text style={{ textAlign: "center" }}>
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
        </Pressable>
      ))}
    </View>
  );
}
