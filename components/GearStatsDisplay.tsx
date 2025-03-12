import { Platform, Pressable, View } from "react-native";
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
import { useVibration } from "../hooks/generic";
import { flex, normalize, useStyles } from "../hooks/styles";
import React from "react";
import { useRootStore } from "../hooks/stores";

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
    const styles = useStyles();
    const { uiStore } = useRootStore();

    if (!detailed && !shouldShowModifier(mod, item)) {
      return null;
    }

    const statInfo = getStatInfo(mod);
    const Icon = statInfo.icon;
    const value = getTotalValue(mod, magnitude);

    return (
      <View style={styles.statRow}>
        <Icon
          height={detailed ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
          width={detailed ? uiStore.iconSizeLarge : uiStore.iconSizeSmall}
        />
        <Text
          style={
            detailed
              ? { paddingLeft: normalize(16), textAlign: "center" }
              : undefined
          }
        >
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
  const { uiStore } = useRootStore();
  const styles = useStyles();

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

  const vibrate = useVibration();

  return (
    <>
      <GenericModal
        isVisibleCondition={showingDetailedView}
        backFunction={() => setShowingDetailedView(false)}
        providedHeight={
          Platform.OS === "android" ? uiStore.dimensions.height : undefined
        }
      >
        <View style={{ paddingHorizontal: 16 }}>
          <View style={[styles.rowBetween, { paddingBottom: 12 }]}>
            {shouldShowTotalDamage ? (
              <View style={{ width: "50%" }}>
                <Text numberOfLines={2} style={styles["text-3xl"]}>
                  {cleanRoundToTenths(item.totalDamage)} Total Damage
                </Text>
              </View>
            ) : shouldShowTotalArmor ? (
              <View style={{ width: "50%" }}>
                <Text numberOfLines={2} style={styles["text-3xl"]}>
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
                marginVertical: "auto",
              }}
            />
          </View>
          {Array.from(item.stats.entries()).map(([key, value]) => (
            <View key={key}>
              <StatRow
                mod={key as Modifier}
                magnitude={value}
                item={item}
                detailed={true}
              />
            </View>
          ))}
          <GenericStrikeAround>
            <Text style={{ textAlign: "center", ...styles["text-sm"] }}>
              ( ) Indicates cumulative effect as a standalone item.
            </Text>
          </GenericStrikeAround>
        </View>
      </GenericModal>
      <Pressable
        onPressIn={() => {
          vibrate({ style: "light" });
        }}
        onLongPress={() => {
          vibrate({ style: "medium" });
          setShowingDetailedView(true);
        }}
        style={{
          flexDirection: "column",
          borderRadius: 8,
          backgroundColor:
            uiStore.colorScheme === "dark"
              ? "rgba(63, 63, 70, 0.5)"
              : "rgba(212, 212, 216, 0.5)",
          marginHorizontal: 4,
          padding: 8,
        }}
      >
        <View style={[flex.rowCenter, flex.wrap, { alignItems: "center" }]}>
          {shouldShowTotalDamage && (
            <Text style={{ textAlign: "center", ...styles["text-xl"] }}>
              {cleanRoundToTenths(item.totalDamage)} Total Damage
            </Text>
          )}
          {shouldShowTotalArmor && (
            <Text style={{ textAlign: "center", ...styles["text-xl"] }}>
              {cleanRoundToTenths(item.totalArmor)} Total Armor
            </Text>
          )}
          {Array.from(item.stats.entries()).map(([key, value]) => (
            <View key={key} style={{ width: "60%" }}>
              <StatRow mod={key as Modifier} magnitude={value} item={item} />
            </View>
          ))}
        </View>
        <Text
          style={{
            marginTop: 8,
            textAlign: "center",
            width: "100%",
            ...styles["text-sm"],
          }}
        >
          Hold for more detail
        </Text>
      </Pressable>
    </>
  );
}
