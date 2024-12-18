import { Pressable, View } from "react-native";
import { Text } from "./Themed";
import { ItemClassType, Modifier } from "../utility/types";
import { useState } from "react";
import GenericModal from "./GenericModal";
import { Item } from "../entities/item";
import { observer } from "mobx-react-lite";
import GenericStrikeAround from "./GenericStrikeAround";
import { Image } from "expo-image";
import { cleanRoundToTenths } from "../utility/functions/misc";
import {
  getStatInfo,
  getTotalValue,
  shouldShowModifier,
} from "../utility/functions/stats";

const StatRow = observer(
  ({
    mod,
    magnitude,
    detailed = false,
    item,
  }: {
    mod: Modifier;
    magnitude: number;
    detailed?: boolean;
    item: Item;
  }) => {
    if (!detailed && !shouldShowModifier(mod, item)) {
      return null;
    }

    const statInfo = getStatInfo(mod);
    const Icon = statInfo.icon;
    const value = getTotalValue(mod, magnitude);

    return (
      <View className="flex flex-row items-center justify-between w-full space-x-1 m-0.5">
        <Icon height={detailed ? 24 : 18} width={detailed ? 24 : 18} />
        <Text className={`${detailed ? "pl-4 text-center" : ""}`}>
          {`${value} ${detailed ? statInfo.description || "" : ""}`}
          {detailed && statInfo.shouldShowTotal
            ? ` (${cleanRoundToTenths(item.stats?.get(mod) ?? 0)})`
            : ""}
        </Text>
      </View>
    );
  },
);

export default function GearStatsDisplay({ item }: { item: Item }) {
  if (!item.stats || item.stats.size === 0) {
    return null;
  }
  const [showingDetailedView, setShowingDetailedView] = useState(false);
  const shouldShowTotalDamage =
    (item.itemClass === ItemClassType.Bow ||
      item.itemClass === ItemClassType.Wand ||
      item.itemClass === ItemClassType.Melee ||
      item.itemClass === ItemClassType.Focus ||
      item.itemClass === ItemClassType.Staff) &&
    item.totalDamage > 0;

  const shouldShowTotalArmor =
    (item.itemClass === ItemClassType.BodyArmor ||
      item.itemClass === ItemClassType.Hat ||
      item.itemClass === ItemClassType.Helmet ||
      item.itemClass === ItemClassType.Shield) &&
    item.totalArmor > 0;

  return (
    <>
      <GenericModal
        isVisibleCondition={showingDetailedView}
        backFunction={() => setShowingDetailedView(false)}
      >
        <View className="px-4">
          <View className="flex flex-row justify-between pb-4">
            {shouldShowTotalDamage ? (
              <View className="w-1/2">
                <Text className="text-3xl" numberOfLines={2}>
                  {cleanRoundToTenths(item.totalDamage)} Total Damage
                </Text>
              </View>
            ) : shouldShowTotalArmor ? (
              <View className="w-1/2">
                <Text className="text-3xl" numberOfLines={2}>
                  {cleanRoundToTenths(item.totalArmor)} Total Armor
                </Text>
              </View>
            ) : (
              <View />
            )}
            <Image
              source={item.getItemIcon()}
              style={{
                width: 48,
                height: 48,
                marginTop: "auto",
                marginBottom: "auto",
              }}
            />
          </View>
          {Array.from(item.stats.entries()).map(([key, value]) => (
            <View key={key} className="">
              <StatRow
                mod={key as Modifier}
                magnitude={value}
                item={item}
                detailed={true}
              />
            </View>
          ))}
          <GenericStrikeAround>
            <Text className="text-sm text-center">
              ( ) Indicates cumulative effect as a standalone item.
            </Text>
          </GenericStrikeAround>
        </View>
      </GenericModal>
      <Pressable
        onLongPress={() => setShowingDetailedView(true)}
        className="flex flex-col rounded-lg bg-zinc-300/50 px-4 py-2 dark:bg-zinc-700/50"
      >
        <View className="flex flex-row flex-wrap items-center justify-center">
          {shouldShowTotalDamage && (
            <Text className="text-xl text-center">
              {cleanRoundToTenths(item.totalDamage)} Total Damage
            </Text>
          )}
          {shouldShowTotalArmor && (
            <Text className="text-xl text-center">
              {cleanRoundToTenths(item.totalArmor)} Total Armor
            </Text>
          )}
          {Array.from(item.stats.entries()).map(([key, value]) => (
            <View key={key} className="w-3/5">
              <StatRow mod={key as Modifier} magnitude={value} item={item} />
            </View>
          ))}
        </View>
        <Text className="mt-2 text-sm text-center w-full">
          Hold for more detail
        </Text>
      </Pressable>
    </>
  );
}
