import { Pressable, View } from "react-native";
import { View as ThemedView, Text } from "./Themed";
import GearStatsDisplay from "./GearStatsDisplay";
import { useColorScheme } from "nativewind";
import { useVibration } from "../utility/customHooks";
import { router } from "expo-router";
import { toTitleCase } from "../utility/functions/misc/words";
import { Item } from "../classes/item";
import { useContext } from "react";
import { Shop } from "../classes/shop";
import { asReadableGold } from "../utility/functions/misc/numbers";
import SpellDetails from "./SpellDetails";
import GenericFlatButton from "./GenericFlatButton";
import { convertMasteryToString } from "../utility/spellHelper";
import { AppContext } from "../app/_layout";
import { Coins } from "../assets/icons/SVGIcons";

type BaseProps = {
  displayItem: {
    item: Item;
    count: number;
    positon: {
      left: number;
      top: number;
    };
  };
  clearItem: () => void;
  topGuard?: number;
  topOffset?: number;
  leftOffset?: number;
};

type DungeonProps = BaseProps & {
  addItemToPouch: (item: Item) => void;
};

type ShopProps = BaseProps & {
  shop: Shop;
  sellItem: (item: Item) => void;
  sellStack: (item: Item) => void;
};

type ShopKeeperProps = BaseProps & {
  shop: Shop;
  purchaseItem: () => void;
};

type StatsDisplayProps = BaseProps | DungeonProps | ShopProps | ShopKeeperProps;

export function StatsDisplay({
  displayItem,
  clearItem,
  topOffset,
  topGuard,
  leftOffset,
  ...props
}: StatsDisplayProps) {
  const { colorScheme } = useColorScheme();
  const vibration = useVibration();

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing contexts");
  const { playerState, dimensions } = appData;

  const SaleSection = () => {
    if (playerState) {
      if ("sellItem" in props) {
        const { shop, sellItem, sellStack } = props;
        const itemPrice = displayItem.item.getSellPrice(
          shop.shopKeeper.affection,
        );
        const isDisabled = shop.currentGold < itemPrice;
        return (
          <>
            <View className="flex flex-row py-1">
              <Text>
                {asReadableGold(
                  displayItem.item.getSellPrice(shop.shopKeeper.affection) *
                    (displayItem.count ?? 1),
                )}
              </Text>
              <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            </View>
            {displayItem.count && displayItem.count > 1 ? (
              <>
                <GenericFlatButton
                  onPressFunction={() => {
                    sellItem(displayItem.item), clearItem();
                  }}
                  disabledCondition={isDisabled}
                >
                  <Text
                    className={
                      isDisabled ? "opacity-50 text-center" : "text-center"
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
                  disabledCondition={isDisabled}
                  className="mt-1"
                >
                  <Text
                    className={
                      isDisabled ? "opacity-50 text-center" : "text-center"
                    }
                  >
                    Sell All
                  </Text>
                </GenericFlatButton>
              </>
            ) : (
              <GenericFlatButton
                onPressFunction={() => {
                  props.sellItem(displayItem.item);
                  clearItem();
                }}
                disabledCondition={isDisabled}
              >
                <Text
                  className={
                    isDisabled ? "opacity-50 text-center" : "text-center"
                  }
                >
                  Sell
                </Text>
              </GenericFlatButton>
            )}
          </>
        );
      } else if ("purchaseItem" in props) {
        const { shop, purchaseItem } = props;
        const itemPrice = displayItem.item.getBuyPrice(
          shop.shopKeeper.affection,
        );
        const isDisabled = playerState.gold < itemPrice;
        return (
          <>
            <View className="flex flex-row py-1">
              <Text>
                {asReadableGold(
                  displayItem.item.getBuyPrice(shop.shopKeeper.affection) *
                    (displayItem.count ?? 1),
                )}
              </Text>
              <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            </View>
            <GenericFlatButton
              onPressFunction={() => purchaseItem()}
              disabledCondition={isDisabled}
            >
              <Text
                className={
                  isDisabled ? "opacity-50 text-center" : "text-center"
                }
              >
                Buy Item
              </Text>
            </GenericFlatButton>
          </>
        );
      } else if ("addItemToPouch" in props) {
        return (
          <GenericFlatButton
            onPressFunction={() => {
              props.addItemToPouch(displayItem.item);
              clearItem();
              playerState?.removeFromInventory(displayItem.item);
            }}
          >
            Drop
          </GenericFlatButton>
        );
      }
    }
  };

  function bookItemLabel() {
    if (playerState) {
      const spellRes = displayItem.item.getAttachedSpell(
        playerState.playerClass,
      );
      return `${convertMasteryToString[spellRes.proficiencyNeeded]} level book`;
    }
  }

  return (
    <ThemedView
      className="items-center rounded-md border border-zinc-600 p-4"
      style={
        displayItem.item.itemClass == "book"
          ? {
              backgroundColor:
                colorScheme == "light"
                  ? "rgba(250, 250, 250, 0.98)"
                  : "rgba(20, 20, 20, 0.95)",
              left: 20,
              top:
                topGuard &&
                displayItem.positon.top +
                  (topOffset ?? 0) -
                  ("shop" in props ? 200 : 100) <
                  topGuard
                  ? topGuard
                  : displayItem.positon.top +
                    (topOffset ?? 0) -
                    ("shop" in props ? 200 : 100),
            }
          : {
              backgroundColor:
                colorScheme == "light"
                  ? "rgba(250, 250, 250, 0.98)"
                  : "rgba(20, 20, 20, 0.95)",
              left: displayItem.positon.left
                ? displayItem.positon.left <
                  dimensions.width * 0.6 + (leftOffset ?? 0)
                  ? displayItem.positon.left + 50 + (leftOffset ?? 0)
                  : displayItem.positon.left -
                    dimensions.width / 3 +
                    (leftOffset ?? 0)
                : undefined,
              top:
                topGuard &&
                displayItem.positon.top + (topOffset ?? 0) < topGuard
                  ? topGuard
                  : displayItem.positon.top + (topOffset ?? 0),
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
        <Text className="text-center">
          {toTitleCase(displayItem.item.name)}
        </Text>
      </View>
      {displayItem.item.stats && displayItem.item.slot ? (
        <View className="py-2">
          <GearStatsDisplay stats={displayItem.item.stats} />
        </View>
      ) : null}
      {(displayItem.item.slot == "one-hand" ||
        displayItem.item.slot == "two-hand" ||
        displayItem.item.slot == "off-hand") && (
        <Text className="text-sm italic">
          {toTitleCase(displayItem.item.slot)}
        </Text>
      )}
      <Text className="text-sm italic">
        {displayItem.item.itemClass == "bodyArmor"
          ? "Body Armor"
          : displayItem.item.itemClass == "book" && playerState
          ? bookItemLabel()
          : toTitleCase(displayItem.item.itemClass)}
      </Text>
      {displayItem.item.itemClass == "book" && playerState ? (
        <>
          <View className="px-2 mx-auto">
            <SpellDetails
              spell={displayItem.item.getAttachedSpell(playerState.playerClass)}
            />
          </View>
          {!("purchaseItem" in props) && (
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                clearItem();
                router.push("/Study");
              }}
              className="-mx-4 mt-2 w-1/2 rounded-xl border border-zinc-900 px-2 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text className="text-center">Study This Book</Text>
            </Pressable>
          )}
        </>
      ) : null}
      <SaleSection />
    </ThemedView>
  );
}
