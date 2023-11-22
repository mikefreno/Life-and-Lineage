import { Stack, useLocalSearchParams } from "expo-router";
import { View, Text } from "../../components/Themed";
import { useDispatch, useSelector } from "react-redux";
import { selectGame, selectPlayerCharacter } from "../../redux/selectors";
import {
  calculateAge,
  fullSave,
  savePlayer,
  toTitleCase,
} from "../../utility/functions";
import { CharacterImage } from "../../components/CharacterImage";
import { Pressable, Image, ScrollView, useColorScheme } from "react-native";
import { useEffect, useState } from "react";
import { Item } from "../../classes/item";
import Coins from "../../assets/icons/CoinsIcon";
import { setPlayerCharacter } from "../../redux/slice/game";
import { AppDispatch } from "../../redux/store";

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

  useEffect(() => {
    if (
      thisShop &&
      thisShop.getLastRefresh() < new Date(Date.now() - 60 * 60 * 1000)
    ) {
      thisShop.refreshInventory();
    }
    setRefreshCheck(true);
  }, []);

  function moveBetweenInventories() {
    if (selectedItem && playerCharacter && thisShop) {
      if (selectedItem.buying) {
        const price = selectedItem.item.getBuyPrice(thisShop!.getAffection());
        playerCharacter.buyItem(selectedItem.item, price);
        thisShop.sellItem(selectedItem.item, price);
        setSelectedItem(null);
        dispatch(setPlayerCharacter(playerCharacter));
        savePlayer(playerCharacter);
      } else {
        const price = selectedItem.item.getSellPrice(thisShop!.getAffection());
        thisShop.buyItem(selectedItem.item, price);
        playerCharacter.sellItem(selectedItem.item, price);
        setSelectedItem(null);
        dispatch(setPlayerCharacter(playerCharacter));
        savePlayer(playerCharacter);
      }
    }
  }

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
              disabled={
                selectedItem.buying
                  ? playerCharacter!.getGold() <
                    selectedItem.item.getBuyPrice(thisShop!.getAffection())
                  : thisShop!.getCurrentGold() <
                    selectedItem.item.getSellPrice(thisShop!.getAffection())
              }
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
        </View>
      );
    } else {
      return <View className="flex h-1/3 items-center justify-center"></View>;
    }
  }

  function displaySetter(item: Item, buying: boolean) {
    setSelectedItem({ item: item, buying: buying });
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
            <ScrollView
              className="my-auto max-h-60 w-2/3"
              style={{
                backgroundColor: colorScheme == "light" ? "#f4f4f5" : "#020617",
              }}
            >
              <View
                className="flex flex-row flex-wrap justify-around"
                style={{
                  backgroundColor:
                    colorScheme == "light" ? "#f4f4f5" : "#020617",
                }}
              >
                {thisShop.getInventory().map((item) => (
                  <Pressable
                    key={item.id}
                    className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                    onPress={() => displaySetter(item, true)}
                  >
                    <View
                      className="rounded-lg p-2"
                      style={{ backgroundColor: "#a1a1aa" }}
                    >
                      <Image source={item.getItemIcon()} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
          {selectedItemDisplay()}
          <View className="h-1/3">
            <View className="mx-auto flex flex-row">
              <Text className="text-center">
                {playerCharacter.getName()}'s Inventory
              </Text>
              <View className="flex flex-row">
                <Text className="my-auto"> ( {playerCharacter!.getGold()}</Text>
                <Coins width={16} height={16} style={{ marginLeft: 6 }} />
                <Text> )</Text>
              </View>
            </View>
            <ScrollView
              style={{
                backgroundColor: colorScheme == "light" ? "#f4f4f5" : "#020617",
              }}
            >
              <View
                className="flex flex-row flex-wrap justify-around"
                style={{
                  backgroundColor:
                    colorScheme == "light" ? "#f4f4f5" : "#020617",
                }}
              >
                {playerCharacter.getInventory().map((item) => (
                  <Pressable
                    key={item.id}
                    className="m-2 w-1/4 items-center active:scale-90 active:opacity-50"
                    onPress={() => displaySetter(item, false)}
                  >
                    <View
                      className="rounded-lg p-2"
                      style={{ backgroundColor: "#a1a1aa" }}
                    >
                      <Image source={item.getItemIcon()} />
                    </View>
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
