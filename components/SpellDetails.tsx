import { View } from "react-native";
import { toTitleCase } from "../utility/functions";
import { Text } from "./Themed";
import Energy from "../assets/icons/EnergyIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import NecromancerSkull from "../assets/icons/NecromancerSkull";
import blessingDisplay from "./BlessingsDisplay";
import { useColorScheme } from "nativewind";
import { elementalColorMap } from "../utility/elementColors";

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
    <View
      className="w-3/4 rounded-lg"
      style={{
        shadowColor:
          elementalColorMap[
            spell.element as
              | "fire"
              | "water"
              | "air"
              | "earth"
              | "blood"
              | "summons"
              | "pestilence"
              | "bone"
              | "holy"
              | "vengeance"
              | "protection"
          ].dark,
        shadowOffset: {
          width: 2,
          height: 3,
        },
        backgroundColor: colorScheme == "light" ? "#fafafa" : "#27272a",
        shadowOpacity: 0.25,
        shadowRadius: 5,
      }}
    >
      <View
        className="flex flex-row justify-between rounded-lg px-4 py-2 dark:border"
        style={{
          borderColor:
            colorScheme == "dark"
              ? elementalColorMap[
                  spell.element as
                    | "fire"
                    | "water"
                    | "air"
                    | "earth"
                    | "blood"
                    | "summons"
                    | "pestilence"
                    | "bone"
                    | "holy"
                    | "vengeance"
                    | "protection"
                ].dark
              : "",
        }}
      >
        <View className="my-auto pl-2">
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
          {spell.effects.buffs?.map((buff) => <Text key={buff}>{buff}</Text>)}
          {spell.effects.debuffs?.map((debuff, idx) => (
            <Text key={idx}>
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
            ? spell.effects.summon.map((summon, idx) => (
                <View key={idx} className="flex flex-row items-center">
                  <Text>{summon}</Text>
                  <NecromancerSkull />
                </View>
              ))
            : null}
        </View>
        {blessingDisplay(spell.element, colorScheme, 40)}
      </View>
    </View>
  );
}
