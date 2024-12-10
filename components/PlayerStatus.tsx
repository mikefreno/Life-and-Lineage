import ProgressBar from "./ProgressBar";
import {
  ScrollView,
  Animated,
  Image,
  Pressable,
  View,
  Platform,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  toTitleCase,
  damageReduction,
  AccelerationCurves,
} from "../utility/functions/misc";
import GenericModal from "./GenericModal";
import GenericStrikeAround from "./GenericStrikeAround";
import FadeOutNode from "./FadeOutNode";
import { BlurView } from "expo-blur";
import { useColorScheme } from "nativewind";
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
import { Attribute, AttributeToString } from "../utility/types";
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

export const EXPANDED_PAD = 16;

interface PlayerStatusProps {
  hideGold?: boolean;
  home?: boolean;
  tabScreen?: boolean;
  positioning?: string;
  classname?: string;
}
const PlayerStatus = observer(
  ({
    hideGold = false,
    home = false,
    tabScreen = false,
    positioning = "absolute",
    classname,
  }: PlayerStatusProps) => {
    const { playerState, uiStore } = useRootStore();
    const [showingHealthWarningPulse, setShowingHealthWarningPulse] =
      useState<boolean>(false);
    const healthWarningAnimatedValue = useState(new Animated.Value(0))[0];
    const [respeccing, setRespeccing] = useState<boolean>(false);

    const vibration = useVibration();
    const { colorScheme } = useColorScheme();

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
      if (
        playerState &&
        playerState.currentHealth / playerState.maxHealth <=
          uiStore.healthWarning
      ) {
        if (!showingHealthWarningPulse) {
          setShowingHealthWarningPulse(true);
        }
      } else {
        if (showingHealthWarningPulse) {
          setShowingHealthWarningPulse(false);
        }
      }
    }, [playerState?.currentHealth, uiStore.healthWarning]);

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
        let simplifiedConditions: {
          name: string;
          icon: any;
          count: number;
        }[] = Array.from(simplifiedConditionsMap.values());

        return (
          <View className="flex flex-row justify-around">
            {simplifiedConditions.map((cond) => (
              <View key={cond.name} className="mx-0.5 flex align-middle">
                <Image
                  source={cond.icon}
                  style={[
                    colorScheme == "dark" &&
                    ["blind", "stun"].includes(cond.name)
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
          <View className="max-h-64">
            <ScrollView>
              {playerState.conditions.map((condition) => (
                <View
                  key={condition.id}
                  className="my-1 border rounded-lg bg-zinc-200 py-2 dark:bg-zinc-600"
                >
                  <View className="flex justify-evenly flex-row">
                    <Text className="text-xl tracking-wide opacity-80">
                      {toTitleCase(condition.name)}
                    </Text>
                    <View className="flex items-center">
                      <View className="flex flex-row items-center py-1">
                        <Image
                          source={condition.getConditionIcon()}
                          style={{ width: 24, height: 24 }}
                          resizeMode="contain"
                        />
                        <Text> {condition.turns} </Text>
                        <ClockIcon width={16} height={16} />
                      </View>
                      {!!condition.getHealthDamage() && (
                        <View className="flex flex-row items-center justify-center">
                          <Text>{condition.getHealthDamage()}</Text>
                          <HealthIcon height={16} width={16} />
                        </View>
                      )}
                      {!!condition.getSanityDamage() && (
                        <View className="flex flex-row items-center justify-center">
                          <Text>{condition.getSanityDamage()}</Text>
                          <View style={{ marginLeft: 4 }}>
                            <Sanity height={16} width={16} />
                          </View>
                        </View>
                      )}
                    </View>
                    <Text className="text-xl tracking-wide opacity-80">
                      {toTitleCase(condition.style)}
                    </Text>
                  </View>
                  <View className="mx-auto">
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
        if (colorScheme == "dark" && Platform.OS == "ios") {
          return (
            <BlurView
              intensity={100}
              className="mx-4 rounded-xl z-top overflow-hidden "
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
            <View className="shadow-soft dark:shadow-soft-white mx-4 rounded-xl z-top  bg-zinc-50 dark:bg-zinc-800">
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
            intensity={Platform.OS == "ios" ? 100 : 0}
            className="shadow-soft dark:shadow-soft-white z-top overflow-hidden pb-6"
            style={{
              backgroundColor:
                Platform.OS != "ios"
                  ? colorScheme == "dark"
                    ? "#27272a"
                    : "#fafafa"
                  : "transparent",
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

    if (playerState) {
      const preprop = !(uiStore.playerStatusIsCompact && home)
        ? home
          ? `${positioning} -mt-4 z-top w-full`
          : `${positioning} mt-2 z-top w-full`
        : home
        ? `${positioning} z-top w-full`
        : `${positioning} mt-20 z-top w-full`;

      const filled = tabScreen
        ? preprop + " bottom-0"
        : classname
        ? preprop + " " + classname
        : preprop;
      return (
        <>
          <GenericModal
            isVisibleCondition={uiStore.detailedStatusViewShowing}
            backFunction={() => uiStore.setDetailedStatusViewShowing(false)}
            size={95}
          >
            <View>
              <View className="flex flex-row justify-between items-center py-1 w-full">
                <View className="flex-1 justify-end items-center">
                  <View className="flex flex-row -ml-4">
                    <Text>{playerState.readableGold}</Text>
                    <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                  </View>
                </View>
                <View className="flex-1 flex items-center">
                  <Text className="text-xl text-center">
                    {playerState.fullName}
                  </Text>
                </View>
                <View className="flex-1"></View>
              </View>
              {playerState.unAllocatedSkillPoints > 0 && (
                <Text
                  className="text-xl text-center"
                  style={{ color: "#16a34a" }}
                  numberOfLines={2}
                  adjustsFontSizeToFit={true}
                >
                  You have {playerState.unAllocatedSkillPoints} unallocated
                  {"\n"}Skill Points!
                </Text>
              )}
              {playerState.getTotalAllocatedPoints() > 0 && (
                <View className="absolute right-0 -mt-1">
                  <Pressable
                    disabled={playerState.root.dungeonStore.inCombat}
                    onPress={() => {
                      setRespeccing(!respeccing);
                      vibration({ style: "light", essential: true });
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${pressed && "scale-90"} ${
                          respeccing
                            ? playerState.root.dungeonStore.inCombat
                              ? "scale-x-[-1] bg-gray-400"
                              : "scale-x-[-1] bg-green-600"
                            : playerState.root.dungeonStore.inCombat
                            ? " bg-gray-400"
                            : "bg-red-600"
                        } h-[30] w-[30] items-center rounded-md`}
                      >
                        <View className="my-auto">
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
              <View className="flex flex-row justify-evenly">
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
              {(playerState.equipmentStats.armor > 0 ||
                playerState.equipmentStats.damage > 0 ||
                playerState.equipmentStats.health > 0 ||
                playerState.equipmentStats.regen > 0 ||
                playerState.equipmentStats.mana > 0 ||
                playerState.equipmentStats.blockChance > 0) && (
                <View className="py-1">
                  <GenericStrikeAround>Gear Stats</GenericStrikeAround>
                  {playerState.equipmentStats.damage > 0 && (
                    <Text className="text-center">
                      Attack Damage: {playerState.equipmentStats.damage}
                    </Text>
                  )}
                  {playerState.equipmentStats.armor > 0 && (
                    <>
                      <Text className="text-center">
                        Total Armor: {playerState.equipmentStats.armor}
                      </Text>
                      <Text className="text-center">
                        Physical Damage Reduction:{" "}
                        {(
                          damageReduction(playerState.equipmentStats.armor) *
                          100
                        ).toFixed(1)}
                        %
                      </Text>
                    </>
                  )}
                  {playerState.equipmentStats.blockChance > 0 && (
                    <Text className="text-center">
                      Chance to block:{" "}
                      {(playerState.equipmentStats.blockChance * 100).toFixed(
                        1,
                      )}
                      %
                    </Text>
                  )}
                  {playerState.equipmentStats.mana > 0 && (
                    <>
                      <Text className="text-center">
                        Mana: +{playerState.equipmentStats.mana}
                      </Text>
                    </>
                  )}
                  {playerState.equipmentStats.regen > 0 && (
                    <Text className="text-center">
                      Mana Regen: +{playerState.equipmentStats.regen}
                    </Text>
                  )}
                  {playerState.equipmentStats.health > 0 && (
                    <Text className="text-center">
                      Health: +{playerState.equipmentStats.health}
                    </Text>
                  )}
                </View>
              )}
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
            className={filled}
          >
            {colorAndPlatformDependantBlur(
              <View className="flex px-2">
                {!(uiStore.playerStatusIsCompact && home) && (
                  <View className="flex py-0.5 h-4 flex-row justify-center">
                    {!hideGold && (
                      <View className="flex flex-row my-auto">
                        <Text>{playerState.readableGold}</Text>
                        <Coins
                          width={16}
                          height={16}
                          style={{ marginLeft: 6 }}
                        />
                      </View>
                    )}
                    {playerState.unAllocatedSkillPoints > 0 && (
                      <View className="px-1 my-auto">
                        <SquarePlus height={16} width={16} />
                      </View>
                    )}
                    <View>{conditionRenderer()}</View>
                  </View>
                )}
                <View className="flex flex-row justify-evenly py-1">
                  <View className="flex w-[31%]">
                    <View className="flex flex-row justify-between">
                      <Text className="pl-1" style={{ color: "#ef4444" }}>
                        Health
                      </Text>
                      <ChangePopUp
                        popUp={"health"}
                        change={statChanges.health}
                        animationCycler={animationCycler}
                        colorScheme={colorScheme}
                      />
                    </View>
                    <ProgressBar
                      value={playerState.currentHealth}
                      maxValue={playerState.maxHealth}
                      filledColor="#ef4444"
                      unfilledColor="#fca5a5"
                    />
                  </View>
                  <View className="flex w-[31%]">
                    <View className="flex flex-row justify-between">
                      <Text className="pl-1" style={{ color: "#60a5fa" }}>
                        Mana
                      </Text>
                      <ChangePopUp
                        popUp={"mana"}
                        change={statChanges.mana}
                        animationCycler={animationCycler}
                        colorScheme={colorScheme}
                      />
                    </View>
                    <ProgressBar
                      value={playerState.currentMana}
                      maxValue={playerState.maxMana}
                      filledColor="#60a5fa"
                      unfilledColor="#bfdbfe"
                    />
                  </View>
                  <View className="flex w-[31%]">
                    <View className="flex flex-row justify-between">
                      <Text className="pl-1" style={{ color: "#c084fc" }}>
                        Sanity
                      </Text>
                      <ChangePopUp
                        popUp={"sanity"}
                        change={statChanges.sanity}
                        animationCycler={animationCycler}
                        colorScheme={colorScheme}
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
              className={`${
                uiStore.playerStatusIsCompact && home
                  ? "ml-4"
                  : "justify-center w-full mr-8"
              } flex flex-row absolute z-top`}
            >
              <ChangePopUp
                popUp={"gold"}
                change={statChanges.gold}
                animationCycler={animationCycler}
                colorScheme={colorScheme}
              />
            </View>
          </Pressable>
        </>
      );
    }
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
    <View className="items-center">
      <Text className="py-1" style={{ color: filledColor }}>
        {AttributeToString[stat]}
      </Text>
      <View className="flex w-full flex-row items-center">
        <View className="flex-1">
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
            className="px-0.5"
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={!shouldShow}
          >
            {({ pressed }) => (
              <View className={pressed ? "scale-95" : ""}>
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
    <View className="flex items-center">
      <Text className="py-1">{AttributeToString[stat]}</Text>
      <View className="flex flex-row items-center">
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
          <View className="flex flex-row">
            <Pressable
              className="px-0.5"
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={!shouldShow}
            >
              {({ pressed }) => (
                <View className={pressed ? "scale-95" : ""}>
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
  const marginAdjust = popUp === "gold" ? "-mt-3" : "";
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
    <View className={`${change.isShowing ? "" : "opacity-0"} ${marginAdjust}`}>
      <FadeOutNode
        animationCycler={animationCycler}
        className="flex flex-row my-auto"
      >
        <Text className="pr-2 text-xs" style={{ color }}>
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
