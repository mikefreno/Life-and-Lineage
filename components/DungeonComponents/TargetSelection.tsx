import { Pressable, View, Animated } from "react-native";
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
import { useRef } from "react";

export default function TargetSelectionRender() {
  const styles = useStyles();
  const { enemyStore, uiStore } = useRootStore();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { useAttack } = useCombatActions();

  let targets: (Enemy | Minion)[] = enemyStore.enemies;

  enemyStore.enemies.forEach((enemy) =>
    enemy.minions.forEach((minion) => targets.push(minion)),
  );

  const animationValues = useRef(new Map());

  const getAnimationValue = (targetId: string) => {
    if (!animationValues.current.has(targetId)) {
      animationValues.current.set(targetId, new Animated.Value(1));
    }
    return animationValues.current.get(targetId);
  };

  const handlePressIn = (targetId: string) => {
    Animated.spring(getAnimationValue(targetId), {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = (targetId: string) => {
    Animated.spring(getAnimationValue(targetId), {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  return (
    <View
      style={{
        marginVertical: "auto",
      }}
    >
      {targets.map((target) => {
        const scaleAnim = getAnimationValue(target.id);

        return (
          <Animated.View
            key={target.id}
            style={{
              transform: [{ scale: scaleAnim }],
              marginBottom: 8,
            }}
          >
            <Pressable
              onPressIn={() => handlePressIn(target.id)}
              onPressOut={() => handlePressOut(target.id)}
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
              style={styles.targetButton}
            >
              <View style={flex.rowEvenly}>
                <View style={{ marginVertical: "auto" }}>
                  <AnimatedSprite
                    spriteSet={EnemyImageMap[target.sprite ?? "samurai_rice"]}
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
          </Animated.View>
        );
      })}
    </View>
  );
}
