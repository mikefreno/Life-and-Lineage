import { View } from "react-native";
import { Text } from "./Themed";
import GenericStrikeAround from "./GenericStrikeAround";
import { Attack } from "../classes/attack";
import { toTitleCase } from "../utility/functions/misc";

export default function AttackDetails({
  attack,
  baseDamage,
}: {
  attack: Attack;
  baseDamage: number;
}) {
  return (
    <>
      <Text className="text-xl">{toTitleCase(attack.name)}</Text>
      <Text>
        {toTitleCase(attack.attackStyle)}{" "}
        {attack.attackStyle == "single" && "Target"}
      </Text>
      {attack.attackStyle && (
        <Text>{attack.baseHitChance * 100}% hit chance</Text>
      )}
      {attack.buffs.length > 0 && (
        <>
          <GenericStrikeAround>Buffs</GenericStrikeAround>
          {attack.buffs.map((buff) => (
            <View>
              <Text>{buff}</Text>
            </View>
          ))}
        </>
      )}
      {attack.debuffs.length > 0 && (
        <>
          <GenericStrikeAround>Debuffs</GenericStrikeAround>
          {attack.debuffs.map((debuff) => (
            <View>
              <Text>{debuff.name}</Text>
              <Text>{debuff.chance * 100}% effect chance</Text>
            </View>
          ))}
        </>
      )}
      <View className="my-1 w-5/6 items-center rounded-md border border-zinc-800 px-2 py-1 dark:border-zinc-100">
        <Text className="text-center">
          {baseDamage}
          {attack.hits > 1
            ? `x${attack.hits}(${
                Math.round(baseDamage * attack.hits * 4) / 4
              } total)`
            : ""}{" "}
          base attack damage
        </Text>
      </View>
    </>
  );
}
