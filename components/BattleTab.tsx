import { View, Text, ScrollView } from "./Themed";
import { Pressable, useColorScheme, FlatList } from "react-native";
import attacks from "../assets/json/playerAttacks.json";
import { toTitleCase } from "../utility/functions";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { selectPlayerCharacter } from "../redux/selectors";

interface BattleTabProps {
  battleTab: "attacks" | "spells" | "equipment" | "log";
  useAttack: (attack: {
    name: string;
    targets: string;
    hitChance: number;
    damageMult: number;
    sanityDamage: number;
    debuffs: { name: string; chance: number }[] | null;
  }) => void;
  useSpell: (spell: {
    name: string;
    element: string;
    proficiencyNeeded: number;
    manaCost: number;
    effects: {
      damage: number | null;
      buffs: string[] | null;
      debuffs: { name: string; chance: number }[] | null;
      summon?: string[];
      selfDamage?: number;
    };
  }) => void;
}

export default function BattleTab({
  battleTab,
  useAttack,
  useSpell,
}: BattleTabProps) {
  const colorScheme = useColorScheme();
  const logs = useSelector((state: RootState) => state.logs);

  const playerCharacter = useSelector(selectPlayerCharacter);

  if (!playerCharacter) {
    throw new Error("no playerCharacter on battleTab");
  }

  const playerAttacks = playerCharacter.getPhysicalAttacks();
  const playerSpells = playerCharacter.getSpells();

  let attackObjects: {
    name: string;
    targets: string;
    hitChance: number;
    damageMult: number;
    sanityDamage: number;
    debuffs: { name: string; chance: number }[] | null;
  }[] = [];

  playerAttacks.forEach((plAttack) =>
    attacks.filter((attack) => {
      if (attack.name == plAttack) {
        attackObjects.push(attack);
      }
    }),
  );

  switch (battleTab) {
    case "attacks":
      return (
        <FlatList
          data={attackObjects}
          inverted
          renderItem={({ item: attack }) => (
            <View className="border-t border-zinc-800 py-2 dark:border-zinc-100">
              <View className="flex flex-row justify-between">
                <View className="flex flex-col justify-center">
                  <Text className="text-xl">{toTitleCase(attack.name)}</Text>
                  <Text className="text-lg">{`${
                    attack.hitChance * 100
                  }% hit chance`}</Text>
                </View>
                <Pressable
                  onPress={() => useAttack(attack)}
                  className="my-auto rounded bg-zinc-300 px-4 py-2 active:scale-95 active:opacity-50 dark:bg-zinc-700"
                >
                  <Text className="text-xl">Use</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      );
    case "spells":
      return (
        <FlatList
          data={playerSpells}
          inverted
          renderItem={({ item: spell }) => (
            <View className="border-t border-zinc-800 py-2 dark:border-zinc-100">
              <View className="flex flex-row justify-between">
                <View className="flex flex-col justify-center">
                  <Text className="text-xl">{toTitleCase(spell.name)}</Text>
                </View>
                <Pressable
                  disabled={playerCharacter.getMana() <= spell.manaCost}
                  onPress={() => useSpell(spell)}
                  className={`my-auto rounded  px-4 py-2 active:scale-95 active:opacity-50 ${
                    playerCharacter.getMana() <= spell.manaCost
                      ? ""
                      : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <Text className="text-xl">
                    {playerCharacter.getMana() <= spell.manaCost
                      ? "Not Enough Mana"
                      : "Use"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      );
    case "equipment":
      return <ScrollView></ScrollView>;
    case "log":
      return (
        <View
          className="my-2 flex-1 rounded border border-zinc-900 px-4 dark:border-zinc-100"
          style={{
            backgroundColor: colorScheme == "dark" ? "#09090b" : "#fff",
          }}
        >
          <FlatList
            inverted
            data={logs.slice().reverse()}
            renderItem={({ item }) => (
              <Text className="py-1">{item.logLine}</Text>
            )}
          />
        </View>
      );
  }
}
