import { View, Animated, Image } from "react-native";
import { toTitleCase } from "../../utility/functions/misc";
import ProgressBar from "../ProgressBar";
import GenericStrikeAround from "../GenericStrikeAround";
import { ThemedView, Text } from "../Themed";
import { EnemyImage } from "../EnemyImage";
import FadeOutNode from "../FadeOutNode";
import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useGameState } from "../../stores/AppData";
import { useDungeonCore, useEnemyAnimation } from "../../stores/DungeonData";

const useEnemyAnimations = () => {
  const attackAnim = useRef(new Animated.Value(0)).current;
  const damageAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const textTranslateAnim = useRef(new Animated.Value(0)).current;
  const dodgeAnim = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(1)).current;

  const runAttackAnimation = () => {
    Animated.sequence([
      Animated.timing(attackAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(attackAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
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

  const runDamageAnimation = (onComplete: () => void) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(damageAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(damageAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 2 },
    ).start(onComplete);
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
  };
};

const EnemyHealthChangePopUp = memo(
  ({ healthDiff, showing }: { healthDiff: number; showing: boolean }) => {
    if (!showing) return <View className="h-6" />;

    return (
      <View className="h-6">
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
    <View className="flex h-8 flex-row">
      {simplifiedConditions.map((cond) => (
        <ThemedView key={cond.name} className="mx-2 flex align-middle">
          <View className="mx-auto rounded-md bg-[rgba(0,0,0,0.4)] p-0.5 dark:bg-[rgba(255,255,255,0.4)]">
            <Image source={cond.icon} style={{ width: 22, height: 24 }} />
          </View>
          <Text className="text-sm">
            {toTitleCase(cond.name)} x {cond.count}
          </Text>
        </ThemedView>
      ))}
    </View>
  );
});

const DungeonEnemyDisplay = observer(() => {
  const { enemyState } = useGameState();
  const { slug, firstLoad } = useDungeonCore();
  const {
    enemyTextString,
    enemyAttackDummy,
    enemyTextDummy,
    setEnemyTextString,
    enemyDodgeDummy,
  } = useEnemyAnimation();

  const {
    animations,
    runAttackAnimation,
    runDodgeAnimation,
    runDamageAnimation,
    runTextAnimation,
  } = useEnemyAnimations();

  const [healthState, setHealthState] = useState({
    record: enemyState?.health,
    diff: 0,
    showing: false,
  });

  useEffect(() => {
    if (!enemyState) return;

    if (
      healthState.record &&
      healthState.record > 0 &&
      enemyState.health !== healthState.record
    ) {
      setHealthState((prev) => ({
        record: enemyState.health,
        diff: enemyState.health - (prev.record ?? 0),
        showing: true,
      }));
    } else if (healthState.record && healthState.record > 0) {
      setHealthState((prev) => ({
        ...prev,
        diff: 0,
        showing: false,
      }));
    }
  }, [enemyState?.health]);

  useEffect(() => {
    if (!firstLoad && enemyAttackDummy !== 0) {
      runAttackAnimation();
    }
  }, [enemyAttackDummy]);

  useEffect(() => {
    if (!firstLoad && enemyDodgeDummy !== 0) {
      runDodgeAnimation();
    }
  }, [enemyDodgeDummy]);

  const healingGlowAnim = useRef(new Animated.Value(0)).current;

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
    if (!firstLoad && healthState.diff !== 0) {
      if (healthState.diff < 0) {
        runDamageAnimation(() => {
          setTimeout(() => {
            setHealthState((prev) => ({
              ...prev,
              showing: false,
              diff: 0,
            }));
          }, 500);
        });
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
    runTextAnimation(() => {
      animations.textFadeAnim.setValue(1);
      animations.textTranslateAnim.setValue(0);
      setEnemyTextString(undefined);
    });
  }, [enemyTextDummy]);

  useEffect(() => {
    return () => setHealthState((prev) => ({ ...prev, diff: -0.1 }));
  }, []);

  if (!enemyState) return null;

  return (
    <View className="flex h-[40%] pt-8">
      <View className="flex-1 flex-row items-center justify-evenly pl-8">
        <View
          className="flex flex-col items-center justify-center"
          style={{ minWidth: "40%", maxWidth: "60%" }}
        >
          <Text className="text-center text-3xl">
            {enemyState.creatureSpecies.toLowerCase().includes("generic npc")
              ? slug[2]
              : toTitleCase(enemyState.creatureSpecies).replace(" ", "\n")}
          </Text>
          <ProgressBar
            value={enemyState.health >= 0 ? enemyState.health : 0}
            maxValue={enemyState.healthMax}
            filledColor="#ef4444"
            unfilledColor="#fee2e2"
            displayNumber={
              enemyState.creatureSpecies.toLowerCase() == "training dummy"
                ? true
                : false
            }
            removeAtZero={true}
          />
          <EnemyHealthChangePopUp
            healthDiff={healthState.diff}
            showing={healthState.showing}
          />
          <EnemyConditions conditions={enemyState.conditions} />
        </View>
        <View className="relative">
          <Animated.View
            className="mx-auto mt-12"
            style={{
              transform: [
                {
                  translateX: Animated.add(
                    animations.attackAnim,
                    animations.dodgeAnim,
                  ),
                },
                {
                  translateY: Animated.multiply(
                    Animated.add(animations.attackAnim, animations.dodgeAnim),
                    -1.5,
                  ),
                },
              ],
              opacity: Animated.multiply(
                animations.damageAnim,
                animations.flashOpacity,
              ),
            }}
          >
            <View style={{ position: "relative" }}>
              <EnemyImage
                creatureSpecies={enemyState.creatureSpecies}
                glowAnim={healingGlowAnim}
              />
            </View>
          </Animated.View>
          <Animated.View
            style={{
              transform: [{ translateY: animations.textTranslateAnim }],
              opacity: animations.textFadeAnim,
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {enemyTextString ? (
              <Text
                className="text-xl tracking-wide text-center"
                numberOfLines={1}
              >
                *{toTitleCase(enemyTextString)}*
              </Text>
            ) : null}
          </Animated.View>
        </View>
      </View>
      {enemyState.minions.length > 0 ? (
        <View className="mx-4">
          <GenericStrikeAround>
            <Text className="text-sm">Enemy Minions</Text>
          </GenericStrikeAround>
          <View className="mx-4 flex flex-row flex-wrap">
            {enemyState.minions.map((minion) => (
              <View
                key={minion.id}
                className="flex-grow px-2 py-1"
                style={{ flexBasis: "50%" }}
              >
                <Text>{toTitleCase(minion.creatureSpecies)}</Text>
                <ProgressBar
                  filledColor="#ef4444"
                  unfilledColor="#fee2e2"
                  value={minion.health}
                  maxValue={minion.healthMax}
                  displayNumber={false}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
});

export default DungeonEnemyDisplay;
