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
import { useContext, useEffect, useState } from "react";
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

export default function ShopScreen() {
  const { shop } = useLocalSearchParams();
  const gameData = useContext(GameContext);
  if (!gameData) throw new Error("missing game context");
  const { gameState } = gameData;
  const playerCharacterData = useContext(PlayerCharacterContext);
  const playerCharacter = playerCharacterData?.playerState;
  const thisShop = gameState?.shops.find((aShop) => aShop.archetype == shop);
  const [selectedItem, setSelectedItem] = useState<{
    item: Item;
    buying: boolean;
  } | null>(null);
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

  const isFocused = useIsFocused();
  const vibrate = useVibration();
  const { colorScheme } = useColorScheme();

  const [showShopInteriorTutorial, setShowShopInteriorTutorial] =
    useState<boolean>(
      (gameState && !gameState.getTutorialState("shopInterior")) ?? false,
    );

  const [tutorialStep, setTutorialStep] = useState<number>(1);

  useEffect(() => {
    if (!showShopInteriorTutorial && gameState) {
      gameState.updateTutorialState("shops", true);
    }
  }, [showShopInteriorTutorial]);

  useEffect(() => {
    if (
      playerCharacter &&
      thisShop &&
      new Date(thisShop.lastStockRefresh) <
        new Date(Date.now() - 60 * 60 * 1000)
    ) {
      thisShop.refreshInventory(playerCharacter.playerClass);
    }
    setRefreshCheck(true);
  }, [playerCharacter]);

  function sellAllJunk() {
    if (thisShop) {
      playerCharacter?.inventory.forEach((item) => {
        if (item.itemClass == "junk") {
          const price = item.getSellPrice(thisShop!.affection);
          thisShop.buyItem(item, price);
          playerCharacter.sellItem(item, price);
        }
      });
    }
  }

  function selectedItemDisplay() {
    if (selectedItem) {
      const transactionCompleteable = selectedItem.buying
        ? playerCharacter!.gold >=
          selectedItem.item.getBuyPrice(thisShop!.affection)
        : thisShop!.currentGold >=
          selectedItem.item.getSellPrice(thisShop!.affection);

      return (
        <View className="mx-auto flex flex-row pt-8">
          <View
            className="flex items-center"
            style={{
              marginLeft:
                selectedItem.item.slot && selectedItem.item.stats ? 100 : 0,
              width: 140,
            }}
          >
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
          {selectedItem.item.slot && selectedItem.item.stats ? (
            <View style={{ marginLeft: 10, marginTop: 20, width: 90 }}>
              <GearStatsDisplay stats={selectedItem.item.stats} />
            </View>
          ) : null}
          {selectedSpell ? <SpellDetails spell={selectedSpell} /> : null}
        </View>
      );
    }
  }

  function moveBetweenInventories(
    selected: { item: Item; buying: boolean } | null,
  ) {
    if (playerCharacter && thisShop && gameState && isFocused && selected) {
      if (selected.buying) {
        const price = selected.item.getBuyPrice(thisShop!.affection);
        playerCharacter.buyItem(selected.item, price);
        thisShop.sellItem(selected.item, price);
      } else {
        const price = selected.item.getSellPrice(thisShop!.affection);
        thisShop.buyItem(selected.item, price);
        playerCharacter.sellItem(selected.item, price);
      }
      vibrate({ style: "light", essential: true });
      setSelectedItem(null);
    }
  }

  function displaySetter(item: Item, buying: boolean) {
    const selected = { item: item, buying: buying };
    setSelectedItem(selected);
    if (item.itemClass == "book" && playerCharacter) {
      const spell = item.getAttachedSpell(playerCharacter.playerClass);
      setSelectedSpell(spell);
    } else {
      setSelectedSpell(null);
    }
  }

  if (refreshCheck && thisShop && gameState && playerCharacter) {
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
                  onPress={() => setShowShopInteriorTutorial(false)}
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
          <NonThemedView className="h-2/5">
            <NonThemedView className="flex flex-row justify-center border-b border-zinc-300 dark:border-zinc-700">
              <Text className="text-center">
                {playerCharacter.getFullName()}'s Inventory
              </Text>
              <View className="flex flex-row">
                <Text> ( {playerCharacter!.getReadableGold()}</Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                <Text> )</Text>
                {playerCharacter.inventory.some(
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
            <ScrollView>
              <View className="flex flex-row flex-wrap justify-around">
                {playerCharacter.inventory.map((item) => (
                  <Pressable
                    key={item.id}
                    className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                    onPress={() => displaySetter(item, false)}
                  >
                    <NonThemedView className="rounded-lg bg-zinc-300 p-2">
                      <Image source={item.getItemIcon()} />
                    </NonThemedView>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </NonThemedView>
        </View>
      </>
    );
  }
}
