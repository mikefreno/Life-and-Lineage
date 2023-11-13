import { useContext } from "react";
import { View, Text } from "./Themed";
import { PlayerCharacterContext } from "../app/_layout";
import { Pressable, ScrollView, useColorScheme } from "react-native";
import attacks from "../assets/playerAttacks.json";
import { AttackObject } from "../utility/types";
import { toTitleCase } from "../utility/functions";

interface BattleTabProps {
  battleTab: "attacks" | "spells" | "equipment" | "misc";
  useAttack: (attack: AttackObject) => void;
}
export default function BattleTab({ battleTab, useAttack }: BattleTabProps) {
  const playerContext = useContext(PlayerCharacterContext);
  const colorScheme = useColorScheme();

  if (!playerContext || !playerContext.playerCharacter) {
    throw new Error(
      "DungeonLevel must be used within a PlayerCharacterContext provider",
    );
  }

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
            <View key={idx}>
              <View className="my-4 flex flex-row justify-between">
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
              <View
                style={{
                  borderBottomColor:
                    colorScheme === "dark" ? "#d4d4d8" : "#18181b",
                  borderBottomWidth: 1,
                  marginVertical: 6,
                }}
              />
            </View>
          ))}
        </ScrollView>
      );
    case "spells":
      return <ScrollView></ScrollView>;
    case "equipment":
      return <ScrollView></ScrollView>;
    case "misc":
      return <ScrollView></ScrollView>;
  }
}
