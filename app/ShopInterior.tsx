import React from "react";
import { router } from "expo-router";
import { Text, ThemedScrollView } from "../components/Themed";
import { CharacterImage } from "../components/CharacterImage";
import {
  Pressable,
  View,
  TouchableWithoutFeedback,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import TutorialModal from "../components/TutorialModal";
import { useHeaderHeight } from "@react-navigation/elements";
import InventoryRender from "../components/InventoryRender";
import { StatsDisplay } from "../components/StatsDisplay";
import { Coins } from "../assets/icons/SVGIcons";
import { MerchantType, TutorialOption } from "../utility/types";
import ProgressBar from "../components/ProgressBar";
import { shopColors } from "../constants/Colors";
import { InventoryItem } from "../components/Draggable";
import { useDraggableStore, useRootStore } from "../hooks/stores";
import { useVibration } from "../hooks/generic";
import type { Item } from "../entities/item";
import { flex, shadows, tw, useStyles } from "../hooks/styles";

const GreetingComponent = ({ greeting }: { greeting: string }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const styles = useStyles();

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
      style={[
        styles.greetingContainer,
        shadows.soft,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={styles.textCenter}>{greeting}</Text>
    </Animated.View>
  );
};

const ShopInteriorScreen = observer(() => {
  const { playerState, shopsStore, uiStore, time } = useRootStore();
  const { draggableClassStore } = useDraggableStore();
  const isFocused = useIsFocused();

  const shopInventoryTarget = useRef<View | null>(null);
  const vibration = useVibration();
  const colors = shopColors[shopsStore.currentShop?.archetype as MerchantType];
  const [displayItem, setDisplayItem] = useState<{
    item: Item[];
    side?: "shop" | "inventory";
    position: { left: number; top: number };
  } | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>("");

  const [inventoryFullNotifier, setInventoryFullNotifier] =
    useState<boolean>(false);
  const header = useHeaderHeight();
  const styles = useStyles();

  const [shopInventoryBounds, setShopInventoryBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      if (!isFocused) {
        shopsStore.setCurrentShop(null);
      }
    };
  }, [isFocused]);

  useEffect(() => {
    if (!shopsStore.currentShop) {
      setTimeout(() => {
        router.replace("/shops");
      }, 100);
    }
  }, [shopsStore.currentShop]);

  const setShopBoundsOnLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setTimeout(() => {
      if (shopInventoryTarget.current) {
        shopInventoryTarget.current.measure((x, y, w, h, pageX, pageY) => {
          setShopInventoryBounds({
            x: pageX,
            y: pageY,
            width,
            height,
          });
        });
      }
    }, 100);
  };

  useEffect(() => {
    if (inventoryFullNotifier) {
      setTimeout(() => setInventoryFullNotifier(false), 2000);
    }
  }, [inventoryFullNotifier]);

  useEffect(() => {
    if (playerState && shopsStore.currentShop && !initialized) {
      if (
        shopsStore.currentShop.inventory.length == 0 ||
        shopsStore.currentShop.lastStockRefresh.year < time.year ||
        shopsStore.currentShop.lastStockRefresh.week + 4 <= time.week
      ) {
        shopsStore.currentShop.refreshInventory();
      }
      setGreeting(shopsStore.currentShop.createGreeting);
      setInitialized(true);
    }
  }, [playerState, shopsStore.currentShop]);

  function sellAllJunk() {
    if (shopsStore.currentShop && playerState) {
      const itemsToSell = playerState.baseInventory.filter(
        (item) => item.itemClass === "junk",
      );

      let totalEarned = 0;
      for (const item of itemsToSell) {
        const price = item.getSellPrice(
          shopsStore.currentShop.shopKeeper.affection,
        );
        shopsStore.currentShop.buyItem(item, price);
        playerState.sellItem(item, price);
        totalEarned += price;
      }
      if (displayItem?.item[0].itemClass == "junk") {
        setDisplayItem(null);
      }
    }
  }

  const sellStack = (itemStack: Item[]) => {
    shopsStore.currentShop?.purchaseStack(itemStack);
  };

  const purchaseItem = (item: Item) => {
    if (playerState && item && shopsStore.currentShop) {
      vibration({ style: "light" });
      const itemPrice = item.getBuyPrice(
        shopsStore.currentShop.shopKeeper.affection,
      );
      if (displayItem?.item.length && displayItem.item.length == 1) {
        setDisplayItem(null);
      }
      shopsStore.currentShop.sellItem(item, itemPrice);
      playerState.buyItem(item, itemPrice);
    }
  };

  const sellItem = (item: Item) => {
    if (playerState && item && shopsStore.currentShop) {
      vibration({ style: "light" });
      const itemPrice = item.getSellPrice(
        shopsStore.currentShop.shopKeeper.affection,
      );
      if (displayItem?.item.length && displayItem.item.length == 1) {
        setDisplayItem(null);
      }
      shopsStore.currentShop.buyItem(item, itemPrice);
      playerState.sellItem(item, itemPrice);
    }
  };

  const purchaseStack = (itemStack: Item[]) => {
    playerState?.purchaseStack(itemStack, shopsStore.currentShop?.archetype!);
  };

  if (!shopsStore.currentShop) {
    return (
      <View style={[flex.columnCenter, { flex: 1 }]}>
        <Text>Redirecting to shops...</Text>
      </View>
    );
  }

  if (!initialized || !playerState || !uiStore.itemBlockSize) {
    return (
      <View style={[flex.columnCenter, { flex: 1 }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
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
        <View style={[flex.columnBetween, { flex: 1 }]}>
          <View style={[flex.rowEvenly, { height: "40%" }]}>
            <View style={[flex.columnCenter, styles.shopKeeperSection]}>
              <CharacterImage
                character={shopsStore.currentShop.shopKeeper}
                scale={0.3}
              />
              <GreetingComponent greeting={greeting} />
              <Text style={styles.textCenter}>
                {shopsStore.currentShop.shopKeeper.fullName}'s Inventory
              </Text>
              <View style={[flex.rowCenter, tw.mb1]}>
                <Text>{shopsStore.currentShop.currentGold}</Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
              <ProgressBar
                value={shopsStore.currentShop.shopKeeper.affection}
                maxValue={100}
                filledColor="#ef4444"
                unfilledColor="#fca5a5"
              />
            </View>
            <View
              onLayout={(e) => setShopBoundsOnLayout(e)}
              style={styles.shopsInventoryContainer}
              ref={shopInventoryTarget}
            >
              <ThemedScrollView
                onScrollBeginDrag={() => setDisplayItem(null)}
                style={{
                  height: "100%",
                  paddingTop: uiStore.itemBlockSize,
                  ...tw.px2,
                }}
                contentContainerStyle={[flex.rowEvenly, flex.wrap]}
              >
                {shopsStore.currentShop.inventory.map((item) => (
                  <Pressable
                    key={item.item[0].id}
                    style={{
                      height: uiStore.itemBlockSize * 1.4,
                      width: uiStore.itemBlockSize * 1.5,
                    }}
                  >
                    <View style={styles.columnCenter}>
                      <InventoryItem
                        key={item.item[0].id}
                        item={item.item}
                        displayItem={displayItem}
                        targetBounds={[
                          {
                            key: "playerInventory",
                            bounds: draggableClassStore.inventoryBounds,
                          },
                        ]}
                        runOnSuccess={() => purchaseStack(item.item)}
                        setDisplayItem={(params) => {
                          if (params) {
                            setDisplayItem({ ...params, side: "shop" });
                          } else {
                            setDisplayItem(null);
                          }
                        }}
                      />
                    </View>
                  </Pressable>
                ))}
              </ThemedScrollView>
            </View>
          </View>
          <View style={styles.playerInventorySection}>
            <View
              style={{
                ...styles.rowCenter,
                ...styles.py4,
              }}
            >
              <Text style={[styles.textCenter, styles["text-md"]]}>
                {playerState.fullName}'s Inventory
              </Text>
              <View style={styles.rowCenter}>
                <Text> ( {playerState.readableGold} </Text>
                <Coins
                  width={16}
                  height={16}
                  style={{ marginLeft: 6, marginVertical: "auto" }}
                />
                <Text> )</Text>
                {playerState.baseInventory.some(
                  (item) => item.itemClass == "junk",
                ) && (
                  <Pressable
                    onPress={sellAllJunk}
                    style={styles.sellJunkButton}
                  >
                    <Text>Sell Junk</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <View style={{ width: "100%", height: "80%" }} collapsable={false}>
              <InventoryRender
                screen="shop"
                displayItem={displayItem}
                setDisplayItem={setDisplayItem}
                targetBounds={[
                  { key: "shopInventory", bounds: shopInventoryBounds },
                ]}
                runOnSuccess={(item: Item[]) => sellStack(item)}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {displayItem && (
        <View style={styles.raisedAbsolutePosition} pointerEvents="box-none">
          <StatsDisplay
            displayItem={displayItem}
            shop={shopsStore.currentShop}
            purchaseItem={purchaseItem}
            purchaseStack={purchaseStack}
            sellItem={sellItem}
            sellStack={sellStack}
            clearItem={() => setDisplayItem(null)}
            topGuard={header}
          />
        </View>
      )}
    </View>
  );
});

export default ShopInteriorScreen;
