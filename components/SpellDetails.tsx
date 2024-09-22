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
import { useContext } from "react";
import { AppContext } from "../app/_layout";
import { Spell } from "../classes/spell";
import { elementalColorMap } from "../constants/Colors";

export default function SpellDetails({ spell }: { spell: Spell }) {
  try {
    const { colorScheme } = useColorScheme();
    const appData = useContext(AppContext);
    if (!appData) throw new Error("missing context");
    const { dimensions, playerState } = appData;
    return (
      <View
        className="rounded-lg"
        style={{
          shadowColor: elementalColorMap[spell.element].dark,
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
                ? elementalColorMap[spell.element].dark
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
            {spell.rangerPet && (
              <View className="flex flex-col items-center">
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
              size={dimensions.width * 0.15}
            />
          </View>
        </View>
      </View>
    );
  } catch (e) {
    console.log(e);
    console.log(spell);
  }
}
