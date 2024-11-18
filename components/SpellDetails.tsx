import { View } from "react-native";
import { toTitleCase } from "../utility/functions/misc";
import { Text } from "./Themed";
import { useColorScheme } from "nativewind";
import {
  BeastMasteryIcon,
  ClockIcon,
  Energy,
  HealthIcon,
  NecromancerSkull,
} from "../assets/icons/SVGIcons";
import BlessingDisplay from "./BlessingsDisplay";
import { elementalColorMap } from "../constants/Colors";
import { Element } from "../utility/types";
import type { Spell } from "../entities/spell";
import { useRootStore } from "../hooks/stores";

export default function SpellDetails({ spell }: { spell: Spell }) {
  const { colorScheme } = useColorScheme();
  const { playerState, uiStore } = useRootStore();
  return (
    <View
      className={`rounded-lg shadow shadow-[${
        elementalColorMap[spell.element].dark
      }]/25`}
      style={{
        backgroundColor: colorScheme == "light" ? "#fafafa" : "#27272a",
        shadowRadius: 5,
        width: uiStore.dimensions.window.width * 0.75,
        elevation: 6,
      }}
    >
      <View
        className="flex flex-row justify-between rounded-lg p-2 dark:border"
        style={{
          borderColor:
            colorScheme == "dark"
              ? spell.element == Element.assassination
                ? elementalColorMap[spell.element].light
                : elementalColorMap[spell.element].dark
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
          {spell.duration > 1 ? (
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
          {spell.baseDamage(playerState!) &&
          spell.baseDamage(playerState!) > 0 ? (
            <View className="flex flex-row items-center">
              <Text>{spell.baseDamage(playerState!)}</Text>
              <HealthIcon width={14} height={14} style={{ marginLeft: 6 }} />
            </View>
          ) : null}
          {spell.buffs?.map((buff) => (
            <Text className="text-center" key={buff}>
              {toTitleCase(buff)}
            </Text>
          ))}
          {spell.debuffs?.map((debuff, idx) => (
            <Text className="text-center" key={idx}>
              {toTitleCase(debuff.name)} - {debuff.chance * 100}%
            </Text>
          ))}
          {spell.usesWeapon && !spell.userHasRequiredWeapon(playerState!) && (
            <Text className="text-center">
              Requires: {toTitleCase(spell.usesWeapon)}
            </Text>
          )}
          {spell.selfDamage ? (
            <View className="flex flex-row items-center">
              {spell.selfDamage > 0 ? (
                <>
                  <Text>{spell.selfDamage} Self</Text>
                  <HealthIcon
                    width={14}
                    height={14}
                    style={{ marginLeft: 6 }}
                  />
                </>
              ) : spell.selfDamage < 0 ? (
                <>
                  <Text>Heal {spell.selfDamage * -1}</Text>
                  <HealthIcon
                    width={14}
                    height={14}
                    style={{ marginLeft: 6 }}
                  />
                </>
              ) : null}
            </View>
          ) : null}
          {spell.summons
            ? spell.summons.map((summon, idx) => (
                <View key={idx} className="flex flex-row items-center">
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
          {spell.rangerPet && (
            <View className="flex flex-row items-center">
              <Text>{toTitleCase(spell.rangerPet)}</Text>
              <BeastMasteryIcon
                width={14}
                height={14}
                style={{ marginLeft: 6 }}
              />
            </View>
          )}
        </View>
        <View className="my-auto">
          <BlessingDisplay
            blessing={spell.element}
            colorScheme={colorScheme}
            size={uiStore.dimensions.window.width * 0.15}
          />
        </View>
      </View>
    </View>
  );
}
