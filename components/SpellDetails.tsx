import { View } from "react-native";
import { toTitleCase } from "../utility/functions/misc/words";
import { Text } from "./Themed";
import { useColorScheme } from "nativewind";
import { elementalColorMap } from "../utility/elementColors";
import { Spell } from "../utility/types";
import {
  ClockIcon,
  Energy,
  HealthIcon,
  NecromancerSkull,
} from "../assets/icons/SVGIcons";
import BlessingDisplay from "./BlessingsDisplay";
import { useContext } from "react";
import { AppContext } from "../app/_layout";

interface SpellDetailsProps {
  spell: Spell;
}

export default function SpellDetails({ spell }: SpellDetailsProps) {
  const { colorScheme } = useColorScheme();
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing context");
  const { dimensions } = appData;
  return (
    <View
      className="rounded-lg"
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
        width: dimensions.width * 0.75,
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
        <View className="my-auto w-1/4">
          <Text className="text-center">{toTitleCase(spell.name)}</Text>
          <View className="flex flex-row items-center justify-center">
            <Text>{spell.manaCost}</Text>
            <Energy width={14} height={14} style={{ marginLeft: 6 }} />
          </View>
        </View>
        <View className="my-auto items-center w-2/5">
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
          <BlessingDisplay
            blessing={spell.element}
            colorScheme={colorScheme}
            size={dimensions.width * 0.15}
          />
        </View>
      </View>
    </View>
  );
}
