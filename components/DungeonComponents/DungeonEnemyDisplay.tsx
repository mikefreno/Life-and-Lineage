import { View, Animated, Image, ScrollView, Easing } from "react-native";
import { toTitleCase } from "../../utility/functions/misc";
import ProgressBar from "../ProgressBar";
import GenericStrikeAround from "../GenericStrikeAround";
import { ThemedView, Text } from "../Themed";
import FadeOutNode from "../FadeOutNode";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import type { Enemy } from "../../entities/creatures";
import {
  FPS,
  type EnemyAnimationStore,
} from "../../stores/EnemyAnimationStore";
import { useRootStore } from "../../hooks/stores";
import { AnimatedSprite } from "../AnimatedSprite";
import { EnemyImageMap } from "../../utility/enemyHelpers";
import { flex, tw_base, useStyles } from "../../hooks/styles";

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
      <Text style={{ ...styles.textCenter, ...styles["text-lg"] }}>{text}</Text>
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

const EnemyConditions = observer(({ conditions }: { conditions: any[] }) => {
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
  const styles = useStyles();

  return (
    <View
      style={{
        width: "100%",
        height: 44,
      }}
    >
      <ScrollView
        horizontal
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        {simplifiedConditions.map((cond) => (
          <View key={cond.name}>
            <ThemedView
              style={[
                flex.columnCenter,
                {
                  borderRadius: 9999,
                  height: 36,
                  width: 36,
                  alignContent: "center",
                  marginVertical: "auto",
                },
              ]}
            >
              <Image source={cond.icon} style={{ width: 22, height: 24 }} />
            </ThemedView>
            <Text
              style={[
                styles["text-xl"],
                {
                  position: "absolute",
                  right: -4,
                  bottom: 0,
                },
              ]}
              numberOfLines={1}
            >
              x{cond.count}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const DungeonEnemyDisplay = observer(() => {
  const { enemyStore } = useRootStore();

  if (enemyStore.enemies.length == 0) {
    return null;
  }

  return (
    <View
      style={{
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
    animationStore: EnemyAnimationStore;
  }) => {
    const { uiStore, enemyStore } = useRootStore();
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
    const dialogueAnim = useRef(new Animated.Value(0)).current;
    const projectileAnim = useRef(new Animated.Value(0)).current;
    const [showProjectile, setShowProjectile] = useState(false);
    const [projectileFrame, setProjectileFrame] = useState(0);
    const projectileAnimationRef = useRef<NodeJS.Timeout>();

    // Simple animation sequence tracking
    const animationSequenceRef = useRef({
      isAttacking: false,
      attackPhase: 0, // 0: not attacking, 1: moving forward, 2: attacking, 3: returning
      isAnimationLocked: false,
    });

    // Get player origin position for projectile targeting
    const [playerOrigin, setPlayerOrigin] = useState<{ x: number; y: number }>({
      x: uiStore.dimensions.width / 4,
      y: uiStore.dimensions.height / 2,
    });

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
      ]).start(({ finished }) => {
        if (finished) {
          onComplete();
        }
      });
    };

    useEffect(() => {
      if (animationStore.dialogueDummy !== 0) {
        runDialogueAnimation(() => {
          animationStore.setDialogueString(undefined);
        });
      }
    }, [animationStore.dialogueDummy]);

    const runHealAnimation = (onComplete: () => void) => {
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
      ]).start(({ finished }) => {
        if (finished) {
          onComplete();
        }
      });
    };

    // Handle health changes and damage/death animations
    useEffect(() => {
      if (healthState.diff !== 0) {
        if (healthState.diff < 0) {
          const hurtFrames = EnemyImageMap[enemy.sprite].sets.hurt?.frames || 6;
          const deathFrames =
            EnemyImageMap[enemy.sprite].sets.death?.frames || 12;
          const isDeathAnimation = enemy.currentHealth <= 0;

          // Lock animations during damage/death
          animationSequenceRef.current.isAnimationLocked = true;

          if (isDeathAnimation) {
            enemyStore.incrementDeathAnimations();
            setAnimationState("death");
            animations.runDeathAnimation(deathFrames, () => {
              animationSequenceRef.current.isAnimationLocked = false;
              enemyStore.decrementDeathAnimations();
              setHealthState((prev) => ({
                ...prev,
                showing: false,
                diff: 0,
              }));
            });
          } else {
            setAnimationState("hurt");
            animations.runDamageAnimation(
              () => {
                animationSequenceRef.current.isAnimationLocked = false;
                setAnimationState("idle");
                setHealthState((prev) => ({
                  ...prev,
                  showing: false,
                  diff: 0,
                }));
              },
              hurtFrames,
              isDeathAnimation,
            );
          }
        } else {
          runHealAnimation(() => {
            setHealthState((prev) => ({
              ...prev,
              showing: false,
              diff: 0,
            }));
          });
        }
      }
    }, [healthState.diff, enemyStore]);

    // Handle text animations
    useEffect(() => {
      if (animationStore.textDummy !== 0) {
        animations.runTextAnimation(() => {
          animations.animations.textFadeAnim.setValue(1);
          animations.animations.textTranslateAnim.setValue(0);
          animationStore.setTextString(undefined);
        });
      }
    }, [animationStore.textDummy]);

    const runProjectileAnimation = (
      startPos: { x: number; y: number },
      targetPos: { x: number; y: number },
    ) => {
      const projectileData = EnemyImageMap[enemy.sprite].effects.projectile;
      const projectileFrames = projectileData.frames || 1;

      // Start frame animation
      if (projectileFrames > 1) {
        if (projectileAnimationRef.current) {
          clearInterval(projectileAnimationRef.current);
        }

        setProjectileFrame(0);

        projectileAnimationRef.current = setInterval(() => {
          setProjectileFrame((prev) => (prev + 1) % projectileFrames);
        }, 100); // Adjust frame rate as needed
      }

      setShowProjectile(true);
      projectileAnim.setValue(0);

      Animated.timing(projectileAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start(({ finished }) => {
        if (finished) {
          setShowProjectile(false);

          if (projectileAnimationRef.current) {
            clearInterval(projectileAnimationRef.current);
            projectileAnimationRef.current = undefined;
          }
        }
      });
    };

    // Cleanup projectile animation on unmount
    useEffect(() => {
      return () => {
        if (projectileAnimationRef.current) {
          clearInterval(projectileAnimationRef.current);
        }
      };
    }, []);

    // Direct attack animation sequence with support for special attacks
    const runAttackSequence = () => {
      if (
        animationSequenceRef.current.isAnimationLocked ||
        animationSequenceRef.current.isAttacking
      ) {
        return;
      }

      const sets = EnemyImageMap[enemy.sprite].sets;
      const attackSet = sets.attack_1;
      const disablePreMovement =
        attackSet &&
        "disablePreMovement" in attackSet &&
        attackSet.disablePreMovement;
      const usesProjectile =
        attackSet && "usesProjectile" in attackSet && attackSet.usesProjectile;

      animationSequenceRef.current.isAttacking = true;

      // Increment the attack animation counter in EnemyStore
      enemyStore.incrementAttackAnimations();

      if (uiStore.reduceMotion) {
        // Simplified animation for reduced motion
        setAnimationState("attack_1");

        const { duration: attackDuration } = calculateAdjustedFrameRate(
          sets.attack_1.frames,
        );

        // Fire projectile if needed
        if (usesProjectile && animationStore.spriteMidPoint) {
          setTimeout(() => {
            runProjectileAnimation(animationStore.spriteMidPoint, playerOrigin);
          }, attackDuration / 3); // Fire projectile 1/3 through the animation
        }

        setTimeout(() => {
          setAnimationState("idle");
          animationSequenceRef.current.isAttacking = false;
          // Decrement the counter when animation completes
          enemyStore.decrementAttackAnimations();
        }, attackDuration);
      } else if (disablePreMovement) {
        // Special attack without movement
        animationSequenceRef.current.attackPhase = 2; // Skip to attack phase
        setAnimationState("attack_1");

        const { duration: attackDuration } = calculateAdjustedFrameRate(
          sets.attack_1.frames,
        );

        // Fire projectile if needed
        if (usesProjectile && animationStore.spriteMidPoint) {
          setTimeout(() => {
            runProjectileAnimation(animationStore.spriteMidPoint, playerOrigin);
          }, attackDuration / 3); // Fire projectile 1/3 through the animation
        }

        setTimeout(() => {
          // Complete sequence
          setAnimationState("idle");
          animationSequenceRef.current.isAttacking = false;
          animationSequenceRef.current.attackPhase = 0;
          // Decrement the counter when animation completes
          enemyStore.decrementAttackAnimations();
        }, attackDuration);
      } else {
        // Standard attack with movement
        // Phase 1: Move forward
        animationSequenceRef.current.attackPhase = 1;
        setAnimationState("move");

        Animated.timing(animations.animations.attackAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished && animationSequenceRef.current.isAttacking) {
            // Phase 2: Attack
            animationSequenceRef.current.attackPhase = 2;
            setAnimationState("attack_1");

            const { duration: attackDuration } = calculateAdjustedFrameRate(
              sets.attack_1.frames,
            );

            // Fire projectile if needed
            if (usesProjectile && animationStore.spriteMidPoint) {
              setTimeout(() => {
                runProjectileAnimation(
                  animationStore.spriteMidPoint,
                  playerOrigin,
                );
              }, attackDuration / 3); // Fire projectile 1/3 through the animation
            }

            setTimeout(() => {
              if (animationSequenceRef.current.isAttacking) {
                // Phase 3: Return
                animationSequenceRef.current.attackPhase = 3;
                setAnimationState("move");

                Animated.timing(animations.animations.attackAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start(({ finished }) => {
                  if (finished) {
                    // Complete sequence
                    setAnimationState("idle");
                    animationSequenceRef.current.isAttacking = false;
                    animationSequenceRef.current.attackPhase = 0;
                    // Decrement the counter when animation completes
                    enemyStore.decrementAttackAnimations();
                  }
                });
              } else {
                // If the sequence was interrupted, still decrement the counter
                enemyStore.decrementAttackAnimations();
              }
            }, attackDuration);
          } else {
            // If the animation was interrupted, still decrement the counter
            enemyStore.decrementAttackAnimations();
          }
        });
      }
    };

    // Handle attack animations
    useEffect(() => {
      if (animationStore.attackDummy !== 0) {
        runAttackSequence();
      }
    }, [animationStore.attackDummy, enemyStore]);

    // Handle dodge animations
    useEffect(() => {
      if (animationStore.dodgeDummy !== 0) {
        // Don't start dodge if we're locked in another animation
        if (
          animationSequenceRef.current.isAnimationLocked ||
          animationSequenceRef.current.isAttacking
        ) {
          return;
        }

        setAnimationState("jump");
        animations.runDodgeAnimation();
      }
    }, [animationStore.dodgeDummy]);

    // Track health changes
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

    // Cleanup on unmount - ensure counters are decremented
    useEffect(() => {
      return () => {
        if (animationSequenceRef.current.isAttacking) {
          enemyStore.decrementAttackAnimations();
        }
      };
    }, [enemyStore]);

    // Calculate projectile animation styles
    const getProjectileStyles = () => {
      if (!animationStore.spriteMidPoint || !showProjectile) return {};

      const startPos = animationStore.spriteMidPoint;
      const targetPos = playerOrigin;

      // Get projectile data
      const projectileData = EnemyImageMap[enemy.sprite].effects.projectile;
      const projectileWidth = projectileData.width || 32;
      const projectileHeight = projectileData.height || 32;

      // Calculate angle for rotation
      const angle =
        Math.atan2(targetPos.y - startPos.y, targetPos.x - startPos.x) *
        (180 / Math.PI);

      return {
        position: "absolute",
        width: projectileWidth,
        height: projectileHeight,
        transform: [
          {
            translateX: projectileAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [
                startPos.x - projectileWidth / 2,
                targetPos.x - projectileWidth / 2,
              ],
            }),
          },
          {
            translateY: projectileAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [
                startPos.y - projectileHeight / 2,
                targetPos.y - projectileHeight / 2,
              ],
            }),
          },
          { rotate: `${angle}deg` },
        ],
        opacity: projectileAnim.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 1, 1, 0],
        }),
        zIndex: 9000,
        overflow: "hidden",
      };
    };

    // Get projectile image style for frame animation
    const getProjectileImageStyle = () => {
      const projectileData = EnemyImageMap[enemy.sprite].effects.projectile;
      const projectileWidth = projectileData.width || 32;
      const projectileHeight = projectileData.height || 32;
      const projectileFrames = projectileData.frames || 1;

      return {
        width: projectileWidth * projectileFrames,
        height: projectileHeight,
        left: -projectileFrame * projectileWidth,
      };
    };

    // Check if enemy has a projectile animation
    const hasProjectileAnimation = () => {
      return (
        enemy.sprite &&
        EnemyImageMap[enemy.sprite] &&
        EnemyImageMap[enemy.sprite].effects &&
        EnemyImageMap[enemy.sprite].effects.projectile &&
        EnemyImageMap[enemy.sprite].effects.projectile.anim
      );
    };

    return (
      <View style={[flex.rowEvenly, { flex: 1, alignItems: "center" }]}>
        <View style={styles.enemyInfoContainer}>
          <Text
            style={{
              ...styles["text-3xl"],
              textAlign: "center",
            }}
            numberOfLines={2}
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
            spriteSet={EnemyImageMap[enemy.sprite ?? "samurai_rice"]}
            currentAnimationState={animationState}
            setCurrentAnimationState={(newState) => {
              // Only handle animation completion if we're not in an attack sequence
              if (
                newState === undefined &&
                !animationSequenceRef.current.isAttacking
              ) {
                setAnimationState("idle");
              }
            }}
            positionSetter={(val) => animationStore.setSpriteMidPoint(val)}
          />
          {animationStore.dialogueString && (
            <Animated.View
              style={{
                opacity: dialogueAnim,
                transform: [
                  {
                    translateY: dialogueAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              }}
            >
              <DialogueBox text={animationStore.dialogueString} />
            </Animated.View>
          )}
        </Animated.View>

        {showProjectile && hasProjectileAnimation() && (
          <Animated.View style={getProjectileStyles()}>
            <Image
              source={EnemyImageMap[enemy.sprite].effects.projectile.anim}
              style={getProjectileImageStyle()}
            />
          </Animated.View>
        )}

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
