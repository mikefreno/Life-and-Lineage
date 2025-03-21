import React, { ReactNode } from "react";
import { View } from "react-native";
import { toTitleCase } from "../utility/functions/misc";
import { Text } from "./Themed";
import {
  BeastMasteryIcon,
  ClockIcon,
  Energy,
  Fire,
  HealthIcon,
  Holy,
  Lightning,
  NecromancerSkull,
  Pestilence,
  Raw,
  Regen,
  Sword,
  Winter,
} from "../assets/icons/SVGIcons";
import BlessingDisplay from "./BlessingsDisplay";
import { elementalColorMap } from "../constants/Colors";
import { DamageType, Element } from "../utility/types";
import { useRootStore } from "../hooks/stores";
import { normalize, useStyles } from "../hooks/styles";
import GenericStrikeAround from "./GenericStrikeAround";
import { Attack } from "@/entities/attack";

export default function SpellDetails({ spell }: { spell: Attack }) {
  if (spell.element === null) return;

  const { uiStore } = useRootStore();
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
            minWidth: "20%",
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
            flex: 1,
            marginVertical: "auto",
            ...styles.itemsCenter,
          }}
        >
          {spell.maxTurnsActive > 1 ? (
            <View style={styles.rowCenter}>
              <Text>{spell.maxTurnsActive}</Text>
              <ClockIcon
                color={uiStore.colorScheme == "dark" ? "#f4f4f5" : "#18181b"}
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
              />
            </View>
          ) : null}
          {spell.displayDamage.cumulative > 0 ? (
            <SplitDamageRender
              damageMap={spell.displayDamage.map}
              title={"Damage"}
            />
          ) : null}
          {spell.usesWeapon && spell.userHasRequiredWeapon && (
            <Text style={styles.textCenter}>
              Requires: {toTitleCase(spell.usesWeapon)}
            </Text>
          )}
          {spell.selfDamage ? (
            <View style={styles.rowCenter}>
              <View style={styles.rowCenter}>
                {spell.selfDamage.cumulative > 0 ? (
                  <>
                    <Text>{spell.selfDamage.cumulative} Self</Text>
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
          {spell.baseHealing ? (
            <View style={styles.rowCenter}>
              <View style={styles.rowCenter}>
                {spell.selfDamage.cumulative > 0 ? (
                  <>
                    <Text>{spell.baseHealing} Self</Text>
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
          {spell.summonNames?.map((summon, idx) => (
            <View key={summon + idx} style={styles.rowCenter}>
              <Text>{toTitleCase(summon)}</Text>
              <NecromancerSkull
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
                color={uiStore.colorScheme == "light" ? "#27272a" : "#f4f4f5"}
              />
            </View>
          ))}
          {spell.rangerPetName ? (
            <View style={[styles.rowCenter, { alignItems: "center" }]}>
              <Text style={styles["text-md"]}>
                {toTitleCase(spell.rangerPetName)}
              </Text>
              <BeastMasteryIcon
                width={uiStore.iconSizeSmall}
                height={uiStore.iconSizeSmall}
                style={{ marginLeft: 6 }}
              />
            </View>
          ) : null}
          {spell.buffNames && spell.buffNames.length > 0 ? (
            <>
              <GenericStrikeAround style={styles["text-md"]}>
                Buffs
              </GenericStrikeAround>
              {spell.buffNames.map((buff, idx) => (
                <Text style={styles.textCenter} key={buff + idx}>
                  {toTitleCase(buff)}
                </Text>
              ))}
            </>
          ) : null}
          {spell.debuffNames && spell.debuffNames.length > 0 ? (
            <>
              <GenericStrikeAround style={styles["text-md"]}>
                Debuffs
              </GenericStrikeAround>
              {spell.debuffNames.map((debuff, idx) => (
                <Text style={styles.textCenter} key={debuff.name + idx}>
                  {toTitleCase(debuff.name)} - {debuff.chance * 100}%
                </Text>
              ))}
            </>
          ) : null}
        </View>
        <View
          style={{
            marginVertical: "auto",
            minWidth: "20%",
            alignItems: "center",
          }}
        >
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

const SplitDamageRender = ({
  damageMap,
  title,
}: {
  damageMap: { [key in DamageType]?: number };
  title: string;
}) => {
  const styles = useStyles();
  const { uiStore } = useRootStore();

  const DamageTypeUtils: Record<DamageType, ReactNode> = {
    [DamageType.PHYSICAL]: (
      <Sword height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
    ),
    [DamageType.X]: (
      <Fire height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
    ),
    [DamageType.FIRE]: (
      <Winter height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
    ),
    [DamageType.LIGHTNING]: (
      <Lightning height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
    ),
    [DamageType.POISON]: (
      <Pestilence
        height={uiStore.iconSizeSmall}
        width={uiStore.iconSizeSmall}
      />
    ),
    [DamageType.HOLY]: (
      <Holy height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
    ),
    [DamageType.MAGIC]: (
      <Regen height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
    ),
    [DamageType.RAW]: (
      <Raw height={uiStore.iconSizeSmall} width={uiStore.iconSizeSmall} />
    ),
  };

  const activeDamageTypes = Object.entries(damageMap)
    .filter(([_, value]) => value && value > 0)
    .map(([key]) => parseInt(key) as DamageType);

  return (
    <View style={{ width: "100%" }}>
      <GenericStrikeAround style={{ paddingBottom: 4 }}>
        <Text style={styles["text-sm"]}>{title}</Text>
      </GenericStrikeAround>
      {activeDamageTypes.map((damageType) => (
        <View
          key={damageType}
          style={[styles.rowCenter, { alignItems: "center" }]}
        >
          <Text style={{ paddingRight: 4 }}>{damageMap[damageType]}</Text>
          {DamageTypeUtils[damageType]}
        </View>
      ))}
    </View>
  );
};
