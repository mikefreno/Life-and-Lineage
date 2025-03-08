import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text, CursiveText, HandwrittenText, CursiveTextBold } from "./Themed";
import GearStatsDisplay from "./GearStatsDisplay";
import { useRouter } from "expo-router";
import { asReadableGold, toTitleCase } from "../utility/functions/misc";
import SpellDetails from "./SpellDetails";
import GenericFlatButton from "./GenericFlatButton";
import {
  Coins,
  DexterityIcon,
  Energy,
  HealthIcon,
  IntelligenceIcon,
  Sanity,
  StrengthIcon,
} from "../assets/icons/SVGIcons";
import {
  Attribute,
  ItemClassType,
  MasteryToString,
  RarityAsString,
} from "../utility/types";
import GenericModal from "./GenericModal";
import GenericStrikeAround from "./GenericStrikeAround";
import type { Item } from "../entities/item";
import { useVibration } from "../hooks/generic";
import { useRootStore } from "../hooks/stores";
import { Condition } from "../entities/conditions";
import { useEnemyManagement } from "../hooks/combat";
import type { Shop } from "../entities/shop";
import Colors, { rarityColors } from "../constants/Colors";
import { tw, useStyles } from "../hooks/styles";

type BaseProps = {
  displayItem: {
    item: Item[];
    side?: "shop" | "inventory" | "stash";
    position: {
      left: number;
      top: number;
    };
  };
  clearItem: () => void;
  topGuard?: number;
  topOffset?: number;
  tabBarHeight?: number;
};

type DungeonProps = BaseProps & {
  addItemToPouch: (items: Item[]) => void;
};

type ShopProps = BaseProps & {
  purchaseItem: (item: Item) => void;
  purchaseStack: (items: Item[]) => void;
  shop: Shop;
  sellItem: (item: Item) => void;
  sellStack: (items: Item[]) => void;
};

type StatsDisplayProps = BaseProps | DungeonProps | ShopProps;

export function StatsDisplay({
  displayItem,
  clearItem,
  topOffset,
  topGuard,
  tabBarHeight = 20,
  ...props
}: StatsDisplayProps) {
  const styles = useStyles();
  const vibration = useVibration();
  const { playerState, enemyStore, uiStore } = useRootStore();
  const { dimensions, itemBlockSize, colorScheme } = uiStore;
  const theme = Colors[colorScheme];

  const [viewWidth, setViewWidth] = useState(dimensions.width * 0.4);
  const [viewHeight, setViewHeight] = useState(dimensions.height * 0.2);
  const [showingAttacks, setShowingAttacks] = useState<boolean>(false);
  const [firstItem, setFirstItem] = useState<Item>(displayItem.item[0]);
  const [renderStory, setRenderStory] = useState<string | null>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const router = useRouter();

  const animatedLeft = useRef(
    new Animated.Value(uiStore.dimensions.width / 3),
  ).current;
  const animatedTop = useRef(
    new Animated.Value(uiStore.dimensions.height / 3),
  ).current;

  const animatedScale = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pad = 4;
    const targetLeft =
      firstItem.itemClass == ItemClassType.Book
        ? Dimensions.get("window").width * 0.125 - 20
        : displayItem.position.left + itemBlockSize < dimensions.width * 0.6
        ? displayItem.position.left + itemBlockSize + pad
        : displayItem.position.left - viewWidth - pad;

    const targetTop =
      topGuard && displayItem.position.top + (topOffset ?? 0) < topGuard
        ? topGuard
        : viewHeight + displayItem.position.top <
          dimensions.height - tabBarHeight
        ? displayItem.position.top + (topOffset ?? 0)
        : dimensions.height - (viewHeight + tabBarHeight);

    if (isFirstRender) {
      animatedLeft.setValue(targetLeft);
      animatedTop.setValue(targetTop);

      Animated.parallel([
        Animated.spring(animatedScale, {
          toValue: 1,
          useNativeDriver: false,
          tension: 200,
          friction: 20,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setIsFirstRender(false);
      });
    } else if (uiStore.reduceMotion) {
      animatedLeft.setValue(targetLeft);
      animatedTop.setValue(targetTop);
    } else {
      Animated.spring(animatedLeft, {
        toValue: targetLeft,
        useNativeDriver: false,
        tension: 100,
        friction: 20,
      }).start();

      Animated.spring(animatedTop, {
        toValue: targetTop,
        useNativeDriver: false,
        tension: 100,
        friction: 20,
      }).start();
    }
  }, [displayItem.position, viewWidth, viewHeight, isFirstRender]);

  useEffect(() => {
    setFirstItem(displayItem.item[0]);
  }, [displayItem, displayItem.item.length]);

  const onLayoutView = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewWidth(width);
    setViewHeight(height);
  };

  interface TextSection {
    text: string;
    meta: boolean;
    largeMeta: boolean;
    emphasized: boolean;
  }
  const StoryItemDescriptionRender = ({ item }: { item: Item }) => {
    if (!item.description) {
      throw Error(`Missing description on story item: ${item.name}`);
    }
    const fontMatch = item.description.match(/<Font>(.*?)<\/Font>/);
    const font = fontMatch ? fontMatch[1].toLowerCase() : null;
    const cleanText = item.description.replace(/<Font>.*?<\/Font>/, "");

    const lines = cleanText.split(/\n/);
    const sections: TextSection[] = [];
    let currentSection = "";
    let inMeta = false;
    let metaBuffer = "";
    let isLargeMeta = false;

    lines.forEach((line) => {
      if (
        (line.startsWith("**") && line.endsWith("**")) ||
        (line.startsWith("*") && line.endsWith("*"))
      ) {
        if (currentSection) {
          sections.push({
            text: currentSection.trim(),
            meta: false,
            emphasized: false,
            largeMeta: false,
          });
          currentSection = "";
        }
        const isDouble = line.startsWith("**");
        sections.push({
          text: line.slice(isDouble ? 2 : 1, isDouble ? -2 : -1),
          meta: true,
          emphasized: false,
          largeMeta: isDouble,
        });
        return;
      }

      if ((line.startsWith("**") || line.startsWith("*")) && !inMeta) {
        if (currentSection) {
          sections.push({
            text: currentSection.trim(),
            meta: false,
            emphasized: false,
            largeMeta: false,
          });
          currentSection = "";
        }
        inMeta = true;
        isLargeMeta = line.startsWith("**");
        metaBuffer = line.slice(isLargeMeta ? 2 : 1);
        return;
      }

      if (
        (line.endsWith("**") && isLargeMeta) ||
        (line.endsWith("*") && !isLargeMeta && inMeta)
      ) {
        inMeta = false;
        sections.push({
          text: metaBuffer + "\n" + line.slice(0, isLargeMeta ? -2 : -1),
          meta: true,
          emphasized: false,
          largeMeta: isLargeMeta,
        });
        metaBuffer = "";
        isLargeMeta = false;
        return;
      }

      if (inMeta) {
        metaBuffer += "\n" + line;
        return;
      }

      if (line === "") {
        if (currentSection) {
          sections.push({
            text: currentSection.trim(),
            meta: false,
            emphasized: false,
            largeMeta: false,
          });
          currentSection = "";
        }
      } else {
        currentSection += (currentSection ? "\n" : "") + line;
      }
    });

    if (currentSection) {
      sections.push({
        text: currentSection.trim(),
        meta: false,
        emphasized: false,
        largeMeta: false,
      });
    }

    return (
      <View style={styles.storyContainer}>
        <View style={styles.storyHeaderContainer}>
          <Text
            style={{ marginLeft: -16, marginRight: 16, ...styles["text-xl"] }}
          >
            {toTitleCase(item.name)}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            vibration({ style: "light" });
            setRenderStory(null);
          }}
          style={[
            styles.closeButton,
            {
              [displayItem.position.left + itemBlockSize <
              dimensions.width * 0.6
                ? "left"
                : "right"]: 0,
            },
          ]}
        >
          <Text style={{ fontSize: 36 }}>x</Text>
        </Pressable>
        {sections.map((section, idx) => {
          if (section.meta) {
            return (
              <Text
                key={idx}
                style={[
                  { textAlign: "center" },
                  tw.py1,
                  section.largeMeta && styles["text-xl"],
                ]}
              >
                [{section.text}]
              </Text>
            );
          } else {
            return (
              <View key={idx} style={tw.py2}>
                {section.text.split("\n").map((paragraph, pIdx) => (
                  <Text key={pIdx} style={tw.mb2}>
                    {paragraph
                      .split(/(<em>.*?<\/em>)/g)
                      .map((part, partIdx) => {
                        const isEmphasized =
                          part.startsWith("<em>") && part.endsWith("</em>");
                        const cleanPart = isEmphasized
                          ? part.replace("<em>", "").replace("</em>", "")
                          : part;

                        if (isEmphasized) {
                          if (font == "cursive") {
                            return (
                              <CursiveTextBold
                                key={partIdx}
                                style={{ fontSize: 48, letterSpacing: 2 }}
                              >
                                {cleanPart}
                              </CursiveTextBold>
                            );
                          } else {
                            return (
                              <HandwrittenText
                                key={partIdx}
                                style={{ fontSize: 30 }}
                              >
                                {cleanPart}
                              </HandwrittenText>
                            );
                          }
                        } else {
                          if (font == "cursive") {
                            return (
                              <CursiveText
                                key={partIdx}
                                style={{ fontSize: 36, letterSpacing: 2 }}
                              >
                                {cleanPart}
                              </CursiveText>
                            );
                          } else {
                            return (
                              <HandwrittenText
                                key={partIdx}
                                style={{ fontSize: 30 }}
                              >
                                {cleanPart}
                              </HandwrittenText>
                            );
                          }
                        }
                      })}
                  </Text>
                ))}
              </View>
            );
          }
        })}
      </View>
    );
  };

  const RequirementsBlock = () => {
    const reqs = firstItem.requirements;
    if ((reqs.intelligence || reqs.strength || reqs.dexterity) && playerState) {
      const playerMeetsStrength =
        reqs.strength &&
        reqs.strength <=
          playerState.baseStrength +
            playerState.allocatedSkillPoints[Attribute.strength];
      const playerMeetsIntelligence =
        reqs.intelligence &&
        reqs.intelligence <=
          playerState.baseIntelligence +
            playerState.allocatedSkillPoints[Attribute.intelligence];
      const playerMeetsDexterity =
        reqs.dexterity &&
        reqs.dexterity <=
          playerState.baseDexterity +
            playerState.allocatedSkillPoints[Attribute.dexterity];
      if (firstItem.playerHasRequirements) return null;
      return (
        <View
          style={[
            styles.consumableEffectContainer,
            { borderColor: theme.error, borderWidth: 1 },
          ]}
        >
          <Text>Requires:</Text>
          {reqs.strength && (
            <View
              style={[styles.rowCenter, { justifyContent: "space-evenly" }]}
            >
              <Text
                style={{
                  color: playerMeetsStrength ? theme.success : theme.error,
                }}
              >
                {reqs.strength}
              </Text>
              <StrengthIcon height={14} width={16} />
            </View>
          )}
          {reqs.intelligence && (
            <View
              style={[styles.rowCenter, { justifyContent: "space-evenly" }]}
            >
              <Text
                style={{
                  color: playerMeetsIntelligence ? theme.success : theme.error,
                }}
              >
                {reqs.intelligence}
              </Text>
              <IntelligenceIcon height={14} width={16} />
            </View>
          )}
          {reqs.dexterity && (
            <View
              style={[styles.rowCenter, { justifyContent: "space-evenly" }]}
            >
              <Text
                style={{
                  color: playerMeetsDexterity ? theme.success : theme.error,
                }}
              >
                {reqs.dexterity}
              </Text>
              <DexterityIcon height={14} width={16} />
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  const ConsumableSection = () => {
    const effect = firstItem.effect;
    if (!effect) return null;

    switch (firstItem.itemClass) {
      case ItemClassType.Potion:
        return (
          <View>
            {"condition" in effect ? (
              <View>
                <Text>Provides {toTitleCase(effect.condition.name)}</Text>
              </View>
            ) : (
              <View
                style={
                  effect.stat === "health"
                    ? styles.healthEffectContainer
                    : effect.stat === "mana"
                    ? styles.manaEffectContainer
                    : styles.sanityEffectContainer
                }
              >
                <Text style={{ textAlign: "center" }}>
                  Heals{" "}
                  {effect.stat == "health" ? (
                    <HealthIcon height={14} width={14} />
                  ) : effect.stat == "mana" ? (
                    <Energy height={14} width={14} />
                  ) : (
                    <Sanity width={14} height={14} />
                  )}{" "}
                  for {effect.amount.min} to {effect.amount.max} points.
                </Text>
              </View>
            )}
            {!!playerState?.baseInventory.find((invItem) =>
              invItem.equals(firstItem),
            ) && (
              <GenericFlatButton
                onPress={() => {
                  if (enemyStore.enemies.length > 0) {
                    const { enemyTurn } = useEnemyManagement();
                    firstItem.use(enemyTurn);
                  } else {
                    firstItem.use();
                  }
                  clearItem();
                }}
                style={tw.pt1}
              >
                Drink
              </GenericFlatButton>
            )}
          </View>
        );
      case ItemClassType.Poison:
        return (
          <View>
            {"condition" in effect ? (
              <View>
                <Text>Provides {toTitleCase(effect.condition.name)}</Text>
              </View>
            ) : (
              <View
                style={
                  effect.stat === "health"
                    ? styles.healthEffectContainer
                    : effect.stat === "mana"
                    ? styles.manaEffectContainer
                    : styles.sanityEffectContainer
                }
              >
                <Text style={{ textAlign: "center" }}>
                  Deals {effect.amount.min} to {effect.amount.max} points of{" "}
                  {effect.stat == "health" ? (
                    <HealthIcon height={14} width={14} />
                  ) : effect.stat == "mana" ? (
                    <Energy height={14} width={14} />
                  ) : (
                    <Sanity width={14} height={14} />
                  )}{" "}
                  damage.
                </Text>
              </View>
            )}
            {!!playerState?.baseInventory.find((invItem) =>
              invItem.equals(firstItem),
            ) && (
              <GenericFlatButton
                onPress={() => {
                  firstItem.use();
                  clearItem();
                }}
                style={tw.pt1}
              >
                Apply
              </GenericFlatButton>
            )}
          </View>
        );
      default:
        return null;
    }
  };
  const ItemTypeLabel = (item: Item) => {
    if (item.itemClass == ItemClassType.BodyArmor) {
      return "Body Armor";
    }
    if (item.itemClass == ItemClassType.StoryItem) {
      return "Key Item";
    }
    if (item.itemClass == ItemClassType.Book) {
      return bookItemLabel();
    }
    return toTitleCase(item.itemClass);
  };
  function bookItemLabel() {
    if (playerState && firstItem.attachedSpell) {
      return `${
        MasteryToString[firstItem.attachedSpell.proficiencyNeeded]
      } level book`;
    }
  }
  const SaleSection = () => {
    if (playerState) {
      if ("shop" in props) {
        const { shop, sellItem, sellStack, purchaseItem, purchaseStack } =
          props;
        if (displayItem.side == "inventory") {
          const itemPrice = firstItem.getSellPrice(shop.shopKeeper.affection);
          const stackPrice = itemPrice * displayItem.item.length;
          const singleIsDisabled = shop.currentGold < itemPrice;
          const stackIsDisabled = shop.currentGold < stackPrice;
          return (
            <>
              <View style={[styles.rowCenter, tw.py1]}>
                <Text>
                  {asReadableGold(
                    firstItem.getSellPrice(shop.shopKeeper.affection) *
                      (displayItem.item.length ?? 1),
                  )}
                </Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
              {displayItem.item.length && displayItem.item.length > 1 ? (
                <>
                  <GenericFlatButton
                    onPress={() => {
                      sellItem(firstItem);
                      clearItem();
                    }}
                    disabled={singleIsDisabled}
                  >
                    <Text
                      style={[
                        { textAlign: "center" },
                        singleIsDisabled && { opacity: 0.5 },
                      ]}
                    >
                      Sell One
                    </Text>
                  </GenericFlatButton>
                  <GenericFlatButton
                    onPress={() => {
                      sellStack(displayItem.item);
                      clearItem();
                    }}
                    disabled={stackIsDisabled}
                    style={tw.mt1}
                  >
                    <Text
                      style={[
                        { textAlign: "center" },
                        stackIsDisabled && { opacity: 0.5 },
                      ]}
                    >
                      Sell All
                    </Text>
                  </GenericFlatButton>
                </>
              ) : (
                <GenericFlatButton
                  onPress={() => {
                    sellItem(firstItem);
                    clearItem();
                  }}
                  disabled={singleIsDisabled}
                >
                  <Text
                    style={[
                      { textAlign: "center" },
                      singleIsDisabled && { opacity: 0.5 },
                    ]}
                  >
                    Sell
                  </Text>
                </GenericFlatButton>
              )}
            </>
          );
        } else if (displayItem.side == "shop") {
          const itemPrice = firstItem.getBuyPrice(shop.shopKeeper.affection);
          const stackPrice = itemPrice * displayItem.item.length;
          const singleIsDisabled = playerState.gold < itemPrice;
          const stackIsDisabled = playerState.gold < stackPrice;
          return (
            <>
              <View style={[styles.rowCenter, tw.py1]}>
                <Text>
                  {asReadableGold(
                    firstItem.getBuyPrice(shop.shopKeeper.affection) *
                      displayItem.item.length,
                  )}
                </Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
              <GenericFlatButton
                onPress={() => purchaseItem(firstItem)}
                disabled={singleIsDisabled}
              >
                <Text
                  style={[
                    { textAlign: "center" },
                    singleIsDisabled && { opacity: 0.5 },
                  ]}
                >
                  Buy {displayItem.item.length == 1 ? "Item" : "One"}
                </Text>
              </GenericFlatButton>
              {displayItem.item.length > 1 && (
                <GenericFlatButton
                  onPress={() => purchaseStack(displayItem.item)}
                  disabled={stackIsDisabled}
                  style={tw.pt1}
                >
                  <Text
                    style={[
                      { textAlign: "center" },
                      stackIsDisabled && { opacity: 0.5 },
                    ]}
                  >
                    Buy All
                  </Text>
                </GenericFlatButton>
              )}
            </>
          );
        }
      } else if ("addItemToPouch" in props) {
        return (
          <View style={tw.pt1}>
            <GenericFlatButton
              onPress={() => {
                props.addItemToPouch(displayItem.item);
                clearItem();
                playerState?.removeFromInventory(firstItem);
              }}
            >
              Drop
            </GenericFlatButton>
            {displayItem.item.length > 1 && (
              <GenericFlatButton
                style={tw.pt1}
                onPress={() => {
                  props.addItemToPouch(displayItem.item);
                  playerState?.removeFromInventory(displayItem.item);
                  clearItem();
                }}
              >
                Drop All
              </GenericFlatButton>
            )}
          </View>
        );
      }
    }
    return null;
  };

  if (!itemBlockSize) {
    return null;
  }

  return (
    <View style={{ pointerEvents: "box-none", flex: 1 }}>
      <GenericModal
        isVisibleCondition={showingAttacks}
        backFunction={() => setShowingAttacks(false)}
      >
        <View>
          {playerState &&
            firstItem.attachedAttacks.map((attack) => (
              <View key={`${firstItem.id}-${attack.name}`}>
                {attack.AttackRender(styles, firstItem.totalDamage)}
              </View>
            ))}
        </View>
      </GenericModal>
      <GenericModal
        isVisibleCondition={!!renderStory}
        backFunction={() => setRenderStory(null)}
        size={95}
        noPad
        style={styles.storyModalContainer}
      >
        <ScrollView style={tw.px4}>
          <StoryItemDescriptionRender item={firstItem} />
        </ScrollView>
      </GenericModal>
      <Animated.View
        style={[
          styles.statsDisplayContainer,
          styles.soft,
          firstItem.itemClass == ItemClassType.Book
            ? {}
            : { width: dimensions.width * 0.4 },
          {
            backgroundColor:
              rarityColors[firstItem.rarity].background[colorScheme],
            left: animatedLeft,
            top: animatedTop,
            opacity: animatedOpacity,
            transform: [{ scale: animatedScale }, { perspective: 1000 }],
          },
        ]}
        onLayout={onLayoutView}
      >
        <Pressable
          onPress={() => clearItem()}
          style={{
            ...styles.raisedAbsolutePosition,
            ...styles.closeButton,
            top: 0,
            [displayItem.position.left + itemBlockSize < dimensions.width * 0.6
              ? "left"
              : "right"]: 0,
          }}
        >
          <Text style={{ marginTop: -8, marginLeft: 0, ...styles["text-2xl"] }}>
            x
          </Text>
        </Pressable>
        <View>
          <Text style={{ textAlign: "center" }}>
            {toTitleCase(firstItem.name)}
          </Text>
        </View>
        <RequirementsBlock />
        {firstItem.isEquippable &&
          firstItem.itemClass !== ItemClassType.Arrow && (
            <GenericStrikeAround>
              <Text
                style={{
                  color:
                    rarityColors[firstItem.rarity ?? 0].background[
                      uiStore.colorScheme == "light" ? "dark" : "light"
                    ],
                  ...styles["text-lg"],
                }}
              >
                {RarityAsString[firstItem.rarity]}
              </Text>
            </GenericStrikeAround>
          )}
        {(firstItem.slot == "one-hand" ||
          firstItem.slot == "two-hand" ||
          firstItem.slot == "off-hand") && (
          <GenericStrikeAround style={styles["text-sm"]}>
            {toTitleCase(firstItem.slot)}
          </GenericStrikeAround>
        )}
        <GenericStrikeAround style={styles["text-sm"]}>
          {ItemTypeLabel(firstItem)}
        </GenericStrikeAround>

        {firstItem.stats && firstItem.slot && (
          <View style={tw.py2}>
            <GearStatsDisplay item={firstItem} />
          </View>
        )}
        {firstItem.activePoison && (
          <View style={styles.poisonContainer}>
            {firstItem.activePoison instanceof Condition ? (
              <View />
            ) : (
              <Text style={{ textAlign: "center" }}>
                {firstItem.activePoison.effect == "health" ? (
                  <HealthIcon height={14} width={14} />
                ) : firstItem.activePoison.effect == "mana" ? (
                  <Energy height={14} width={14} />
                ) : (
                  <Sanity width={14} height={14} />
                )}{" "}
                poison active.
              </Text>
            )}
          </View>
        )}
        {firstItem.attachedAttacks.length > 0 && playerState && (
          <GenericFlatButton
            style={tw.pt1}
            onPress={() => setShowingAttacks(true)}
          >
            Show attacks
          </GenericFlatButton>
        )}
        {firstItem.attachedSpell && (
          <>
            <View style={tw.px2}>
              <SpellDetails spell={firstItem.attachedSpell} />
            </View>
            {!("purchaseItem" in props || "addItemToPouch" in props) && (
              <GenericFlatButton
                onPress={() => {
                  vibration({ style: "light" });
                  clearItem();
                  router.push("/spells");
                  router.push("/Study");
                }}
                style={tw.mt2}
              >
                Study This Book
              </GenericFlatButton>
            )}
          </>
        )}
        {displayItem.side == "stash" && (
          <GenericFlatButton
            onPress={() => {
              playerState?.root.stashStore.removeItem(displayItem.item);
              clearItem();
            }}
            style={tw.py2}
          >
            Add to Inventory
          </GenericFlatButton>
        )}
        {firstItem.itemClass == ItemClassType.StoryItem && (
          <GenericFlatButton
            onPress={() => {
              vibration({ style: "light" });
              setRenderStory(firstItem.description);
            }}
          >
            Inspect
          </GenericFlatButton>
        )}
        <ConsumableSection />
        <SaleSection />
      </Animated.View>
    </View>
  );
}
