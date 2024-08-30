import { Stack, useLocalSearchParams } from "expo-router";
import { View as ThemedView, Text } from "../../components/Themed";
import { CharacterImage } from "../../components/CharacterImage";
import { Pressable, Image, ScrollView, View } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import { Item } from "../../classes/item";
import { useIsFocused } from "@react-navigation/native";
import { AppContext } from "../_layout";
import { useVibration } from "../../utility/customHooks";
import { observer } from "mobx-react-lite";
import TutorialModal from "../../components/TutorialModal";
import { useHeaderHeight } from "@react-navigation/elements";
import shopObjects from "../../assets/json/shops.json";
import { toTitleCase } from "../../utility/functions/misc/words";
import { calculateAge } from "../../utility/functions/misc/age";
import InventoryRender from "../../components/InventoryRender";
import { StatsDisplay } from "../../components/StatsDisplay";
import { Coins } from "../../assets/icons/SVGIcons";

const ONE_HOUR = 60 * 60 * 1000;
const ONE_SECOND = 1000;
const REFRESH_TIME = __DEV__ ? ONE_SECOND : ONE_HOUR;

const ShopInteriorScreen = observer(() => {
  const { shop } = useLocalSearchParams();
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing game context");
  const { gameState, playerState } = appData;
  const vibration = useVibration();
  const colors = shopObjects.find((shopObj) => shopObj.type == shop)?.colors;
  const thisShop = gameState?.shops.find((aShop) => aShop.archetype == shop);
  const [displayItem, setDisplayItem] = useState<{
    item: Item;
    count: number;
    positon: { left: number; top: number };
  } | null>(null);
  const [refreshCheck, setRefreshCheck] = useState<boolean>(false);

  const [inventoryFullNotifier, setInventoryFullNotifier] =
    useState<boolean>(false);

  const inventoryTarget = useRef<View>(null);
  const shopInventoryTarget = useRef<View>(null);

  const header = useHeaderHeight();
  const isFocused = useIsFocused();

  const [showShopInteriorTutorial, setShowShopInteriorTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("shopInterior")) ?? false,
    );

  useEffect(() => {
    if (!showShopInteriorTutorial && gameState) {
      gameState.updateTutorialState("shopInterior", true);
    }
  }, [showShopInteriorTutorial]);

  useEffect(() => {
    if (inventoryFullNotifier) {
      setTimeout(() => setInventoryFullNotifier(false), 2000);
    }
  }, [inventoryFullNotifier]);

  useEffect(() => {
    if (
      playerState &&
      thisShop &&
      new Date(thisShop.lastStockRefresh) < new Date(Date.now() - REFRESH_TIME)
    ) {
      thisShop.refreshInventory(playerState.playerClass);
    }
    setRefreshCheck(true);
  }, [playerState]);

  function sellAllJunk() {
    if (thisShop) {
      const itemsToSell: Item[] = [];
      playerState?.inventory.forEach((item) => {
        if (item.itemClass == "junk") {
          itemsToSell.push(item);
        }
      });

      itemsToSell.forEach((item) => {
        const price = item.getSellPrice(thisShop.shopKeeper.affection);
        thisShop.buyItem(item, price);
        playerState?.sellItem(item, price);
      });
      if (displayItem?.item.itemClass == "junk") {
        setDisplayItem(null);
      }
    }
  }

  const sellStack = (item: Item) => {
    if (playerState && thisShop) {
      playerState.getInventory().forEach((obj) => {
        if (obj.item.name === item.name) {
          sellItem(item);
        }
      });
    }
  };

  const purchaseItem = () => {
    if (playerState && displayItem && thisShop) {
      vibration({ style: "light" });
      const itemPrice = displayItem.item.getBuyPrice(
        thisShop.shopKeeper.affection,
      );
      playerState.buyItem(displayItem.item, itemPrice);
      thisShop.sellItem(displayItem.item, itemPrice);
      setDisplayItem(null);
    }
  };

  const sellItem = (item: Item) => {
    if (playerState && thisShop) {
      vibration({ style: "light" });
      const itemPrice = item.getSellPrice(thisShop.shopKeeper.affection);
      thisShop.buyItem(item, itemPrice);
      playerState.sellItem(item, itemPrice);
    }
  };

  interface ItemRenderProps {
    item: Item;
    count: number;
  }

  const ItemRender = ({ item, count }: ItemRenderProps) => {
    const localRef = useRef<View>(null);

    const handlePress = () => {
      vibration({ style: "light" });
      if (displayItem && displayItem.item.equals(item)) {
        setDisplayItem(null);
      } else {
        localRef.current?.measureInWindow((x, y) => {
          setDisplayItem({ item, count, positon: { left: x, top: y } });
        });
      }
    };

    return (
      <Pressable
        className="z-10 h-14 w-14 items-center justify-center rounded-lg bg-zinc-400 active:scale-90 active:opacity-50"
        ref={localRef}
        onPress={handlePress}
      >
        <Image source={item.getItemIcon()} />
      </Pressable>
    );
  };

  if (refreshCheck && thisShop && gameState && playerState) {
    return (
      <ThemedView className="h-full">
        <Stack.Screen
          options={{
            title: toTitleCase(shop as string),
          }}
        />
        <TutorialModal
          isVisibleCondition={
            (showShopInteriorTutorial &&
              gameState?.tutorialsEnabled &&
              isFocused) ??
            false
          }
          backFunction={() => setShowShopInteriorTutorial(false)}
          onCloseFunction={() => setShowShopInteriorTutorial(false)}
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
        <ThemedView className="flex-1 justify-between">
          <ThemedView className="flex h-[40%] flex-row justify-between">
            <View className="w-1/3 items-center my-auto">
              <CharacterImage
                characterAge={calculateAge(
                  new Date(thisShop.shopKeeper.birthdate),
                  new Date(gameState.date),
                )}
                characterSex={thisShop.shopKeeper.sex == "male" ? "M" : "F"}
              />
              <Text className="text-center">
                {thisShop.shopKeeper.getFullName()}'s Inventory
              </Text>
              <View className="flex flex-row">
                <Text>{thisShop.currentGold}</Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
            </View>
            <View
              className="mx-2 -mt-1 w-2/3 rounded border border-zinc-300 dark:border-zinc-700"
              ref={shopInventoryTarget}
            >
              <ScrollView className="my-auto">
                <View className="flex flex-row flex-wrap justify-around">
                  {thisShop.inventory.map((item) => (
                    <View
                      key={item.id}
                      className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                    >
                      <ItemRender item={item} count={1} />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ThemedView>
          <View className="flex-1 mx-2 mt-4">
            <ThemedView className="flex flex-row justify-center py-4 dark:border-zinc-700">
              <Text className=" text-center">
                {playerState.getFullName()}'s Inventory
              </Text>
              <View className="flex flex-row">
                <Text> ( {playerState!.getReadableGold()}</Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                <Text> )</Text>
                {playerState.inventory.some(
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
            </ThemedView>
            <InventoryRender
              selfRef={inventoryTarget}
              shopInventoryTarget={shopInventoryTarget}
              inventory={playerState.getInventory()}
              shop={thisShop}
              sellItem={sellItem}
              sellStack={sellStack}
              displayItem={displayItem}
              setDisplayItem={setDisplayItem}
            />
          </View>
        </ThemedView>
        {displayItem && (
          <View className="absolute z-10">
            <StatsDisplay
              displayItem={displayItem}
              shop={thisShop}
              purchaseItem={purchaseItem}
              sellItem={sellItem}
              clearItem={() => setDisplayItem(null)}
            />
          </View>
        )}
      </ThemedView>
    );
  }
});
export default ShopInteriorScreen;
