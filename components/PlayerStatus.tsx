import React from "react";
import ProgressBar from "./ProgressBar";
import {
  ScrollView,
  Animated,
  Image,
  Pressable,
  View,
  Platform,
  ViewStyle,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { toTitleCase, AccelerationCurves } from "../utility/functions/misc";
import GenericModal from "./GenericModal";
import GenericStrikeAround from "./GenericStrikeAround";
import FadeOutNode from "./FadeOutNode";
import { BlurView } from "expo-blur";
import { usePathname } from "expo-router";
import {
  ClockIcon,
  Coins,
  DexterityIcon,
  HealthIcon,
  IntelligenceIcon,
  RotateArrow,
  Sanity,
  SquareMinus,
  SquarePlus,
  StrengthIcon,
} from "../assets/icons/SVGIcons";
import { Attribute, AttributeToString, Modifier } from "../utility/types";
import { Text } from "./Themed";
import { useRootStore } from "../hooks/stores";
import {
  StatChange,
  StatType,
  useAcceleratedAction,
  useStatChanges,
  useVibration,
} from "../hooks/generic";
import { Condition } from "../entities/conditions";
import { PlayerCharacter } from "../entities/character";
import {
  DEFENSIVE_STATS,
  OFFENSIVE_STATS,
  getTotalValue,
  statMapping,
} from "../utility/functions/stats";
import { radius, tw_base, useStyles } from "../hooks/styles";
import Colors from "../constants/Colors";

export const EXPANDED_PAD = 16;

const StatDisplay = ({
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
        <Text style={{ ...styles.ml2, ...styles.bold }}>
          {getTotalValue(modifier, value)}
        </Text>
      </View>
      <Text
        style={{
          ...styles.textCenter,
          ...styles.xs,
          ...styles.mt1,
          color: theme.border,
        }}
      >
        {statInfo.description}
      </Text>
    </View>
  );
};

interface PlayerStatusProps {
  hideGold?: boolean;
  home?: boolean;
  tabScreen?: boolean;
  positioning?: string;
  style?: ViewStyle;
}
const PlayerStatus = observer(
  ({
    hideGold = false,
    home = false,
    tabScreen = false,
    positioning = "absolute",
    style,
  }: PlayerStatusProps) => {
    const { playerState, uiStore } = useRootStore();
    const styles = useStyles();
    const [showingHealthWarningPulse, setShowingHealthWarningPulse] =
      useState<boolean>(false);
    const healthWarningAnimatedValue = useState(new Animated.Value(0))[0];
    const [ownedOffensive, setOwnedOffensive] = useState<Map<Modifier, number>>(
      new Map(),
    );
    const [ownedDefensive, setOwnedDefensive] = useState<Map<Modifier, number>>(
      new Map(),
    );
    const [respeccing, setRespeccing] = useState<boolean>(false);

    const vibration = useVibration();

    const { statChanges, animationCycler, healthDamageFlash } = useStatChanges(
      playerState!,
    );
    const pathname = usePathname();

    const healthWarningInterpolation = healthWarningAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(205,20,20,0.6)", "rgba(127,29,29,0.2)"],
    });

    const healthDamageInterpolation = healthDamageFlash.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(180,30,30,0.4)"],
    });

    useEffect(() => {
      if (playerState?.getTotalAllocatedPoints() == 0) {
        setRespeccing(false);
      }
    }, [playerState?.unAllocatedSkillPoints]);

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

    const prevEquipmentRef = useRef<string>("");

    useEffect(() => {
      if (!playerState?.equipmentStats) return;

      const currentEquipment = JSON.stringify(
        Array.from(playerState.equipmentStats.entries()),
      );
      if (currentEquipment === prevEquipmentRef.current) return;

      prevEquipmentRef.current = currentEquipment;

      const offensive = new Map(
        Array.from(playerState.equipmentStats.entries()).filter(
          ([key, value]) => OFFENSIVE_STATS.includes(key) && value > 0,
        ),
      );

      const defensive = new Map(
        Array.from(playerState.equipmentStats.entries()).filter(
          ([key, value]) => DEFENSIVE_STATS.includes(key) && value > 0,
        ),
      );

      setOwnedOffensive(offensive);
      setOwnedDefensive(defensive);
    }, [playerState?.equipmentStats]);

    function conditionRenderer() {
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
            let existingCondition = simplifiedConditionsMap.get(
              condition.name,
            )!;
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
    }

    function detailedViewConditionRender() {
      if (playerState) {
        return (
          <View style={{ height: tw_base[64] }}>
            <ScrollView>
              {playerState.conditions.map((condition) => (
                <View key={condition.id} style={styles.detailedConditionCard}>
                  <View style={styles.rowEvenly}>
                    <Text
                      style={{ letterSpacing: 1, opacity: 0.8, ...styles.xl }}
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
                      style={{ letterSpacing: 1, opacity: 0.8, ...styles.xl }}
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
    }

    function colorAndPlatformDependantBlur(children: JSX.Element) {
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
                    : healthDamageInterpolation,
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
                    : healthDamageInterpolation,
                  paddingBottom: 4,
                  borderRadius: 12,
                }}
              >
                {children}
              </Animated.View>
            </View>
          );
        }
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
                  : healthDamageInterpolation,
              }}
            >
              {children}
            </Animated.View>
          </BlurView>
        );
      }
    }

    const StatCategory = ({
      category,
      stats,
    }: {
      category: "offensive" | "defensive";
      stats: Map<Modifier, number>;
    }) => {
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

            return (
              <StatDisplay key={modifier} modifier={modifier} value={value} />
            );
          })}
        </ScrollView>
      );
    };

    if (!playerState) {
      return null;
    }

    const positionStyle = !(uiStore.playerStatusIsCompact && home)
      ? ({
          position: positioning as "absolute" | "relative",
          marginTop: home ? -16 : 8,
          zIndex: 10,
          width: "100%",
        } as const)
      : ({
          position: positioning as "absolute" | "relative",
          zIndex: 10,
          width: "100%",
        } as const);

    const finalPosition = tabScreen
      ? { ...positionStyle, bottom: 0 }
      : style
      ? { ...positionStyle, ...style }
      : positionStyle;

    return (
      <>
        <GenericModal
          isVisibleCondition={uiStore.detailedStatusViewShowing}
          backFunction={() => uiStore.setDetailedStatusViewShowing(false)}
          size={95}
        >
          <View>
            <View
              style={{
                alignItems: "center",
                paddingVertical: 4,
                width: "100%",
                ...styles.rowBetween,
              }}
            >
              <View style={[styles.columnCenter, { flex: 1 }]}>
                <View style={{ marginLeft: -16, flexDirection: "row" }}>
                  <Text>{playerState.readableGold}</Text>
                  <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                </View>
              </View>
              <View style={[styles.columnCenter, { flex: 1 }]}>
                <Text style={[styles.xl, { textAlign: "center" }]}>
                  {playerState.fullName}
                </Text>
              </View>
              <View style={{ flex: 1 }} />
            </View>

            {playerState.unAllocatedSkillPoints > 0 && (
              <Text
                style={{ color: "#16a34a", textAlign: "center", ...styles.xl }}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
              >
                You have {playerState.unAllocatedSkillPoints} unallocated
                {"\n"}Skill Points!
              </Text>
            )}

            {playerState.getTotalAllocatedPoints() > 0 && (
              <View style={{ position: "absolute", right: 0, marginTop: -4 }}>
                <Pressable
                  disabled={playerState.root.dungeonStore.inCombat}
                  onPress={() => {
                    setRespeccing(!respeccing);
                    vibration({ style: "light", essential: true });
                  }}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.respecButton,
                        {
                          transform: [
                            { scale: pressed ? 0.9 : 1 },
                            { scaleX: respeccing ? -1 : 1 },
                          ],
                          backgroundColor: playerState.root.dungeonStore
                            .inCombat
                            ? "#9ca3af"
                            : respeccing
                            ? "#16a34a"
                            : "#dc2626",
                        },
                      ]}
                    >
                      <View style={{ marginVertical: "auto" }}>
                        <RotateArrow height={18} width={18} color={"white"} />
                      </View>
                    </View>
                  )}
                </Pressable>
              </View>
            )}

            <RenderPrimaryStatsBlock
              stat={Attribute.health}
              playerState={playerState}
              respeccing={respeccing}
              vibration={vibration}
            />
            <RenderPrimaryStatsBlock
              stat={Attribute.mana}
              playerState={playerState}
              respeccing={respeccing}
              vibration={vibration}
            />
            <RenderPrimaryStatsBlock
              stat={Attribute.sanity}
              playerState={playerState}
              respeccing={respeccing}
              vibration={vibration}
            />

            <View style={styles.rowEvenly}>
              <RenderSecondaryStatsBlock
                stat={Attribute.strength}
                playerState={playerState}
                respeccing={respeccing}
                vibration={vibration}
              />
              <RenderSecondaryStatsBlock
                stat={Attribute.dexterity}
                playerState={playerState}
                respeccing={respeccing}
                vibration={vibration}
              />
              <RenderSecondaryStatsBlock
                stat={Attribute.intelligence}
                playerState={playerState}
                respeccing={respeccing}
                vibration={vibration}
              />
            </View>

            {playerState.equipmentStats.size > 0 ? (
              <View style={{ paddingVertical: 4 }}>
                <GenericStrikeAround>Equipment Stats</GenericStrikeAround>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 8,
                    height: Math.min(
                      uiStore.dimensions.height * 0.3,
                      Math.max(ownedOffensive.size, ownedDefensive.size) * 70 +
                        30,
                    ),
                  }}
                >
                  <View style={[styles.equipmentStatsSection]}>
                    <Text
                      style={[
                        styles.bold,
                        { textAlign: "center", marginBottom: 4 },
                      ]}
                    >
                      Offensive
                    </Text>
                    <StatCategory
                      stats={ownedOffensive}
                      category={"offensive"}
                    />
                  </View>
                  <View style={[styles.equipmentStatsSection]}>
                    <Text
                      style={[
                        styles.bold,
                        { textAlign: "center", marginBottom: 4 },
                      ]}
                    >
                      Defensive
                    </Text>
                    <StatCategory
                      stats={ownedDefensive}
                      category={"defensive"}
                    />
                  </View>
                </View>
              </View>
            ) : null}

            {playerState.conditions.length > 0 ? (
              <View>
                <GenericStrikeAround>Conditions</GenericStrikeAround>
                {detailedViewConditionRender()}
              </View>
            ) : null}
          </View>
        </GenericModal>
        <Pressable
          onPress={() => {
            vibration({ style: "light" });
            uiStore.setDetailedStatusViewShowing(true);
          }}
          style={finalPosition}
        >
          {colorAndPlatformDependantBlur(
            <View style={styles.playerStatusContent}>
              {!(uiStore.playerStatusIsCompact && home) && (
                <View
                  style={{
                    height: 16,
                    paddingVertical: 2,
                    ...styles.rowCenter,
                  }}
                >
                  {!hideGold && (
                    <View
                      style={[styles.rowCenter, { marginVertical: "auto" }]}
                    >
                      <Text>{playerState.readableGold}</Text>
                      <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                    </View>
                  )}
                  {playerState.unAllocatedSkillPoints > 0 && (
                    <View
                      style={{ paddingHorizontal: 4, marginVertical: "auto" }}
                    >
                      <SquarePlus height={16} width={16} />
                    </View>
                  )}
                  <View>{conditionRenderer()}</View>
                </View>
              )}
              <View style={styles.statsRow}>
                <View
                  style={{
                    width: "31%",
                  }}
                >
                  <View style={styles.rowBetween}>
                    <Text style={{ paddingLeft: 4, color: "#ef4444" }}>
                      Health
                    </Text>
                    <ChangePopUp
                      popUp={"health"}
                      change={statChanges.health}
                      animationCycler={animationCycler}
                      colorScheme={uiStore.colorScheme}
                    />
                  </View>
                  <ProgressBar
                    value={playerState.currentHealth}
                    maxValue={playerState.maxHealth}
                    filledColor="#ef4444"
                    unfilledColor="#fca5a5"
                  />
                </View>
                <View
                  style={{
                    width: "31%",
                  }}
                >
                  <View style={styles.rowBetween}>
                    <Text style={{ paddingLeft: 4, color: "#60a5fa" }}>
                      Mana
                    </Text>
                    <ChangePopUp
                      popUp={"mana"}
                      change={statChanges.mana}
                      animationCycler={animationCycler}
                      colorScheme={uiStore.colorScheme}
                    />
                  </View>
                  <ProgressBar
                    value={playerState.currentMana}
                    maxValue={playerState.maxMana}
                    filledColor="#60a5fa"
                    unfilledColor="#bfdbfe"
                  />
                </View>
                <View
                  style={{
                    width: "31%",
                  }}
                >
                  <View style={styles.rowBetween}>
                    <Text style={{ paddingLeft: 4, color: "#c084fc" }}>
                      Sanity
                    </Text>
                    <ChangePopUp
                      popUp={"sanity"}
                      change={statChanges.sanity}
                      animationCycler={animationCycler}
                      colorScheme={uiStore.colorScheme}
                    />
                  </View>
                  <ProgressBar
                    value={playerState.currentSanity}
                    minValue={-playerState.maxSanity}
                    maxValue={playerState.maxSanity}
                    filledColor="#c084fc"
                    unfilledColor="#e9d5ff"
                  />
                </View>
              </View>
            </View>,
          )}
          <View
            style={{
              position: "absolute",
              zIndex: 10,
              ...styles.rowCenter,
              ...(uiStore.playerStatusIsCompact && home
                ? { marginLeft: 16 }
                : { width: "100%", marginRight: 32 }),
            }}
          >
            <ChangePopUp
              popUp={"gold"}
              change={statChanges.gold}
              animationCycler={animationCycler}
              colorScheme={uiStore.colorScheme}
            />
          </View>
        </Pressable>
      </>
    );
  },
);

export default PlayerStatus;

function RenderPrimaryStatsBlock({
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
}) {
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
}

function RenderSecondaryStatsBlock({
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
}) {
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
}
const ChangePopUp = ({
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

  return (
    <View
      style={[
        popUp === "gold" && { marginTop: -12 },
        { opacity: change.isShowing ? 1 : 0 },
      ]}
    >
      <FadeOutNode
        animationCycler={animationCycler}
        style={{ marginVertical: "auto", flexDirection: "row" }}
      >
        <Text style={{ paddingRight: 8, fontSize: 12, color }}>
          {change.current > 0 ? "+" : ""}
          {change.current}
          {change.cumulative !== change.current && (
            <>
              ({change.cumulative > 0 ? "+" : ""}
              {change.cumulative})
            </>
          )}
        </Text>
        {popUp === "gold" && <Coins height={14} width={14} />}
      </FadeOutNode>
    </View>
  );
};
