import { useContext } from "react";
import { View, Text, ScrollView } from "./Themed";
import { Pressable, useColorScheme, FlatList } from "react-native";
import attacks from "../assets/json/playerAttacks.json";
import { AttackObject } from "../utility/types";
import { toTitleCase } from "../utility/functions";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { selectPlayerCharacter } from "../redux/selectors";

interface BattleTabProps {
  battleTab: "attacks" | "spells" | "equipment" | "log";
  useAttack: (attack: AttackObject) => void;
}

export default function BattleTab({ battleTab, useAttack }: BattleTabProps) {
  const colorScheme = useColorScheme();
  const logs = useSelector((state: RootState) => state.logs);

  const playerCharacter = useSelector(selectPlayerCharacter);

  if (!playerCharacter) {
    throw new Error("no playerCharacter on battleTab");
  }

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
          className="flex-1 rounded border border-zinc-900 px-4 dark:border-zinc-100"
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
