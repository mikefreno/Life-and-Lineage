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
} from "../assets/icons/SVGIcons";
import { Link } from "expo-router";
import mageSpells from "../assets/json/mageSpells.json";
import necromancerSpells from "../assets/json/necroSpells.json";
import SpellDetails from "./SpellDetails";
import type { MasteryLevel } from "../utility/types";
import { toTitleCase } from "../utility/functions/misc/words";

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
          <Text className="text-2xl" style={{ color: "#ea580c" }}>
            Fire
          </Text>
          <Fire height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Water" suppressHighlighting>
          <Text className="text-2xl" style={{ color: "#3b82f6" }}>
            Water
          </Text>
          <Water height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Air" suppressHighlighting>
          <Text className="text-2xl" style={{ color: "#cbd5e1" }}>
            Air
          </Text>
          <Air height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Earth" suppressHighlighting>
          <Text className="text-2xl" style={{ color: "#937D62" }}>
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
        <Text className="text-center pt-8">
          The School of Water focuses on healing the caster and freezing
          opponents, at the highest levels it can even give the caster control
          over their enemies.
        </Text>
        <Text className="text-2xl py-4" style={{ color: "#3b82f6" }}>
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
        <Text className="text-center pt-8">
          The School of Fire has its focus in all out damage, fire spells hit
          hard, and can leave enemies burnt.
        </Text>
        <Text className="text-2xl py-4" style={{ color: "#ea580c" }}>
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
        <Text className="text-center pt-8">
          The School of Earth believes in defense. Prevent your enemies from
          moving and coat yourself in armor of stones.
        </Text>
        <Text className="text-2xl py-4" style={{ color: "#937D62" }}>
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
        <Text className="text-center pt-8">
          The School of Air channels lightning and terrifying winds, these
          spells can debilitate and defend.
        </Text>
        <Text className="text-2xl py-4" style={{ color: "#cbd5e1" }}>
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
        <Text className="text-center pt-8">The Necromancer</Text>
        <Text>The Necromancer has four schools:</Text>
        <Link href="/Options/Codex/Player/Blood" suppressHighlighting>
          <Text className="text-2xl" style={{ color: "#ea580c" }}>
            Blood
          </Text>
          <BloodDrop height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Pestilence" suppressHighlighting>
          <Text className="text-2xl" style={{ color: "#3b82f6" }}>
            Pestilence
          </Text>
          <Pestilence height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Bones" suppressHighlighting>
          <Text className="text-2xl" style={{ color: "#cbd5e1" }}>
            Bones
          </Text>
          <Bones height={24} width={24} />
        </Link>
        <Link href="/Options/Codex/Player/Summoner" suppressHighlighting>
          <Text className="text-2xl" style={{ color: "#937D62" }}>
            Summoning
          </Text>
          <Earth height={24} width={24} />
        </Link>
        <Text className="text-2xl py-4" style={{ color: "#9333ea" }}>
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
  return <View></View>;
}
export function PestilenceCodex() {
  return <View></View>;
}
export function BonesCodex() {
  return <View></View>;
}
export function SummonerCodex() {
  return <View></View>;
}
export function PaladinCodex() {
  return <View></View>;
}
export function ProtectionCodex() {
  return <View></View>;
}
export function VengeanceCodex() {
  return <View></View>;
}
export function HolyCodex() {
  return <View></View>;
}
