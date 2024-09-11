import { View, Animated, Image } from "react-native";
import { EnemyHealingAnimationBox } from "./EnemyHealingAnimationBox";
import { toTitleCase } from "../../utility/functions/misc/words";
import { Text } from "../Themed";
import ProgressBar from "../ProgressBar";
import GenericStrikeAround from "../GenericStrikeAround";
import { View as ThemedView } from "../Themed";
import { EnemyImage } from "../EnemyImage";
import FadeOutNode from "../FadeOutNode";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app/_layout";
import { DungeonContext } from "./DungeonContext";

export default function DungeonEnemyDisplay() {
  const appData = useContext(AppContext);
  const dungeonData = useContext(DungeonContext);
  if (!dungeonData || !appData) throw new Error("missing context");
  const { enemyState } = appData;
  const {
    slug,
    enemyTextString,
    enemyHealDummy,
    enemyAttackDummy,
    firstLoad,
    enemyTextDummy,
    setEnemyTextString,
    enemyDodgeDummy,
  } = dungeonData;

  const [enemyHealthRecord, setEnemyHealthRecord] = useState<
    number | undefined
  >(enemyState?.health);
  const [enemyHealthDiff, setEnemyHealthDiff] = useState<number>(0);
  const [showingEnemyHealthChange, setShowingEnemyHealthChange] =
    useState<boolean>(false);
  const [animationCycler, setAnimationCycler] = useState<number>(0);

  const enemyAttackAnimationValue = useState(new Animated.Value(0))[0];
  const enemyDamagedAnimationValue = useState(new Animated.Value(1))[0];
  const enemyTextFadeAnimation = useState(new Animated.Value(1))[0];
  const enemyTextTranslateAnimation = useState(new Animated.Value(0))[0];
  const enemyDodgeAnimationValue = useState(new Animated.Value(0))[0];
  const enemyFlashOpacity = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (
      enemyState &&
      enemyHealthRecord &&
      enemyState.health != enemyHealthRecord
    ) {
      setEnemyHealthDiff(enemyState.health - enemyHealthRecord);
      setAnimationCycler(animationCycler + 1);
      setShowingEnemyHealthChange(true);
    } else {
      setEnemyHealthDiff(0);
      setShowingEnemyHealthChange(false);
    }
    setEnemyHealthRecord(enemyState?.health);
  }, [enemyState?.health]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(enemyTextFadeAnimation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(enemyTextTranslateAnimation, {
        toValue: -100,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      enemyTextFadeAnimation.setValue(1);
      enemyTextTranslateAnimation.setValue(0);
      setEnemyTextString(undefined);
    });
  }, [enemyTextDummy]);

  useEffect(() => {
    if (!firstLoad && enemyAttackDummy !== 0) {
      Animated.sequence([
        Animated.timing(enemyAttackAnimationValue, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(enemyAttackAnimationValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [enemyAttackDummy]);

  useEffect(() => {
    if (!firstLoad && enemyDodgeDummy !== 0) {
      Animated.sequence([
        // Move to dodge position
        Animated.timing(enemyDodgeAnimationValue, {
          toValue: 30,
          duration: 200,
          useNativeDriver: true,
        }),
        // Hold position and flash simultaneously
        Animated.parallel([
          Animated.delay(200),
          Animated.sequence([
            Animated.timing(enemyFlashOpacity, {
              toValue: 0.3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(enemyFlashOpacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Move back to original position
        Animated.timing(enemyDodgeAnimationValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [enemyDodgeDummy]);

  useEffect(() => {
    if (enemyHealthDiff < 0 && !firstLoad) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(enemyDamagedAnimationValue, {
            toValue: 0.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(enemyDamagedAnimationValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 },
      ).start(() => {
        setTimeout(() => {
          setShowingEnemyHealthChange(false);
          setEnemyHealthDiff(0);
        }, 500);
      });
    }
  }, [enemyHealthDiff]);

  useEffect(() => {
    return () => setEnemyHealthDiff(-0.1);
  }, []);

  function EnemyHealthChangePopUp() {
    return (
      <View className="h-6">
        {enemyHealthDiff != -0.1 &&
          enemyState?.health !== enemyState?.healthMax && (
            <FadeOutNode>
              <Text style={{ color: "#f87171" }}>
                {enemyHealthDiff > 0 ? "+" : ""}
                {enemyHealthDiff.toString()}
              </Text>
            </FadeOutNode>
          )}
      </View>
    );
  }

  function EnemyConditionRender() {
    if (enemyState) {
      let simplifiedConditionsMap: Map<
        string,
        {
          name: string;
          icon: any;
          count: number;
        }
      > = new Map();

      enemyState.conditions.forEach((condition) => {
        if (simplifiedConditionsMap.has(condition.name)) {
          let existingCondition = simplifiedConditionsMap.get(condition.name)!;
          existingCondition.count += 1;
          simplifiedConditionsMap.set(condition.name, existingCondition);
        } else {
          simplifiedConditionsMap.set(condition.name, {
            name: condition.name,
            icon: condition.getConditionIcon(),
            count: 1,
          });
        }
      });
      let simplifiedConditions: {
        name: string;
        icon: any;
        count: number;
      }[] = Array.from(simplifiedConditionsMap.values());

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
    }
  }

  if (enemyState) {
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
            {showingEnemyHealthChange ? (
              <EnemyHealthChangePopUp />
            ) : (
              <View className="h-6" />
            )}
            {EnemyConditionRender()}
          </View>
          <View className="relative">
            <Animated.View
              className="mx-auto mt-12"
              style={{
                transform: [
                  {
                    translateX: Animated.add(
                      enemyAttackAnimationValue,
                      enemyDodgeAnimationValue,
                    ),
                  },
                  {
                    translateY: Animated.multiply(
                      Animated.add(
                        enemyAttackAnimationValue,
                        enemyDodgeAnimationValue,
                      ),
                      -1.5,
                    ),
                  },
                ],
                opacity: Animated.multiply(
                  enemyDamagedAnimationValue,
                  enemyFlashOpacity,
                ),
              }}
            >
              <EnemyImage creatureSpecies={enemyState.creatureSpecies} />
            </Animated.View>
            <EnemyHealingAnimationBox showHealAnimationDummy={enemyHealDummy} />
            <Animated.View
              style={{
                transform: [{ translateY: enemyTextTranslateAnimation }],
                opacity: enemyTextFadeAnimation,
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
  }
}
