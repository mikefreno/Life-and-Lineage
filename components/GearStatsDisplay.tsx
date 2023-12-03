import { View, Text } from "react-native";
import ArmorIcon from "../assets/icons/ArmorIcon";
import Energy from "../assets/icons/EnergyIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import Sword from "../assets/icons/SwordIcon";
import ShieldSlashIcon from "../assets/icons/ShieldSlash";

interface GearStatsDisplayProps {
  stats: Record<string, number | undefined>;
}

export default function GearStatsDisplay({ stats }: GearStatsDisplayProps) {
  return (
    <View className="flex items-center rounded-lg bg-zinc-300 px-8 py-1 dark:bg-zinc-700">
      {stats.armor ? (
        <View className="flex flex-row">
          <Text>{stats.armor} </Text>
          <View className="my-auto">
            <ArmorIcon height={14} width={14} />
          </View>
        </View>
      ) : null}
      {stats.damage ? (
        <View className="flex flex-row">
          <Text>{stats.damage} </Text>
          <View className="my-auto">
            <Sword height={14} width={14} />
          </View>
        </View>
      ) : null}
      {stats.mana ? (
        <View className="flex flex-row">
          <Text>{stats.mana} </Text>
          <View className="my-auto">
            <Energy height={14} width={14} />
          </View>
        </View>
      ) : null}
      {stats.regen ? (
        <View className="flex flex-row">
          <Text>{stats.regen} </Text>
          <View className="my-auto">
            <ArmorIcon height={14} width={14} />
          </View>
        </View>
      ) : null}
      {stats.health ? (
        <View className="flex flex-row">
          <Text>{stats.health} </Text>
          <View className="my-auto">
            <HealthIcon height={14} width={14} />
          </View>
        </View>
      ) : null}
      {stats.blockChance ? (
        <View className="flex flex-row">
          <Text>{stats.blockChance * 100}% </Text>
          <View className="my-auto">
            <ShieldSlashIcon height={14} width={14} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
