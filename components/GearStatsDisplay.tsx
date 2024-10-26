import { View } from "react-native";
import { Text } from "../components/Themed";
import {
  ArmorIcon,
  Energy,
  HealthIcon,
  Regen,
  ShieldSlashIcon,
  Sword,
} from "../assets/icons/SVGIcons";

interface GearStatsDisplayProps {
  stats: Record<string, number> | null;
}

export default function GearStatsDisplay({ stats }: GearStatsDisplayProps) {
  if (
    !stats ||
    (!stats.armor &&
      !stats.damage &&
      !stats.mana &&
      !stats.regen &&
      !stats.health &&
      !stats.blockChance)
  ) {
    return;
  }

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
            <Regen height={14} width={14} />
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
          <Text>{Math.round(stats.blockChance * 100)}% </Text>
          <View className="my-auto">
            <ShieldSlashIcon height={14} width={14} />
          </View>
        </View>
      ) : null}
    </View>
  );
}
