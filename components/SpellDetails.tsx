import { View } from "react-native";
import { toTitleCase } from "../utility/functions/misc/words";
import { Text } from "./Themed";
import Energy from "../assets/icons/EnergyIcon";
import HealthIcon from "../assets/icons/HealthIcon";
import NecromancerSkull from "../assets/icons/NecromancerSkull";
import blessingDisplay from "./BlessingsDisplay";
import { useColorScheme } from "nativewind";
import { elementalColorMap } from "../utility/elementColors";
import ClockIcon from "../assets/icons/ClockIcon";
import { Spell } from "../utility/types";
import { Dimensions } from "react-native";

interface SpellDetailsProps {
  spell: Spell;
}

export default function SpellDetails({ spell }: SpellDetailsProps) {
  const windowWidth = Dimensions.get("window").width;
  const { colorScheme } = useColorScheme();
  return (
    <View
      className="mx-auto w-4/5 rounded-lg"
      style={{
        shadowColor:
          elementalColorMap[
            (spell.element as
              | "fire"
              | "water"
              | "air"
              | "earth"
              | "blood"
              | "summoning"
              | "pestilence"
              | "bone"
              | "holy"
              | "vengeance"
              | "protection") ?? "fire"
          ].dark,
        shadowOffset: {
          width: 2,
          height: 3,
        },
        elevation: 6,
        backgroundColor: colorScheme == "light" ? "#fafafa" : "#27272a",
        shadowOpacity: 0.25,
        shadowRadius: 5,
        maxWidth: windowWidth * 0.9,
      }}
    >
      <View
        className="flex flex-row justify-between rounded-lg p-2 dark:border"
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
                    | "summoning"
                    | "pestilence"
                    | "bone"
                    | "holy"
                    | "vengeance"
                    | "protection"
                ].dark
              : "",
        }}
      >
        <View className="my-auto">
          <Text className="text-center">{toTitleCase(spell.name)}</Text>
          <View className="flex flex-row items-center justify-center">
            <Text>{spell.manaCost}</Text>
            <Energy width={14} height={14} style={{ marginLeft: 6 }} />
          </View>
        </View>
        <View className="my-auto items-center w-1/2">
          {spell.duration ? (
            <View className="flex flex-row items-center">
              <Text>{spell.duration}</Text>
              <ClockIcon
                color={colorScheme == "dark" ? "#f4f4f5" : "#18181b"}
                width={14}
                height={14}
                style={{ marginLeft: 6 }}
              />
            </View>
          ) : null}
          {spell.effects.damage && spell.effects.damage > 0 ? (
            <View className="flex flex-row items-center">
              <Text>{spell.effects.damage}</Text>
              <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
            </View>
          ) : null}
          {spell.effects.buffs?.map((buff) => (
            <Text className="text-center" key={buff}>
              {toTitleCase(buff)}
            </Text>
          ))}
          {spell.effects.debuffs?.map((debuff, idx) => (
            <Text className="text-center" key={idx}>
              {toTitleCase(debuff.name)} - {debuff.chance * 100}%
            </Text>
          ))}
          {spell.effects.selfDamage ? (
            <View className="flex flex-row items-center">
              {spell.effects.selfDamage > 0 ? (
                <>
                  <Text>{spell.effects.selfDamage} Self</Text>
                  <HealthIcon
                    width={14}
                    height={14}
                    style={{ marginLeft: 6 }}
                  />
                </>
              ) : spell.effects.selfDamage < 0 ? (
                <>
                  <Text>Heal {spell.effects.selfDamage * -1}</Text>
                  <HealthIcon
                    width={14}
                    height={14}
                    style={{ marginLeft: 6 }}
                  />
                </>
              ) : null}
            </View>
          ) : null}
          {spell.effects.summon
            ? spell.effects.summon.map((summon, idx) => (
                <View key={idx} className="flex flex-col items-center">
                  <Text>{toTitleCase(summon)}</Text>
                  <NecromancerSkull
                    width={14}
                    height={14}
                    style={{ marginLeft: 6 }}
                    color={colorScheme == "light" ? "#27272a" : "#f4f4f5"}
                  />
                </View>
              ))
            : null}
        </View>
        <View className="my-auto">
          {blessingDisplay(spell.element, colorScheme, 40)}
        </View>
      </View>
    </View>
  );
}
