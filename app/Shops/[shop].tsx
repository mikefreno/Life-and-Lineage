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

  function selectedItemDisplay() {
    if (selectedItem) {
      const transactionCompleteable = selectedItem.buying
        ? playerCharacter!.gold >=
          selectedItem.item.getBuyPrice(thisShop!.affection)
        : thisShop!.currentGold >=
          selectedItem.item.getSellPrice(thisShop!.affection);

      return (
        <ScrollView className="pt-6">
          <View className="mx-auto flex min-h-[1/3] flex-row">
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
                  onPress={moveBetweenInventories}
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
          </View>
          {selectedSpell ? <SpellDetails spell={selectedSpell} /> : null}
        </ScrollView>
      );
    } else {
      return <View className="flex h-1/3 items-center justify-center"></View>;
    }
  }

  function moveBetweenInventories() {
    if (selectedItem && playerCharacter && thisShop && gameState && isFocused) {
      if (selectedItem.buying) {
        const price = selectedItem.item.getBuyPrice(thisShop!.affection);
        playerCharacter.buyItem(selectedItem.item, price);
        thisShop.sellItem(selectedItem.item, price);
      } else {
        const price = selectedItem.item.getSellPrice(thisShop!.affection);
        thisShop.buyItem(selectedItem.item, price);
        playerCharacter.sellItem(selectedItem.item, price);
      }
      vibrate({ style: "light", essential: true });
      setSelectedItem(null);
    }
  }

  function displaySetter(item: Item, buying: boolean) {
    setSelectedItem({ item: item, buying: buying });
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
                      onPress={() => {
                        vibrate({ style: "light" });
                        displaySetter(item, true);
                      }}
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
          {selectedItem ? (
            selectedItemDisplay()
          ) : (
            <NonThemedView className="-my-6 flex h-1/3 items-center justify-center" />
          )}
          <NonThemedView className="h-1/3">
            <NonThemedView className="flex flex-row justify-center border-b border-zinc-300 dark:border-zinc-700">
              <Text className="text-center">
                {playerCharacter.getFullName()}'s Inventory
              </Text>
              <View className="flex flex-row">
                <Text className="my-auto">
                  {" "}
                  ( {playerCharacter!.getReadableGold()}
                </Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                <Text> )</Text>
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
