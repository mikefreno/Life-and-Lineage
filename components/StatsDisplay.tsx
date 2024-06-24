import { Dimensions, Pressable, ScrollView, View } from "react-native";
import { View as ThemedView, Text } from "./Themed";
import GearStatsDisplay from "./GearStatsDisplay";
import { useColorScheme } from "nativewind";
import { useVibration } from "../utility/customHooks";
import { router } from "expo-router";
import { toTitleCase } from "../utility/functions/misc/words";
import { Item } from "../classes/item";
import { Dispatch, useContext } from "react";
import { Shop } from "../classes/shop";
import Coins from "../assets/icons/CoinsIcon";
import { asReadableGold } from "../utility/functions/misc/numbers";
import SpellDetails from "./SpellDetails";
import GenericFlatButton from "./GenericFlatButton";
import { PlayerCharacterContext } from "../app/_layout";
import {
  convertMasteryToString,
  getMasteryLevel,
} from "../utility/spellHelper";

type StatsDisplayBaseProps = {
  statsLeftPos: number;
  statsTopPos: number;
  item: Item;
  setShowingStats: Dispatch<React.SetStateAction<Item | null>>;
  location?: string;
  topGuard?: number;
  topOffset?: number;
  leftOffset?: number;
};

type StatsDisplayShopProps = StatsDisplayBaseProps & {
  location: "shop";
  playerInventory: true;
  shop: Shop;
};

type StatsDisplayShopKeeperProps = StatsDisplayBaseProps & {
  location: "shopkeeper";
  playerInventory: false;
  shop: Shop;
};

type StatsDisplayProps =
  | StatsDisplayBaseProps
  | StatsDisplayShopProps
  | StatsDisplayShopKeeperProps;

export function StatsDisplay({
  statsLeftPos,
  statsTopPos,
  item,
  setShowingStats,
  topOffset,
  topGuard,
  location,
  leftOffset,
  ...props
}: StatsDisplayProps) {
  const deviceWidth = Dimensions.get("window").width;
  const { colorScheme } = useColorScheme();
  const vibration = useVibration();

  const playerStateData = useContext(PlayerCharacterContext);
  if (!playerStateData) throw new Error("missing contexts");
  const { playerState } = playerStateData;

  const SaleSection = () => {
    if (playerState) {
      const purchaseItem = (itemPrice: number, shop: Shop) => {
        vibration({ style: "light" });
        playerState.buyItem(item, itemPrice);
        shop.sellItem(item, itemPrice);
        setShowingStats(null);
      };

      const sellItem = (itemPrice: number, shop: Shop) => {
        vibration({ style: "light" });
        shop.buyItem(item, itemPrice);
        playerState.sellItem(item, itemPrice);
        setShowingStats(null);
      };

      if (location == "shop") {
        const { shop } = props as StatsDisplayShopProps;
        const itemPrice = item.getSellPrice(shop.shopKeeper.affection);
        const isDisabled = shop.currentGold < itemPrice;
        return (
          <>
            <View className="flex flex-row py-1">
              <Text>
                {asReadableGold(item.getSellPrice(shop.shopKeeper.affection))}
              </Text>
              <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            </View>
            <GenericFlatButton
              onPressFunction={() => sellItem(itemPrice, shop)}
              textNode={
                <Text
                  className={
                    isDisabled ? "opacity-50 text-center" : "text-center"
                  }
                >
                  Sell Item
                </Text>
              }
              disabledCondition={isDisabled}
            />
          </>
        );
      } else if (location == "shopkeeper") {
        const { shop } = props as StatsDisplayShopKeeperProps;
        const itemPrice = item.getBuyPrice(shop.shopKeeper.affection);
        const isDisabled = playerState.gold < itemPrice;
        return (
          <>
            <View className="flex flex-row py-1">
              <Text>
                {asReadableGold(item.getBuyPrice(shop.shopKeeper.affection))}
              </Text>
              <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            </View>
            <GenericFlatButton
              onPressFunction={() => purchaseItem(itemPrice, shop)}
              textNode={
                <Text
                  className={
                    isDisabled ? "opacity-50 text-center" : "text-center"
                  }
                >
                  Buy Item
                </Text>
              }
              disabledCondition={isDisabled}
            />
          </>
        );
      }
    }
  };

  function bookItemLabel() {
    if (playerState) {
      const spellRes = item.getAttachedSpell(playerState.playerClass);
      return `${convertMasteryToString[spellRes.proficiencyNeeded]} level book`;
    }
  }

  return (
    <ThemedView
      className="absolute items-center rounded-md border border-zinc-600 py-4"
      style={
        item.itemClass == "book"
          ? {
              backgroundColor:
                colorScheme == "light"
                  ? "rgba(250, 250, 250, 0.98)"
                  : "rgba(20, 20, 20, 0.95)",
              left: 20,
              top:
                topGuard &&
                statsTopPos +
                  (topOffset ?? 0) -
                  (location == "shop" || location == "shopkeeper" ? 200 : 100) <
                  topGuard
                  ? topGuard
                  : statsTopPos +
                    (topOffset ?? 0) -
                    (location == "shop" || location == "shopkeeper"
                      ? 200
                      : 100),
            }
          : {
              width: deviceWidth / 3 - 2,
              backgroundColor:
                colorScheme == "light"
                  ? "rgba(250, 250, 250, 0.98)"
                  : "rgba(20, 20, 20, 0.95)",
              left: statsLeftPos
                ? statsLeftPos < deviceWidth * 0.6 + (leftOffset ?? 0)
                  ? statsLeftPos + 50 + (leftOffset ?? 0)
                  : statsLeftPos - deviceWidth / 3 + (leftOffset ?? 0)
                : undefined,
              top:
                topGuard && statsTopPos + (topOffset ?? 0) < topGuard
                  ? topGuard
                  : statsTopPos + (topOffset ?? 0),
            }
      }
    >
      <Pressable
        onPress={() => setShowingStats(null)}
        className="absolute right-1 -mt-2"
      >
        <Text className="text-3xl">x</Text>
      </Pressable>
      <View>
        <Text className="text-center">{toTitleCase(item.name)}</Text>
      </View>
      {item.stats && item.slot ? (
        <View className="py-2">
          <GearStatsDisplay stats={item.stats} />
        </View>
      ) : null}
      {(item.slot == "one-hand" ||
        item.slot == "two-hand" ||
        item.slot == "off-hand") && (
        <Text className="text-sm italic">{toTitleCase(item.slot)}</Text>
      )}
      <Text className="text-sm italic">
        {item.itemClass == "bodyArmor"
          ? "Body Armor"
          : item.itemClass == "book" && playerState
          ? bookItemLabel()
          : toTitleCase(item.itemClass)}
      </Text>
      {item.itemClass == "book" && playerState ? (
        <>
          <View className="px-2">
            <SpellDetails
              spell={item.getAttachedSpell(playerState.playerClass)}
            />
          </View>
          {location != "shopkeeper" && (
            <Pressable
              onPress={() => {
                vibration({ style: "light" });
                setShowingStats(null);
                router.push("/Study");
              }}
              className="-mx-4 mt-2 w-full rounded-xl border border-zinc-900 px-2 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
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
