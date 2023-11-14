import { useContext } from "react";
import { View, Text, ScrollView } from "./Themed";
import { BattleLogContext, PlayerCharacterContext } from "../app/_layout";
import { Pressable, useColorScheme, FlatList } from "react-native";
import attacks from "../assets/playerAttacks.json";
import { AttackObject } from "../utility/types";
import { toTitleCase } from "../utility/functions";

interface BattleTabProps {
  battleTab: "attacks" | "spells" | "equipment" | "log";
  useAttack: (attack: AttackObject) => void;
}

export default function BattleTab({ battleTab, useAttack }: BattleTabProps) {
  const playerContext = useContext(PlayerCharacterContext);
  const battleContext = useContext(BattleLogContext);
  const colorScheme = useColorScheme();

  if (!playerContext || !playerContext.playerCharacter || !battleContext) {
    throw new Error(
      "DungeonLevel must be used within a PlayerCharacterContext provider",
    );
  }

  const { logs } = battleContext;

  const { playerCharacter } = playerContext;
  const playerAttacks = playerCharacter.getPhysicalAttacks();

  let attackObjects: AttackObject[] = [];
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
        <ScrollView>
          {attackObjects.map((attack, idx) => (
            <View
              key={idx}
              className="border-b border-zinc-800 py-2 dark:border-zinc-100"
            >
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
          ))}
        </ScrollView>
      );
    case "spells":
      return <ScrollView></ScrollView>;
    case "equipment":
      return <ScrollView></ScrollView>;
    case "log":
      return (
        <View
          className="flex-1 border border-zinc-900 px-4 dark:border-zinc-100"
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
