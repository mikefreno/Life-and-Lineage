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
import { toTitleCase, damageReduction } from "../utility/functions/misc";
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
import { Condition } from "../classes/conditions";

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
      playerState?.currentHealth,
    );
    const [sanityRecord, setSanityRecord] = useState<number | undefined>(
      playerState?.currentSanity,
    );
    const [manaRecord, setManaRecord] = useState<number | undefined>(
      playerState?.currentMana,
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
      if (
        playerState &&
        healthRecord &&
        playerState.currentHealth != healthRecord
      ) {
        if (playerState?.currentHealth - healthRecord < 0) {
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
        setHealthDiff(playerState?.currentHealth - healthRecord);
        setShowingHealthChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setHealthDiff(0);
        setShowingHealthChange(false);
      }
      if (
        playerState &&
        sanityRecord &&
        playerState.currentSanity != sanityRecord
      ) {
        setSanityDiff(playerState?.currentSanity - sanityRecord);
        setShowingSanityChange(true);
        setAnimationCycler(animationCycler + 1);
      } else {
        setSanityDiff(0);
        setShowingSanityChange(false);
      }
      if (playerState && manaRecord && playerState.currentMana != manaRecord) {
        setManaDiff(playerState?.currentMana - manaRecord);
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

      setHealthRecord(playerState?.currentHealth);
      setSanityRecord(playerState?.currentSanity);
      setManaRecord(playerState?.currentMana);
      setGoldRecord(playerState?.gold);
    }, [
      playerState?.currentHealth,
      playerState?.currentSanity,
      playerState?.currentMana,
      playerState?.gold,
    ]);

    useEffect(() => {
      if (
        playerState &&
        gameState &&
        playerState.currentHealth / playerState.maxHealth <=
          gameState.healthWarning
      ) {
        if (!showingHealthWarningPulse) {
          setShowingHealthWarningPulse(true);
        }
      } else {
        if (showingHealthWarningPulse) {
          setShowingHealthWarningPulse(false);
        }
      }
    }, [playerState?.currentHealth, gameState?.healthWarning]);

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
                  <View className="flex-1 justify-around flex-row">
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
                      {condition.getHealthDamage() && (
                        <View className="flex flex-row items-center justify-center">
                          <Text>{condition.getHealthDamage()}</Text>
                          <HealthIcon height={16} width={16} />
                        </View>
                      )}
                      {condition.getSanityDamage() && (
                        <View className="flex flex-row items-center justify-center">
                          <Text>
                            {condition.getSanityDamage()}
                            <Sanity height={16} width={16} />
                          </Text>
                        </View>
                      )}
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
                    <Text className="text-xl tracking-wide opacity-80">
                      {toTitleCase(condition.style)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        );
      }
    }

    function changePopUp({
      popUp,
      diff,
    }: {
      popUp: "health" | "mana" | "sanity" | "gold";
      diff: number;
    }) {
      const marginAdjust = popUp == "gold" ? "-mt-3" : "ml-1";
      const color =
        popUp == "mana"
          ? "#60a5fa"
          : popUp == "health"
          ? "#f87171"
          : popUp == "sanity"
          ? "#c084fc"
          : "black";
      if (diff) {
        return (
          <View className={`absolute ${marginAdjust}`}>
            <FadeOutNode
              animationCycler={animationCycler}
              className="flex flex-row"
            >
              <Text className="pr-0.5" style={{ color: color }}>
                {diff > 0 ? "+" : ""}
                {diff.toString()}
              </Text>
              {popUp == "gold" && <Coins />}
            </FadeOutNode>
          </View>
        );
      }
    }

    function RenderPrimaryStatsBlock({
      stat,
    }: {
      stat: Attribute.health | Attribute.mana | Attribute.sanity;
    }) {
      if (playerState) {
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
              {playerState.unAllocatedSkillPoints > 0 && !respeccing && (
                <Pressable
                  className="px-0.5"
                  onPress={() => {
                    vibration({ style: "light" });
                    playerState.addSkillPoint({ to: stat });
                  }}
                >
                  {({ pressed }) => (
                    <View className={pressed ? "scale-95" : ""}>
                      <SquarePlus height={28} width={28} />
                    </View>
                  )}
                </Pressable>
              )}
              {playerState.allocatedSkillPoints[stat] > 0 && respeccing && (
                <Pressable
                  className="px-0.5"
                  onPress={() => {
                    vibration({ style: "light" });
                    playerState.removeSkillPoint({ from: stat });
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
        );
      }
    }

    function RenderSecondaryStatsBlock({
      stat,
    }: {
      stat: Attribute.strength | Attribute.dexterity | Attribute.intelligence;
    }) {
      if (playerState) {
        return (
          <View className="flex items-center">
            <Text className="py-1">{AttributeToString[stat]}</Text>
            <View className="flex flex-row items-center">
              <Text>
                {stat == Attribute.strength
                  ? playerState.totalStrength
                  : stat == Attribute.dexterity
                  ? playerState.totalDexterity
                  : playerState.totalIntelligence}
              </Text>
              {stat == Attribute.strength ? (
                <StrengthIcon height={20} width={23} />
              ) : stat == Attribute.dexterity ? (
                <DexterityIcon height={20} width={23} />
              ) : (
                <IntelligenceIcon height={20} width={23} />
              )}
              <View className="flex flex-row">
                {playerState.unAllocatedSkillPoints > 0 && !respeccing && (
                  <Pressable
                    className="px-0.5"
                    onPress={() => {
                      vibration({ style: "light" });
                      playerState.addSkillPoint({ to: stat });
                    }}
                  >
                    {({ pressed }) => (
                      <View className={pressed ? "scale-95" : ""}>
                        <SquarePlus height={28} width={28} />
                      </View>
                    )}
                  </Pressable>
                )}
                {playerState.allocatedSkillPoints[stat] > 0 && respeccing && (
                  <Pressable
                    className="px-0.5"
                    onPress={() => {
                      vibration({ style: "light" });
                      playerState.removeSkillPoint({
                        from: stat,
                      });
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
      const preprop = !isCompact
        ? home
          ? `${positioning} -mt-7 z-top w-full`
          : `${positioning} mt-3 z-top w-full`
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
                    {playerState.fullName}
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
              <RenderPrimaryStatsBlock stat={Attribute.health} />
              <RenderPrimaryStatsBlock stat={Attribute.mana} />
              <RenderPrimaryStatsBlock stat={Attribute.sanity} />
              <View className="flex flex-row justify-evenly">
                <RenderSecondaryStatsBlock stat={Attribute.strength} />
                <RenderSecondaryStatsBlock stat={Attribute.dexterity} />
                <RenderSecondaryStatsBlock stat={Attribute.intelligence} />
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
              setShowDetailedStatusView(true);
            }}
            className={filled}
          >
            {colorAndPlatformDependantBlur(
              <View className="flex px-2">
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
                    {showingHealthChange &&
                      changePopUp({ popUp: "health", diff: healthDiff })}

                    <Text className="mx-auto" style={{ color: "#ef4444" }}>
                      Health
                    </Text>
                    <ProgressBar
                      value={playerState.currentHealth}
                      maxValue={playerState.maxHealth}
                      filledColor="#ef4444"
                      unfilledColor="#fca5a5"
                    />
                  </View>
                  <View className="flex w-[31%]">
                    {showingManaChange &&
                      changePopUp({ popUp: "mana", diff: manaDiff })}
                    <Text className="mx-auto" style={{ color: "#60a5fa" }}>
                      Mana
                    </Text>
                    <ProgressBar
                      value={playerState.currentMana}
                      maxValue={playerState.maxMana}
                      filledColor="#60a5fa"
                      unfilledColor="#bfdbfe"
                    />
                  </View>
                  <View className="flex w-[31%]">
                    {showingSanityChange &&
                      changePopUp({ popUp: "sanity", diff: sanityDiff })}
                    <Text className="mx-auto" style={{ color: "#c084fc" }}>
                      Sanity
                    </Text>
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
                isCompact ? "ml-4" : "justify-center w-full mr-8"
              } flex flex-row absolute z-top`}
            >
              {showingGoldChange &&
                changePopUp({ popUp: "gold", diff: goldDiff })}
            </View>
          </Pressable>
        </>
      );
    }
  },
);
export default PlayerStatus;
