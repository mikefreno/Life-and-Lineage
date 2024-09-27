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
    <View className="flex w-full my-1 items-center bg-zinc-300 dark:bg-zinc-700 border rounded border-zinc-900 dark:border-zinc-50 pb-2">
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
      <View className="my-1 w-5/6 items-center rounded-md border border-zinc-800 px-2 py-1 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 ">
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
    </View>
  );
}
