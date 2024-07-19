import { View, Animated, Image } from "react-native";
import { EnemyHealingAnimationBox } from "../EnemyHealingAnimationBox";
import { toTitleCase } from "../../utility/functions/misc/words";
import { Enemy } from "../../classes/creatures";
import { Text } from "../Themed";
import ProgressBar from "../ProgressBar";
import GenericStrikeAround from "../GenericStrikeAround";
import FadeOutText from "../FadeOutText";
import { View as ThemedView } from "../Themed";
import { EnemyImage } from "../EnemyImage";

interface DungeonEnemyDisplayInterface {
  enemyState: Enemy;
  showingEnemyHealthChange: boolean;
  enemyHealthDiff: number;
  animationCycler: number;
  enemyAttackAnimationValue: Animated.Value;
  enemyHealDummy: number;
  enemyDamagedAnimationValue: Animated.Value;
  enemyTextTranslateAnimation: Animated.Value;
  enemyTextString?: string;
  enemyTextFadeAnimation: Animated.Value;
}
export default function DungeonEnemyDisplay({
  enemyState,
  showingEnemyHealthChange,
  enemyHealthDiff,
  animationCycler,
  enemyAttackAnimationValue,
  enemyHealDummy,
  enemyDamagedAnimationValue,
  enemyTextTranslateAnimation,
  enemyTextString,
  enemyTextFadeAnimation,
}: DungeonEnemyDisplayInterface) {
  function EnemyHealthChangePopUp() {
    return (
      <View className="h-6">
        <FadeOutText
          className={"text-red-400"}
          text={`${
            enemyHealthDiff > 0 ? "+" : ""
          }${enemyHealthDiff.toString()}`}
          animationCycler={animationCycler}
        />
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

  return (
    <View className="flex h-[40%] pt-8">
      <View className="flex-1 flex-row justify-evenly pl-8">
        <View
          className="flex flex-col items-center justify-center"
          style={{ minWidth: "40%" }}
        >
          <Text className="text-center text-3xl">
            {toTitleCase(enemyState.creatureSpecies).replace(" ", "\n")}
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
        <View>
          <Animated.View
            className="mx-auto mt-12"
            style={{
              transform: [
                { translateX: enemyAttackAnimationValue },
                {
                  translateY: Animated.multiply(
                    enemyAttackAnimationValue,
                    -1.5,
                  ),
                },
              ],
              opacity: enemyDamagedAnimationValue,
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
              marginLeft: 48,
              marginTop: 48,
            }}
          >
            {enemyTextString ? (
              <Text className="text-center text-xl tracking-wide">
                *{toTitleCase(enemyTextString)}*
              </Text>
            ) : null}
          </Animated.View>
        </View>
      </View>
      {enemyState.minions.length > 0 ? (
        <View className="mx-4">
          <GenericStrikeAround
            textNode={<Text className="text-sm">Enemy Minions</Text>}
          />
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
