import { useLocalSearchParams } from "expo-router";
import { Text, ThemedScrollView } from "../../components/Themed";
import { CharacterImage } from "../../components/CharacterImage";
import {
  Pressable,
  View,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import TutorialModal from "../../components/TutorialModal";
import { useHeaderHeight } from "@react-navigation/elements";
import shopObjects from "../../assets/json/shops.json";
import { calculateAge } from "../../utility/functions/misc";
import InventoryRender from "../../components/InventoryRender";
import { StatsDisplay } from "../../components/StatsDisplay";
import { Coins } from "../../assets/icons/SVGIcons";
import { TutorialOption, checkReleasePositionProps } from "../../utility/types";
import ProgressBar from "../../components/ProgressBar";
import Colors from "../../constants/Colors";
import { useColorScheme } from "nativewind";
import { InventoryItem } from "../../components/Draggable";
import { useDraggableStore, useRootStore } from "../../hooks/stores";
import { useVibration } from "../../hooks/generic";
import type { Item } from "../../entities/item";
import { saveGame } from "../../entities/game";

const TEN_MINUTES = 10 * 60 * 1000;
//const ONE_SECOND = 1000;
//const REFRESH_TIME = __DEV__ ? ONE_SECOND : TEN_MINUTES;
const REFRESH_TIME = TEN_MINUTES;

const GreetingComponent = ({
  greeting,
  colorScheme,
}: {
  greeting: string;
  colorScheme: "light" | "dark";
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    });

    const timer = setTimeout(() => {
      fadeOut.start();
    }, 3000);

    return () => {
      clearTimeout(timer);
      fadeOut.stop();
    };
  }, []);

  return (
    <Animated.View
      style={{
        borderColor: Colors[colorScheme].tint,
        zIndex: 999,
        opacity: fadeAnim,
      }}
      className="border absolute shadow-lg rounded-md p-2 bg-[#fafafa] dark:bg-[#000000] dark:border-[]"
    >
      <Text className="text-center">{greeting}</Text>
    </Animated.View>
  );
};

const ShopInteriorScreen = observer(() => {
  let { shop } = useLocalSearchParams();
  const { gameState, playerState, shopsStore, uiStore } = useRootStore();
  const { setIconString } = useDraggableStore();

  const vibration = useVibration();
  const colors = shopObjects.find((shopObj) => shopObj.type == shop)?.colors;
  const thisShop = shopsStore.getShop(shop as string);
  const [displayItem, setDisplayItem] = useState<{
    item: Item[];
    side?: "shop" | "inventory";
    position: { left: number; top: number };
  } | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>("");

  const [inventoryFullNotifier, setInventoryFullNotifier] =
    useState<boolean>(false);

  const inventoryTarget = useRef<View>(null);
  const shopInventoryTarget = useRef<View>(null);
  const isFocused = useIsFocused();

  const header = useHeaderHeight();
  const { colorScheme } = useColorScheme();

  const [inventoryBounds, setInventoryBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (inventoryFullNotifier) {
      setTimeout(() => setInventoryFullNotifier(false), 2000);
    }
  }, [inventoryFullNotifier]);

  useEffect(() => {
    if (playerState && thisShop && !initialized) {
      if (
        new Date(thisShop.lastStockRefresh) <
          new Date(Date.now() - REFRESH_TIME) ||
        thisShop.inventory.length == 0
      ) {
        thisShop.refreshInventory();
      }
      setGreeting(thisShop.createGreeting);
      setInitialized(true);
    }
  }, [playerState]);

  function checkReleasePosition({
    itemStack,
    xPos,
    yPos,
    size,
  }: checkReleasePositionProps) {
    if (itemStack && thisShop && playerState && inventoryBounds) {
      const isWidthAligned =
        xPos + size / 2 >= inventoryBounds.x &&
        xPos - size / 2 <= inventoryBounds.x + inventoryBounds.width;
      const isHeightAligned =
        yPos + size / 2 >= inventoryBounds.y &&
        yPos - size / 2 <= inventoryBounds.y + inventoryBounds.height;

      if (isWidthAligned && isHeightAligned) {
        setDisplayItem(null);
        vibration({ style: "light", essential: true });
        const price = itemStack[0].getBuyPrice(thisShop.shopKeeper.affection);
        if (price <= playerState.gold) {
          playerState.buyItem(itemStack, price);
          thisShop.sellItem(itemStack, price);
          return false;
        }
      }
    }
    return true;
  }

  function sellAllJunk() {
    if (thisShop) {
      const itemsToSell: Item[] = [];
      playerState?.baseInventory.forEach((item) => {
        if (item.itemClass == "junk") {
          itemsToSell.push(item);
        }
      });

      itemsToSell.forEach((item) => {
        const price = item.getSellPrice(thisShop.shopKeeper.affection);
        thisShop.buyItem(item, price);
        playerState?.sellItem(item, price);
      });
      if (displayItem?.item[0].itemClass == "junk") {
        setDisplayItem(null);
      }
    }
    saveGame(gameState);
  }

  const sellStack = (items: Item[]) => {
    if (playerState && displayItem && thisShop) {
      items.forEach((item) => {
        const itemPrice = item.getSellPrice(thisShop.shopKeeper.affection);
        thisShop.buyItem(item, itemPrice);
        playerState.sellItem(item, itemPrice);
        setDisplayItem(null);
      });
    }
    saveGame(gameState);
  };

  const purchaseItem = (item: Item) => {
    if (playerState && item && thisShop) {
      vibration({ style: "light" });
      const itemPrice = item.getBuyPrice(thisShop.shopKeeper.affection);
      if (displayItem?.item.length && displayItem.item.length == 1) {
        setDisplayItem(null);
      }
      thisShop.sellItem(item, itemPrice);
      playerState.buyItem(item, itemPrice);
    }
    saveGame(gameState);
  };

  const sellItem = (item: Item) => {
    if (playerState && item && thisShop) {
      vibration({ style: "light" });
      const itemPrice = item.getSellPrice(thisShop.shopKeeper.affection);
      if (displayItem?.item.length && displayItem.item.length == 1) {
        setDisplayItem(null);
      }
      thisShop.buyItem(item, itemPrice);
      playerState.sellItem(item, itemPrice);
    }
    saveGame(gameState);
  };

  const purchaseStack = (items: Item[]) => {
    if (playerState && thisShop) {
      vibration({ style: "light" });
      items.forEach((item) => {
        const itemPrice = item.getBuyPrice(thisShop.shopKeeper.affection);
        playerState.buyItem(item, itemPrice);
        thisShop.sellItem(item, itemPrice);
        setDisplayItem(null);
      });
    }
    saveGame(gameState);
  };

  if (
    initialized &&
    thisShop &&
    gameState &&
    playerState &&
    uiStore.itemBlockSize
  ) {
    return (
      <>
        <TutorialModal
          tutorial={TutorialOption.shopInterior}
          isFocused={isFocused}
          pageOne={{
            title: "Shopkeepers remember you.",
            body: "The more you trade with a given shopkeeper the better deals they will have for you.",
          }}
          pageTwo={{
            title: "Shopkeepers are people too.",
            body: "They each have different personalities. They will also age eventually die.",
          }}
          pageThree={{
            title: "Good Luck.",
            body: "And remember fleeing (top left) can save you.",
          }}
        />
        <View
          style={{
            marginTop: header / 2,
            height: header / 2,
            backgroundColor: colors?.background,
            opacity: 0.5,
          }}
        />

        <TouchableWithoutFeedback onPress={() => setDisplayItem(null)}>
          <View className="flex-1 justify-between">
            <View className="flex h-[40%] flex-row justify-between">
              <View className="items-center w-1/3 my-auto px-1">
                <CharacterImage
                  characterAge={calculateAge(
                    new Date(thisShop.shopKeeper.birthdate),
                    new Date(gameState.date),
                  )}
                  characterSex={thisShop.shopKeeper.sex == "male" ? "M" : "F"}
                />
                <GreetingComponent
                  greeting={greeting}
                  colorScheme={colorScheme}
                />
                <Text className="text-center">
                  {thisShop.shopKeeper.fullName}'s Inventory
                </Text>
                <View className="flex flex-row mb-1">
                  <Text>{thisShop.currentGold}</Text>
                  <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                </View>
                <ProgressBar
                  value={thisShop.shopKeeper.affection}
                  maxValue={100}
                  filledColor="#ef4444"
                  unfilledColor="#fca5a5"
                />
              </View>
              <View
                className="shadow-soft w-2/3 rounded-l border-l border-b border-zinc-300 dark:border-zinc-700"
                ref={shopInventoryTarget}
              >
                <ThemedScrollView
                  onScrollBeginDrag={() => setDisplayItem(null)}
                  className="px-2 h-full"
                  contentContainerClassName="flex flex-row flex-wrap justify-around"
                >
                  {thisShop.inventory.map((item) => (
                    <Pressable
                      key={item.item[0].id}
                      style={{
                        height: uiStore.itemBlockSize * 1.4,
                        width: uiStore.itemBlockSize * 1.5,
                      }}
                    >
                      <View className="flex-1 justify-center items-center">
                        <InventoryItem
                          key={item.item[0].id}
                          item={item.item}
                          displayItem={displayItem}
                          setDisplayItem={(params) => {
                            if (params) {
                              setDisplayItem({ ...params, side: "shop" });
                            } else {
                              setDisplayItem(null);
                            }
                          }}
                          checkReleasePosition={checkReleasePosition}
                        />
                      </View>
                    </Pressable>
                  ))}
                </ThemedScrollView>
              </View>
            </View>
            <View className="flex-1 mx-2 mt-4">
              <View className="flex flex-row justify-center py-4 dark:border-zinc-700">
                <Text className=" text-center">
                  {playerState.fullName}'s Inventory
                </Text>
                <View className="flex flex-row">
                  <Text> ( {playerState.readableGold} )</Text>
                  <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                  <Text> )</Text>
                  {playerState.baseInventory.some(
                    (item) => item.itemClass == "junk",
                  ) ? (
                    <Pressable
                      onPress={sellAllJunk}
                      className="ml-2 rounded-xl border border-zinc-900 px-6 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                    >
                      <Text>Sell Junk</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
              <View className="h-[85%] w-full" collapsable={false}>
                <InventoryRender
                  setInventoryBounds={setInventoryBounds}
                  selfRef={inventoryTarget}
                  shopInventoryTarget={shopInventoryTarget}
                  inventory={playerState.inventory}
                  shop={thisShop}
                  sellItem={sellItem}
                  sellStack={sellStack}
                  displayItem={displayItem}
                  setDisplayItem={setDisplayItem}
                  setIconString={setIconString}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        {displayItem && (
          <View className="absolute z-10">
            <StatsDisplay
              displayItem={displayItem}
              shop={thisShop}
              purchaseItem={purchaseItem}
              purchaseStack={purchaseStack}
              sellItem={sellItem}
              sellStack={sellStack}
              clearItem={() => setDisplayItem(null)}
              topGuard={header}
            />
          </View>
        )}
      </>
    );
  }
});

export default ShopInteriorScreen;
