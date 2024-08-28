import ProgressBar from "./ProgressBar";
import { Text } from "./Themed";
import {
  ScrollView,
  Animated,
  Image,
  Pressable,
  View,
  Platform,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { toTitleCase } from "../utility/functions/misc/words";
import GenericModal from "./GenericModal";
import GenericStrikeAround from "./GenericStrikeAround";
import { useVibration } from "../utility/customHooks";
import FadeOutNode from "./FadeOutNode";
import { BlurView } from "expo-blur";
import { useColorScheme } from "nativewind";
import { usePathname } from "expo-router";
import { AppContext } from "../app/_layout";
import { useIsFocused } from "@react-navigation/native";
import {
  ClockIcon,
  Coins,
  Energy,
  HealthIcon,
  RotateArrow,
  Sanity,
  SquareMinus,
  SquarePlus,
} from "../assets/icons/SVGIcons";

interface PlayerStatus {
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
  }: PlayerStatus) => {
    const appData = useContext(AppContext);
    if (!appData) throw new Error("missing context");
    const {
      playerState,
      gameState,
      isCompact,
      setIsCompact,
      showDetailedStatusView,
      setShowDetailedStatusView,
    } = appData;
    const [readableGold, setReadableGold] = useState(
      playerState?.getReadableGold(),
    );
    const [healthRecord, setHealthRecord] = useState<number | undefined>(
      playerState?.health,
    );
    const [sanityRecord, setSanityRecord] = useState<number | undefined>(
      playerState?.sanity,
    );
    const [manaRecord, setManaRecord] = useState<number | undefined>(
      playerState?.mana,
    );
    const [goldRecord, setGoldRecord] = useState<number | undefined>(
      playerState?.gold,
    );
    const [healthDiff, setHealthDiff] = useState<number>(0);
    const [sanityDiff, setSanityDiff] = useState<number>(0);
    const [manaDiff, setManaDiff] = useState<number>(0);
    const [goldDiff, setGoldDiff] = useState<number>(0);
    const [showingHealthChange, setShowingHealthChange] =
      useState<boolean>(false);
    const [showingSanityChange, setShowingSanityChange] =
      useState<boolean>(false);
    const [showingManaChange, setShowingManaChange] = useState<boolean>(false);
    const [showingGoldChange, setShowingGoldChange] = useState<boolean>(false);
    const [animationCycler, setAnimationCycler] = useState<number>(0);
    const [showingHealthWarningPulse, setShowingHealthWarningPulse] =
      useState<boolean>(false);
    const healthDamageFlash = useState(new Animated.Value(0))[0];
    const healthWarningAnimatedValue = useState(new Animated.Value(0))[0];
    const [localHealthMax, setLocalHealthMax] = useState<number | undefined>(
      playerState?.getMaxHealth(),
    );
    const [localManaMax, setLocalManaMax] = useState<number | undefined>(
      playerState?.getMaxMana(),
    );
    const [localSanityMax, setLocalSanityMax] = useState<number | undefined>(
      playerState?.getMaxSanity(),
    );
    const [respeccing, setRespeccing] = useState<boolean>(false);

    const vibration = useVibration();
    const { colorScheme } = useColorScheme();

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
      setLocalHealthMax(playerState?.getMaxHealth());
      setLocalManaMax(playerState?.getMaxMana());
      setLocalSanityMax(playerState?.getMaxSanity());
    }, [
      playerState?.equipment.body,
      playerState?.equipment.head,
      playerState?.equipment.mainHand,
      playerState?.equipment.offHand,
      playerState?.healthMax,
      playerState?.manaMax,
      playerState?.sanityMax,
    ]);

    const isFocused = useIsFocused();

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
      if (playerState && isFocused) {
        if (
          playerState.conditions.length > 0 ||
          !hideGold ||
          playerState.unAllocatedSkillPoints > 0
        ) {
          if (isCompact) {
            setIsCompact(false);
          }
        } else if (!isCompact) {
          setIsCompact(true);
        }
      }
    }, [
      playerState?.conditions,
      playerState?.unAllocatedSkillPoints,
      pathname,
    ]);

    useEffect(() => {
      if (playerState && healthRecord && playerState.health != healthRecord) {
        if (playerState?.health - healthRecord < 0) {
          Animated.sequence([
            Animated.timing(healthDamageFlash, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.timing(healthDamageFlash, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
        setHealthDiff(playerState?.health - healthRecord);
        setShowingHealthChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setHealthDiff(0);
        setShowingHealthChange(false);
      }
      if (playerState && sanityRecord && playerState.sanity != sanityRecord) {
        setSanityDiff(playerState?.sanity - sanityRecord);
        setShowingSanityChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setSanityDiff(0);
        setShowingSanityChange(false);
      }
      if (playerState && manaRecord && playerState.mana != manaRecord) {
        setManaDiff(playerState?.mana - manaRecord);
        setShowingManaChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setManaDiff(0);
        setShowingManaChange(false);
      }
      if (playerState && goldRecord && playerState.gold != manaRecord) {
        setGoldDiff(playerState?.gold - goldRecord);
        setShowingGoldChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setGoldDiff(0);
        setShowingGoldChange(false);
      }

      setHealthRecord(playerState?.health);
      setSanityRecord(playerState?.sanity);
      setManaRecord(playerState?.mana);
      setGoldRecord(playerState?.gold);
    }, [
      playerState?.health,
      playerState?.sanity,
      playerState?.mana,
      playerState?.gold,
    ]);

    useEffect(() => {
      if (
        playerState &&
        gameState &&
        playerState.health / playerState.healthMax <= gameState.healthWarning
      ) {
        if (!showingHealthWarningPulse) {
          setShowingHealthWarningPulse(true);
        }
      } else {
        if (showingHealthWarningPulse) {
          setShowingHealthWarningPulse(false);
        }
      }
    }, [playerState?.health, gameState?.healthWarning]);

    useEffect(() => {
      setReadableGold(playerState?.getReadableGold());
    }, [playerState?.gold]);

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
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </View>
        );
      }
    }

    function detailedViewConditionRender() {
      const effectListTypes = [
        "accuracy reduction",
        "accuracy increase",
        "sanityMax increase",
        "sanityMax decrease",
        "healthMax increase",
        "healthMax decrease",
        "manaMax increase",
        "manaMax decrease",
        "armor increase",
        "armor decrease",
        "weaken",
        "strengthen",
      ];
      if (playerState) {
        return (
          <View className="max-h-52">
            <ScrollView>
              {playerState.conditions.map((condition) => (
                <View
                  key={condition.id}
                  className="my-1 rounded-lg bg-zinc-200 px-4 py-2 dark:bg-zinc-600"
                >
                  <View className="mb-1 flex flex-row items-center justify-center">
                    <Image
                      source={condition.getConditionIcon()}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                    <View className="flex flex-row items-center">
                      <Text> {condition.turns} </Text>
                      <ClockIcon width={18} height={18} />
                    </View>
                  </View>
                  <View className="flex flex-row flex-wrap justify-center">
                    <Text>{toTitleCase(condition.name)}:</Text>
                    {condition.getHealthDamage() && (
                      <View className="flex flex-row items-center">
                        <Text> dealing {condition.getHealthDamage()} </Text>
                        <HealthIcon height={14} width={14} />
                        <Text> damage</Text>
                      </View>
                    )}
                    {condition.getHealthDamage() &&
                      condition.getHealthDamage()! < 0 &&
                      condition.effect.includes("heal") && (
                        <View className="flex flex-row items-center">
                          <Text>
                            {condition.getHealthDamage() && "and"} healing{" "}
                            {condition.effectMagnitude}{" "}
                          </Text>
                          <HealthIcon height={14} width={14} />
                          <Text> health</Text>
                        </View>
                      )}
                    {condition.sanityDamage && (
                      <View className="flex flex-row items-center">
                        <Text>
                          {(condition.getHealthDamage() ||
                            condition.effect.includes("heal")) &&
                            "and"}{" "}
                          dealing {condition.getSanityDamage()}
                        </Text>
                        <Sanity height={14} width={14} />
                        <Text> damage</Text>
                      </View>
                    )}
                    {condition.effect.includes("mana drain") && (
                      <View className="flex flex-row items-center">
                        <Text>
                          {(condition.getHealthDamage() ||
                            condition.getSanityDamage() ||
                            condition.effect.includes("heal")) &&
                            "and "}
                          draining {condition.effectMagnitude}
                        </Text>
                        <Energy width={14} height={14} />
                      </View>
                    )}
                    {condition.effect.includes("mana regen") && (
                      <View className="flex flex-row items-center">
                        <Text>
                          {(condition.getHealthDamage() ||
                            condition.getSanityDamage() ||
                            condition.effect.includes("heal") ||
                            condition.effect.includes("mana drain")) &&
                            "and "}
                          restoring {condition.effectMagnitude}
                        </Text>
                        <Energy width={14} height={14} />
                      </View>
                    )}
                    {condition.effect.includes("stun") && (
                      <View className="flex flex-row items-center">
                        <Text>
                          {(condition.getHealthDamage() ||
                            condition.getSanityDamage() ||
                            condition.effect.includes("heal") ||
                            condition.effect.includes("mana regen") ||
                            condition.effect.includes("mana drain")) &&
                            "and "}
                          stuns
                        </Text>
                      </View>
                    )}
                    {condition.effect.includes("blood magic consumable") && (
                      <View className="flex flex-row items-center">
                        <Text>Expended by powerful blood magic</Text>
                      </View>
                    )}
                    {Array.isArray(condition.effect)
                      ? condition.effect.map((effect) => {
                          if (effectListTypes.includes(effect)) {
                            return (
                              <View
                                key={condition.id}
                                className="flex flex-row items-center"
                              >
                                <Text> {toTitleCase(effect)}</Text>
                                <Text>
                                  {` of `}
                                  {condition.effectStyle == "flat"
                                    ? condition.effectMagnitude
                                    : condition.effectStyle == "multiplier"
                                    ? condition.effectMagnitude * 100 + "%"
                                    : ""}
                                </Text>
                              </View>
                            );
                          }
                        })
                      : condition.effectMagnitude && (
                          <View
                            key={condition.id}
                            className="flex flex-row items-center"
                          >
                            <Text> {toTitleCase(condition.effect)}</Text>
                            <Text>
                              {` of `}
                              {condition.effectStyle == "flat"
                                ? condition.effectMagnitude
                                : condition.effectMagnitude
                                ? condition.effectMagnitude * 100 + "%"
                                : ""}
                            </Text>
                          </View>
                        )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );
      }
    }

    function healthChangePopUp() {
      if (healthDiff != 0) {
        return (
          <View className="absolute ml-1">
            <FadeOutNode animationCycler={animationCycler}>
              <Text style={{ color: "#f87171" }}>
                {healthDiff > 0 ? "+" : ""}
                {healthDiff.toString()}
              </Text>
            </FadeOutNode>
          </View>
        );
      }
    }
    function sanityChangePopUp() {
      if (sanityDiff != 0) {
        return (
          <View className="absolute ml-1">
            <FadeOutNode animationCycler={animationCycler}>
              <Text style={{ color: "#c084fc" }}>
                {sanityDiff > 0 ? "+" : ""}
                {sanityDiff.toString()}
              </Text>
            </FadeOutNode>
          </View>
        );
      }
    }
    function manaChangePopUp() {
      if (manaDiff != 0) {
        return (
          <View className="absolute ml-1">
            <FadeOutNode animationCycler={animationCycler}>
              <Text style={{ color: "#60a5fa" }}>
                {manaDiff > 0 ? "+" : ""}
                {manaDiff.toString()}
              </Text>
            </FadeOutNode>
          </View>
        );
      }
    }
    function goldChangePopUp() {
      if (goldDiff != 0) {
        return (
          <View className="absolute -mt-3">
            <FadeOutNode
              animationCycler={animationCycler}
              className="flex flex-row"
            >
              <Text className="pr-0.5">
                {goldDiff > 0 ? "+" : ""}
                {goldDiff.toString()}
              </Text>
              <Coins />
            </FadeOutNode>
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
              className="shadow-soft dark:shadow-soft-white mx-4 rounded-xl z-top overflow-hidden"
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
      const preprop = !isCompact
        ? home
          ? `${positioning} -mt-7 z-top w-full`
          : `${positioning} mt-3 z-top w-full`
        : home
        ? `${positioning} z-top w-full`
        : `${positioning} mt-20 z-top w-full`;

      const filled = tabScreen
        ? preprop + " bottom-0 -mb-4"
        : classname
        ? preprop + " " + classname
        : preprop;
      return (
        <>
          <GenericModal
            isVisibleCondition={showDetailedStatusView}
            backFunction={() => setShowDetailedStatusView(false)}
          >
            <View>
              <View className="flex flex-row justify-between items-center py-1 w-full">
                <View className="flex-1 justify-end items-center">
                  <View className="flex flex-row -ml-4">
                    <Text>{readableGold}</Text>
                    <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                  </View>
                </View>
                <View className="flex-1 flex items-center">
                  <Text className="text-xl text-center">
                    {playerState.getFullName()}
                  </Text>
                </View>
                <View className="flex-1">
                  {/* This empty View takes up space on the right*/}
                </View>
              </View>
              {playerState.unAllocatedSkillPoints > 0 && (
                <Text
                  className="text-center text-xl"
                  style={{ color: "#16a34a" }}
                >
                  You have {playerState.unAllocatedSkillPoints} unallocated
                  Skill Points!
                </Text>
              )}
              {playerState.getTotalAllocatedPoints() > 0 && (
                <View className="absolute right-0 -mt-1">
                  <Pressable
                    onPress={() => {
                      setRespeccing(!respeccing);
                      vibration({ style: "light", essential: true });
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className={`${pressed && "scale-90"} ${
                          respeccing
                            ? "scale-x-[-1] bg-green-600"
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
              <View className="items-center">
                <Text className="pb-1" style={{ color: "#ef4444" }}>
                  Health
                </Text>
                <View className="flex w-full flex-row items-center">
                  <View className="flex-1">
                    <ProgressBar
                      value={playerState.health}
                      maxValue={localHealthMax ?? playerState.getMaxHealth()}
                      filledColor="#ef4444"
                      unfilledColor="#fca5a5"
                      showMax
                    />
                  </View>
                  {playerState.unAllocatedSkillPoints > 0 && !respeccing && (
                    <Pressable
                      className="px-0.5"
                      onPress={() => {
                        vibration({ style: "light" });
                        playerState.spendSkillPointOnHealth();
                      }}
                    >
                      {({ pressed }) => (
                        <View className={`${pressed && "scale-95"}`}>
                          <SquarePlus height={28} width={28} />
                        </View>
                      )}
                    </Pressable>
                  )}
                  {playerState.allocatedSkillPoints.health > 0 &&
                    respeccing && (
                      <Pressable
                        className="px-0.5"
                        onPress={() => {
                          vibration({ style: "light" });
                          playerState.refundSkillPointOnHealth();
                        }}
                      >
                        {({ pressed }) => (
                          <View className={pressed ? "scale-95" : ""}>
                            <SquareMinus height={28} width={28} />
                          </View>
                        )}
                      </Pressable>
                    )}
                </View>
              </View>
              <View className="items-center">
                <Text className="py-1" style={{ color: "#60a5fa" }}>
                  Mana
                </Text>
                <View className="flex w-full flex-row items-center">
                  <View className="flex-1">
                    <ProgressBar
                      value={playerState.mana}
                      maxValue={localManaMax ?? playerState.getMaxMana()}
                      filledColor="#60a5fa"
                      unfilledColor="#bfdbfe"
                      showMax
                    />
                  </View>
                  {playerState.unAllocatedSkillPoints > 0 && !respeccing && (
                    <Pressable
                      className="px-0.5"
                      onPress={() => {
                        vibration({ style: "light" });
                        playerState.spendSkillPointOnMana();
                      }}
                    >
                      {({ pressed }) => (
                        <View className={pressed ? "scale-95" : ""}>
                          <SquarePlus height={28} width={28} />
                        </View>
                      )}
                    </Pressable>
                  )}
                  {playerState.allocatedSkillPoints.mana > 0 && respeccing && (
                    <Pressable
                      className="px-0.5"
                      onPress={() => {
                        vibration({ style: "light" });
                        playerState.refundSkillPointOnMana();
                      }}
                    >
                      {({ pressed }) => (
                        <View className={pressed ? "scale-95" : ""}>
                          <SquareMinus height={28} width={28} />
                        </View>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
              <View className="items-center">
                <Text className="py-1" style={{ color: "#c084fc" }}>
                  Sanity
                </Text>
                <View className="flex w-full flex-row items-center">
                  <View className="flex-1">
                    <ProgressBar
                      value={playerState.sanity}
                      minValue={-50}
                      maxValue={localSanityMax ?? playerState.getMaxSanity()}
                      filledColor="#c084fc"
                      unfilledColor="#e9d5ff"
                      showMax
                    />
                  </View>
                  {playerState.unAllocatedSkillPoints > 0 && !respeccing && (
                    <Pressable
                      className="px-0.5"
                      onPress={() => {
                        vibration({ style: "light" });
                        playerState.spendSkillPointOnSanity();
                      }}
                    >
                      {({ pressed }) => (
                        <View className={pressed ? "scale-95" : ""}>
                          <SquarePlus height={28} width={28} />
                        </View>
                      )}
                    </Pressable>
                  )}
                  {playerState.allocatedSkillPoints.sanity > 0 &&
                    respeccing && (
                      <Pressable
                        className="px-0.5"
                        onPress={() => {
                          vibration({ style: "light" });
                          playerState.refundSkillPointOnSanity();
                        }}
                      >
                        {({ pressed }) => (
                          <View className={pressed ? "scale-95" : ""}>
                            <SquareMinus height={28} width={28} />
                          </View>
                        )}
                      </Pressable>
                    )}
                </View>
              </View>
              {playerState.conditions.length > 0 ? (
                <View>
                  <GenericStrikeAround>Conditions</GenericStrikeAround>
                  {detailedViewConditionRender()}
                </View>
              ) : null}
            </View>
          </GenericModal>
          <Pressable
            onPress={() => setShowDetailedStatusView(true)}
            className={filled}
          >
            {colorAndPlatformDependantBlur(
              <View className={home ? "flex px-2" : "flex"}>
                {!isCompact && (
                  <View className="flex h-7 flex-row justify-center">
                    {!hideGold && (
                      <View className="flex flex-row my-auto">
                        <Text>{readableGold}</Text>
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
                    {showingHealthChange && healthChangePopUp()}
                    <Text className="mx-auto" style={{ color: "#ef4444" }}>
                      Health
                    </Text>
                    <ProgressBar
                      value={playerState.health}
                      maxValue={localHealthMax ?? playerState.getMaxHealth()}
                      filledColor="#ef4444"
                      unfilledColor="#fca5a5"
                    />
                  </View>
                  <View className="flex w-[31%]">
                    {showingManaChange && manaChangePopUp()}
                    <Text className="mx-auto" style={{ color: "#60a5fa" }}>
                      Mana
                    </Text>
                    <ProgressBar
                      value={playerState.mana}
                      maxValue={localManaMax ?? playerState.getMaxMana()}
                      filledColor="#60a5fa"
                      unfilledColor="#bfdbfe"
                    />
                  </View>
                  <View className="flex w-[31%]">
                    {showingSanityChange && sanityChangePopUp()}
                    <Text className="mx-auto" style={{ color: "#c084fc" }}>
                      Sanity
                    </Text>
                    <ProgressBar
                      value={playerState.sanity}
                      minValue={-50}
                      maxValue={localSanityMax ?? playerState.getMaxSanity()}
                      filledColor="#c084fc"
                      unfilledColor="#e9d5ff"
                    />
                  </View>
                </View>
              </View>,
            )}
            <View
              className={`${
                isCompact ? "ml-4" : "justify-center w-full mr-8"
              } flex flex-row absolute z-top`}
            >
              {showingGoldChange && goldChangePopUp()}
            </View>
          </Pressable>
        </>
      );
    }
  },
);
export default PlayerStatus;
