import { LayoutChangeEvent, Pressable, View } from "react-native";
import { Text } from "./Themed";
import GearStatsDisplay from "./GearStatsDisplay";
import { useColorScheme } from "nativewind";
import { useVibration } from "../utility/customHooks";
import { router } from "expo-router";
import { Item } from "../classes/item";
import { useContext, useEffect, useState } from "react";
import { Shop } from "../classes/shop";
import { asReadableGold, toTitleCase } from "../utility/functions/misc";
import SpellDetails from "./SpellDetails";
import GenericFlatButton from "./GenericFlatButton";
import { AppContext } from "../app/_layout";
import {
  Coins,
  DexterityIcon,
  Energy,
  HealthIcon,
  IntelligenceIcon,
  Sanity,
  StrengthIcon,
} from "../assets/icons/SVGIcons";
import { Attribute, ItemClassType, MasteryToString } from "../utility/types";
import GenericModal from "./GenericModal";
import GenericStrikeAround from "./GenericStrikeAround";
import { Condition } from "../classes/conditions";
import { DungeonContext } from "./DungeonComponents/DungeonContext";
import { enemyTurn } from "./DungeonComponents/DungeonInteriorFunctions";

type BaseProps = {
  displayItem: {
    item: Item[];
    side?: "shop" | "inventory";
    positon: {
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
  const { colorScheme } = useColorScheme();
  const vibration = useVibration();

  const dungeonData = useContext(DungeonContext);
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { playerState, dimensions } = appData;
  const [viewWidth, setViewWidth] = useState(dimensions.width * 0.4);
  const [viewHeight, setViewHeight] = useState(dimensions.height * 0.2);
  const [blockSize, setBlockSize] = useState<number>();
  const [showingAttacks, setShowingAttacks] = useState<boolean>(false);
  const [firstItem, setFirstItem] = useState<Item>(displayItem.item[0]);

  useEffect(() => {
    if (dimensions.width === dimensions.lesser) {
      const blockSize = Math.min(dimensions.height / 5, dimensions.width / 7.5);
      setBlockSize(blockSize);
    } else {
      const blockSize = dimensions.width / 14;
      setBlockSize(blockSize);
    }
  }, [dimensions.height]);

  useEffect(() => {
    setFirstItem(displayItem.item[0]);
  }, [displayItem, displayItem.item.length]);

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
        <View className="flex items-center p-1 rounded-lg border border-red-700">
          <Text>Requires:</Text>
          {reqs.strength && (
            <View className="flex flex-row items-center justify-evenly">
              <Text
                className="text-sm"
                style={{ color: playerMeetsStrength ? "#22c55e" : "#b91c1c" }}
              >
                {reqs.strength}
              </Text>
              <StrengthIcon height={14} width={16} />
            </View>
          )}
          {reqs.intelligence && (
            <View className="flex flex-row items-center justify-evenly">
              <Text
                className="text-sm pr-1"
                style={{
                  color: playerMeetsIntelligence ? "#22c55e" : "#b91c1c",
                }}
              >
                {reqs.intelligence}
              </Text>
              <IntelligenceIcon height={14} width={16} />
            </View>
          )}
          {reqs.dexterity && (
            <View className="flex flex-row items-center justify-evenly">
              <Text
                className="text-sm pr-1"
                style={{ color: playerMeetsDexterity ? "#22c55e" : "#b91c1c" }}
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

  const SaleSection = () => {
    if (playerState) {
      if ("shop" in props) {
        const { shop, sellItem, sellStack } = props;
        if (displayItem.side == "inventory") {
          const itemPrice = firstItem.getSellPrice(shop.shopKeeper.affection);
          const stackPrice = itemPrice * displayItem.item.length;
          const singleIsDisabled = shop.currentGold < itemPrice;
          const stackIsDisabled = shop.currentGold < stackPrice;
          return (
            <>
              <View className="flex flex-row py-1">
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
                    onPressFunction={() => {
                      sellItem(firstItem), clearItem();
                    }}
                    disabledCondition={singleIsDisabled}
                  >
                    <Text
                      className={
                        singleIsDisabled
                          ? "opacity-50 text-center"
                          : "text-center"
                      }
                    >
                      Sell One
                    </Text>
                  </GenericFlatButton>
                  <GenericFlatButton
                    onPressFunction={() => {
                      sellStack(displayItem.item);
                      clearItem();
                    }}
                    disabledCondition={stackIsDisabled}
                    className="mt-1"
                  >
                    <Text
                      className={
                        stackIsDisabled
                          ? "opacity-50 text-center"
                          : "text-center"
                      }
                    >
                      Sell All
                    </Text>
                  </GenericFlatButton>
                </>
              ) : (
                <GenericFlatButton
                  onPressFunction={() => {
                    props.sellItem(firstItem);
                    clearItem();
                  }}
                  disabledCondition={singleIsDisabled}
                >
                  <Text
                    className={
                      singleIsDisabled
                        ? "opacity-50 text-center"
                        : "text-center"
                    }
                  >
                    Sell
                  </Text>
                </GenericFlatButton>
              )}
            </>
          );
        } else if (displayItem.side == "shop") {
          const { shop, purchaseItem, purchaseStack } = props;
          const itemPrice = firstItem.getBuyPrice(shop.shopKeeper.affection);
          const stackPrice = itemPrice * displayItem.item.length;
          const singleIsDisabled = playerState.gold < itemPrice;
          const stackIsDisabled = playerState.gold < stackPrice;
          return (
            <>
              <View className="flex flex-row py-1">
                <Text>
                  {asReadableGold(
                    firstItem.getBuyPrice(shop.shopKeeper.affection) *
                      displayItem.item.length,
                  )}
                </Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
              <GenericFlatButton
                onPressFunction={() => purchaseItem(firstItem)}
                disabledCondition={singleIsDisabled}
              >
                <Text
                  className={
                    singleIsDisabled ? "opacity-50 text-center" : "text-center"
                  }
                >
                  Buy {displayItem.item.length == 1 ? "Item" : "One"}
                </Text>
              </GenericFlatButton>
              {displayItem.item.length > 1 && (
                <GenericFlatButton
                  onPressFunction={() => purchaseStack(displayItem.item)}
                  disabledCondition={stackIsDisabled}
                  className="pt-1"
                >
                  <Text
                    className={
                      stackIsDisabled ? "opacity-50 text-center" : "text-center"
                    }
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
          <View className="pt-1">
            <GenericFlatButton
              onPressFunction={() => {
                props.addItemToPouch(displayItem.item);
                clearItem();
                playerState?.removeFromInventory(firstItem);
              }}
            >
              Drop
            </GenericFlatButton>
            {displayItem.item.length > 1 && (
              <GenericFlatButton
                className="pt-1"
                onPressFunction={() => {
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
  };

  const ConsumableSection = () => {
    const effect = firstItem.effect;
    if (!effect) return;
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
                className={`${
                  effect.stat == "health"
                    ? "bg-red-200 dark:bg-red-900"
                    : effect.stat == "mana"
                    ? "bg-blue-200 dark:bg-blue-900"
                    : "bg-purple-200 dark:bg-purple-900"
                } rounded-md p-1`}
              >
                <Text className="text-center ">
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
            {!!playerState?.inventory.find((invItem) =>
              invItem.equals(firstItem),
            ) && (
              <GenericFlatButton
                onPressFunction={() => {
                  if (dungeonData) {
                    firstItem.use(() => enemyTurn({ appData, dungeonData }));
                  } else {
                    firstItem.use();
                  }
                  clearItem();
                }}
                className="pt-1"
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
                className={`${
                  effect.stat == "health"
                    ? "bg-red-200 dark:bg-red-900"
                    : effect.stat == "mana"
                    ? "bg-blue-200 dark:bg-blue-900"
                    : "bg-purple-200 dark:bg-purple-900"
                } rounded-md p-1`}
              >
                <Text className="text-center ">
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
            {!!playerState?.inventory.find((invItem) =>
              invItem.equals(firstItem),
            ) && (
              <GenericFlatButton
                onPressFunction={() => {
                  firstItem.use();
                  clearItem();
                }}
                className="pt-1"
              >
                Apply
              </GenericFlatButton>
            )}
          </View>
        );

      default:
        return;
    }
  };

  function bookItemLabel() {
    if (playerState && firstItem.attachedSpell) {
      return `${
        MasteryToString[firstItem.attachedSpell.proficiencyNeeded]
      } level book`;
    }
  }
  const onLayoutView = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewWidth(width);
    setViewHeight(height);
  };

  while (!blockSize) {
    return <></>;
  }

  return (
    <>
      <GenericModal
        isVisibleCondition={showingAttacks}
        backFunction={() => setShowingAttacks(false)}
      >
        <View>
          {playerState &&
            firstItem.attachedAttacks.map((attack) => (
              <View key={`${firstItem.id}-${attack.name}`}>
                {attack.AttackRender(firstItem.stats?.damage)}
              </View>
            ))}
        </View>
      </GenericModal>
      <View
        className="items-center rounded-md border border-zinc-600 p-4"
        onLayout={onLayoutView}
        style={
          firstItem.itemClass == ItemClassType.Book
            ? {
                backgroundColor:
                  colorScheme == "light"
                    ? "rgba(250, 250, 250, 0.98)"
                    : "rgba(20, 20, 20, 0.95)",
                left: 20,
                top:
                  topGuard &&
                  displayItem.positon.top + (topOffset ?? 0) < topGuard
                    ? topGuard
                    : viewHeight + displayItem.positon.top < dimensions.height
                    ? displayItem.positon.top + (topOffset ?? 0)
                    : dimensions.height - (viewHeight + 20),
              }
            : {
                width: dimensions.width * 0.4,
                backgroundColor:
                  colorScheme == "light"
                    ? "rgba(250, 250, 250, 0.98)"
                    : "rgba(20, 20, 20, 0.95)",
                left:
                  displayItem.positon.left + blockSize < dimensions.width * 0.6
                    ? displayItem.positon.left + blockSize
                    : displayItem.positon.left - viewWidth - 4,
                top:
                  topGuard &&
                  displayItem.positon.top + (topOffset ?? 0) < topGuard
                    ? topGuard
                    : viewHeight + displayItem.positon.top <
                      dimensions.height - tabBarHeight
                    ? displayItem.positon.top + (topOffset ?? 0)
                    : dimensions.height - (viewHeight + tabBarHeight),
              }
        }
      >
        <Pressable
          onPress={() => clearItem()}
          className="absolute right-0 border-zinc-600 rounded-tr rounded-bl dark:border-zinc-400 px-2 py-1"
        >
          <Text className="-mt-3 -ml-1 text-2xl">x</Text>
        </Pressable>
        <View>
          <Text className="text-center">{toTitleCase(firstItem.name)}</Text>
        </View>
        <RequirementsBlock />
        {(firstItem.slot == "one-hand" ||
          firstItem.slot == "two-hand" ||
          firstItem.slot == "off-hand") && (
          <GenericStrikeAround className="text-sm">
            {toTitleCase(firstItem.slot)}
          </GenericStrikeAround>
        )}
        <GenericStrikeAround className="text-sm">
          {firstItem.itemClass == "bodyArmor"
            ? "Body Armor"
            : firstItem.itemClass == "book" && playerState
            ? bookItemLabel()
            : toTitleCase(firstItem.itemClass)}
        </GenericStrikeAround>
        {firstItem.stats && firstItem.slot && (
          <View className="py-2">
            <GearStatsDisplay stats={firstItem.stats} />
          </View>
        )}
        {firstItem.activePoison && (
          <View className="rounded-md p-1 bg-[#A5D6A7] dark:bg-[#388E3C]">
            {firstItem.activePoison instanceof Condition ? (
              <View></View>
            ) : (
              <Text className="text-center">
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
            className="pt-1"
            onPressFunction={() => setShowingAttacks(true)}
          >
            Show attacks
          </GenericFlatButton>
        )}
        {firstItem.attachedSpell ? (
          <>
            <View className="px-2 mx-auto">
              <SpellDetails spell={firstItem.attachedSpell} />
            </View>
            {!("purchaseItem" in props || "addItemToPouch" in props) && (
              <GenericFlatButton
                onPressFunction={() => {
                  vibration({ style: "light" });
                  clearItem();
                  router.push("/Study");
                }}
                className="mt-2"
              >
                Study This Book
              </GenericFlatButton>
            )}
          </>
        ) : null}
        <ConsumableSection />
        <SaleSection />
      </View>
    </>
  );
}
