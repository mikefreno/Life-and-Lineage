import React from "react";
import { View } from "react-native";
import GenericStrikeAround from "./GenericStrikeAround";
import { toTitleCase } from "../utility/functions/misc";
import { Text } from "./Themed";
import type { Attack } from "../entities/attack";
import { useStyles } from "../hooks/styles";

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
      <Text style={styles.xl}>{toTitleCase(attack.name)}</Text>
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
          {attack.buffStrings.map((buff, idx) => (
            <View key={`${buff}-${idx}`}>
              <Text>{buff}</Text>
            </View>
          ))}
        </>
      )}
      {attack.debuffs.length > 0 && (
        <>
          <GenericStrikeAround>Debuffs</GenericStrikeAround>
          {attack.debuffStrings.map((debuff, idx) => (
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
