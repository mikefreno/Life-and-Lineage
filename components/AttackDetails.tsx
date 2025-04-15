import React from "react";
import { View } from "react-native";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { toTitleCase } from "@/utility/functions/misc";
import { Text } from "@/components/Themed";
import type { Attack } from "@/entities/attack";
import { useStyles } from "@/hooks/styles";

export default function AttackDetails({
  attack,
  baseDamage,
  styles,
}: {
  attack: Attack;
  baseDamage: number;
  styles: ReturnType<typeof useStyles>;
}) {
  return (
    <View style={styles.attackDetailsContainer}>
      <Text style={styles["text-xl"]}>{toTitleCase(attack.name)}</Text>
      <Text>
        {toTitleCase(attack.targets)}{" "}
        {(attack.targets == "single" || attack.targets == "dual") && "Target"}
      </Text>
      {attack.targets && <Text>{attack.baseHitChance * 100}% hit chance</Text>}
      {attack.buffNames && attack.buffNames.length > 0 && (
        <>
          <GenericStrikeAround>Buffs</GenericStrikeAround>
          {attack.buffNames.map((buff, idx) => (
            <View key={`${buff}-${idx}`}>
              <Text>{buff}</Text>
            </View>
          ))}
        </>
      )}
      {attack.debuffs.length > 0 && (
        <>
          <GenericStrikeAround>Debuffs</GenericStrikeAround>
          {attack.debuffNames?.map((debuff, idx) => (
            <View
              key={`${debuff.name}-${idx}`}
              style={styles.attackEffectContainer}
            >
              <Text>{toTitleCase(debuff.name)}</Text>
              <Text>{debuff.chance * 100}% effect chance</Text>
            </View>
          ))}
        </>
      )}
      <View style={styles.attackDamageBox}>
        <Text style={{ textAlign: "center" }}>
          {baseDamage}
          {attack.hitsPerTurn > 1
            ? `x${attack.hitsPerTurn}(${
                Math.round(baseDamage * attack.hitsPerTurn * 4) / 4
              } total)`
            : ""}{" "}
          base attack damage
        </Text>
      </View>
    </View>
  );
}
