import { Pressable, View, Animated } from "react-native";
import { Text } from "@/components/Themed";
import ProgressBar from "@/components/ProgressBar";
import { toTitleCase } from "@/utility/functions/misc";
import { useCombatState } from "@/providers/DungeonData";
import { useCombatActions } from "@/hooks/combat";
import { Creature, Enemy } from "@/entities/creatures";
import { useRootStore } from "@/hooks/stores";
import { AnimatedSprite } from "@/components/AnimatedSprite";
import { flex, useStyles } from "@/hooks/styles";
import { useRef } from "react";
import { Being } from "@/entities/being";
import { Character } from "@/entities/character";

export default function TargetSelectionRender() {
  const styles = useStyles();
  const { enemyStore } = useRootStore();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { useAttack } = useCombatActions();

  let targets: Being[] = enemyStore.enemies;

  enemyStore.enemies.forEach((enemy) => {
    if (enemy instanceof Enemy) {
      enemy.minions.forEach((minion) => targets.push(minion));
    }
  });

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
                    attack: showTargetSelection.chosenAttack,
                    targets,
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
                  <AnimatedSprite enemy={target} />
                </View>
                <View style={[styles.myAuto, { width: "33%" }]}>
                  <Text style={{ textAlign: "center" }}>
                    {toTitleCase(
                      (target as Creature | Character).nameReference,
                    )}
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
