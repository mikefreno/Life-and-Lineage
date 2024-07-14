import ProgressBar from "./ProgressBar";
import { Text } from "./Themed";
import { ScrollView, Animated, Image, Pressable, View } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import { useContext, useEffect, useRef, useState } from "react";
import {
  GameContext,
  PlayerCharacterContext,
  PlayerStatusCompactContext,
  PlayerStatusContext,
} from "../app/_layout";
import { observer } from "mobx-react-lite";
import { toTitleCase } from "../utility/functions/misc/words";
import FadeOutText from "./FadeOutText";
import GenericModal from "./GenericModal";
import GenericStrikeAround from "./GenericStrikeAround";
import ClockIcon from "../assets/icons/ClockIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import Sanity from "../assets/icons/SanityIcon";
import Energy from "../assets/icons/EnergyIcon";
import SquarePlus from "../assets/icons/SquarePlus";
import { useVibration } from "../utility/customHooks";
import SquareMinus from "../assets/icons/SquareMinus";
import RotateArrow from "../assets/icons/RotateArrow";
import FadeOutNode from "./FadeOutNode";

interface PlayerStatus {
  hideGold?: boolean;
  home?: boolean;
}
const PlayerStatus = observer(
  ({ hideGold = false, home = false }: PlayerStatus) => {
    const playerCharacterData = useContext(PlayerCharacterContext);
    const gameData = useContext(GameContext);
    const playerStatusRefContext = useContext(PlayerStatusContext);
    const playerStatusCompact = useContext(PlayerStatusCompactContext);
    if (
      !playerCharacterData ||
      !gameData ||
      !playerStatusRefContext ||
      !playerStatusCompact
    )
      throw new Error("missing context");
    const { playerState } = playerCharacterData;
    const { gameState } = gameData;
    const { setPlayerStatusRef } = playerStatusRefContext;
    const { isCompact, setIsCompact } = playerStatusCompact;
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
    const animatedValue = useState(new Animated.Value(0))[0];
    const [localHealthMax, setLocalHealthMax] = useState<number | undefined>(
      playerState?.getMaxHealth(),
    );
    const [localManaMax, setLocalManaMax] = useState<number | undefined>(
      playerState?.getMaxMana(),
    );
    const [localSanityMax, setLocalSanityMax] = useState<number | undefined>(
      playerState?.getMaxSanity(),
    );
    const [showDetailedView, setShowDetailedView] = useState<boolean>(false);
    const [respeccing, setRespeccing] = useState<boolean>(false);

    const vibration = useVibration();

    const pressableRef = useRef<View>(null);

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

    useEffect(() => {
      if (playerState?.getTotalAllocatedPoints() == 0) {
        setRespeccing(false);
      }
    }, [playerState?.unAllocatedSkillPoints]);

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
        {
          iterations: -1,
        },
      ).start();
    }, []);

    useEffect(() => {
      if (playerState) {
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
      hideGold,
      playerState?.conditions,
      playerState?.unAllocatedSkillPoints,
    ]);

    const backgroundColorInterpolation = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["rgba(205,20,20,0.6)", "rgba(127,29,29,0.2)"],
    });

    useEffect(() => {
      (playerState &&
        gameState &&
        playerState.health / playerState.healthMax <=
          gameState.healthWarning) ??
      0.2
        ? setShowingHealthWarningPulse(true)
        : setShowingHealthWarningPulse(false);
    }, [playerState?.health, gameState?.healthWarning]);

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
      setReadableGold(playerState?.getReadableGold());
    }, [playerState?.gold]);

    useEffect(() => {
      if (pressableRef) {
        setPlayerStatusRef(pressableRef);
      }
    }, [pressableRef]);

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
              <View key={cond.name} className="mx-2 flex align-middle">
                <Image
                  source={cond.icon}
                  style={{ maxHeight: 26, maxWidth: 32 }}
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
                      style={{ maxWidth: 32, height: 24 }}
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
                        <Text> dealing {condition.healthDamage} </Text>
                        <HealthIcon height={14} width={14} />
                        <Text> damage</Text>
                      </View>
                    )}
                    {condition.getHealthDamage() &&
                      condition.getHealthDamage()! < 0 &&
                      condition.effect.includes("heal") && (
                        <View className="flex flex-row items-center">
                          <Text>
                            {condition.healthDamage && "and"} healing{" "}
                            {condition.effectMagnitude}{" "}
                          </Text>
                          <HealthIcon height={14} width={14} />
                          <Text> health</Text>
                        </View>
                      )}
                    {condition.sanityDamage && (
                      <View className="flex flex-row items-center">
                        <Text>
                          {(condition.healthDamage ||
                            condition.effect.includes("heal")) &&
                            "and"}{" "}
                          dealing {condition.sanityDamage}
                        </Text>
                        <Sanity height={14} width={14} />
                        <Text> damage</Text>
                      </View>
                    )}
                    {condition.effect.includes("mana drain") && (
                      <View className="flex flex-row items-center">
                        <Text>
                          {(condition.healthDamage ||
                            condition.sanityDamage ||
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
                          {(condition.healthDamage ||
                            condition.sanityDamage ||
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
                          {(condition.healthDamage ||
                            condition.sanityDamage ||
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
          <View className="absolute ml-2">
            <FadeOutText
              className={"text-red-400"}
              text={`${healthDiff > 0 ? "+" : ""}${healthDiff.toString()}`}
              animationCycler={animationCycler}
            />
          </View>
        );
      }
    }
    function sanityChangePopUp() {
      if (sanityDiff != 0) {
        return (
          <View className="absolute ml-2">
            <FadeOutText
              className={"text-purple-400"}
              text={`${sanityDiff > 0 ? "+" : ""}${sanityDiff.toString()}`}
              animationCycler={animationCycler}
            />
          </View>
        );
      }
    }
    function manaChangePopUp() {
      if (manaDiff != 0) {
        return (
          <View className="absolute ml-2">
            <FadeOutText
              className={"text-blue-400"}
              text={`${manaDiff > 0 ? "+" : ""}${manaDiff.toString()}`}
              animationCycler={animationCycler}
            />
          </View>
        );
      }
    }
    function goldChangePopUp() {
      if (goldDiff != 0) {
        return (
          <View className="absolute -mt-3">
            <FadeOutNode
              className={"text-zinc-900 dark:text-zinc-50 flex flex-row"}
              animationCycler={animationCycler}
            >
              <Text>{`${goldDiff > 0 ? "+" : ""}${goldDiff.toString()}`}</Text>
              <Coins />
            </FadeOutNode>
          </View>
        );
      }
    }

    if (playerState) {
      return (
        <>
          <GenericModal
            isVisibleCondition={showDetailedView}
            backFunction={() => setShowDetailedView(false)}
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
                  <Text className="text-xl">{playerState.getFullName()}</Text>
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
                  <GenericStrikeAround text={"Conditions"} />
                  {detailedViewConditionRender()}
                </View>
              ) : null}
            </View>
          </GenericModal>
          <Pressable
            ref={pressableRef}
            onPress={() => setShowDetailedView(true)}
            className={
              !isCompact
                ? home
                  ? "absolute -mt-7 shadow-soft z-top dark:shadow-soft-white w-full"
                  : "absolute mt-3 z-top w-full"
                : home
                ? "absolute shadow-soft z-top dark:shadow-soft-white w-full"
                : "absolute mt-20 z-top w-full"
            }
          >
            <View className="mx-4 rounded-xl z-top pb-1 bg-opacity-90 bg-zinc-50 dark:bg-zinc-800">
              <Animated.View
                style={{
                  display: "flex",
                  backgroundColor: showingHealthWarningPulse
                    ? backgroundColorInterpolation
                    : healthDamageFlash.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["transparent", "rgba(180,30,30,0.4)"],
                      }),
                }}
              >
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
                          {showingGoldChange ? goldChangePopUp() : null}
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
                </View>
              </Animated.View>
            </View>
          </Pressable>
        </>
      );
    }
  },
);
export default PlayerStatus;
