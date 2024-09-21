import { FlatList, View } from "react-native";
import { Text } from "./Themed";
import {
  Air,
  Earth,
  Fire,
  NecromancerSkull,
  Water,
  WizardHat,
  BloodDrop,
  Pestilence,
  Bones,
  SummonerSkull,
  PaladinHammer,
  Holy,
  Vengeance,
  Protection,
} from "../assets/icons/SVGIcons";
import { Link } from "expo-router";
import mageSpells from "../assets/json/mageSpells.json";
import necromancerSpells from "../assets/json/necroSpells.json";
import paladinSpells from "../assets/json/paladinSpells.json";
import SpellDetails from "./SpellDetails";
import type { MasteryLevel } from "../utility/types";
import { toTitleCase } from "../utility/functions/misc";
import { descriptionMap } from "../utility/descriptions";
import { elementalColorMap } from "../constants/Colors";

export function MageCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <WizardHat width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">
          The Mage is the default class, it is well balanced, with a focus on
          casting elemental magic.
        </Text>
        <Text>The mage has four schools:</Text>
        <Link href="/Options/Codex/Player/Fire" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["fire"].dark }}
          >
            Fire
          </Text>
          <Fire height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Water" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["water"].dark }}
          >
            Water
          </Text>
          <Water height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Air" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["air"].dark }}
          >
            Air
          </Text>
          <Air height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Earth" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["earth"].dark }}
          >
            Earth
          </Text>
          <Earth height={24} width={24} />
        </Link>
        <Text className="text-2xl py-4" style={{ color: "#2563eb" }}>
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={mageSpells}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

export function WaterCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <Water width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["water"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["water"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={mageSpells.filter((spell) => spell.element == "water")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

export function FireCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <Fire width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["fire"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["fire"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={mageSpells.filter((spell) => spell.element == "fire")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

export function EarthCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <Earth width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["earth"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["earth"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={mageSpells.filter((spell) => spell.element == "earth")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

export function AirCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <Air width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["air"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["air"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={mageSpells.filter((spell) => spell.element == "air")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

export function NecromancerCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <NecromancerSkull width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">
          The Necromancer controls the forces of death, they can summon minions,
          use blood, bone and poisonous magics.
        </Text>
        <Text>The Necromancer has four schools:</Text>
        <Link href="/Options/Codex/Player/Blood" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["blood"].dark }}
          >
            Blood
          </Text>
          <BloodDrop height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Pestilence" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["pestilence"].dark }}
          >
            Pestilence
          </Text>
          <Pestilence height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Bone" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["bone"].dark }}
          >
            Bone
          </Text>
          <Bones height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Summoner" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["summoning"].dark }}
          >
            Summoning
          </Text>
          <SummonerSkull height={24} width={24} />
        </Link>
        <Text className="text-2xl py-4" style={{ color: "#4b5563" }}>
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={necromancerSpells}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
export function BloodCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <BloodDrop width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["blood"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["blood"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={necromancerSpells.filter((spell) => spell.element == "blood")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

export function PestilenceCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <Pestilence width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["pestilence"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["pestilence"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={necromancerSpells.filter((spell) => spell.element == "pestilence")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
export function BoneCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <Bones width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["bone"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["bone"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={necromancerSpells.filter((spell) => spell.element == "bone")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
export function SummonerCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <SummonerSkull width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["summoning"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["summoning"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={necromancerSpells.filter((spell) => spell.element == "summoning")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

export function PaladinCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <PaladinHammer width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">
          The Paladin is skilled with arms and uses holy magic, which is
          especially powerful against the undead and protecting life.
        </Text>
        <Text>The Paladin has three schools:</Text>
        <Link href="/Options/Codex/Player/Protection" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["protection"].dark }}
          >
            Protection
          </Text>
          <Protection height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Vengeance" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["vengeance"].dark }}
          >
            Vengeance
          </Text>
          <Vengeance height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Holy" suppressHighlighting>
          <Text
            className="text-2xl"
            style={{ color: elementalColorMap["holy"].dark }}
          >
            Holy
          </Text>
          <Holy height={24} width={24} />
        </Link>
        <Text className="text-2xl py-4" style={{ color: "#fcd34d" }}>
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={paladinSpells}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
export function ProtectionCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <Protection width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["protection"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["protection"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={paladinSpells.filter((spell) => spell.element == "protection")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
export function VengeanceCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <Vengeance width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["vengeance"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["vengeance"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={paladinSpells.filter((spell) => spell.element == "vengeance")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
export function HolyCodex() {
  const headerComponent = () => (
    <View className="px-4 pt-4">
      <View className="items-center">
        <Holy width={64} height={64} />
      </View>
      <View className="items-center">
        <Text className="text-center pt-8">{descriptionMap["holy"]}</Text>
        <Text
          className="text-2xl py-4"
          style={{ color: elementalColorMap["holy"].dark }}
        >
          Available Spells:
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View className="py-2 mx-auto">
      <SpellDetails
        spell={{
          name: item.name,
          element: item.element,
          proficiencyNeeded: toTitleCase(
            item.proficiencyNeeded,
          ) as unknown as MasteryLevel,
          manaCost: item.manaCost,
          duration: item.duration,
          effects: item.effects,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={paladinSpells.filter((spell) => spell.element == "holy")}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.name || index.toString()}
      ListHeaderComponent={headerComponent}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
