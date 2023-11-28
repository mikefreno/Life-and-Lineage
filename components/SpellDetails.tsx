import { View } from "react-native";
import { toTitleCase } from "../utility/functions";
import { Text } from "./Themed";
import Energy from "../assets/icons/EnergyIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import NecromancerSkull from "../assets/icons/NecromancerSkull";
import blessingDisplay from "./BlessingsDisplay";
import { useColorScheme } from "nativewind";

interface SpellDetailInterface {
  spell: {
    name: string;
    element: string;
    proficiencyNeeded: number;
    manaCost: number;
    effects: {
      damage: number | null;
      buffs: string[] | null;
      debuffs:
        | {
            name: string;
            chance: number;
          }[]
        | null;
      summon?: string[] | undefined;
      selfDamage?: number | undefined;
    };
  };
}

export default function SpellDetails({ spell }: SpellDetailInterface) {
  const { colorScheme } = useColorScheme();
  return (
    <View className="flex w-3/4 flex-row justify-between rounded-lg bg-zinc-700 px-8 py-2">
      <View className="my-auto">
        <Text>{toTitleCase(spell.name)}</Text>
        <View className="flex flex-row items-center justify-center">
          <Text>{spell.manaCost}</Text>
          <Energy width={14} height={14} style={{ marginLeft: 6 }} />
        </View>
      </View>
      <View className="my-auto items-center">
        <View className="flex flex-row items-center">
          <Text>{spell.effects.damage}</Text>
          <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
        </View>
        {spell.effects.buffs?.map((buff) => <Text>{buff}</Text>)}
        {spell.effects.debuffs?.map((debuff) => (
          <Text>
            {debuff.name} - {debuff.chance * 100}%
          </Text>
        ))}
        {spell.effects.selfDamage ? (
          <View className="flex flex-row items-center">
            <Text>{spell.effects.selfDamage} Self</Text>
            <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
          </View>
        ) : null}
        {spell.effects.summon
          ? spell.effects.summon.map((summon) => (
              <View className="flex flex-row items-center">
                <Text>{summon}</Text>
                <NecromancerSkull />
              </View>
            ))
          : null}
      </View>
      {blessingDisplay(spell.element, colorScheme, 40)}
    </View>
  );
}
