import { View, Image, ScrollView } from "react-native";
import { toTitleCase } from "../../utility/functions/misc";
import ProgressBar from "../ProgressBar";
import GenericStrikeAround from "../GenericStrikeAround";
import { Text } from "../Themed";
import FadeOutNode from "../FadeOutNode";
import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Creature, Enemy } from "../../entities/creatures";
import { useRootStore } from "../../hooks/stores";
import { AnimatedSprite } from "../AnimatedSprite";
import {
  flex,
  normalize,
  normalizeLineHeight,
  useStyles,
} from "../../hooks/styles";
import Colors from "@/constants/Colors";
import {
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { type Being } from "@/entities/being";
import { Character } from "@/entities/character";

const EnemyHealthChangePopUp = ({
  healthDiff,
  showing,
  reset,
}: {
  healthDiff: number;
  showing: boolean;
  reset: () => void;
}) => {
  if (!showing) return <View style={{ height: normalizeLineHeight(16) }} />;
  return (
    <View style={{ height: normalizeLineHeight(16) }}>
      <FadeOutNode clearingFunction={reset}>
        <Text style={{ color: "#f87171" }}>
          {healthDiff > 0 ? "+" : ""}
          {healthDiff.toString()}
        </Text>
      </FadeOutNode>
    </View>
  );
};

const EnemyConditions = ({ enemy }: { enemy: Being }) => {
  const { uiStore } = useRootStore();
  const simplifiedConditions = useMemo(() => {
    const condMap = new Map();
    enemy?.conditions.forEach((condition) => {
      if (condMap.has(condition.name)) {
        const existing = condMap.get(condition.name);
        existing.count += 1;
        condMap.set(condition.name, existing);
      } else {
        condMap.set(condition.name, {
          name: condition.name,
          id: condition.id,
          icon: condition.getConditionIcon(),
          count: 1,
        });
      }
    });
    return Array.from(condMap.values());
  }, [enemy?.conditions, enemy?.conditions.length]);
  const styles = useStyles();

  return (
    <View
      style={{
        width: "100%",
        height: uiStore.iconSizeLarge + 8,
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
          <View key={cond.id} style={{ marginHorizontal: 2 }}>
            <View
              style={[
                flex.columnCenter,
                {
                  borderRadius: 9999,
                  padding: 4,
                  alignContent: "center",
                  marginVertical: "auto",
                  backgroundColor: `${Colors.light.background}50`,
                },
              ]}
            >
              <Image
                source={cond.icon}
                style={{
                  width: uiStore.iconSizeLarge,
                  height: uiStore.iconSizeLarge,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                position: "absolute",
                right: normalize(-4),
                top: normalize(16),
              }}
            >
              <Text style={[styles["text-3xl"], { top: 4 }]}>*</Text>
              <Text style={[styles["text-xl"]]} numberOfLines={1}>
                {cond.count}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

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
      {enemyStore.enemies.map((enemy) => {
        const store = enemyStore.getAnimationStore(enemy.id);

        if (store) {
          return <EnemyDisplay key={enemy.id} enemy={enemy} />;
        }
      })}
    </View>
  );
});

const EnemyDisplay = observer(({ enemy }: { enemy: Being }) => {
  const styles = useStyles();
  const [healthState, setHealthState] = useState({
    id: enemy.id,
    record: enemy.currentHealth,
    diff: 0,
    showing: false,
  });
  const glowValue = useSharedValue(0);

  const enemyName = useMemo(() => {
    if (enemy instanceof Creature) {
      return enemy.creatureSpecies;
    } else if (enemy instanceof Character) {
      return enemy.fullName;
    }
    throw new Error(`invalid enemy instance: ${enemy.beingType}`);
  }, [enemy]);

  useEffect(() => {
    if (healthState.id !== enemy.id) {
      setHealthState({
        id: enemy.id,
        record: enemy.currentHealth,
        diff: 0,
        showing: false,
      });
    } else if (enemy.currentHealth !== healthState.record) {
      if (enemy.currentHealth - healthState.record > 0) {
        glowValue.value = withSequence(
          withTiming(0.8, { duration: 300 }),
          withTiming(0, { duration: 700 }),
        );
      }
      setHealthState((prev) => {
        return {
          record: enemy.currentHealth,
          diff: enemy.currentHealth - prev.record,
          showing: true,
          id: prev.id,
        };
      });
    }
  }, [enemy.currentHealth, enemy.id]);

  return (
    <View style={{ flex: 1, paddingHorizontal: "2%", marginTop: "-10%" }}>
      <View style={[flex.rowBetween, { flex: 1 }]}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            width: "50%",
          }}
        >
          <Text
            style={{
              ...styles["text-3xl"],
              textAlign: "center",
            }}
            numberOfLines={2}
          >
            {toTitleCase(enemyName).replace(" ", "\n")}
          </Text>
          <ProgressBar
            value={enemy.currentHealth >= 0 ? enemy.currentHealth : 0}
            maxValue={enemy.maxHealth}
            filledColor="#ef4444"
            unfilledColor="#fee2e2"
            displayNumber={enemyName.toLowerCase() == "training dummy"}
            removeAtZero={true}
            containerStyle={{ width: "90%" }}
          />
          <EnemyHealthChangePopUp
            healthDiff={healthState.diff}
            showing={healthState.showing}
            reset={() =>
              setHealthState((prev) => {
                return { ...prev, showing: false };
              })
            }
          />
          <EnemyConditions enemy={enemy} />
        </View>
        <AnimatedSprite enemy={enemy} glow={glowValue} />
      </View>
      {enemy instanceof Enemy && enemy.minions.length > 0 ? (
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
});

export default DungeonEnemyDisplay;
