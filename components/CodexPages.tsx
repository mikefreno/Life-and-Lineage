import { ScrollView, View } from "react-native";
import { Text } from "./Themed";
import {
  Air,
  BloodDrop,
  Bones,
  Earth,
  Fire,
  Holy,
  NecromancerSkull,
  PaladinHammer,
  Pestilence,
  Protection,
  SummonerSkull,
  Vengeance,
  Water,
  WizardHat,
} from "../assets/icons/SVGIcons";
import { useColorScheme } from "nativewind";
import { Link } from "expo-router";

export function CombatCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}

export function DungeonCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}

export function GearCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}

export function LaborCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}
export function MagicCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}
export function MonstersCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}
export function PlayerCodex() {
  const { colorScheme } = useColorScheme();

  return (
    <ScrollView>
      <View className="p-4">
        <View>
          <Text className="text-xl text-center">
            The player(you) has 3 potential classes:{"\n"}
          </Text>
          <View className="mx-auto">
            <Link href="/Options/Codex/Player/Mage" suppressHighlighting>
              <Text
                style={{
                  color: colorScheme == "dark" ? "#2563eb" : "#1e40af",
                }}
                className="text-xl underline"
              >
                The Mage{" "}
                <WizardHat
                  height={24}
                  width={24}
                  color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                />
              </Text>
            </Link>
          </View>
          <View className="mx-auto">
            <Link href="/Options/Codex/Player/Necromancer" suppressHighlighting>
              <Text
                style={{ color: colorScheme == "dark" ? "#9333ea" : "#6b21a8" }}
                className="text-xl underline"
              >
                The Necromancer{" "}
                <NecromancerSkull
                  height={24}
                  width={24}
                  color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
                />
              </Text>
            </Link>
          </View>
          <View className="mx-auto">
            <Link href="/Options/Codex/Player/Paladin" suppressHighlighting>
              <Text style={{ color: "#fcd34d" }} className="text-xl underline">
                The Paladin <PaladinHammer height={24} width={24} />
              </Text>
            </Link>
          </View>
          <View className="py-4">
            <Text className="text-xl text-center">
              Each of these has schools, each housing different styles of magic.
            </Text>
            <Text className="text-sm text-center">
              <Text className="text-lg" style={{ color: "black" }}>
                Note:
              </Text>{" "}
              Magic of any school can be learned by a player of the parent
              class.
            </Text>
          </View>
          <View className="py-2 my-2 border border-blue-500 bg-blue-100 dark:bg-blue-950">
            <Link
              href="/Options/Codex/Player/Mage"
              className="mx-auto"
              suppressHighlighting
            >
              <View className="flex items-center">
                <WizardHat
                  height={64}
                  width={64}
                  color={colorScheme == "dark" ? "#2563eb" : "#1e40af"}
                />
                <Text
                  style={{
                    color: colorScheme == "dark" ? "#2563eb" : "#1e40af",
                  }}
                >
                  Mage
                </Text>
              </View>
            </Link>
            <View className="flex flex-row justify-evenly py-2">
              <Link href="/Options/Codex/Player/Water" suppressHighlighting>
                <Water height={48} width={48} />
              </Link>
              <Link href="/Options/Codex/Player/Fire" suppressHighlighting>
                <Fire height={48} width={48} />
              </Link>
            </View>
            <View className="flex flex-row justify-evenly py-2">
              <Link href="/Options/Codex/Player/Earth" suppressHighlighting>
                <Earth height={48} width={48} />
              </Link>
              <Link href="/Options/Codex/Player/Air" suppressHighlighting>
                <Air height={48} width={48} />
              </Link>
            </View>
          </View>
        </View>
        <View className="py-2 my-2 border border-purple-500 bg-purple-100 dark:bg-purple-950">
          <Link
            href="/Options/Codex/Player/Necromancer"
            className="mx-auto"
            suppressHighlighting
          >
            <View className="flex items-center">
              <NecromancerSkull
                width={64}
                height={64}
                color={colorScheme == "dark" ? "#9333ea" : "#6b21a8"}
              />
              <Text
                style={{ color: colorScheme == "dark" ? "#9333ea" : "#6b21a8" }}
              >
                Necromancer
              </Text>
            </View>
          </Link>
          <View className="flex flex-row justify-evenly py-2">
            <Link href="/Options/Codex/Player/Blood" suppressHighlighting>
              <BloodDrop height={48} width={48} />
            </Link>
            <Link href="/Options/Codex/Player/Pestilence" suppressHighlighting>
              <Pestilence
                height={48}
                width={48}
                color={colorScheme == "dark" ? "#84cc16" : "#65a30d"}
              />
            </Link>
          </View>
          <View className="flex flex-row justify-evenly py-2">
            <Link href="/Options/Codex/Player/Bone" suppressHighlighting>
              <Bones height={48} width={48} />
            </Link>
            <Link href="/Options/Codex/Player/Summoner" suppressHighlighting>
              <SummonerSkull height={48} width={48} />
            </Link>
          </View>
        </View>
        <View className="py-2 my-2 border border-yellow-500 bg-yellow-100 dark:bg-yellow-950">
          <Link
            className="mx-auto"
            href="/Options/Codex/Player/Paladin"
            suppressHighlighting
          >
            <View className="flex items-center">
              <PaladinHammer width={64} height={64} />
              <Text style={{ color: "#fcd34d" }}>Paladin</Text>
            </View>
          </Link>
          <View className="flex flex-row justify-evenly py-2">
            <Link href="/Options/Codex/Player/Protection" suppressHighlighting>
              <Protection height={48} width={48} />
            </Link>
            <Link href="/Options/Codex/Player/Vengeance" suppressHighlighting>
              <Vengeance height={48} width={48} />
            </Link>
          </View>
          <View className="flex flex-row justify-evenly py-2">
            <Link href="/Options/Codex/Player/Holy" suppressHighlighting>
              <Holy height={48} width={48} />
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
export function RelationshipsCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}
export function ShopsCodex() {
  return (
    <View>
      <View></View>
    </View>
  );
}
