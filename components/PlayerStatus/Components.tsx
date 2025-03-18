import { PlayerCharacter } from "@/entities/character";
import {
  StatChange,
  StatType,
  useAcceleratedAction,
  useStatChanges,
} from "@/hooks/generic";
import { normalize, radius, tw_base, useStyles } from "@/hooks/styles";
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
  Regen,
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
import Colors from "@/constants/Colors";

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
    const { uiStore } = useRootStore();

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
                    <SquareMinus
                      height={uiStore.iconSizeLarge}
                      width={uiStore.iconSizeLarge}
                    />
                  ) : (
                    <SquarePlus
                      height={uiStore.iconSizeLarge}
                      width={uiStore.iconSizeLarge}
                    />
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
    stat:
      | Attribute.strength
      | Attribute.dexterity
      | Attribute.intelligence
      | Attribute.manaRegen;
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
    const { uiStore } = useRootStore();
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
      <View style={[styles.columnCenter, { flex: 1 }]}>
        <Text style={{ paddingVertical: 4, ...styles["text-lg"] }}>
          {AttributeToString[stat]}
        </Text>
        <View style={[styles.rowCenter, { alignItems: "center" }]}>
          <Text style={[styles["text-lg"], { paddingRight: 4 }]}>
            {stat === Attribute.strength
              ? playerState.totalStrength
              : stat === Attribute.dexterity
              ? playerState.totalDexterity
              : stat === Attribute.intelligence
              ? playerState.totalIntelligence
              : playerState.totalManaRegen}
          </Text>
          {stat === Attribute.strength ? (
            <StrengthIcon
              height={uiStore.iconSizeLarge}
              width={uiStore.iconSizeLarge}
            />
          ) : stat === Attribute.dexterity ? (
            <DexterityIcon
              height={uiStore.iconSizeLarge}
              width={uiStore.iconSizeLarge}
            />
          ) : stat === Attribute.intelligence ? (
            <IntelligenceIcon
              height={uiStore.iconSizeLarge}
              width={uiStore.iconSizeLarge}
            />
          ) : (
            <Regen
              height={uiStore.iconSizeLarge}
              width={uiStore.iconSizeLarge}
            />
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
                      <SquareMinus
                        height={uiStore.iconSizeLarge}
                        width={uiStore.iconSizeLarge}
                      />
                    ) : (
                      <SquarePlus
                        height={uiStore.iconSizeLarge}
                        width={uiStore.iconSizeLarge}
                      />
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
        id: string;
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
          id: condition.id,
          icon: condition.getConditionIcon(),
          count: 1,
        });
      }
    });
    let simplifiedConditions = Array.from(simplifiedConditionsMap.values());

    return (
      <View style={[styles.rowAround, { marginLeft: tw_base[2] }]}>
        {simplifiedConditions.map((cond) => (
          <View
            key={cond.id}
            style={{
              backgroundColor: `${
                Colors[uiStore.colorScheme == "light" ? "dark" : "light"]
                  .background
              }60`,
              borderColor: Colors[uiStore.colorScheme].border,
              borderWidth: 1,
              borderRadius: 999,
              padding: 1,
              marginHorizontal: tw_base[1],
              marginVertical: "auto",
            }}
          >
            <Image
              source={cond.icon}
              style={{
                width: normalize(22),
                height: normalize(22),
              }}
              resizeMode="contain"
            />
          </View>
        ))}
      </View>
    );
  }
});

export const DetailedViewConditionRender = observer(() => {
  const { playerState, uiStore } = useRootStore();
  const styles = useStyles();

  if (playerState) {
    return (
      /*TODO: Fix sizing, cannot scroll to bottom*/
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
                    style={{
                      width: uiStore.iconSizeLarge,
                      height: uiStore.iconSizeLarge,
                    }}
                    resizeMode="contain"
                  />
                  <Text> {condition.turns} </Text>
                  <ClockIcon
                    width={uiStore.iconSizeSmall}
                    height={uiStore.iconSizeSmall}
                  />
                </View>
                {!!condition.getHealthDamage() && (
                  <View style={styles.rowCenter}>
                    <Text>{condition.getHealthDamage()}</Text>
                    <HealthIcon
                      height={uiStore.iconSizeSmall}
                      width={uiStore.iconSizeSmall}
                    />
                  </View>
                )}
                {!!condition.getSanityDamage() && (
                  <View style={styles.rowCenter}>
                    <Text>{condition.getSanityDamage()}</Text>
                    <View style={{ marginLeft: 4 }}>
                      <Sanity
                        height={uiStore.iconSizeSmall}
                        width={uiStore.iconSizeSmall}
                      />
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
        <Icon height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
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
    const sanityWarningAnimatedValue = useState(new Animated.Value(0))[0];
    const combinedWarningAnimatedValue = useState(new Animated.Value(0))[0];

    const [showingWarningPulse, setShowingWarningPulse] = useState<
      "health" | "sanity" | "both" | null
    >(null);

    const healthWarningInterpolation = healthWarningAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(180,30,30,0.1)", "rgba(180,30,30,0.35)"],
    });

    const healthDamageInterpolation = healthDamageFlash.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(180,30,30,0.4)"],
    });

    const sanityDamageInterpolation = sanityDamageFlash.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(107,33,168,0.4)"],
    });

    const sanityWarningInterpolation = sanityWarningAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(107,33,168,0.1)", "rgba(107,33,168,0.35)"],
    });

    const combinedFlashInterpolation = Animated.multiply(
      healthDamageFlash,
      sanityDamageFlash,
    ).interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(180,30,120,0.5)"],
      extrapolate: "clamp",
    });

    const combinedWarningInterpolation =
      combinedWarningAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["rgba(160,30,120,0.1)", "rgba(180,30,120,0.35)"],
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

    const healthOrSanityWarning = () => {
      switch (showingWarningPulse) {
        case "sanity":
          return sanityWarningInterpolation;
        case "health":
          return healthWarningInterpolation;
        case "both":
          return combinedWarningInterpolation;
      }
    };

    // ----------- Warning ------------- //
    useEffect(() => {
      if (showingWarningPulse) {
        startWarningAnimation();
      }
    }, [pathname, showingWarningPulse]);

    useEffect(() => {
      if (playerState) {
        if (
          playerState.currentHealth / playerState.maxHealth <=
            uiStore.healthWarning &&
          playerState.currentSanity <= 0
        ) {
          setShowingWarningPulse("both");
        } else if (
          playerState.currentHealth / playerState.maxHealth <=
          uiStore.healthWarning
        ) {
          setShowingWarningPulse("health");
        } else if (playerState.currentSanity <= 0) {
          setShowingWarningPulse("sanity");
        } else {
          setShowingWarningPulse(null);
        }
      }
    }, [
      playerState?.currentHealth,
      playerState?.currentSanity,
      playerState?.maxHealth,
      playerState?.maxSanity,
      uiStore.healthWarning,
      showingWarningPulse,
    ]);

    const startWarningAnimation = () => {
      switch (showingWarningPulse) {
        case "health":
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
          return;
        case "sanity":
          Animated.loop(
            Animated.sequence([
              Animated.timing(sanityWarningAnimatedValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(sanityWarningAnimatedValue, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            {
              iterations: -1,
            },
          ).start();
          return;
        case "both":
          Animated.loop(
            Animated.sequence([
              Animated.timing(combinedWarningAnimatedValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(combinedWarningAnimatedValue, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            {
              iterations: -1,
            },
          ).start();
          return;
      }
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
                backgroundColor: showingWarningPulse
                  ? healthOrSanityWarning()
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
                backgroundColor: showingWarningPulse
                  ? healthOrSanityWarning()
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
            paddingBottom: uiStore.insets?.bottom,
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
              backgroundColor: showingWarningPulse
                ? healthOrSanityWarning()
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
              backgroundColor: showingWarningPulse
                ? healthOrSanityWarning()
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
