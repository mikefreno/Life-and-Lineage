import React from "react";
import { View, Text } from "react-native";

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
    <View className="mx-2 my-2 flex flex-row justify-between rounded bg-zinc-200 px-4 py-1 dark:text-white">
      <Text className="bold w-1/2 text-xl">{title}</Text>
      <View>
        <Text>{reward} Gold</Text>
        <Text>{cost.energy} Energy</Text>
        {cost.happiness && <Text>{cost.happiness} Happiness</Text>}
        {cost.sanity && <Text>{cost.sanity} Sanity</Text>}
        {cost.health && <Text>{cost.health} Health</Text>}
      </View>
    </View>
  );
}
