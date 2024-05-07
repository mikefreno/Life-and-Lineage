import { Dimensions, Pressable, View } from "react-native";
import { View as ThemedView, Text } from "./Themed";
import GearStatsDisplay from "./GearStatsDisplay";
import { useColorScheme } from "nativewind";
import { useVibration } from "../utility/customHooks";
import { router } from "expo-router";
import { toTitleCase } from "../utility/functions/misc/words";
import type { Item } from "../classes/item";
import { Dispatch } from "react";

interface StatsDisplayProps {
  statsLeftPos: number;
  statsTopPos: number;
  showingStats: Item;
  setShowingStats: Dispatch<React.SetStateAction<Item | null>>;
  topOffset?: number;
  leftOffset?: number;
}

export function StatsDisplay({
  statsLeftPos,
  statsTopPos,
  showingStats,
  setShowingStats,
  topOffset,
  leftOffset,
}: StatsDisplayProps) {
  const deviceWidth = Dimensions.get("window").width;
  const { colorScheme } = useColorScheme();
  const vibration = useVibration();

  return (
    <ThemedView
      className="absolute items-center rounded-md border border-zinc-600 p-4"
      style={{
        width: deviceWidth / 3 - 2,
        backgroundColor:
          colorScheme == "light"
            ? "rgba(250, 250, 250, 0.98)"
            : "rgba(20, 20, 20, 0.95)",
        left: statsLeftPos
          ? statsLeftPos < deviceWidth * 0.6
            ? statsLeftPos + 50
            : statsLeftPos - deviceWidth / 3
          : undefined,
        top: statsTopPos + (topOffset ?? 0),
      }}
    >
      <View>
        <Text className="text-center">{toTitleCase(showingStats.name)}</Text>
      </View>
      {showingStats.stats && showingStats.slot ? (
        <View className="py-2">
          <GearStatsDisplay stats={showingStats.stats} />
        </View>
      ) : null}
      {(showingStats.slot == "one-hand" ||
        showingStats.slot == "two-hand" ||
        showingStats.slot == "off-hand") && (
        <Text className="text-sm italic">{toTitleCase(showingStats.slot)}</Text>
      )}
      <Text className="text-sm italic">
        {showingStats.itemClass == "bodyArmor"
          ? "Body Armor"
          : toTitleCase(showingStats.itemClass)}
      </Text>
      {showingStats.itemClass == "book" ? (
        <Pressable
          onPress={() => {
            vibration({ style: "light" });
            setShowingStats(null);
            router.push("/Study");
          }}
          className="-mx-4 mt-2 w-full rounded-xl border border-zinc-900 px-2 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
        >
          <Text className="text-center">Study This Book</Text>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}
