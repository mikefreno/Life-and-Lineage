import { View, Animated, Image, ScrollView } from "react-native";
import { toTitleCase } from "../../utility/functions/misc";
import ProgressBar from "../ProgressBar";
import GenericStrikeAround from "../GenericStrikeAround";
import { Text } from "../Themed";
import FadeOutNode from "../FadeOutNode";
import { memo, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import type { Enemy } from "../../entities/creatures";
import { useRootStore } from "../../hooks/stores";
import { AnimatedSprite } from "../AnimatedSprite";
import { flex, normalize, tw_base, useStyles } from "../../hooks/styles";
import Colors from "@/constants/Colors";

const EnemyHealthChangePopUp = memo(
  ({ healthDiff, showing }: { healthDiff: number; showing: boolean }) => {
    if (!showing) return <View style={{ height: tw_base[2] }} />;

    return (
      <View style={{ height: tw_base[2] }}>
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
            <View
              style={[
                flex.columnCenter,
                {
                  borderRadius: 9999,
                  height: 36,
                  width: 36,
                  alignContent: "center",
                  marginVertical: "auto",
                  backgroundColor: `${Colors.light.background}50`,
                },
              ]}
            >
              <Image source={cond.icon} style={{ width: 22, height: 24 }} />
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
      {enemyStore.enemies.map((enemy) => {
        const store = enemyStore.getAnimationStore(enemy.id);

        if (store) {
          return <EnemyDisplay key={enemy.id} enemy={enemy} />;
        }
      })}
    </View>
  );
});

const EnemyDisplay = observer(({ enemy }: { enemy: Enemy }) => {
  const styles = useStyles();
  const [healthState, setHealthState] = useState({
    record: enemy.currentHealth,
    diff: 0,
    showing: false,
  });

  const healingGlowAnim = useRef(new Animated.Value(0)).current;

  // TODO: Dialogue popup (modal)
  // TODO: Healing animation

  return (
    <View style={{ flex: 1, paddingHorizontal: "2%" }}>
      <View style={[flex.rowBetween, { flex: 1 }]}>
        <View
          style={{
            width: "50%",
          }}
        >
          <View style={{ flex: 1 }} />
          <View style={{ flex: 1, alignItems: "center" }}>
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
              containerStyle={{ width: "90%" }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <EnemyHealthChangePopUp
              healthDiff={healthState.diff}
              showing={healthState.showing}
            />
            <EnemyConditions conditions={enemy.conditions} />
          </View>
        </View>
        <AnimatedSprite enemy={enemy} />
      </View>
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
});

export default DungeonEnemyDisplay;
