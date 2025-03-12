import { PlayerCharacter } from "@/entities/character";
import {
  StatChange,
  StatType,
  useAcceleratedAction,
  useStatChanges,
} from "@/hooks/generic";
import { radius, tw_base, useStyles } from "@/hooks/styles";
import { AccelerationCurves, toTitleCase } from "@/utility/functions/misc";
import { Attribute, AttributeToString, Modifier } from "@/utility/types";
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text } from "../Themed";
import ProgressBar from "../ProgressBar";
import {
  ClockIcon,
  DexterityIcon,
  HealthIcon,
  IntelligenceIcon,
  Sanity,
  SquareMinus,
  SquarePlus,
  StrengthIcon,
} from "@/assets/icons/SVGIcons";
import FadeOutNode from "../FadeOutNode";
import React from "react";
import { useRootStore } from "@/hooks/stores";
import { observer } from "mobx-react-lite";
import { Condition } from "@/entities/conditions";
import { BlurView } from "expo-blur";
import { usePathname } from "expo-router";
import { getTotalValue, statMapping } from "@/utility/functions/stats";
import { Colors } from "react-native/Libraries/NewAppScreen";

export const EXPANDED_PAD = 16;

export const RenderPrimaryStatsBlock = observer(
  ({
    stat,
    playerState,
    respeccing,
    vibration,
  }: {
    stat: Attribute.health | Attribute.mana | Attribute.sanity;
    playerState: PlayerCharacter;
    respeccing: boolean;
    vibration: ({
      style,
      essential,
    }: {
      style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
      essential?: boolean | undefined;
    }) => void;
  }) => {
    const getMaxAmount = useCallback(() => {
      return respeccing
        ? playerState.allocatedSkillPoints[stat]
        : playerState.unAllocatedSkillPoints;
    }, [stat, playerState, respeccing]);

    const action = useCallback(() => {
      if (playerState) {
        if (respeccing) {
          playerState.removeSkillPoint({
            from: stat,
          });
        } else {
          playerState.addSkillPoint({
            to: stat,
          });
        }
      }
    }, [playerState, stat, respeccing]);

    const { start: handlePressIn, stop: handlePressOut } = useAcceleratedAction(
      () => null,
      {
        minHoldTime: 350,
        maxSpeed: 10,
        accelerationCurve: AccelerationCurves.linear,
        action,
        minActionAmount: 1,
        maxActionAmount: getMaxAmount(),
        debounceTime: 50,
      },
    );

    const styles = useStyles();
    const onPressIn = useCallback(() => {
      vibration({ style: "light" });
      handlePressIn();
    }, [handlePressIn, vibration]);

    const onPressOut = useCallback(() => {
      handlePressOut();
    }, [handlePressOut]);

    if (!playerState) return null;

    let current;
    let max;
    let min = 0;
    let filledColor;
    let unfilledColor;

    switch (stat) {
      case Attribute.health:
        current = playerState.currentHealth;
        max = playerState.maxHealth;
        filledColor = "#ef4444";
        unfilledColor = "#fca5a5";
        break;
      case Attribute.mana:
        current = playerState.currentMana;
        max = playerState.maxMana;
        filledColor = "#60a5fa";
        unfilledColor = "#bfdbfe";
        break;
      case Attribute.sanity:
        current = playerState.currentSanity;
        max = playerState.maxSanity;
        min = -playerState.maxSanity;
        filledColor = "#c084fc";
        unfilledColor = "#e9d5ff";
        break;
    }
    const shouldShow =
      (playerState.unAllocatedSkillPoints > 0 && !respeccing) ||
      (playerState.allocatedSkillPoints[stat] > 0 && respeccing);

    return (
      <View style={styles.columnCenter}>
        <Text style={{ paddingVertical: 4, color: filledColor }}>
          {AttributeToString[stat]}
        </Text>
        <View
          style={{ width: "100%", alignItems: "center", ...styles.rowCenter }}
        >
          <View style={{ flex: 1 }}>
            <ProgressBar
              value={current}
              minValue={min}
              maxValue={max}
              filledColor={filledColor}
              unfilledColor={unfilledColor}
              showMax
            />
          </View>
          {shouldShow && (
            <Pressable
              style={{ paddingHorizontal: 2 }}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={!shouldShow}
            >
              {({ pressed }) => (
                <View style={{ transform: [{ scale: pressed ? 0.95 : 1 }] }}>
                  {respeccing ? (
                    <SquareMinus height={28} width={28} />
                  ) : (
                    <SquarePlus height={28} width={28} />
                  )}
                </View>
              )}
            </Pressable>
          )}
        </View>
      </View>
    );
  },
);

export const RenderSecondaryStatsBlock = observer(
  ({
    stat,
    playerState,
    respeccing,
    vibration,
  }: {
    stat: Attribute.strength | Attribute.dexterity | Attribute.intelligence;
    playerState: PlayerCharacter;
    respeccing: boolean;
    vibration: ({
      style,
      essential,
    }: {
      style: "light" | "medium" | "heavy" | "success" | "warning" | "error";
      essential?: boolean | undefined;
    }) => void;
  }) => {
    const getMaxAmount = useCallback(() => {
      return respeccing
        ? playerState.allocatedSkillPoints[stat]
        : playerState.unAllocatedSkillPoints;
    }, [stat, playerState, respeccing]);

    const styles = useStyles();
    const action = useCallback(() => {
      if (playerState) {
        if (respeccing) {
          playerState.removeSkillPoint({
            from: stat,
          });
        } else {
          playerState.addSkillPoint({
            to: stat,
          });
        }
      }
    }, [playerState, stat, respeccing]);

    const { start: handlePressIn, stop: handlePressOut } = useAcceleratedAction(
      () => null,
      {
        minHoldTime: 350,
        maxSpeed: 10,
        accelerationCurve: AccelerationCurves.cubic,
        action,
        minActionAmount: 1,
        maxActionAmount: getMaxAmount(),
        debounceTime: 50,
      },
    );

    const onPressIn = useCallback(() => {
      vibration({ style: "light" });
      handlePressIn();
    }, [handlePressIn, vibration]);

    const onPressOut = useCallback(() => {
      handlePressOut();
    }, [handlePressOut]);

    const shouldShow =
      (respeccing && playerState.allocatedSkillPoints[stat] > 0) ||
      (!respeccing && playerState.unAllocatedSkillPoints > 0);

    return (
      <View style={styles.columnCenter}>
        <Text style={{ paddingVertical: 4 }}>{AttributeToString[stat]}</Text>
        <View style={[styles.rowCenter, { alignItems: "center" }]}>
          <Text>
            {stat === Attribute.strength
              ? playerState.totalStrength
              : stat === Attribute.dexterity
              ? playerState.totalDexterity
              : playerState.totalIntelligence}
          </Text>
          {stat === Attribute.strength ? (
            <StrengthIcon height={20} width={23} />
          ) : stat === Attribute.dexterity ? (
            <DexterityIcon height={20} width={23} />
          ) : (
            <IntelligenceIcon height={20} width={23} />
          )}
          {shouldShow && (
            <View style={styles.rowCenter}>
              <Pressable
                style={{ paddingHorizontal: 2 }}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={!shouldShow}
              >
                {({ pressed }) => (
                  <View style={{ transform: [{ scale: pressed ? 0.95 : 1 }] }}>
                    {respeccing ? (
                      <SquareMinus height={28} width={28} />
                    ) : (
                      <SquarePlus height={28} width={28} />
                    )}
                  </View>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  },
);

export const ChangePopUp = ({
  popUp,
  change,
  animationCycler,
  colorScheme,
}: {
  popUp: StatType;
  change: StatChange;
  animationCycler: number;
  colorScheme: "light" | "dark";
}) => {
  const color =
    popUp === "mana"
      ? "#60a5fa"
      : popUp === "health"
      ? "#ef4444"
      : popUp === "sanity"
      ? "#c084fc"
      : colorScheme === "dark"
      ? "white"
      : "black";

  const styles = useStyles();
  return (
    <View style={{ opacity: change.isShowing ? 1 : 0 }}>
      <FadeOutNode
        animateWidth={popUp === "gold"}
        animationCycler={animationCycler}
        style={{ marginVertical: "auto", flexDirection: "row" }}
      >
        <Text
          style={[
            {
              color,
              ...styles["text-sm"],
            },
            popUp === "gold" ? { paddingLeft: 4 } : { paddingRight: 8 },
          ]}
        >
          {change.current > 0 ? "+" : ""}
          {change.current}
          {change.cumulative !== change.current && (
            <>
              ({change.cumulative > 0 ? "+" : ""}
              {change.cumulative})
            </>
          )}
        </Text>
      </FadeOutNode>
    </View>
  );
};

export const ConditionRenderer = observer(() => {
  const styles = useStyles();
  const { uiStore, playerState } = useRootStore();
  if (playerState) {
    let simplifiedConditionsMap: Map<
      string,
      {
        name: string;
        icon: any;
        count: number;
      }
    > = new Map();

    playerState.conditions.forEach((condition) => {
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
    let simplifiedConditions = Array.from(simplifiedConditionsMap.values());

    return (
      <View style={styles.rowAround}>
        {simplifiedConditions.map((cond) => (
          <View key={cond.name} style={styles.conditionIcon}>
            <Image
              source={cond.icon}
              style={[
                ["blind", "stun"].includes(cond.name) &&
                uiStore.colorScheme === "dark"
                  ? {
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      borderRadius: 20,
                      width: 24,
                      height: 24,
                    }
                  : {
                      width: 24,
                      height: 24,
                    },
              ]}
              resizeMode="contain"
            />
          </View>
        ))}
      </View>
    );
  }
});

export const DetailedViewConditionRender = observer(() => {
  const { playerState } = useRootStore();
  const styles = useStyles();
  if (playerState) {
    return (
      <View style={{ height: tw_base[64] }}>
        <ScrollView>
          {playerState.conditions.map((condition) => (
            <View key={condition.id} style={styles.detailedConditionCard}>
              <View style={styles.rowEvenly}>
                <Text
                  style={{
                    letterSpacing: 1,
                    opacity: 0.8,
                    ...styles["text-xl"],
                  }}
                >
                  {toTitleCase(condition.name)}
                </Text>
                <View style={styles.columnCenter}>
                  <View style={[styles.rowCenter, { paddingVertical: 4 }]}>
                    <Image
                      source={condition.getConditionIcon()}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                    <Text> {condition.turns} </Text>
                    <ClockIcon width={16} height={16} />
                  </View>
                  {!!condition.getHealthDamage() && (
                    <View style={styles.rowCenter}>
                      <Text>{condition.getHealthDamage()}</Text>
                      <HealthIcon height={16} width={16} />
                    </View>
                  )}
                  {!!condition.getSanityDamage() && (
                    <View style={styles.rowCenter}>
                      <Text>{condition.getSanityDamage()}</Text>
                      <View style={{ marginLeft: 4 }}>
                        <Sanity height={16} width={16} />
                      </View>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    letterSpacing: 1,
                    opacity: 0.8,
                    ...styles["text-xl"],
                  }}
                >
                  {toTitleCase(condition.style)}
                </Text>
              </View>
              <View style={{ marginHorizontal: "auto" }}>
                {condition.effect.map((effect, idx) => (
                  <Text key={idx}>
                    {Condition.effectExplanationString({
                      effect,
                      effectMagnitude: condition.effectMagnitude[idx],
                      effectStyle: condition.effectStyle[idx],
                      trapSetupTime: condition.trapSetupTime,
                    })}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
});

export const StatDisplay = ({
  modifier,
  value,
}: {
  modifier: Modifier;
  value: number;
}) => {
  const statInfo = statMapping[modifier];
  const Icon = statInfo.icon;
  const styles = useStyles();
  const { uiStore } = useRootStore();
  const theme = Colors[uiStore.colorScheme];

  return (
    <View
      style={{
        ...styles.my2,
        ...styles.p2,
        ...radius.lg,
        backgroundColor: theme.secondary,
      }}
    >
      <View style={{ ...styles.rowCenter }}>
        <Icon height={14} width={14} />
        <Text style={styles.ml2}>{getTotalValue(modifier, value)}</Text>
      </View>
      <Text
        style={{
          ...styles.textCenter,
          ...styles["text-sm"],
          ...styles.mt1,
        }}
      >
        {statInfo.description}
      </Text>
    </View>
  );
};

export const StatCategory = ({
  category,
  stats,
}: {
  category: "offensive" | "defensive";
  stats: Map<Modifier, number>;
}) => {
  const styles = useStyles();
  if (!stats.size || stats.size == 0) {
    return (
      <View style={[styles.columnCenter, { flex: 1 }]}>
        <Text
          style={{
            textAlign: "center",
            color: "#6b7280",
            fontStyle: "italic",
          }}
        >
          No {category} stats from equipment
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      {Array.from(stats).map(([modifier, value]) => {
        if (!value || value <= 0) {
          return null;
        }

        return <StatDisplay key={modifier} modifier={modifier} value={value} />;
      })}
    </ScrollView>
  );
};

export const ColorAndPlatformDependantBlur = observer(
  ({ children, home = true }: { children: ReactNode; home?: boolean }) => {
    const { uiStore, playerState, dungeonStore } = useRootStore();
    const pathname = usePathname();
    const { healthDamageFlash, sanityDamageFlash, statChanges } =
      useStatChanges(playerState!);

    const healthWarningAnimatedValue = useState(new Animated.Value(0))[0];

    const [showingHealthWarningPulse, setShowingHealthWarningPulse] =
      useState<boolean>(false);

    const healthWarningInterpolation = healthWarningAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(205,20,20,0.6)", "rgba(127,29,29,0.2)"],
    });

    const healthDamageInterpolation = healthDamageFlash.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(180,30,30,0.4)"],
    });

    const sanityDamageInterpolation = sanityDamageFlash.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(107,33,168,0.4)"], // #6b21a8 with 0.4 opacity
    });

    const combinedFlashInterpolation = Animated.multiply(
      healthDamageFlash,
      sanityDamageFlash,
    ).interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(160,30,120,0.5)"],
      extrapolate: "clamp",
    });

    const healthOrSanityFlash = () => {
      if (statChanges.health.isShowing && statChanges.sanity.isShowing) {
        return combinedFlashInterpolation;
      }
      if (statChanges.health.isShowing) {
        return healthDamageInterpolation;
      }
      if (statChanges.sanity.isShowing) {
        return sanityDamageInterpolation;
      }
    };

    useEffect(() => {
      if (showingHealthWarningPulse) {
        startHealthWarningAnimation();
      }
    }, [pathname, showingHealthWarningPulse]);

    useEffect(() => {
      let animationLoop: Animated.CompositeAnimation | null = null;

      if (
        playerState &&
        playerState.currentHealth / playerState.maxHealth <=
          uiStore.healthWarning
      ) {
        if (!showingHealthWarningPulse) {
          setShowingHealthWarningPulse(true);

          animationLoop = Animated.loop(
            Animated.sequence([
              Animated.timing(healthWarningAnimatedValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(healthWarningAnimatedValue, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            {
              iterations: -1,
            },
          );

          animationLoop.start();
        }
      } else if (showingHealthWarningPulse) {
        setShowingHealthWarningPulse(false);
      }

      // Cleanup
      return () => {
        if (animationLoop) {
          animationLoop.stop();
        }
      };
    }, [
      playerState?.currentHealth,
      playerState?.maxHealth,
      uiStore.healthWarning,
      showingHealthWarningPulse,
    ]);

    const startHealthWarningAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(healthWarningAnimatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(healthWarningAnimatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        {
          iterations: -1,
        },
      ).start();
    };

    if (home) {
      if (uiStore.colorScheme === "dark" && Platform.OS === "ios") {
        return (
          <BlurView
            intensity={100}
            tint={uiStore.colorScheme}
            style={[
              {
                marginHorizontal: 16,
                borderRadius: 12,
                zIndex: 10,
                overflow: "hidden",
              },
            ]}
          >
            <Animated.View
              style={{
                display: "flex",
                backgroundColor: showingHealthWarningPulse
                  ? healthWarningInterpolation
                  : healthOrSanityFlash(),
                paddingBottom: 4,
              }}
            >
              {children}
            </Animated.View>
          </BlurView>
        );
      } else {
        return (
          <View
            style={{
              marginHorizontal: 16,
              borderRadius: 12,
              zIndex: 10,
              backgroundColor:
                uiStore.colorScheme === "dark" ? "#27272a" : "#fafafa",
              shadowColor:
                uiStore.colorScheme === "dark" ? "#ffffff" : "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Animated.View
              style={{
                display: "flex",
                backgroundColor: showingHealthWarningPulse
                  ? healthWarningInterpolation
                  : healthOrSanityFlash(),
                paddingBottom: 4,
                borderRadius: 12,
              }}
            >
              {children}
            </Animated.View>
          </View>
        );
      }
    }
    if (dungeonStore.isInDungeon) {
      return (
        <View
          style={{
            zIndex: 10,
            overflow: "hidden",
            paddingBottom: 24,
            backgroundColor:
              Platform.OS !== "ios"
                ? uiStore.colorScheme === "dark"
                  ? "#27272a"
                  : "#fafafa"
                : "transparent",
            shadowColor: uiStore.colorScheme === "dark" ? "#ffffff" : "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Animated.View
            style={{
              display: "flex",
              backgroundColor: showingHealthWarningPulse
                ? healthWarningInterpolation
                : healthOrSanityFlash(),
            }}
          >
            {children}
          </Animated.View>
        </View>
      );
    } else {
      return (
        <BlurView
          intensity={Platform.OS === "ios" ? 100 : 0}
          tint={uiStore.colorScheme}
          style={{
            zIndex: 10,
            overflow: "hidden",
            paddingBottom: 24,
            backgroundColor:
              Platform.OS !== "ios"
                ? uiStore.colorScheme === "dark"
                  ? "#27272a"
                  : "#fafafa"
                : "transparent",
            shadowColor: uiStore.colorScheme === "dark" ? "#ffffff" : "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Animated.View
            style={{
              display: "flex",
              backgroundColor: showingHealthWarningPulse
                ? healthWarningInterpolation
                : healthOrSanityFlash(),
            }}
          >
            {children}
          </Animated.View>
        </BlurView>
      );
    }
  },
);
