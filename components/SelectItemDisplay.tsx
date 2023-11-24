import Coins from "../assets/icons/CoinsIcon";
import { PlayerCharacter } from "../classes/character";
import { Item } from "../classes/item";
import { Shop } from "../classes/shop";
import { toTitleCase } from "../utility/functions";
import { View, Text } from "./Themed";
import { Image, Pressable } from "react-native";

type BaseDisplayOption = {
  item: Item;
  manipulatingFunction: () => void;
};

type HomeScreenDisplayOption = BaseDisplayOption & {
  isEquipped: boolean;
  buyingItem?: undefined;
  shop?: undefined;
  playerCharacter?: undefined;
};
type StoreDiplayOptions = BaseDisplayOption & {
  buyingItem: boolean;
  shop: Shop;
  playerCharacter: PlayerCharacter;
  isEquipped?: undefined;
};
type FullItemDisplayOption = StoreDiplayOptions | HomeScreenDisplayOption;

export default function SelectItemDisplay({
  item,
  isEquipped,
  buyingItem,
  manipulatingFunction,
  shop,
  playerCharacter,
}: FullItemDisplayOption) {
  let transactionCompleteable: boolean | undefined = undefined;
  if (shop) {
    transactionCompleteable = buyingItem
      ? playerCharacter!.getGold() >= item.getBuyPrice(shop.getAffection())
      : shop!.getCurrentGold() >= item.getSellPrice(shop.getAffection());
  }
  return (
    <View className="flex items-center justify-center py-4">
      <Text>{toTitleCase(item.name)}</Text>
      <Image source={item.getItemIcon()} />
      <Text>
        {item.itemClass == "bodyArmor"
          ? "Body Armor"
          : toTitleCase(item.itemClass)}
      </Text>
      {item.slot ? (
        <Text className="">Fills {toTitleCase(item.slot)} Slot</Text>
      ) : null}
      {item.stats ? <View></View> : null}
      {buyingItem !== undefined ? (
        <View className="flex flex-row">
          <Text>
            Price:{" "}
            {buyingItem
              ? item.getBuyPrice(shop.getAffection())
              : item.getSellPrice(shop.getAffection())}
          </Text>
          <Coins width={20} height={20} style={{ marginLeft: 6 }} />
        </View>
      ) : null}
      {item.slot ? (
        <View>
          <Pressable
            disabled={
              buyingItem == true
                ? playerCharacter!.getGold() <
                  item.getBuyPrice(shop.getAffection())
                : buyingItem == false
                ? shop.getCurrentGold() < item.getSellPrice(shop.getAffection())
                : false
            }
            onPress={() => manipulatingFunction()}
            className={`${
              transactionCompleteable == false ? "bg-zinc-300" : "bg-blue-400"
            } my-4 rounded-lg active:scale-95 active:opacity-50`}
          >
            <Text className="px-6 py-4" style={{ color: "white" }}>
              {isEquipped == true
                ? "Unequip"
                : isEquipped == false
                ? `Equip`
                : buyingItem
                ? "Purchase"
                : "Sell"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
