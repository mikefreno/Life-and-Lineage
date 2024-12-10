import { View } from "react-native";
import { Text } from "./Themed";
import {
  ArmorIcon,
  Energy,
  HealthIcon,
  ShieldSlashIcon,
} from "../assets/icons/SVGIcons";
import { Modifier } from "../utility/types";

const ModifierLabel: Record<Modifier, string> = {
  health: "Health",
  mana: "Mana",
  sanity: "Sanity",
  healthRegen: "Health Regen",
  manaRegen: "Mana Regen",
  sanityRegen: "Sanity Regen",
  strength: "Strength",
  dexterity: "Dexterity",
  intelligence: "Intelligence",
  armor: "Armor",
  blockChance: "Block Chance",
  dodgeChance: "Dodge Chance",
  fireResistance: "Fire Resist",
  coldResistance: "Cold Resist",
  lightningResistance: "Lightning Resist",
  poisonResistance: "Poison Resist",
  physicalDamageAdded: "Physical Damage",
  fireDamageAdded: "Fire Damage",
  coldDamageAdded: "Cold Damage",
  lightningDamageAdded: "Lightning Damage",
  poisonDamageAdded: "Poison Damage",
  physicalDamageMultiplier: "Physical Dmg Mult",
  fireDamageMultiplier: "Fire Dmg Mult",
  coldDamageMultiplier: "Cold Dmg Mult",
  lightningDamageMultiplier: "Lightning Dmg Mult",
  poisonDamageMultiplier: "Poison Dmg Mult",
};

interface GearStatsDisplayProps {
  stats: Partial<Record<Modifier, number>>;
}

const StatRow: React.FC<{ modifier: Modifier; value: number }> = ({
  modifier,
  value,
}) => {
  let icon = null;
  let displayValue = value;

  switch (modifier) {
    case "health":
      icon = <HealthIcon height={14} width={14} />;
      break;
    case "mana":
      icon = <Energy height={14} width={14} />;
      break;
    case "armor":
      icon = <ArmorIcon height={14} width={14} />;
      break;
    case "blockChance":
      icon = <ShieldSlashIcon height={14} width={14} />;
      displayValue = Math.round(value * 100);
      break;
    default:
      icon = <Text className="text-xs">{ModifierLabel[modifier]}</Text>;
  }

  return (
    <View className="flex flex-row items-center space-x-1">
      <Text>
        {displayValue}
        {modifier === "blockChance" ? "%" : ""}{" "}
      </Text>
      <View className="my-auto">{icon}</View>
    </View>
  );
};

export default function GearStatsDisplay({ stats }: GearStatsDisplayProps) {
  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }

  return (
    <View className="flex flex-wrap items-center justify-center rounded-lg bg-zinc-300/50 px-4 py-2 dark:bg-zinc-700/50">
      {Object.entries(stats).map(([key, value]) => (
        <View key={key} className="m-1">
          <StatRow modifier={key as Modifier} value={value} />
        </View>
      ))}
    </View>
  );
}
