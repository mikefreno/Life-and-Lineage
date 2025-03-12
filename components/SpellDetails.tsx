import React from "react";
import { View } from "react-native";
import { toTitleCase } from "../utility/functions/misc";
import { Text } from "./Themed";
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
import { normalize, useStyles } from "../hooks/styles";
import GenericStrikeAround from "./GenericStrikeAround";

export default function SpellDetails({ spell }: { spell: Spell }) {
  const { playerState, uiStore } = useRootStore();
  const styles = useStyles();

  return (
    <View
      style={[
        styles.spellCard,
        { shadowColor: elementalColorMap[spell.element].dark },
      ]}
    >
      <View
        style={[
          styles.spellHeader,
          uiStore.colorScheme == "dark" && {
            borderColor:
              spell.element == Element.assassination
                ? elementalColorMap[spell.element].light
                : elementalColorMap[spell.element].dark,
          },
        ]}
      >
        <View
          style={{
            width: "25%",
            marginVertical: "auto",
            ...styles.itemsCenter,
          }}
        >
          <Text style={[styles.textCenter, styles["text-md"]]}>
            {toTitleCase(spell.name)}
          </Text>
          <View style={[styles.rowCenter, { alignItems: "center" }]}>
            <Text style={styles["text-md"]}>{spell.manaCost}</Text>
            <Energy
              width={uiStore.iconSizeSmall}
              height={uiStore.iconSizeSmall}
              style={{ marginLeft: 6 }}
            />
          </View>
        </View>
        <View
          style={{
            width: "40%",
            marginVertical: "auto",
            ...styles.itemsCenter,
          }}
        >
          {spell.duration > 1 ? (
            <View style={styles.rowCenter}>
              <Text>{spell.duration}</Text>
              <ClockIcon
                color={uiStore.colorScheme == "dark" ? "#f4f4f5" : "#18181b"}
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
              />
            </View>
          ) : null}
          {spell.baseDamage(playerState!) > 0 ? (
            <View style={[styles.rowCenter, { alignItems: "center" }]}>
              <Text>{spell.baseDamage(playerState!)}</Text>
              <HealthIcon
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
              />
            </View>
          ) : null}
          {spell.usesWeapon && !spell.userHasRequiredWeapon(playerState!) && (
            <Text style={styles.textCenter}>
              Requires: {toTitleCase(spell.usesWeapon)}
            </Text>
          )}
          {spell.selfDamage ? (
            <View style={styles.rowCenter}>
              <View style={styles.rowCenter}>
                {spell.selfDamage > 0 ? (
                  <>
                    <Text>{spell.selfDamage} Self</Text>
                    <HealthIcon
                      width={normalize(14)}
                      height={normalize(14)}
                      style={{ marginLeft: 6 }}
                    />
                  </>
                ) : spell.selfDamage < 0 ? (
                  <>
                    <Text>Heal {spell.selfDamage * -1}</Text>
                    <HealthIcon
                      width={normalize(14)}
                      height={normalize(14)}
                      style={{ marginLeft: 6 }}
                    />
                  </>
                ) : null}
              </View>
            </View>
          ) : null}
          {spell.summons?.map((summon, idx) => (
            <View key={idx} style={styles.rowCenter}>
              <Text>{toTitleCase(summon)}</Text>
              <NecromancerSkull
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
                color={uiStore.colorScheme == "light" ? "#27272a" : "#f4f4f5"}
              />
            </View>
          ))}
          {spell.rangerPet ? (
            <View style={[styles.rowCenter, { alignItems: "center" }]}>
              <Text style={styles["text-md"]}>
                {toTitleCase(spell.rangerPet)}
              </Text>
              <BeastMasteryIcon
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
              />
            </View>
          ) : null}
          {spell.buffs.length > 0 ? (
            <>
              <GenericStrikeAround style={styles["text-md"]}>
                Buffs
              </GenericStrikeAround>
              {spell.buffs?.map((buff) => (
                <Text style={styles.textCenter} key={buff}>
                  {toTitleCase(buff)}
                </Text>
              ))}
            </>
          ) : null}
          {spell.debuffs.length > 0 ? (
            <>
              <GenericStrikeAround style={styles["text-md"]}>
                Debuffs
              </GenericStrikeAround>
              {spell.debuffs?.map((debuff, idx) => (
                <Text style={styles.textCenter} key={idx}>
                  {toTitleCase(debuff.name)} - {debuff.chance * 100}%
                </Text>
              ))}
            </>
          ) : null}
        </View>
        <View style={{ marginVertical: "auto" }}>
          <BlessingDisplay
            blessing={spell.element}
            colorScheme={uiStore.colorScheme}
            size={uiStore.dimensions.width * 0.15}
          />
        </View>
      </View>
    </View>
  );
}
