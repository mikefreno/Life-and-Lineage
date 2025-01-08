import React, { ReactNode } from "react";
import { FlatList, View, ViewStyle } from "react-native";
import { Link } from "expo-router";
import SpellDetails from "./SpellDetails";
import { Element, ElementToString, PlayerClassOptions } from "../utility/types";
import { ClassDescriptionMap, DescriptionMap } from "../utility/descriptions";
import { elementalColorMap, playerClassColors } from "../constants/Colors";
import { Text } from "./Themed";

// Import spell data
import mageSpells from "../assets/json/mageSpells.json";
import necromancerSpells from "../assets/json/necroSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import rangerSpells from "../assets/json/rangerSpells.json";
import BlessingDisplay from "./BlessingsDisplay";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "../assets/icons/SVGIcons";
import { Spell } from "../entities/spell";
import { useRootStore } from "../hooks/stores";
import { useStyles } from "../hooks/styles";

const ClassCodex = ({
  classOption,
  icon,
  schools,
  spells,
}: {
  classOption: PlayerClassOptions;
  icon: ReactNode;
  schools: Element[];
  spells: any[];
}) => {
  const { uiStore } = useRootStore();
  const styles = useStyles();

  const headerComponent = () => (
    <View style={[styles.px4, styles.pt4]}>
      <View style={styles.columnCenter}>{icon}</View>
      <View style={styles.columnCenter}>
        <Text style={[styles.textCenter, styles.pt8]}>
          {ClassDescriptionMap[classOption]}
        </Text>
        <Text>
          The {classOption} has {schools.length} schools:
        </Text>
        {schools.map((school, idx) => (
          <Link
            key={idx}
            href={`/Options/Codex/Player/${ElementToString[school]}`}
            suppressHighlighting
          >
            <Text
              style={{
                ...styles["2xl"],
                color:
                  uiStore.colorScheme == "dark"
                    ? school == Element.assassination
                      ? elementalColorMap[school].light
                      : elementalColorMap[school].dark
                    : elementalColorMap[school].dark,
              }}
            >
              {ElementToString[school]}
            </Text>
            {BlessingDisplay({
              blessing: school,
              colorScheme: uiStore.colorScheme,
              size: 24,
            })}
          </Link>
        ))}
        <Text
          style={[
            styles["2xl"],
            styles.py4,
            {
              color: playerClassColors[classOption],
            },
          ]}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={[styles.py2, styles.mxAuto]}>
      <SpellDetails spell={new Spell({ ...item })} />
    </View>
  );

  return (
    <FlatList
      data={spells}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 } as ViewStyle}
    />
  );
};

const ElementCodex = ({
  element,
  spells,
}: {
  element: Element;
  spells: any[];
}) => {
  const { uiStore } = useRootStore();
  const styles = useStyles();

  const headerComponent = () => (
    <View style={styles.px4}>
      <View style={styles.itemsCenter}>
        {BlessingDisplay({
          blessing: element,
          colorScheme: uiStore.colorScheme,
        })}
      </View>
      <View style={styles.itemsCenter}>
        <Text style={[styles.textCenter, styles.pt8]}>
          {DescriptionMap[element as Element]}
        </Text>
        <Text
          style={{
            color: elementalColorMap[element].dark,
            ...styles["2xl"],
            ...styles.py4,
          }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={[styles.py2, styles.mxAuto]}>
      <SpellDetails spell={new Spell({ ...item })} />
    </View>
  );

  return (
    <FlatList
      data={spells}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 } as ViewStyle}
    />
  );
};

export const MageCodex = () => (
  <ClassCodex
    classOption={PlayerClassOptions.mage}
    icon={<WizardHat />}
    schools={[Element.fire, Element.water, Element.air, Element.earth]}
    spells={mageSpells}
  />
);

export const FireCodex = () => (
  <ElementCodex
    element={Element.fire}
    spells={mageSpells.filter((spell) => spell.element === "fire")}
  />
);
export const WaterCodex = () => (
  <ElementCodex
    element={Element.water}
    spells={mageSpells.filter((spell) => spell.element === "water")}
  />
);
export const AirCodex = () => (
  <ElementCodex
    element={Element.air}
    spells={mageSpells.filter((spell) => spell.element === "air")}
  />
);
export const EarthCodex = () => (
  <ElementCodex
    element={Element.earth}
    spells={mageSpells.filter((spell) => spell.element === "earth")}
  />
);

export const NecromancerCodex = () => (
  <ClassCodex
    classOption={PlayerClassOptions.necromancer}
    icon={<NecromancerSkull />}
    schools={[
      Element.blood,
      Element.summoning,
      Element.bone,
      Element.pestilence,
    ]}
    spells={necromancerSpells}
  />
);

export const BloodCodex = () => (
  <ElementCodex
    element={Element.blood}
    spells={necromancerSpells.filter((spell) => spell.element === "blood")}
  />
);
export const BoneCodex = () => (
  <ElementCodex
    element={Element.bone}
    spells={necromancerSpells.filter((spell) => spell.element === "bone")}
  />
);
export const PestilenceCodex = () => (
  <ElementCodex
    element={Element.pestilence}
    spells={necromancerSpells.filter((spell) => spell.element === "pestilence")}
  />
);
export const SummoningCodex = () => (
  <ElementCodex
    element={Element.summoning}
    spells={necromancerSpells.filter((spell) => spell.element === "summoning")}
  />
);

export const PaladinCodex = () => (
  <ClassCodex
    classOption={PlayerClassOptions.paladin}
    icon={<PaladinHammer />}
    schools={[Element.protection, Element.holy, Element.vengeance]}
    spells={paladinSpells}
  />
);

export const ProtectionCodex = () => (
  <ElementCodex
    element={Element.protection}
    spells={paladinSpells.filter((spell) => spell.element === "protection")}
  />
);
export const HolyCodex = () => (
  <ElementCodex
    element={Element.holy}
    spells={paladinSpells.filter((spell) => spell.element === "holy")}
  />
);
export const VengeanceCodex = () => (
  <ElementCodex
    element={Element.vengeance}
    spells={paladinSpells.filter((spell) => spell.element === "vengeance")}
  />
);

export const RangerCodex = () => (
  <ClassCodex
    classOption={PlayerClassOptions.ranger}
    icon={<RangerIcon />}
    schools={[Element.beastMastery, Element.assassination, Element.arcane]}
    spells={rangerSpells}
  />
);

export const BeastMasteryCodex = () => (
  <ElementCodex
    element={Element.beastMastery}
    spells={rangerSpells.filter((spell) => spell.element === "beastMastery")}
  />
);
export const AssassinationCodex = () => (
  <ElementCodex
    element={Element.assassination}
    spells={rangerSpells.filter((spell) => spell.element === "assassination")}
  />
);
export const ArcaneCodex = () => (
  <ElementCodex
    element={Element.arcane}
    spells={rangerSpells.filter((spell) => spell.element === "arcane")}
  />
);
