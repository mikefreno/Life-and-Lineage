import { Pressable, View, Animated } from "react-native";
import { Text } from "@/components/Themed";
import ProgressBar from "@/components/ProgressBar";
import { toTitleCase } from "@/utility/functions/misc";
import { useCombatState } from "@/providers/DungeonData";
import { useCombatActions } from "@/hooks/combat";
import { Creature } from "@/entities/creatures";
import { useRootStore } from "@/hooks/stores";
import { AnimatedSprite } from "@/components/AnimatedSprite";
import { flex, useStyles } from "@/hooks/styles";
import { useRef, useState } from "react";
import { Character } from "@/entities/character";
import { observer } from "mobx-react-lite";
import React from "react";
import { Being } from "@/entities/being";

const TargetSelectionRender = observer(() => {
  const styles = useStyles();
  const { enemyStore } = useRootStore();
  const { showTargetSelection, setShowTargetSelection } = useCombatState();
  const { useAttack } = useCombatActions();
  const [firstTarget, setFirstTarget] = useState<Being | null>(null);

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

  const handleSelection = (target: Being) => {
    if (showTargetSelection.chosenAttack?.targets == "dual") {
      if (!firstTarget) {
        setFirstTarget(target);
      } else if (firstTarget.equals(target.id)) {
        setFirstTarget(null);
      } else {
        useAttack({
          attack: showTargetSelection.chosenAttack,
          targets: [firstTarget, target],
        });
        setShowTargetSelection({
          showing: false,
          chosenAttack: null,
        });
        setFirstTarget(null);
      }
    } else {
      useAttack({
        attack: showTargetSelection.chosenAttack,
        targets: [target],
      });
      setShowTargetSelection({
        showing: false,
        chosenAttack: null,
      });
    }
  };

  return (
    <>
      <Text style={{ width: "100%" }}>
        {showTargetSelection.chosenAttack?.targets == "single"
          ? "Choose Your Target"
          : "Choose Your Targets"}
      </Text>
      <View
        style={{
          marginVertical: "auto",
        }}
      >
        {enemyStore.allBeings.map((target) => {
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
                onPress={() => handleSelection(target)}
                style={styles.targetButton}
              >
                <View style={flex.rowEvenly}>
                  <View style={{ marginVertical: "auto" }}>
                    <AnimatedSprite enemy={target} isInTargetSelection={true} />
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
    </>
  );
});
export default TargetSelectionRender;
