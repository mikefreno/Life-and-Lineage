import { useColorScheme } from "nativewind";
import { View as ThemedView, Text, ScrollView } from "./Themed";
import { InvestmentType, InvestmentUpgrade } from "../utility/types";
import Coins from "../assets/icons/CoinsIcon";
import { Pressable, View, StyleSheet, Animated } from "react-native";
import Modal from "react-native-modal";
import { useContext, useEffect, useRef, useState } from "react";
import { toTitleCase } from "../utility/functions/misc/words";
import ClockIcon from "../assets/icons/ClockIcon";
import Vault from "../assets/icons/VaultIcon";
import { Entypo } from "@expo/vector-icons";
import Sanity from "../assets/icons/SanityIcon";
import { Investment } from "../classes/investment";
import GenericModal from "./GenericModal";
import { observer } from "mobx-react-lite";
import { useVibration } from "../utility/customHooks";
import { asReadableGold } from "../utility/functions/misc/numbers";
import ThemedCard from "./ThemedCard";
import { AppContext } from "../app/_layout";
import GenericStrikeAround from "./GenericStrikeAround";

interface InvestmentCardProps {
  investment: InvestmentType;
}

const InvestmentCard = observer(({ investment }: InvestmentCardProps) => {
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { playerState, gameState } = appData;

  const { colorScheme } = useColorScheme();

  const [showUpgrades, setShowUpgrades] = useState<boolean>(false);
  const [showRequirements, setShowRequirements] = useState<boolean>(false);

  const [showInvestmentConfirmation, setShowInvestmentConfirmation] =
    useState<boolean>(false);
  const vibration = useVibration();

  const [madeInvestment, setMadeInvestment] = useState<Investment | undefined>(
    playerState?.getInvestment(investment.name),
  );

  function purchaseInvestmentCheck() {
    const requirement = investment.requires?.requirement;
    if (requirement && gameState?.completedInstances.includes(requirement)) {
      if (playerState && playerState.gold >= investment.cost) {
        if (investment.cost / playerState.gold >= 0.2) {
          setShowInvestmentConfirmation(true);
        } else {
          playerState.purchaseInvestmentBase(investment);
        }
      }
    } else {
      setShowRequirements(true);
    }
  }

  function purchaseUpgradeCheck(specifiedUpgrade: InvestmentUpgrade) {
    if (playerState && playerState.gold >= specifiedUpgrade.cost) {
      playerState.purchaseInvestmentUpgrade(
        investment,
        specifiedUpgrade,
        playerState,
      );
    }
  }

  function collectOnInvestment() {
    if (playerState && gameState) {
      playerState.collectFromInvestment(investment.name);
      gameState.gameTick(playerState);
    }
  }

  useEffect(() => {
    setMadeInvestment(playerState?.getInvestment(investment.name));
  }, [playerState?.investments.length]);

  return (
    <>
      {investment.requires && (
        <GenericModal
          isVisibleCondition={showRequirements}
          backFunction={() => setShowRequirements(false)}
        >
          <GenericStrikeAround>
            <Text className="text-center text-xl">Alert!</Text>
          </GenericStrikeAround>
          <Text className="mx-4 text-lg">{investment.requires.message}</Text>
          <Text className="mx-8 py-4 text-center italic">
            Complete the {toTitleCase(investment.requires.requirement)} dungeon
            to unlock this investment!
          </Text>
          <Pressable
            onPress={() => setShowRequirements(false)}
            className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text>Cancel</Text>
          </Pressable>
        </GenericModal>
      )}
      <GenericModal
        isVisibleCondition={showInvestmentConfirmation}
        backFunction={() => setShowInvestmentConfirmation(false)}
      >
        <Text className="text-center text-lg">Purchase:</Text>
        <GenericStrikeAround>
          <Text className="text-center text-2xl">{investment.name}</Text>
        </GenericStrikeAround>
        <Text className="pb-6 text-center text-xl">Are you sure?</Text>
        <View className="flex flex-row">
          <Pressable
            onPress={() => {
              vibration({ style: "medium", essential: true });
              playerState?.purchaseInvestmentBase(investment);
              setShowInvestmentConfirmation(false);
            }}
            className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text>Purchase</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              vibration({ style: "light" });
              setShowInvestmentConfirmation(false);
            }}
            className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text>Cancel</Text>
          </Pressable>
        </View>
      </GenericModal>
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.2}
        animationInTiming={500}
        animationOutTiming={300}
        isVisible={showUpgrades}
        onBackdropPress={() => setShowUpgrades(false)}
        onBackButtonPress={() => setShowUpgrades(false)}
      >
        <ThemedView
          className="mx-auto max-h-[90vh] w-full rounded-xl px-4 dark:border dark:border-zinc-500"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            elevation: 1,
            shadowOpacity: 0.25,
            shadowRadius: 5,
          }}
        >
          <GenericStrikeAround>
            <Text className="text-center text-xl">
              {investment.name} Upgrades
            </Text>
          </GenericStrikeAround>
          <ScrollView>
            {investment.upgrades.map((upgrade) => {
              const [showingBody, setShowingBody] = useState<boolean>(false);
              const rotation = useRef(new Animated.Value(0)).current;

              useEffect(() => {
                Animated.timing(rotation, {
                  toValue: showingBody ? 1 : 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start();
              }, [showingBody]);

              const rotationInterpolate = rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "180deg"],
              });

              return (
                <Pressable
                  className="w-full"
                  onPress={() => {
                    vibration({ style: "light" });
                    setShowingBody(!showingBody);
                  }}
                  key={upgrade.name}
                >
                  <View
                    className="m-2 rounded-xl"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 3,
                        height: 1,
                      },
                      elevation: 3,
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      backgroundColor:
                        "style" in upgrade
                          ? upgrade.style == "evil"
                            ? "#ef4444"
                            : upgrade.style == "neutral"
                            ? "#f59e0b"
                            : "#10b981"
                          : colorScheme == "light"
                          ? "#fafafa"
                          : "#27272a",
                    }}
                  >
                    <View className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500">
                      <View className="flex flex-row justify-between">
                        <Text className="bold my-auto text-xl tracking-wider dark:text-zinc-50">
                          {upgrade.name}
                        </Text>
                        <Animated.View
                          style={{
                            transform: [{ rotate: rotationInterpolate }],
                          }}
                        >
                          <Entypo
                            name="chevron-small-down"
                            size={24}
                            color={
                              colorScheme == "light" ? "#18181b" : "#fafafa"
                            }
                          />
                        </Animated.View>
                      </View>
                      {madeInvestment?.upgrades.includes(upgrade.name) && (
                        <Text className="my-auto text-lg italic tracking-wider opacity-70 dark:text-zinc-50">
                          Purchased
                        </Text>
                      )}
                      {showingBody && (
                        <View>
                          <Text className="bold my-auto py-2 text-center dark:text-zinc-50">
                            {upgrade.description}
                          </Text>
                          <GenericStrikeAround>
                            <Text>Effects</Text>
                          </GenericStrikeAround>
                          <View className="items-center py-2">
                            {upgrade.effect.goldMinimumIncrease && (
                              <View className="flex flex-row items-center">
                                <Text>
                                  Minimum return
                                  {upgrade.effect.goldMinimumIncrease! > 0
                                    ? ` increase: ${upgrade.effect.goldMinimumIncrease} `
                                    : ` decrease: ${upgrade.effect.goldMinimumIncrease} `}
                                </Text>
                                <Coins height={14} width={14} />
                              </View>
                            )}
                            {upgrade.effect.goldMaximumIncrease && (
                              <View className="flex flex-row items-center">
                                <Text>
                                  Max return
                                  {upgrade.effect.goldMaximumIncrease! > 0
                                    ? ` increase: ${upgrade.effect.goldMaximumIncrease} `
                                    : ` decrease: ${upgrade.effect.goldMaximumIncrease} `}
                                </Text>
                                <Coins height={14} width={14} />
                              </View>
                            )}
                            {upgrade.effect.turnsPerRollChange && (
                              <View className="flex flex-row items-center">
                                <Text>
                                  {upgrade.effect.turnsPerRollChange}{" "}
                                </Text>
                                <ClockIcon
                                  height={14}
                                  width={14}
                                  color={
                                    colorScheme == "dark"
                                      ? "#fafafa"
                                      : undefined
                                  }
                                />
                              </View>
                            )}
                            {upgrade.effect.maxGoldStockPileIncrease && (
                              <View className="flex flex-row items-center">
                                <Text>
                                  {upgrade.effect.maxGoldStockPileIncrease}{" "}
                                </Text>
                                <Vault height={14} width={14} />
                              </View>
                            )}
                            {upgrade.effect.changeMaxSanity && (
                              <View className="flex flex-row items-center">
                                <Text>{upgrade.effect.changeMaxSanity} </Text>
                                <Sanity height={14} width={14} />
                              </View>
                            )}
                          </View>
                          {!madeInvestment ||
                            (madeInvestment &&
                              !madeInvestment.upgrades.includes(
                                upgrade.name,
                              ) && (
                                <Pressable
                                  onPress={() => purchaseUpgradeCheck(upgrade)}
                                  disabled={
                                    playerState &&
                                    playerState.gold < upgrade.cost
                                  }
                                  className="mx-auto my-2"
                                >
                                  {({ pressed }) => (
                                    <View
                                      className={`rounded-xl px-8 py-4 ${
                                        pressed ? "scale-95 opacity-50" : ""
                                      }`}
                                      style={
                                        playerState &&
                                        playerState.gold >= upgrade.cost
                                          ? {
                                              shadowColor: "#000",
                                              elevation: 1,
                                              backgroundColor:
                                                colorScheme == "light"
                                                  ? "white"
                                                  : "#71717a",
                                              shadowOpacity: 0.1,
                                              shadowRadius: 5,
                                            }
                                          : {
                                              backgroundColor:
                                                colorScheme == "light"
                                                  ? "#ccc"
                                                  : "#4b4b4b",
                                              opacity: 0.5,
                                            }
                                      }
                                    >
                                      <Text className="text-center">
                                        Purchase For
                                      </Text>
                                      <View className="flex flex-row items-center justify-center">
                                        <Text className="dark:text-zinc-50">
                                          {asReadableGold(upgrade.cost)}{" "}
                                        </Text>
                                        <Coins width={14} height={14} />
                                      </View>
                                    </View>
                                  )}
                                </Pressable>
                              ))}
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            onPress={() => {
              vibration({ style: "light" });
              setShowUpgrades(false);
            }}
            className="mx-auto mb-4 mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text>Close</Text>
          </Pressable>
        </ThemedView>
      </Modal>
      <ThemedCard>
        <View>
          {madeInvestment ? (
            <View className="flex flex-row justify-between">
              <Text className="bold my-auto text-xl tracking-wider dark:text-zinc-50">
                {investment.name}
              </Text>
              <Text className="my-auto text-lg italic tracking-wider opacity-70 dark:text-zinc-50">
                Purchased
              </Text>
            </View>
          ) : (
            <Text className="bold my-auto text-xl tracking-wider dark:text-zinc-50">
              {investment.name}
            </Text>
          )}
          <Text className="bold my-auto py-2 text-center dark:text-zinc-50">
            {investment.description}
          </Text>
        </View>
        <View className="flex flex-row items-center justify-evenly py-4">
          <View className="mx-12 flex items-center">
            <View className="flex flex-row">
              {madeInvestment ? (
                <Text>
                  {`${madeInvestment.minimumReturn} - ${madeInvestment.maximumReturn} `}
                </Text>
              ) : (
                <Text>
                  {`${investment.goldReturnRange.min} - ${investment.goldReturnRange.max} `}
                </Text>
              )}
              <Coins height={14} width={14} />
            </View>
            <View className="flex flex-row">
              <Text>
                {madeInvestment
                  ? madeInvestment.turnsPerRoll
                  : investment.turnsPerReturn}{" "}
              </Text>
              <View className="my-auto">
                <ClockIcon
                  height={14}
                  width={14}
                  color={colorScheme == "dark" ? "#fafafa" : undefined}
                />
              </View>
            </View>
            <View className="flex flex-row items-center">
              <Text>
                {madeInvestment
                  ? madeInvestment.maxGoldStockPile
                  : investment.maxGoldStockPile}{" "}
              </Text>
              <Vault height={14} width={16} />
            </View>
          </View>
          <Pressable
            onPress={() => {
              vibration({ style: "light" });
              setShowUpgrades(true);
            }}
            className="mx-12 rounded-xl border border-zinc-900 px-4 py-1 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
          >
            <Text className="text-center">
              {`View\nUpgrades `}({investment.upgrades.length})
            </Text>
          </Pressable>
        </View>
        {!madeInvestment ? (
          <Pressable
            onPress={purchaseInvestmentCheck}
            disabled={playerState && playerState.gold < investment.cost}
            className="mx-auto mb-2"
          >
            {({ pressed }) => (
              <View
                className={`rounded-xl px-8 py-4 ${
                  pressed ? "scale-95 opacity-50" : ""
                }`}
                style={
                  playerState && playerState.gold >= investment.cost
                    ? {
                        shadowColor: "#000",
                        elevation: 2,
                        backgroundColor:
                          colorScheme == "light" ? "white" : "#71717a",
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                      }
                    : {
                        backgroundColor:
                          colorScheme == "light" ? "#ccc" : "#4b4b4b",
                        opacity: 0.5,
                      }
                }
              >
                <Text className="text-center">Purchase For</Text>
                <View className="flex flex-row items-center justify-center">
                  <Text className="dark:text-zinc-50">
                    {asReadableGold(investment.cost)}{" "}
                  </Text>
                  <Coins width={14} height={14} />
                </View>
              </View>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={collectOnInvestment}
            disabled={madeInvestment.currentGoldStockPile == 0}
            className="mx-auto mb-2"
          >
            {({ pressed }) => (
              <View
                className={`rounded-xl px-8 py-4 ${
                  pressed ? "scale-95 opacity-50" : ""
                }`}
                style={
                  madeInvestment.currentGoldStockPile > 0
                    ? {
                        shadowColor: "#000",
                        elevation: 1,
                        backgroundColor:
                          colorScheme == "light" ? "white" : "#71717a",
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                      }
                    : {
                        backgroundColor:
                          colorScheme == "light" ? "#ccc" : "#4b4b4b",
                        opacity: 0.5,
                      }
                }
              >
                <Text className="text-center">Collect</Text>
                <View className="flex flex-row items-center justify-center">
                  <Text className="dark:text-zinc-50">
                    {asReadableGold(madeInvestment.currentGoldStockPile)}{" "}
                  </Text>
                  <Coins width={14} height={14} />
                </View>
              </View>
            )}
          </Pressable>
        )}
      </ThemedCard>
    </>
  );
});

export default InvestmentCard;
