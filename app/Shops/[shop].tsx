import { Stack, useLocalSearchParams } from "expo-router";
import { View, Text } from "../../components/Themed";
import { calculateAge, toTitleCase } from "../../utility/functions";
import { CharacterImage } from "../../components/CharacterImage";
import {
  Pressable,
  Image,
  ScrollView,
  View as NonThemedView,
} from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import { Item } from "../../classes/item";
import Coins from "../../assets/icons/CoinsIcon";
import SpellDetails from "../../components/SpellDetails";
import { useIsFocused } from "@react-navigation/native";
import { GameContext, PlayerCharacterContext } from "../_layout";
import GearStatsDisplay from "../../components/GearStatsDisplay";
import { useVibration } from "../../utility/customHooks";
import { Entypo } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import Modal from "react-native-modal/dist/modal";
import { observer } from "mobx-react-lite";

const ShopInteriorScreen = observer(() => {
  const { shop } = useLocalSearchParams();
  const gameData = useContext(GameContext);
  const playerCharacterData = useContext(PlayerCharacterContext);
  if (!gameData || !playerCharacterData)
    throw new Error("missing game context");
  const { gameState } = gameData;
  const { playerState } = playerCharacterData;
  const vibration = useVibration();
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

  const isFocused = useIsFocused();
  const { colorScheme } = useColorScheme();

  const [showShopInteriorTutorial, setShowShopInteriorTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("shopInterior")) ?? false,
    );

  const [tutorialStep, setTutorialStep] = useState<number>(1);

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
      new Date(thisShop.lastStockRefresh) <
        new Date(Date.now() - 60 * 60 * 1000)
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
        const price = item.getSellPrice(thisShop!.affection);
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
    if (selectedItem) {
      const transactionCompleteable = selectedItem.buying
        ? playerState!.gold >=
          selectedItem.item.getBuyPrice(thisShop!.affection)
        : thisShop!.currentGold >=
          selectedItem.item.getSellPrice(thisShop!.affection);

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
                  {selectedItem.buying
                    ? selectedItem.item.getBuyPrice(thisShop!.affection)
                    : selectedItem.item.getSellPrice(thisShop!.affection)}
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
            thisShop!.affection,
          );
          playerState.buyItem(selectedItemRef.current, price);
          thisShop.sellItem(selectedItemRef.current, price);
        } else {
          setInventoryFullNotifier(true);
        }
      } else {
        const price = selectedItemRef.current.getSellPrice(thisShop!.affection);
        thisShop.buyItem(selectedItemRef.current, price);
        playerState.sellItem(selectedItemRef.current, price);
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

  interface ItemRenderProps {
    item: Item;
  }
  const ItemRender = ({ item }: ItemRenderProps) => {
    return (
      <Pressable
        className="h-14 w-14 items-center justify-center rounded-lg bg-zinc-400 active:scale-90 active:opacity-50"
        onPress={() => displaySetter(item, false)}
      >
        <Image source={item.getItemIcon()} />
      </Pressable>
    );
  };

  function inventoryRender() {
    if (playerState) {
      return (
        <NonThemedView
          className="mx-auto flex flex-wrap rounded-lg border border-zinc-600"
          style={{ height: "85%", width: "95%" }}
        >
          {Array.from({ length: 24 }).map((_, index) => (
            <NonThemedView
              className="absolute items-center justify-center"
              style={{
                left: `${(index % 6) * 16.67 + 1}%`,
                top: `${Math.floor(index / 6) * 25 + 3}%`,
              }}
              key={"bg-" + index}
            >
              <NonThemedView className="h-14 w-14 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            </NonThemedView>
          ))}
          {playerState.inventory.slice(0, 24).map((item, index) => (
            <NonThemedView
              className="absolute items-center justify-center"
              style={{
                left: `${(index % 6) * 16.67 + 1}%`,
                top: `${Math.floor(index / 6) * 25 + 3}%`,
              }}
              key={index}
            >
              <ItemRender item={item} />
            </NonThemedView>
          ))}
        </NonThemedView>
      );
    }
  }

  if (refreshCheck && thisShop && gameState && playerState) {
    return (
      <>
        <Stack.Screen
          options={{
            title: toTitleCase(shop as string),
          }}
        />
        <Modal
          animationIn="slideInUp"
          animationOut="fadeOut"
          isVisible={showShopInteriorTutorial && gameState?.tutorialsEnabled}
          backdropOpacity={0.2}
          animationInTiming={500}
          onBackdropPress={() => setShowShopInteriorTutorial(false)}
          onBackButtonPress={() => setShowShopInteriorTutorial(false)}
        >
          <View
            className="mx-auto w-5/6 rounded-xl bg-zinc-50 px-6 py-4 dark:bg-zinc-700"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },

              shadowOpacity: 0.25,
              shadowRadius: 5,
            }}
          >
            <View
              className={`flex flex-row ${
                tutorialStep == 2 ? "justify-between" : "justify-end"
              }`}
            >
              {tutorialStep == 2 ? (
                <Pressable onPress={() => setTutorialStep((prev) => prev - 1)}>
                  <Entypo
                    name="chevron-left"
                    size={24}
                    color={colorScheme == "dark" ? "#f4f4f5" : "black"}
                  />
                </Pressable>
              ) : null}
              <Text>{tutorialStep}/2</Text>
            </View>
            {tutorialStep == 1 ? (
              <>
                <Text className="text-center text-2xl">
                  Shopkeepers remember you.
                </Text>
                <Text className="my-4 text-center text-lg">
                  The more you trade with a given shopkeeper the better the
                  deals they will have for you.
                </Text>
                <Pressable
                  onPress={() => setTutorialStep((prev) => prev + 1)}
                  className="mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text>Next</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="text-center text-xl">
                  Shopkeepers are people too.
                </Text>
                <Text className="my-4 text-center">
                  They each have different personalities. They will also age and
                  eventually die.
                </Text>
                <Pressable
                  onPress={() => {
                    vibration({ style: "light" });
                    setShowShopInteriorTutorial(false);
                  }}
                  className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </Modal>
        <View className="flex-1">
          <View className="flex flex-row justify-between">
            <View className="w-1/3">
              <CharacterImage
                characterAge={calculateAge(
                  new Date(thisShop.shopKeeperBirthDate),
                  new Date(gameState.date),
                )}
                characterSex={thisShop?.shopKeeperSex == "male" ? "M" : "F"}
              />
              <Text className="mx-auto text-center">
                {thisShop.shopKeeperName}'s Inventory
              </Text>
              <View className="mx-auto flex flex-row">
                <Text>{thisShop.currentGold}</Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
            </View>
            <View className="mx-2 -mt-1 max-h-60 w-2/3 rounded border border-zinc-300 dark:border-zinc-700">
              <ScrollView className="my-auto">
                <View className="flex flex-row flex-wrap justify-around">
                  {thisShop.inventory.map((item) => (
                    <Pressable
                      key={item.id}
                      className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                      onPress={() => displaySetter(item, true)}
                    >
                      <NonThemedView className="rounded-lg bg-zinc-300 p-2">
                        <Image source={item.getItemIcon()} />
                      </NonThemedView>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
          <ScrollView className="">{selectedItemDisplay()}</ScrollView>
          <NonThemedView style={{ height: "38%" }}>
            <NonThemedView className="flex flex-row justify-center dark:border-zinc-700">
              <Text className="text-center">
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
            </NonThemedView>
            {inventoryRender()}
          </NonThemedView>
        </View>
      </>
    );
  }
});
export default ShopInteriorScreen;
