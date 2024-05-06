import { Stack, useLocalSearchParams } from "expo-router";
import { View as ThemedView, Text } from "../../components/Themed";
import { CharacterImage } from "../../components/CharacterImage";
import { Pressable, Image, ScrollView, View } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import { Item } from "../../classes/item";
import Coins from "../../assets/icons/CoinsIcon";
import SpellDetails from "../../components/SpellDetails";
import { useIsFocused } from "@react-navigation/native";
import { GameContext, PlayerCharacterContext } from "../_layout";
import GearStatsDisplay from "../../components/GearStatsDisplay";
import { useVibration } from "../../utility/customHooks";
import { observer } from "mobx-react-lite";
import TutorialModal from "../../components/TutorialModal";
import { useHeaderHeight } from "@react-navigation/elements";
import shopObjects from "../../assets/json/shops.json";
import { toTitleCase } from "../../utility/functions/misc/words";
import { asReadableGold } from "../../utility/functions/misc/numbers";
import { calculateAge } from "../../utility/functions/misc/age";
import InventoryRender from "../../components/InventoryRender";

const ONE_HOUR = 60 * 60 * 1000;

const ShopInteriorScreen = observer(() => {
  const { shop } = useLocalSearchParams();
  const gameData = useContext(GameContext);
  const playerCharacterData = useContext(PlayerCharacterContext);
  if (!gameData || !playerCharacterData)
    throw new Error("missing game context");
  const { gameState } = gameData;
  const { playerState } = playerCharacterData;
  const vibration = useVibration();
  const colors = shopObjects.find((shopObj) => shopObj.type == shop)?.colors;
  const thisShop = gameState?.shops.find((aShop) => aShop.archetype == shop);
  const [selectedItem, setSelectedItem] = useState<{
    item: Item;
    buying: boolean;
  } | null>(null);
  let selectedItemRef = useRef<Item>();
  const [refreshCheck, setRefreshCheck] = useState<boolean>(false);
  const [selectedSpell, setSelectedSpell] = useState<{
    name: string;
    element: string;
    proficiencyNeeded: number;
    manaCost: number;
    effects: {
      damage: number | null;
      buffs: string[] | null;
      debuffs:
        | {
            name: string;
            chance: number;
          }[]
        | null;
      summon?: string[] | undefined;
      selfDamage?: number | undefined;
    };
  } | null>(null);
  const [inventoryFullNotifier, setInventoryFullNotifier] =
    useState<boolean>(false);

  const inventoryTarget = useRef<NonThemedView>(null);
  const [showingStats, setShowingStats] = useState<Item | null>(null);

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
      new Date(thisShop.lastStockRefresh) < new Date(Date.now() - ONE_HOUR)
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
      if (
        selectedItem?.item.itemClass == "junk" ||
        selectedItemRef.current?.itemClass == "junk"
      ) {
        setSelectedItem(null);
        selectedItemRef.current = undefined;
      }
    }
  }

  function selectedItemDisplay() {
    if (selectedItem && thisShop) {
      const transactionCompleteable = selectedItem.buying
        ? playerState!.gold >=
          selectedItem.item.getBuyPrice(thisShop.shopKeeper.affection)
        : thisShop!.currentGold >=
          selectedItem.item.getSellPrice(thisShop.shopKeeper.affection);

      return (
        <View className="mx-auto flex flex-row pb-6 pt-2">
          <View
            className="flex items-center"
            style={{
              marginLeft:
                selectedItem.item.slot && selectedItem.item.stats ? 100 : 0,
            }}
          >
            <View className="w-36 items-center">
              <Text className="text-red-500">
                {inventoryFullNotifier ?? "Inventory is full!"}
              </Text>
              <Text className="text-center">
                {toTitleCase(selectedItem.item.name)}
              </Text>
              <Image source={selectedItem.item.getItemIcon()} />
              <Text>
                {selectedItem.item.itemClass == "bodyArmor"
                  ? "Body Armor"
                  : toTitleCase(selectedItem.item.itemClass)}
              </Text>
              {selectedItem.item.slot ? (
                <Text className="">
                  Fills {toTitleCase(selectedItem.item.slot)} Slot
                </Text>
              ) : null}
              <View className="flex flex-row">
                <Text>
                  Price:{" "}
                  {asReadableGold(
                    selectedItem.buying
                      ? Math.floor(
                          selectedItem.item.getBuyPrice(
                            thisShop.shopKeeper.affection,
                          ),
                        )
                      : Math.floor(
                          selectedItem.item.getSellPrice(
                            thisShop.shopKeeper.affection,
                          ),
                        ),
                  )}
                </Text>
                <Coins width={20} height={20} style={{ marginLeft: 6 }} />
              </View>
              <View>
                <Pressable
                  disabled={!transactionCompleteable}
                  onPress={() => moveBetweenInventories(selectedItem)}
                  className={`${
                    !transactionCompleteable ? "bg-zinc-300" : "bg-blue-400"
                  } my-4 rounded-lg active:scale-95 active:opacity-50`}
                >
                  <Text className="px-6 py-4" style={{ color: "white" }}>
                    {selectedItem.buying ? "Purchase" : "Sell"}
                  </Text>
                </Pressable>
              </View>
            </View>
            {selectedSpell ? <SpellDetails spell={selectedSpell} /> : null}
          </View>
          {selectedItem.item.slot && selectedItem.item.stats ? (
            <View style={{ marginLeft: 10, marginTop: 20, width: 90 }}>
              <GearStatsDisplay stats={selectedItem.item.stats} />
            </View>
          ) : null}
        </View>
      );
    }
  }

  function moveBetweenInventories(
    selected: { item: Item; buying: boolean } | null,
  ) {
    if (
      playerState &&
      thisShop &&
      gameState &&
      isFocused &&
      selected &&
      selectedItemRef.current
    ) {
      if (selected.buying) {
        if (playerState.inventory.length < 24) {
          const price = selectedItemRef.current.getBuyPrice(
            thisShop.shopKeeper.affection,
          );
          playerState.buyItem(selectedItemRef.current, price);
          thisShop.sellItem(selectedItemRef.current, price);
        } else {
          setInventoryFullNotifier(true);
        }
      } else {
        const price = selectedItemRef.current.getSellPrice(
          thisShop.shopKeeper.affection,
        );
        thisShop.buyItem(selectedItemRef.current, Math.floor(price));
        playerState.sellItem(selectedItemRef.current, Math.floor(price));
      }
      vibration({ style: "light", essential: true });
      setSelectedItem(null);
      selectedItemRef.current = undefined;
    }
  }

  function displaySetter(item: Item, buying: boolean) {
    const selected = { item: item, buying: buying };
    setSelectedItem(selected);
    selectedItemRef.current = item;
    if (item.itemClass == "book" && playerState) {
      const spell = item.getAttachedSpell(playerState.playerClass);
      setSelectedSpell(spell);
    } else {
      setSelectedSpell(null);
    }
  }

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
        <ThemedView className="flex flex-row justify-between">
          <View className="w-1/3 items-center">
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
          <View className="mx-2 -mt-1 h-96 w-2/3 rounded border border-zinc-300 dark:border-zinc-700">
            <ScrollView className="my-auto">
              <View className="flex flex-row flex-wrap justify-around">
                {thisShop.inventory.map((item) => (
                  <Pressable
                    key={item.id}
                    className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                    onPress={() => displaySetter(item, true)}
                  >
                    <View className="rounded-lg bg-zinc-300 p-2">
                      <Image source={item.getItemIcon()} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </ThemedView>
        <ThemedView className="flex flex-row justify-center py-4 dark:border-zinc-700">
          <Text className=" text-center">
            {playerState.getFullName()}'s Inventory
          </Text>
          <View className="flex flex-row">
            <Text> ( {playerState!.getReadableGold()}</Text>
            <Coins width={16} height={16} style={{ marginLeft: 6 }} />
            <Text> )</Text>
            {playerState.inventory.some((item) => item.itemClass == "junk") ? (
              <Pressable
                onPress={sellAllJunk}
                className="ml-2 rounded-xl border border-zinc-900 px-6 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Sell Junk</Text>
              </Pressable>
            ) : null}
          </View>
        </ThemedView>
        <InventoryRender location={"shop"} selfRef={inventoryTarget} />
      </ThemedView>
    );
  }
});
export default ShopInteriorScreen;
