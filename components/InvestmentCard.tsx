import { useColorScheme } from "nativewind";
import { View as ThemedView, Text, ScrollView } from "./Themed";
import { Investment } from "../utility/types";
import Coins from "../assets/icons/CoinsIcon";
import { Pressable, View, StyleSheet, Animated } from "react-native";
import Modal from "react-native-modal";
import { useEffect, useRef, useState } from "react";
import { asReadableGold } from "../utility/functions";
import ClockIcon from "../assets/icons/ClockIcon";
import Vault from "../assets/icons/VaultIcon";
import { Entypo } from "@expo/vector-icons";
import Sanity from "../assets/icons/SanityIcon";

interface InvestmentCardProps {
  investment: Investment;
}
export default function InvestmentCard({ investment }: InvestmentCardProps) {
  const { colorScheme } = useColorScheme();
  const [showUpgrades, setShowUpgrades] = useState<boolean>(false);

  return (
    <>
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
          className="mx-auto w-full rounded-xl p-4"
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
          <ScrollView>
            <View style={styles.container}>
              <View style={styles.line} />
              <View style={styles.content}>
                <Text className="text-xl">{investment.name} Upgrades</Text>
              </View>
              <View style={styles.line} />
            </View>
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
                  onPress={() => setShowingBody(!showingBody)}
                  key={upgrade.name}
                >
                  <ThemedView
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
                            color="black"
                          />
                        </Animated.View>
                      </View>
                      {showingBody && (
                        <View>
                          <Text className="bold my-auto py-2 text-center dark:text-zinc-50">
                            {upgrade.description}
                          </Text>
                          <View style={styles.container}>
                            <View style={styles.line} />
                            <View style={styles.content}>
                              <Text>Effects</Text>
                            </View>
                            <View style={styles.line} />
                          </View>
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
                                <ClockIcon height={14} width={14} />
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
                            {upgrade.effect.permanentlyDecreaseMaxSanity && (
                              <View className="flex flex-row items-center">
                                <Text>
                                  -{upgrade.effect.permanentlyDecreaseMaxSanity}{" "}
                                </Text>
                                <Sanity height={14} width={14} />
                              </View>
                            )}
                            {upgrade.effect.permanentlyIncreaseMaxSanity && (
                              <View className="flex flex-row items-center">
                                <Text>
                                  {upgrade.effect.permanentlyIncreaseMaxSanity}{" "}
                                </Text>
                                <Sanity height={14} width={14} />
                              </View>
                            )}
                          </View>
                          <Pressable className="mx-auto my-2 active:scale-95 active:opacity-50">
                            <View
                              className="rounded-xl px-4 py-2"
                              style={{
                                shadowColor: "#000",
                                elevation: 1,
                                backgroundColor:
                                  colorScheme == "light" ? "white" : "#71717a",
                                shadowOpacity: 0.1,
                                shadowRadius: 5,
                              }}
                            >
                              <Text className="text-center">Purchase For</Text>
                              <View className="flex flex-row items-center justify-center">
                                <Text className="dark:text-zinc-50">
                                  {asReadableGold(investment.cost)}{" "}
                                </Text>
                                <Coins width={14} height={14} />
                              </View>
                            </View>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </ThemedView>
                </Pressable>
              );
            })}
          </ScrollView>
        </ThemedView>
      </Modal>
      <ThemedView
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
        }}
      >
        <View className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500">
          <View>
            <Text className="bold my-auto text-xl tracking-wider dark:text-zinc-50">
              {investment.name}
            </Text>
            <Text className="bold my-auto py-2 text-center dark:text-zinc-50">
              {investment.description}
            </Text>
          </View>
          <View className="flex flex-row items-center justify-between py-4">
            <View className="flex items-center">
              <View className="flex flex-row">
                <Text>
                  {`${investment.goldReturnRange.min} - ${investment.goldReturnRange.max} `}
                </Text>
                <Coins height={14} width={14} />
              </View>
              <View className="flex flex-row">
                <Text>{investment.turnsPerReturn} </Text>
                <View className="my-auto">
                  <ClockIcon height={14} width={14} />
                </View>
              </View>
              <View className="flex flex-row items-center">
                <Text>{investment.maxGoldStockPile} </Text>
                <Vault height={14} width={16} />
              </View>
            </View>
            <Pressable
              onPress={() => setShowUpgrades(true)}
              className="rounded-xl border border-zinc-900 px-4 py-1 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text className="text-center">
                {`View\nUpgrades `}({investment.upgrades.length})
              </Text>
            </Pressable>
          </View>
          <Pressable className="mx-auto mb-2 active:scale-95 active:opacity-50">
            <View
              className="rounded-xl px-8 py-4"
              style={{
                shadowColor: "#000",
                elevation: 1,
                backgroundColor: colorScheme == "light" ? "white" : "#71717a",
                shadowOpacity: 0.1,
                shadowRadius: 5,
              }}
            >
              <Text className="text-center">Purchase For</Text>
              <View className="flex flex-row items-center justify-center">
                <Text className="dark:text-zinc-50">
                  {asReadableGold(investment.cost)}{" "}
                </Text>
                <Coins width={14} height={14} />
              </View>
            </View>
          </Pressable>
        </View>
      </ThemedView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
  },
  content: {
    marginHorizontal: 10,
  },
  line: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});
