import React from "react";
import { Text, ThemedView } from "@/components/Themed";
import { InvestmentType, InvestmentUpgrade } from "@/utility/types";
import { Pressable, View, Animated, ScrollView, Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import { toTitleCase, asReadableGold } from "@/utility/functions/misc";
import { Entypo } from "@expo/vector-icons";
import GenericModal from "@/components/GenericModal";
import { observer } from "mobx-react-lite";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { ClockIcon, Coins, Sanity, Vault } from "@/assets/icons/SVGIcons";
import { useRootStore } from "@/hooks/stores";
import { useVibration } from "@/hooks/generic";
import type { Investment } from "@/entities/investment";
import { useStyles } from "@/hooks/styles";
import Colors from "@/constants/Colors";
import GenericFlatButton from "./GenericFlatButton";
import { useScaling } from "@/hooks/scaling";

const InvestmentCard = observer(
  ({
    investment,
    searchedFor,
  }: {
    investment: InvestmentType;
    searchedFor: boolean;
  }) => {
    const root = useRootStore();
    const { playerState, uiStore } = root;
    const styles = useStyles();
    const theme = Colors[uiStore.colorScheme];
    const { getNormalizedSize } = useScaling();

    const [showUpgrades, setShowUpgrades] = useState<boolean>(false);
    const [showRequirements, setShowRequirements] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [showInvestmentConfirmation, setShowInvestmentConfirmation] =
      useState<boolean>(false);
    const vibration = useVibration();

    const [madeInvestment, setMadeInvestment] = useState<
      Investment | undefined
    >(playerState?.getInvestment(investment.name));

    function purchaseInvestmentCheck() {
      if (!playerState) return;

      const requirement = investment.requires.requirement;
      if (playerState.keyItems.find((item) => item.name == requirement)) {
        if (playerState.gold >= investment.cost) {
          if (investment.cost / playerState.gold >= 0.2) {
            setShowInvestmentConfirmation(true);
          } else {
            try {
              playerState.purchaseInvestmentBase(investment);
              setMadeInvestment(playerState.getInvestment(investment.name));
            } catch (error) {
              console.error("Error purchasing investment:", error);
              setErrorMessage(
                "Failed to purchase investment. Please try again.",
              );
              setShowError(true);
            }
          }
        }
      } else {
        setShowRequirements(true);
      }
    }

    function purchaseUpgradeCheck(specifiedUpgrade: InvestmentUpgrade) {
      if (!playerState) return;

      if (playerState.gold < specifiedUpgrade.cost) return;

      const existingInvestment = playerState.getInvestment(investment.name);
      if (!existingInvestment) {
        console.error(
          `Investment ${investment.name} not found in player's investments!`,
        );
        setErrorMessage(
          `Cannot purchase upgrade: You don't own the ${investment.name} investment yet.`,
        );
        setShowError(true);
        return;
      }

      if (existingInvestment.upgrades.includes(specifiedUpgrade.name)) {
        setErrorMessage(
          `You've already purchased the ${specifiedUpgrade.name} upgrade.`,
        );
        setShowError(true);
        return;
      }

      try {
        playerState.purchaseInvestmentUpgrade(
          investment,
          specifiedUpgrade,
          playerState,
        );

        setMadeInvestment(playerState.getInvestment(investment.name));
      } catch (error) {
        console.error("Error purchasing upgrade:", error);
        setErrorMessage(
          `Failed to purchase upgrade: ${
            error.message ?? "unkown validation error"
          }`,
        );
        setShowError(true);
      }
    }

    function collectOnInvestment() {
      if (!playerState) return;

      try {
        playerState.collectFromInvestment(investment.name);
        root.gameTick();

        setMadeInvestment(playerState.getInvestment(investment.name));
      } catch (error) {
        console.error("Error collecting from investment:", error);
        setErrorMessage("Failed to collect from investment. Please try again.");
        setShowError(true);
      }
    }

    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (searchedFor) {
        const pulse = Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
          //Animated.delay(1000),
        ]);

        Animated.loop(pulse, { iterations: 1 }).start(() => {
          glowAnim.setValue(0);
        });
      } else {
        glowAnim.setValue(0);
      }
    }, [searchedFor, glowAnim]);

    useEffect(() => {
      if (playerState) {
        const currentInvestment = playerState.getInvestment(investment.name);
        setMadeInvestment(currentInvestment);
      }
    }, [playerState, investment.name, playerState?.investments.length]);

    return (
      <>
        {investment.requires && (
          <GenericModal
            isVisibleCondition={showRequirements}
            backFunction={() => setShowRequirements(false)}
          >
            <GenericStrikeAround>
              <Text style={{ textAlign: "center", ...styles["text-xl"] }}>
                Alert!
              </Text>
            </GenericStrikeAround>
            <Text style={[styles.mx4, styles["text-lg"]]}>
              {investment.requires.message}
            </Text>
            <Text style={[styles.mx8, styles.py4, styles.textCenter]}>
              {toTitleCase(investment.requires.requirement)} needed to unlock
              this investment!
            </Text>
            <GenericFlatButton onPress={() => setShowRequirements(false)}>
              <Text>Close</Text>
            </GenericFlatButton>
          </GenericModal>
        )}

        <GenericModal
          isVisibleCondition={showError}
          backFunction={() => setShowError(false)}
        >
          <GenericStrikeAround>
            <Text style={{ textAlign: "center", ...styles["text-xl"] }}>
              Error
            </Text>
          </GenericStrikeAround>
          <Text
            style={[
              styles.mx4,
              styles["text-lg"],
              styles.py4,
              styles.textCenter,
            ]}
          >
            {errorMessage}
          </Text>
          <GenericFlatButton onPress={() => setShowError(false)}>
            <Text>Close</Text>
          </GenericFlatButton>
        </GenericModal>

        <GenericModal
          isVisibleCondition={showInvestmentConfirmation}
          backFunction={() => setShowInvestmentConfirmation(false)}
        >
          <Text style={[styles.textCenter, styles["text-lg"]]}>Purchase:</Text>
          <GenericStrikeAround>
            <Text style={[styles.textCenter, styles["text-2xl"]]}>
              {investment.name}
            </Text>
          </GenericStrikeAround>
          <Text style={[styles.textCenter, styles["text-xl"], styles.pb6]}>
            Are you sure?
          </Text>
          <View style={styles.rowCenter}>
            <Pressable
              onPress={() => {
                vibration({ style: "medium", essential: true });
                try {
                  playerState?.purchaseInvestmentBase(investment);
                  // Update the madeInvestment state after purchase
                  setMadeInvestment(
                    playerState?.getInvestment(investment.name),
                  );
                } catch (error) {
                  console.error("Error purchasing investment:", error);
                  setErrorMessage(
                    "Failed to purchase investment. Please try again.",
                  );
                  setShowError(true);
                }
                setShowInvestmentConfirmation(false);
              }}
              style={styles.investmentButton}
            >
              <Text style={styles["text-lg"]}>Purchase</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                setShowInvestmentConfirmation(false);
              }}
              style={styles.investmentButton}
            >
              <Text style={styles["text-lg"]}>Cancel</Text>
            </Pressable>
          </View>
        </GenericModal>

        {/* Upgrades Modal */}
        <GenericModal
          isVisibleCondition={showUpgrades}
          style={{ maxHeight: "75%", marginVertical: "auto" }}
          backFunction={() => setShowUpgrades(false)}
          size={95}
          scrollEnabled={true}
        >
          <GenericStrikeAround>
            <Text style={[styles.textCenter, styles["text-xl"]]}>
              {investment.name} Upgrades
            </Text>
          </GenericStrikeAround>

          {!madeInvestment && (
            <View
              style={[
                styles.my4,
                styles.mx2,
                styles.p2,
                { backgroundColor: theme.warning, borderRadius: 8 },
              ]}
            >
              <Text style={[styles.textCenter, styles.bold]}>
                You don't own this investment yet!
              </Text>
              <Text style={styles.textCenter}>
                Purchase the base investment first to unlock upgrades.
              </Text>
            </View>
          )}

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

              const isUpgradePurchased = madeInvestment?.upgrades.includes(
                upgrade.name,
              );

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
                        opacity: !madeInvestment ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[styles.columnBetween, styles.px4, styles.py2]}
                    >
                      <View style={styles.rowBetween}>
                        <Text
                          style={[
                            styles["text-xl"],
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
                            size={uiStore.iconSizeLarge}
                            color={theme.text}
                          />
                        </Animated.View>
                      </View>
                      {isUpgradePurchased && (
                        <Text
                          style={[
                            styles["text-lg"],
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
                            {/* min gold change */}
                            {typeof upgrade.effect.goldMinimumIncrease ===
                              "number" && (
                              <View
                                style={[styles.rowCenter, styles.itemsCenter]}
                              >
                                <Text>
                                  Minimum return{" "}
                                  {upgrade.effect.goldMinimumIncrease! > 0
                                    ? `increase: ${upgrade.effect.goldMinimumIncrease}`
                                    : `decrease: ${-upgrade.effect
                                        .goldMinimumIncrease}`}{" "}
                                </Text>
                                <Coins
                                  height={uiStore.iconSizeSmall}
                                  width={uiStore.iconSizeSmall}
                                />
                              </View>
                            )}

                            {/* max gold change */}
                            {typeof upgrade.effect.goldMaximumIncrease ===
                              "number" && (
                              <View
                                style={[styles.rowCenter, styles.itemsCenter]}
                              >
                                <Text>
                                  Maximum return{" "}
                                  {upgrade.effect.goldMaximumIncrease! > 0
                                    ? `increase: ${upgrade.effect.goldMaximumIncrease}`
                                    : `decrease: ${-upgrade.effect
                                        .goldMaximumIncrease}`}{" "}
                                </Text>
                                <Coins
                                  height={uiStore.iconSizeSmall}
                                  width={uiStore.iconSizeSmall}
                                />
                              </View>
                            )}

                            {/* max stockpile change */}
                            {typeof upgrade.effect.maxGoldStockPileIncrease ===
                              "number" && (
                              <View
                                style={[styles.rowCenter, styles.itemsCenter]}
                              >
                                <Text>
                                  Max stockpile{" "}
                                  {upgrade.effect.maxGoldStockPileIncrease! > 0
                                    ? `increase: ${upgrade.effect.maxGoldStockPileIncrease}`
                                    : `decrease: ${-upgrade.effect
                                        .maxGoldStockPileIncrease}`}{" "}
                                </Text>
                                <Vault
                                  height={uiStore.iconSizeSmall}
                                  width={uiStore.iconSizeSmall * 1.15}
                                />
                              </View>
                            )}

                            {/* turns‑per‑roll change */}
                            {typeof upgrade.effect.turnsPerRollChange ===
                              "number" && (
                              <View
                                style={[styles.rowCenter, styles.itemsCenter]}
                              >
                                <Text>
                                  Turn interval{" "}
                                  {upgrade.effect.turnsPerRollChange! < 0
                                    ? `↓${-upgrade.effect.turnsPerRollChange}`
                                    : `+${upgrade.effect.turnsPerRollChange}`}{" "}
                                </Text>
                                <ClockIcon
                                  height={uiStore.iconSizeSmall}
                                  width={uiStore.iconSizeSmall}
                                  color={theme.text}
                                />
                              </View>
                            )}

                            {/* max sanity change */}
                            {typeof upgrade.effect.changeMaxSanity ===
                              "number" && (
                              <View
                                style={[styles.rowCenter, styles.itemsCenter]}
                              >
                                <Text>
                                  Max sanity{" "}
                                  {upgrade.effect.changeMaxSanity! > 0
                                    ? `+${upgrade.effect.changeMaxSanity}`
                                    : `${upgrade.effect.changeMaxSanity}`}{" "}
                                </Text>
                                <Sanity
                                  height={uiStore.iconSizeSmall}
                                  width={uiStore.iconSizeSmall}
                                />
                              </View>
                            )}
                          </View>

                          {madeInvestment && !isUpgradePurchased && (
                            <Pressable
                              onPress={() => purchaseUpgradeCheck(upgrade)}
                              disabled={
                                !playerState ||
                                playerState.gold < upgrade.cost ||
                                !madeInvestment
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
                                    playerState.gold >= upgrade.cost &&
                                    madeInvestment
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
                                    <Coins
                                      width={uiStore.iconSizeSmall}
                                      height={uiStore.iconSizeSmall}
                                    />
                                  </View>
                                </View>
                              )}
                            </Pressable>
                          )}
                          {!madeInvestment && (
                            <Text
                              style={[
                                styles.textCenter,
                                styles.my2,
                                { color: theme.warning },
                              ]}
                            >
                              Purchase base investment first
                            </Text>
                          )}
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
        <Animated.View
          style={{
            margin: getNormalizedSize(6),
            borderRadius: 12,
            // interpolate between base bg and accent glow
            backgroundColor: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [theme.background, theme.border],
            }),
            shadowColor: uiStore.colorScheme === "dark" ? "#fff" : "#000",
            shadowOffset: { width: 0, height: 2 } as const,
            shadowOpacity: Platform.OS === "android" ? 0.9 : 0.2,
            shadowRadius: 1.5,
            elevation: 3,
            // keep dark‐mode inner border
            ...(uiStore.colorScheme === "dark" &&
              ({
                borderWidth: 1,
                borderColor: "#71717a",
              } as const)),
          }}
        >
          <ThemedView
            style={{
              // inner container must be transparent so Animated.View color shows
              backgroundColor: "transparent",
              justifyContent: "space-between",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <View>
              {madeInvestment ? (
                <View style={styles.rowBetween}>
                  <Text
                    style={[
                      styles.bold,
                      styles.myAuto,
                      styles["text-xl"],
                      { letterSpacing: 0.5 },
                    ]}
                  >
                    {investment.name}
                  </Text>
                  <Text
                    style={[
                      styles.myAuto,
                      styles["text-xl"],
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
                    styles["text-xl"],
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

            <View
              style={[
                styles.rowBetween,
                styles.itemsCenter,
                styles.py4,
                { width: "100%" },
              ]}
            >
              <View style={styles.columnCenter}>
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
                  <Coins
                    height={uiStore.iconSizeSmall}
                    width={uiStore.iconSizeSmall}
                  />
                </View>
                <View style={styles.rowCenter}>
                  <Text>
                    {madeInvestment
                      ? madeInvestment.turnsPerRoll
                      : investment.turnsPerReturn}{" "}
                  </Text>
                  <View style={styles.myAuto}>
                    <ClockIcon
                      height={uiStore.iconSizeSmall}
                      width={uiStore.iconSizeSmall}
                      color={theme.text}
                    />
                  </View>
                </View>
                <View style={[styles.rowCenter, styles.itemsCenter]}>
                  <Text>
                    {madeInvestment
                      ? madeInvestment.maxGoldStockPile
                      : investment.maxGoldStockPile}{" "}
                  </Text>
                  <Vault
                    height={uiStore.iconSizeSmall}
                    width={uiStore.iconSizeSmall * 1.15}
                  />
                </View>
              </View>
              <GenericFlatButton
                onPress={() => {
                  vibration({ style: "light" });
                  setShowUpgrades(true);
                }}
              >
                <Text style={styles.textCenter}>
                  {`View\nUpgrades `}({investment.upgrades.length})
                </Text>
              </GenericFlatButton>
            </View>

            {!madeInvestment ? (
              <Pressable
                onPress={purchaseInvestmentCheck}
                disabled={!playerState || playerState.gold < investment.cost}
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
                      <Coins
                        width={uiStore.iconSizeSmall}
                        height={uiStore.iconSizeSmall}
                      />
                    </View>
                  </View>
                )}
              </Pressable>
            ) : (
              <Pressable
                onPress={collectOnInvestment}
                disabled={
                  !madeInvestment || madeInvestment.currentGoldStockPile === 0
                }
                style={styles.mxAuto}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      styles.roundedBorder,
                      styles.px8,
                      styles.py4,
                      pressed && styles.pressedStyle,
                      madeInvestment && madeInvestment.currentGoldStockPile > 0
                        ? styles.activeButton
                        : styles.disabledButton,
                    ]}
                  >
                    <Text style={styles.textCenter}>Collect</Text>
                    <View style={[styles.rowCenter, styles.itemsCenter]}>
                      <Text>
                        {asReadableGold(
                          madeInvestment?.currentGoldStockPile || 0,
                        )}{" "}
                      </Text>
                      <Coins
                        width={uiStore.iconSizeSmall}
                        height={uiStore.iconSizeSmall}
                      />
                    </View>
                  </View>
                )}
              </Pressable>
            )}
          </ThemedView>
        </Animated.View>
      </>
    );
  },
);

export default InvestmentCard;
