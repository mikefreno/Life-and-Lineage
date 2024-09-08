import { LayoutChangeEvent, Pressable, View } from "react-native";
import { Text } from "./Themed";
import GearStatsDisplay from "./GearStatsDisplay";
import { useColorScheme } from "nativewind";
import { useVibration } from "../utility/customHooks";
import { router } from "expo-router";
import { toTitleCase } from "../utility/functions/misc/words";
import { Item } from "../classes/item";
import { useContext, useEffect, useState } from "react";
import { Shop } from "../classes/shop";
import { asReadableGold } from "../utility/functions/misc/numbers";
import SpellDetails from "./SpellDetails";
import GenericFlatButton from "./GenericFlatButton";
import { convertMasteryToString } from "../utility/spellHelper";
import { AppContext } from "../app/_layout";
import {
  Coins,
  DexterityIcon,
  IntelligenceIcon,
  StrengthIcon,
} from "../assets/icons/SVGIcons";

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
  addItemToPouch: (item: Item) => void;
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

  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing contexts");
  const { playerState, dimensions } = appData;
  const [viewWidth, setViewWidth] = useState(dimensions.width * 0.4);
  const [viewHeight, setViewHeight] = useState(dimensions.height * 0.2);
  const [blockSize, setBlockSize] = useState<number>();

  useEffect(() => {
    if (dimensions.width === dimensions.lesser) {
      const blockSize = Math.min(dimensions.height / 5, dimensions.width / 7.5);
      setBlockSize(blockSize);
    } else {
      const blockSize = dimensions.width / 14;
      setBlockSize(blockSize);
    }
  }, [dimensions.height]);

  const RequirementsBlock = () => {
    const item = displayItem.item[0];
    const reqs = item.requirements;
    if ((reqs.intelligence || reqs.strength || reqs.dexterity) && playerState) {
      const playerMeetsStrength =
        reqs.strength &&
        reqs.strength <
          playerState.baseStrength + playerState.allocatedSkillPoints.strength;
      const playerMeetsIntelligence =
        reqs.intelligence &&
        reqs.intelligence <
          playerState.baseIntelligence +
            playerState.allocatedSkillPoints.intelligence;
      const playerMeetDexterity =
        reqs.dexterity &&
        reqs.dexterity <
          playerState.baseDexterity +
            playerState.allocatedSkillPoints.dexterity;
      if (playerMeetsStrength && playerMeetsIntelligence) return null;
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
                style={{ color: playerMeetDexterity ? "#22c55e" : "#b91c1c" }}
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
          const itemPrice = displayItem.item[0].getSellPrice(
            shop.shopKeeper.affection,
          );
          const stackPrice = itemPrice * displayItem.item.length;
          const singleIsDisabled = shop.currentGold < itemPrice;
          const stackIsDisabled = shop.currentGold < stackPrice;
          return (
            <>
              <View className="flex flex-row py-1">
                <Text>
                  {asReadableGold(
                    displayItem.item[0].getSellPrice(
                      shop.shopKeeper.affection,
                    ) * (displayItem.item.length ?? 1),
                  )}
                </Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
              {displayItem.item.length && displayItem.item.length > 1 ? (
                <>
                  <GenericFlatButton
                    onPressFunction={() => {
                      sellItem(displayItem.item[0]), clearItem();
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
                    props.sellItem(displayItem.item[0]);
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
          const itemPrice = displayItem.item[0].getBuyPrice(
            shop.shopKeeper.affection,
          );
          const stackPrice = itemPrice * displayItem.item.length;
          const singleIsDisabled = playerState.gold < itemPrice;
          const stackIsDisabled = playerState.gold < stackPrice;
          return (
            <>
              <View className="flex flex-row py-1">
                <Text>
                  {asReadableGold(
                    displayItem.item[0].getBuyPrice(shop.shopKeeper.affection) *
                      displayItem.item.length,
                  )}
                </Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
              <GenericFlatButton
                onPressFunction={() => purchaseItem(displayItem.item[0])}
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
                props.addItemToPouch(displayItem.item[0]);
                clearItem();
                playerState?.removeFromInventory(displayItem.item[0]);
              }}
            >
              Drop
            </GenericFlatButton>
            {displayItem.item.length > 1 && (
              <GenericFlatButton
                className="pt-1"
                onPressFunction={() => {
                  displayItem.item.forEach((item) => {
                    props.addItemToPouch(item);
                    playerState?.removeFromInventory(item);
                  });
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

  function bookItemLabel() {
    if (playerState) {
      const spellRes = displayItem.item[0].getAttachedSpell(
        playerState.playerClass,
      );
      return `${convertMasteryToString[spellRes.proficiencyNeeded]} level book`;
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
    <View
      className="items-center rounded-md border border-zinc-600 p-4"
      onLayout={onLayoutView}
      style={
        displayItem.item[0].itemClass == "book"
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
              maxWidth: dimensions.width * 0.4,
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
        <Text className="text-center">
          {toTitleCase(displayItem.item[0].name)}
        </Text>
      </View>
      {displayItem.item[0].stats && displayItem.item[0].slot ? (
        <View className="py-2">
          <GearStatsDisplay stats={displayItem.item[0].stats} />
        </View>
      ) : null}
      <RequirementsBlock />
      {(displayItem.item[0].slot == "one-hand" ||
        displayItem.item[0].slot == "two-hand" ||
        displayItem.item[0].slot == "off-hand") && (
        <Text className="text-sm">{toTitleCase(displayItem.item[0].slot)}</Text>
      )}
      <Text className="text-sm">
        {displayItem.item[0].itemClass == "BodyArmor"
          ? "Body Armor"
          : displayItem.item[0].itemClass == "book" && playerState
          ? bookItemLabel()
          : toTitleCase(displayItem.item[0].itemClass)}
      </Text>
      {displayItem.item[0].itemClass == "book" && playerState ? (
        <>
          <View className="px-2 mx-auto">
            <SpellDetails
              spell={displayItem.item[0].getAttachedSpell(
                playerState.playerClass,
              )}
            />
          </View>
          {!("purchaseItem" in props) && (
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
      <SaleSection />
    </View>
  );
}
