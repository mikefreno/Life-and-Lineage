import React from "react";
import { View, Text, Pressable } from "react-native";
import Coins from "../assets/icons/CoinsIcon";
import Energy from "../assets/icons/EnergyIcon";
import Sanity from "../assets/icons/SanityIcon";
import HealthIcon from "../assets/icons/HealthIcon";

interface LaborTaskProps {
  title: string;
  reward: number;
  cost: {
    energy: number;
    happiness?: number;
    sanity?: number;
    health?: number;
  };
}

export default function LaborTask({ title, reward, cost }: LaborTaskProps) {
  return (
    <View className="mx-2 my-2 flex justify-between rounded-xl bg-zinc-200 px-4 py-2 text-zinc-950 dark:bg-zinc-800">
      <View className="flex flex-row justify-between">
        <Text className="bold my-auto w-2/3 text-xl dark:text-zinc-50">
          {title}
        </Text>
        <View className="my-auto -mb-8 mt-8 w-1/3">
          <View className="flex w-full flex-row items-center justify-evenly">
            <Text className="dark:text-zinc-50">{reward}</Text>
            <Coins width={14} height={14} style={{ marginLeft: 6 }} />
          </View>
          <View className="flex w-full flex-row items-center justify-evenly">
            <Text className="dark:text-zinc-50">-{cost.energy}</Text>
            <Energy width={14} height={14} style={{ marginLeft: 6 }} />
          </View>
          {cost.health && (
            <View className="flex w-full flex-row items-center justify-evenly">
              <Text className="dark:text-zinc-50">{cost.health}</Text>
              <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
            </View>
          )}
          {cost.sanity && (
            <View className="flex w-full flex-row items-center justify-evenly">
              <Text className="dark:text-zinc-50">{cost.sanity}</Text>
              <Sanity width={14} height={14} style={{ marginLeft: 6 }} />
            </View>
          )}
        </View>
      </View>
      <Pressable className="mx-auto mb-2 mt-4">
        {({ pressed }) => (
          <View
            className={`my-auto rounded-xl bg-sky-50 px-8 py-4 ${
              pressed ? "scale-95 opacity-30" : null
            }`}
          >
            <Text className="text-center">Apply</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
