import { Stack, useLocalSearchParams } from "expo-router";
import { View, Text } from "../../components/Themed";
import { useDispatch, useSelector } from "react-redux";
import { selectGame, selectPlayerCharacter } from "../../redux/selectors";
import { calculateAge, fullSave, toTitleCase } from "../../utility/functions";
import { CharacterImage } from "../../components/CharacterImage";
import {
  Pressable,
  Image,
  ScrollView,
  View as NonThemedView,
  useColorScheme,
} from "react-native";
import { useEffect, useState } from "react";
import { Item } from "../../classes/item";
import Coins from "../../assets/icons/CoinsIcon";
import {
  setGameData,
  setMonster,
  setPlayerCharacter,
} from "../../redux/slice/game";
import { AppDispatch } from "../../redux/store";
import SpellDetails from "../../components/SpellDetails";

export default function ShopScreen() {
  const { shop } = useLocalSearchParams();
  const game = useSelector(selectGame);
  const dispatch: AppDispatch = useDispatch();
  const playerCharacter = useSelector(selectPlayerCharacter);
  const thisShop = game?.getShops().find((aShop) => aShop.archetype == shop);
  const colorScheme = useColorScheme();
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

  useEffect(() => {
    if (
      playerCharacter &&
      thisShop &&
      thisShop.getLastRefresh() < new Date(Date.now() - 60 * 60 * 1000)
    ) {
      thisShop.refreshInventory(playerCharacter.playerClass);
    }
    setRefreshCheck(true);
  }, [playerCharacter]);

  function selectedItemDisplay() {
    if (selectedItem) {
      const transactionCompleteable = selectedItem.buying
        ? playerCharacter!.getGold() >=
          selectedItem.item.getBuyPrice(thisShop!.getAffection())
        : thisShop!.getCurrentGold() >=
          selectedItem.item.getSellPrice(thisShop!.getAffection());

      return (
        <View className="flex h-1/3 items-center justify-center">
          <Text>{toTitleCase(selectedItem.item.name)}</Text>
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
                ? selectedItem.item.getBuyPrice(thisShop!.getAffection())
                : selectedItem.item.getSellPrice(thisShop!.getAffection())}
            </Text>
            <Coins width={20} height={20} style={{ marginLeft: 6 }} />
          </View>
          <View>
            <Pressable
              disabled={!transactionCompleteable}
              onPress={moveBetweenInventories}
              className={`${
                !transactionCompleteable ? "bg-zinc-300" : "bg-blue-400"
              } my-4 rounded-lg  active:scale-95 active:opacity-50`}
            >
              <Text className="px-6 py-4" style={{ color: "white" }}>
                {selectedItem.buying ? "Purchase" : "Sell"}
              </Text>
            </Pressable>
          </View>
          {selectedSpell ? <SpellDetails spell={selectedSpell} /> : null}
        </View>
      );
    } else {
      return <View className="flex h-1/3 items-center justify-center"></View>;
    }
  }

  function moveBetweenInventories() {
    if (selectedItem && playerCharacter && thisShop && game) {
      if (selectedItem.buying) {
        const price = selectedItem.item.getBuyPrice(thisShop!.getAffection());
        playerCharacter.buyItem(selectedItem.item, price);
        thisShop.sellItem(selectedItem.item, price);
      } else {
        const price = selectedItem.item.getSellPrice(thisShop!.getAffection());
        thisShop.buyItem(selectedItem.item, price);
        playerCharacter.sellItem(selectedItem.item, price);
      }
      setSelectedItem(null);
      game.gameTick();
      dispatch(setMonster(null));
      dispatch(setGameData(game));
      dispatch(setPlayerCharacter(playerCharacter));
      fullSave(game, playerCharacter);
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

  if (refreshCheck && thisShop && game && playerCharacter) {
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
                  thisShop.shopKeeperBirthDate,
                  game.getGameDate(),
                )}
                characterSex={thisShop?.shopKeeperSex == "male" ? "M" : "F"}
              />
              <Text className="mx-auto text-center">
                {thisShop.shopKeeperName}'s Inventory
              </Text>
              <View className="mx-auto flex flex-row">
                <Text>{thisShop.getCurrentGold()}</Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
              </View>
            </View>
            <View className="mx-2 -mt-1 max-h-60 w-2/3 rounded border border-zinc-300 dark:border-zinc-700">
              <ScrollView className="my-auto">
                <View className="flex flex-row flex-wrap justify-around">
                  {thisShop.getInventory().map((item) => (
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
          {selectedItem ? (
            selectedItemDisplay()
          ) : (
            <View className="flex h-1/3 items-center justify-center" />
          )}
          <View className="h-1/3">
            <View className="flex flex-row justify-center border-b border-zinc-300 dark:border-zinc-700">
              <Text className="text-center">
                {playerCharacter.getName()}'s Inventory
              </Text>
              <View className="flex flex-row">
                <Text className="my-auto">
                  {" "}
                  ( {playerCharacter!.getReadableGold()}
                </Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                <Text> )</Text>
              </View>
            </View>
            <ScrollView>
              <View className="flex flex-row flex-wrap justify-around">
                {playerCharacter.getInventory().map((item) => (
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
          </View>
        </View>
      </>
    );
  }
}
