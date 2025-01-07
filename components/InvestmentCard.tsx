import React from "react";
import { ThemedScrollView, Text } from "./Themed";
import { InvestmentType, InvestmentUpgrade } from "../utility/types";
import { Pressable, View, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import { toTitleCase, asReadableGold } from "../utility/functions/misc";
import { Entypo } from "@expo/vector-icons";
import GenericModal from "./GenericModal";
import { observer } from "mobx-react-lite";
import ThemedCard from "./ThemedCard";
import GenericStrikeAround from "./GenericStrikeAround";
import { ClockIcon, Coins, Vault } from "../assets/icons/SVGIcons";
import { useRootStore } from "../hooks/stores";
import { useVibration } from "../hooks/generic";
import type { Investment } from "../entities/investment";
import { text, useStyles } from "../hooks/styles";
import { Colors } from "react-native/Libraries/NewAppScreen";

const InvestmentCard = observer(
  ({ investment }: { investment: InvestmentType }) => {
    const root = useRootStore();
    const { playerState, uiStore } = root;
    const styles = useStyles();
    const theme = Colors[uiStore.colorScheme];

    const [showUpgrades, setShowUpgrades] = useState<boolean>(false);
    const [showRequirements, setShowRequirements] = useState<boolean>(false);

    const [showInvestmentConfirmation, setShowInvestmentConfirmation] =
      useState<boolean>(false);
    const vibration = useVibration();

    const [madeInvestment, setMadeInvestment] = useState<
      Investment | undefined
    >(playerState?.getInvestment(investment.name));

    function purchaseInvestmentCheck() {
      const requirement = investment.requires.requirement;
      if (playerState?.keyItems.find((item) => item.name == requirement)) {
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
      if (playerState) {
        playerState.collectFromInvestment(investment.name);
        root.gameTick();
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
              <Text style={{ textAlign: "center", ...text.xl }}>Alert!</Text>
            </GenericStrikeAround>
            <Text style={[styles.mx4, text.lg]}>
              {investment.requires.message}
            </Text>
            <Text style={[styles.mx8, styles.py4, styles.textCenter]}>
              Complete the {toTitleCase(investment.requires.requirement)}{" "}
              dungeon to unlock this investment!
            </Text>
            <Pressable
              onPress={() => setShowRequirements(false)}
              style={styles.investmentButton}
            >
              <Text>Cancel</Text>
            </Pressable>
          </GenericModal>
        )}
        <GenericModal
          isVisibleCondition={showInvestmentConfirmation}
          backFunction={() => setShowInvestmentConfirmation(false)}
        >
          <Text style={[styles.textCenter, styles.lg]}>Purchase:</Text>
          <GenericStrikeAround>
            <Text style={[styles.textCenter, styles["2xl"]]}>
              {investment.name}
            </Text>
          </GenericStrikeAround>
          <Text style={[styles.textCenter, styles.xl, styles.pb6]}>
            Are you sure?
          </Text>
          <View style={styles.rowCenter}>
            <Pressable
              onPress={() => {
                vibration({ style: "medium", essential: true });
                playerState?.purchaseInvestmentBase(investment);
                setShowInvestmentConfirmation(false);
              }}
              style={styles.investmentButton}
            >
              <Text style={styles.lg}>Purchase</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                setShowInvestmentConfirmation(false);
              }}
              style={styles.investmentButton}
            >
              <Text style={styles.lg}>Cancel</Text>
            </Pressable>
          </View>
        </GenericModal>
        <GenericModal
          isVisibleCondition={showInvestmentConfirmation}
          backFunction={() => setShowInvestmentConfirmation(false)}
        >
          <Text style={[styles.textCenter, text.lg]}>Purchase:</Text>
          <GenericStrikeAround>
            <Text style={[styles.textCenter, text["2xl"]]}>
              {investment.name}
            </Text>
          </GenericStrikeAround>
          <Text style={[styles.pb6, styles.textCenter, text.xl]}>
            Are you sure?
          </Text>
          <View style={styles.rowCenter}>
            <Pressable
              onPress={() => {
                vibration({ style: "medium", essential: true });
                playerState?.purchaseInvestmentBase(investment);
                setShowInvestmentConfirmation(false);
              }}
              style={styles.investmentButton}
            >
              <Text>Purchase</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                setShowInvestmentConfirmation(false);
              }}
              style={styles.investmentButton}
            >
              <Text>Cancel</Text>
            </Pressable>
          </View>
        </GenericModal>

        <GenericModal
          isVisibleCondition={showUpgrades}
          style={{ maxHeight: "75%", marginTop: "auto", marginBottom: "auto" }}
          backFunction={() => setShowUpgrades(false)}
          size={95}
        >
          <GenericStrikeAround>
            <Text style={[styles.textCenter, text.xl]}>
              {investment.name} Upgrades
            </Text>
          </GenericStrikeAround>
          <ThemedScrollView>
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
                  style={{ width: "100%" }}
                  onPress={() => {
                    vibration({ style: "light" });
                    setShowingBody(!showingBody);
                  }}
                  key={upgrade.name}
                >
                  <View
                    style={[
                      styles.themedCard,
                      styles.m2,
                      styles.roundedBorder,
                      {
                        backgroundColor:
                          "style" in upgrade
                            ? upgrade.style === "evil"
                              ? theme.error
                              : upgrade.style === "neutral"
                              ? theme.warning
                              : theme.success
                            : theme.background,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.columnBetween,
                        styles.roundedBorder,
                        styles.px4,
                        styles.py2,
                      ]}
                    >
                      <View style={styles.rowBetween}>
                        <Text
                          style={[
                            text.xl,
                            styles.bold,
                            styles.myAuto,
                            { letterSpacing: 0.5 },
                          ]}
                        >
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
                            color={theme.text}
                          />
                        </Animated.View>
                      </View>
                      {madeInvestment?.upgrades.includes(upgrade.name) && (
                        <Text
                          style={[
                            text.lg,
                            styles.myAuto,
                            {
                              opacity: 0.7,
                              letterSpacing: 0.5,
                            },
                          ]}
                        >
                          Purchased
                        </Text>
                      )}
                      {showingBody && (
                        <View>
                          <Text
                            style={[
                              styles.bold,
                              styles.myAuto,
                              styles.py2,
                              styles.textCenter,
                            ]}
                          >
                            {upgrade.description}
                          </Text>
                          <GenericStrikeAround>
                            <Text>Effects</Text>
                          </GenericStrikeAround>
                          <View style={[styles.columnCenter, styles.py2]}>
                            {upgrade.effect.goldMinimumIncrease && (
                              <View
                                style={[styles.rowCenter, styles.itemsCenter]}
                              >
                                <Text>
                                  Minimum return
                                  {upgrade.effect.goldMinimumIncrease! > 0
                                    ? ` increase: ${upgrade.effect.goldMinimumIncrease} `
                                    : ` decrease: ${upgrade.effect.goldMinimumIncrease} `}
                                </Text>
                                <Coins height={14} width={14} />
                              </View>
                            )}
                            {/* Additional effects follow same pattern */}
                          </View>
                          {(!madeInvestment ||
                            (madeInvestment &&
                              !madeInvestment.upgrades.includes(
                                upgrade.name,
                              ))) && (
                            <Pressable
                              onPress={() => purchaseUpgradeCheck(upgrade)}
                              disabled={
                                playerState && playerState.gold < upgrade.cost
                              }
                              style={[styles.mxAuto, styles.my2]}
                            >
                              {({ pressed }) => (
                                <View
                                  style={[
                                    styles.roundedBorder,
                                    styles.px8,
                                    styles.py4,
                                    pressed && styles.pressedStyle,
                                    playerState &&
                                    playerState.gold >= upgrade.cost
                                      ? styles.activeButton
                                      : styles.disabledButton,
                                  ]}
                                >
                                  <Text style={styles.textCenter}>
                                    Purchase For
                                  </Text>
                                  <View
                                    style={[
                                      styles.rowCenter,
                                      styles.itemsCenter,
                                    ]}
                                  >
                                    <Text>{asReadableGold(upgrade.cost)} </Text>
                                    <Coins width={14} height={14} />
                                  </View>
                                </View>
                              )}
                            </Pressable>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ThemedScrollView>
          <Pressable
            onPress={() => {
              vibration({ style: "light" });
              setShowUpgrades(false);
            }}
            style={[
              styles.mxAuto,
              styles.mb4,
              styles.mt2,
              styles.roundedBorder,
              styles.px6,
              styles.py2,
            ]}
          >
            <Text>Close</Text>
          </Pressable>
        </GenericModal>

        <ThemedCard>
          <View>
            {madeInvestment ? (
              <View style={styles.rowBetween}>
                <Text
                  style={[
                    styles.bold,
                    styles.myAuto,
                    text.xl,
                    { letterSpacing: 0.5 },
                  ]}
                >
                  {investment.name}
                </Text>
                <Text
                  style={[
                    styles.myAuto,
                    text.lg,
                    { letterSpacing: 0.5, opacity: 0.7 },
                  ]}
                >
                  Purchased
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.bold,
                  styles.myAuto,
                  text.xl,
                  { letterSpacing: 0.5 },
                ]}
              >
                {investment.name}
              </Text>
            )}
            <Text
              style={[
                styles.bold,
                styles.myAuto,
                styles.py2,
                styles.textCenter,
              ]}
            >
              {investment.description}
            </Text>
          </View>

          <View style={[styles.rowEvenly, styles.itemsCenter, styles.py4]}>
            <View style={[styles.mx12, styles.columnCenter]}>
              <View style={styles.rowCenter}>
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
              <View style={styles.rowCenter}>
                <Text>
                  {madeInvestment
                    ? madeInvestment.turnsPerRoll
                    : investment.turnsPerReturn}{" "}
                </Text>
                <View style={styles.myAuto}>
                  <ClockIcon height={14} width={14} color={theme.text} />
                </View>
              </View>
              <View style={[styles.rowCenter, styles.itemsCenter]}>
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
              style={[
                styles.mx12,
                styles.roundedBorder,
                styles.px4,
                styles.py1,
              ]}
            >
              <Text style={styles.textCenter}>
                {`View\nUpgrades `}({investment.upgrades.length})
              </Text>
            </Pressable>
          </View>

          {!madeInvestment ? (
            <Pressable
              onPress={purchaseInvestmentCheck}
              disabled={playerState && playerState.gold < investment.cost}
              style={[styles.mxAuto, styles.mb2]}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.roundedBorder,
                    styles.px8,
                    styles.py4,
                    pressed && styles.pressedStyle,
                    playerState && playerState.gold >= investment.cost
                      ? styles.activeButton
                      : styles.disabledButton,
                  ]}
                >
                  <Text style={styles.textCenter}>Purchase For</Text>
                  <View style={[styles.rowCenter, styles.itemsCenter]}>
                    <Text>{asReadableGold(investment.cost)} </Text>
                    <Coins width={14} height={14} />
                  </View>
                </View>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={collectOnInvestment}
              disabled={madeInvestment.currentGoldStockPile == 0}
              style={[styles.mxAuto, styles.mb2]}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.roundedBorder,
                    styles.px8,
                    styles.py4,
                    pressed && styles.pressedStyle,
                    madeInvestment.currentGoldStockPile > 0
                      ? styles.activeButton
                      : styles.disabledButton,
                  ]}
                >
                  <Text style={styles.textCenter}>Collect</Text>
                  <View style={[styles.rowCenter, styles.itemsCenter]}>
                    <Text>
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
  },
);

export default InvestmentCard;
