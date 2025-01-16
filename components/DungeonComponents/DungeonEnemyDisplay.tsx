import { View, Animated, Image } from "react-native";
import { toTitleCase } from "../../utility/functions/misc";
import ProgressBar from "../ProgressBar";
import GenericStrikeAround from "../GenericStrikeAround";
import { ThemedView, Text } from "../Themed";
import FadeOutNode from "../FadeOutNode";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import type { Enemy } from "../../entities/creatures";
import { FPS, type AnimationStore } from "../../stores/AnimationStore";
import { useRootStore } from "../../hooks/stores";
import { AnimatedSprite } from "../AnimatedSprite";
import { EnemyImageMap } from "../../utility/enemyHelpers";
import { flex, text, tw, tw_base, useStyles } from "../../hooks/styles";

const calculateAdjustedFrameRate = (
  frames: number,
  maxDuration: number = 400,
) => {
  const normalDuration = (frames / FPS) * 1000;
  if (normalDuration <= maxDuration) {
    return { duration: normalDuration, adjustedFPS: FPS };
  }

  const adjustedFPS = (frames * 1000) / maxDuration;
  return { duration: maxDuration, adjustedFPS };
};

const DialogueBox = memo(({ text }: { text: string }) => {
  const styles = useStyles();
  return (
    <ThemedView style={styles.dialogueBox}>
      <Text style={{ ...styles.textCenter, ...styles.lg }}>{text}</Text>
    </ThemedView>
  );
});

const useEnemyAnimations = () => {
  const attackAnim = useRef(new Animated.Value(0)).current;
  const damageAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const textTranslateAnim = useRef(new Animated.Value(0)).current;
  const dodgeAnim = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(1)).current;
  const { enemyStore, uiStore } = useRootStore();

  const runAttackAnimation = ({
    moveAnimationFrames = 6,
    attackAnimationFrames = 6,
    onReachPeak,
    onAttackEnd,
    onComplete,
  }: {
    moveAnimationFrames?: number;
    attackAnimationFrames?: number;
    onReachPeak: () => void;
    onAttackEnd: () => void;
    onComplete: () => void;
  }) => {
    const { duration: moveDuration } =
      calculateAdjustedFrameRate(moveAnimationFrames);
    const { duration: attackDuration } = calculateAdjustedFrameRate(
      attackAnimationFrames,
    );

    enemyStore.incrementAttackAnimations();

    if (uiStore.reduceMotion) {
      // Only do attack animation, no movement
      onReachPeak(); // Call immediately since we're not moving

      Animated.sequence([Animated.delay(attackDuration)]).start((finished) => {
        if (finished) {
          onAttackEnd();
          onComplete();
          enemyStore.decrementAttackAnimations();
        }
      });
    } else {
      // Full animation sequence
      Animated.sequence([
        Animated.timing(attackAnim, {
          toValue: -50,
          duration: moveDuration,
          useNativeDriver: true,
        }),
        Animated.delay(attackDuration),
        Animated.timing(attackAnim, {
          toValue: 0,
          duration: moveDuration,
          useNativeDriver: true,
        }),
      ]).start((finished) => {
        if (finished) {
          onComplete();
          enemyStore.decrementAttackAnimations();
        }
      });

      setTimeout(onReachPeak, moveDuration);
      setTimeout(onAttackEnd, moveDuration + attackDuration);
    }
  };

  const runDodgeAnimation = () => {
    Animated.sequence([
      Animated.timing(dodgeAnim, {
        toValue: 30,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.delay(200),
        Animated.sequence([
          Animated.timing(flashOpacity, {
            toValue: 0.3,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(flashOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.timing(dodgeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runDeathAnimation = (deathFrames: number, onComplete: () => void) => {
    const deathDuration = (deathFrames / FPS) * 1000;

    enemyStore.incrementDeathAnimations();

    Animated.sequence([
      Animated.timing(damageAnim, {
        toValue: 0.5,
        duration: deathDuration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(damageAnim, {
        toValue: 0,
        duration: deathDuration / 2,
        useNativeDriver: true,
      }),
    ]).start((finished) => {
      if (finished) {
        onComplete();
        enemyStore.decrementDeathAnimations();
      }
    });
  };

  const runDamageAnimation = (
    onComplete: () => void,
    animationFrames: number,
    isDeathAnimation: boolean = false,
  ) => {
    const animationDuration = (animationFrames / FPS) * 1000;

    const iterations = isDeathAnimation
      ? Math.ceil(animationDuration / 400)
      : 2;

    const flashDuration = isDeathAnimation
      ? 200
      : Math.min(200, animationDuration / 4);

    Animated.loop(
      Animated.sequence([
        Animated.timing(damageAnim, {
          toValue: 0.5,
          duration: flashDuration,
          useNativeDriver: true,
        }),
        Animated.timing(damageAnim, {
          toValue: 1,
          duration: flashDuration,
          useNativeDriver: true,
        }),
      ]),
      { iterations: iterations },
    ).start(() => {
      damageAnim.setValue(1);
      onComplete();
    });
  };

  const runTextAnimation = (onComplete: () => void) => {
    Animated.parallel([
      Animated.timing(textFadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateAnim, {
        toValue: -100,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(onComplete);
  };

  return {
    animations: {
      attackAnim,
      damageAnim,
      textFadeAnim,
      textTranslateAnim,
      dodgeAnim,
      flashOpacity,
    },
    runAttackAnimation,
    runDodgeAnimation,
    runDamageAnimation,
    runTextAnimation,
    runDeathAnimation,
  };
};

const EnemyHealthChangePopUp = memo(
  ({ healthDiff, showing }: { healthDiff: number; showing: boolean }) => {
    if (!showing) return <View style={{ height: tw_base[6] }} />;

    return (
      <View style={{ height: tw_base[6] }}>
        <FadeOutNode>
          <Text style={{ color: "#f87171" }}>
            {healthDiff > 0 ? "+" : ""}
            {healthDiff.toString()}
          </Text>
        </FadeOutNode>
      </View>
    );
  },
);

const EnemyConditions = memo(({ conditions }: { conditions: any[] }) => {
  const styles = useStyles();
  const { uiStore } = useRootStore();
  const simplifiedConditions = useMemo(() => {
    const condMap = new Map();
    conditions.forEach((condition) => {
      if (condMap.has(condition.name)) {
        const existing = condMap.get(condition.name);
        existing.count += 1;
        condMap.set(condition.name, existing);
      } else {
        condMap.set(condition.name, {
          name: condition.name,
          icon: condition.getConditionIcon(),
          count: 1,
        });
      }
    });
    return Array.from(condMap.values());
  }, [conditions]);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        paddingTop: 16,
      }}
    >
      {simplifiedConditions.map((cond) => (
        <ThemedView key={cond.name} style={flex.columnCenter}>
          <View
            style={[
              styles.conditionIcon,
              {
                backgroundColor:
                  uiStore.colorScheme === "dark"
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(0,0,0,0.4)",
              },
            ]}
          >
            <Image source={cond.icon} style={{ width: 22, height: 24 }} />
          </View>
          <Text style={{ fontSize: 14 }}>
            {toTitleCase(cond.name)} x {cond.count}
          </Text>
        </ThemedView>
      ))}
    </View>
  );
});

const DungeonEnemyDisplay = observer(() => {
  const { enemyStore } = useRootStore();

  useEffect(() => {
    console.log("enemies in store?: ", !!enemyStore.enemies);
  });

  if (enemyStore.enemies.length == 0) {
    return null;
  }

  return (
    <View
      style={{
        ...flex.rowEvenly,
        flex: 1,
      }}
    >
      {enemyStore.enemies.map((enemy) => (
        <EnemyDisplay
          key={enemy.id}
          enemy={enemy}
          animationStore={enemyStore.getAnimationStore(enemy.id)!}
        />
      ))}
    </View>
  );
});

const EnemyDisplay = observer(
  ({
    enemy,
    animationStore,
  }: {
    enemy: Enemy;
    animationStore: AnimationStore;
  }) => {
    const { uiStore } = useRootStore();
    const styles = useStyles();
    const animations = useEnemyAnimations();
    const [healthState, setHealthState] = useState({
      record: enemy.currentHealth,
      diff: 0,
      showing: false,
    });
    const [animationState, setAnimationState] = useState<string | undefined>(
      "idle",
    );
    const healingGlowAnim = useRef(new Animated.Value(0)).current;
    const attackStateRef = useRef<"start" | "attacking" | "returning">("start");

    const dialogueAnim = useRef(new Animated.Value(0)).current;

    const runDialogueAnimation = (onComplete: () => void) => {
      Animated.sequence([
        Animated.timing(dialogueAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(2000), // Show dialogue for 2 seconds
        Animated.timing(dialogueAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(onComplete);
    };

    useEffect(() => {
      if (animationStore.dialogueDummy !== 0) {
        runDialogueAnimation(() => {
          animationStore.setDialogueString(undefined);
        });
      }
    }, [animationStore.dialogueDummy]);

    const runHealAnimation = () => {
      Animated.sequence([
        Animated.timing(healingGlowAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(300),
        Animated.timing(healingGlowAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    };

    useEffect(() => {
      if (healthState.diff !== 0) {
        if (healthState.diff < 0) {
          const hurtFrames = EnemyImageMap[enemy.sprite].sets.hurt?.frames || 6;
          const deathFrames =
            EnemyImageMap[enemy.sprite].sets.death?.frames || 12;
          const isDeathAnimation = enemy.currentHealth <= 0;

          if (isDeathAnimation) {
            setAnimationState("death");
            animations.runDeathAnimation(deathFrames, () => {
              setTimeout(() => {
                setHealthState((prev) => ({
                  ...prev,
                  showing: false,
                  diff: 0,
                }));
              }, 500);
            });
          } else {
            animations.runDamageAnimation(
              () => {
                setAnimationState("idle");
                setTimeout(() => {
                  setHealthState((prev) => ({
                    ...prev,
                    showing: false,
                    diff: 0,
                  }));
                }, 500);
              },
              isDeathAnimation ? deathFrames : hurtFrames,
              isDeathAnimation,
            );
          }

          if (isDeathAnimation) {
            setAnimationState("death");
          } else {
            setAnimationState("hurt");
          }
        } else {
          runHealAnimation();
          setTimeout(() => {
            setHealthState((prev) => ({
              ...prev,
              showing: false,
              diff: 0,
            }));
          }, 500);
        }
      }
    }, [healthState.diff]);

    useEffect(() => {
      if (animationStore.textDummy !== 0) {
        animations.runTextAnimation(() => {
          animations.animations.textFadeAnim.setValue(1);
          animations.animations.textTranslateAnim.setValue(0);
          animationStore.setTextString(undefined);
        });
      }
    }, [animationStore.textDummy]);

    useEffect(() => {
      if (animationStore.attackDummy !== 0) {
        attackStateRef.current = "start";
        setAnimationState(uiStore.reduceMotion ? "attack_1" : "move");
        const sets = EnemyImageMap[enemy.sprite].sets;

        animations.runAttackAnimation({
          attackAnimationFrames: sets.attack_1.frames,
          moveAnimationFrames: sets.move?.frames,
          onReachPeak: () => {
            if (!uiStore.reduceMotion) {
              setAnimationState("attack_1");
            }
          },
          onAttackEnd: () => {
            if (!uiStore.reduceMotion) {
              setAnimationState("move");
            }
          },
          onComplete: () => setAnimationState("idle"),
        });
      }
    }, [animationStore.attackDummy]);

    useEffect(() => {
      if (animationStore.dodgeDummy !== 0) {
        animations.runDodgeAnimation();
        setAnimationState("jump");
      }
    }, [animationStore.dodgeDummy]);

    useEffect(() => {
      if (
        healthState.record &&
        healthState.record > 0 &&
        enemy.currentHealth !== healthState.record
      ) {
        setHealthState((prev) => ({
          record: enemy.currentHealth,
          diff: enemy.currentHealth - (prev.record ?? 0),
          showing: true,
        }));
      } else if (healthState.record && healthState.record > 0) {
        setHealthState((prev) => ({
          ...prev,
          diff: 0,
          showing: false,
        }));
      }
    }, [enemy?.currentHealth]);

    return (
      <View style={styles.enemyRow}>
        <View style={styles.enemyInfoContainer}>
          <Text
            style={{
              ...text["3xl"],
              textAlign: "center",
            }}
          >
            {enemy.creatureSpecies.toLowerCase().includes("generic npc")
              ? ""
              : toTitleCase(enemy.creatureSpecies).replace(" ", "\n")}
          </Text>
          <ProgressBar
            value={enemy.currentHealth >= 0 ? enemy.currentHealth : 0}
            maxValue={enemy.maxHealth}
            filledColor="#ef4444"
            unfilledColor="#fee2e2"
            displayNumber={
              enemy.creatureSpecies.toLowerCase() == "training dummy"
            }
            removeAtZero={true}
          />
          <EnemyHealthChangePopUp
            healthDiff={healthState.diff}
            showing={healthState.showing}
          />
          <EnemyConditions conditions={enemy.conditions} />
        </View>
        <Animated.View
          style={{
            transform: [
              {
                translateX: Animated.add(
                  animations.animations.attackAnim,
                  animations.animations.dodgeAnim,
                ),
              },
              {
                translateY: Animated.multiply(
                  Animated.add(
                    animations.animations.attackAnim,
                    animations.animations.dodgeAnim,
                  ),
                  -1.5,
                ),
              },
            ],
            opacity: Animated.multiply(
              animations.animations.damageAnim,
              animations.animations.flashOpacity,
            ),
          }}
        >
          <AnimatedSprite
            spriteSet={EnemyImageMap[enemy.sprite]}
            currentAnimationState={animationState}
            setCurrentAnimationState={setAnimationState}
          />
          {animationStore.dialogueString && (
            <DialogueBox text={animationStore.dialogueString} />
          )}
        </Animated.View>
        <Animated.View
          style={[
            styles.textAnimationContainer,
            {
              transform: [
                { translateY: animations.animations.textTranslateAnim },
              ],
              opacity: animations.animations.textFadeAnim,
            },
          ]}
        >
          {animationStore.textString ? (
            <Text
              style={{ letterSpacing: 1, textAlign: "center", ...styles.xl }}
              numberOfLines={1}
            >
              *{toTitleCase(animationStore.textString)}*
            </Text>
          ) : null}
        </Animated.View>
        {enemy.minions.length > 0 ? (
          <View style={styles.mx4}>
            <GenericStrikeAround>
              <Text style={{ fontSize: 14 }}>Enemy Minions</Text>
            </GenericStrikeAround>
            <View style={styles.minionRow}>
              {enemy.minions.map((minion) => (
                <View
                  key={minion.id}
                  style={{
                    flexGrow: 1,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                  <ProgressBar
                    filledColor="#ef4444"
                    unfilledColor="#fee2e2"
                    value={minion.currentHealth}
                    maxValue={minion.maxHealth}
                    displayNumber={false}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  },
);

export default DungeonEnemyDisplay;
