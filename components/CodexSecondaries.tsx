import React, { ReactNode } from "react";
import { FlatList, View, ViewStyle } from "react-native";
import { Text } from "./Themed";
import { Link } from "expo-router";
import SpellDetails from "./SpellDetails";
import { Element, ElementToString, PlayerClassOptions } from "../utility/types";
import { ClassDescriptionMap, DescriptionMap } from "../utility/descriptions";
import { elementalColorMap, playerClassColors } from "../constants/Colors";
import { Spell } from "../classes/spell";

// Import spell data
import mageSpells from "../assets/json/mageSpells.json";
import necromancerSpells from "../assets/json/necroSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import rangerSpells from "../assets/json/rangerSpells.json";
import BlessingDisplay from "./BlessingsDisplay";
import { useColorScheme } from "nativewind";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "../assets/icons/SVGIcons";

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
  const { colorScheme } = useColorScheme();
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">{icon}</View>
      <View className="items-center">
        <Text className="text-center pt-8">
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
              className="text-2xl"
              style={{
                color:
                  colorScheme == "dark"
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
              colorScheme: colorScheme,
              size: 24,
            })}
          </Link>
        ))}
        <Text
          className="text-2xl py-4"
          style={{ color: playerClassColors[classOption] }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
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
  const { colorScheme } = useColorScheme();
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        {BlessingDisplay({ blessing: element, colorScheme: colorScheme })}
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">
          {DescriptionMap[element as Element]}
        </Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap[element].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
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
