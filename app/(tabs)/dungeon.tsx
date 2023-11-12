import { useContext } from "react";
import { Text, View } from "../../components/Themed";
import { GameContext } from "../_layout";
import { Pressable } from "react-native";
import { router } from "expo-router";

const dangerColorStep = [
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171",
  "#ef4444",
  "#dc2626",
];

export default function DungeonScreen() {
  const gameContext = useContext(GameContext);
  if (!gameContext) {
    throw new Error("DungeonTab must be used within a GameContext provider");
  }

  const { gameData } = gameContext;
  if (gameData) {
    const activeDungeonLevels = gameData.getDungeon();
    let height = 1;
    activeDungeonLevels.forEach((level) => {
      if (level.level > height) {
        height = level.level;
        if (level.getCompleted()) {
          height += 1;
        }
      }
    });

    let levelArr = [];
    for (let i = 1; i <= height; i++) {
      levelArr.push(i);
    }

    return (
      <View className="px-4 py-8">
        <Text className="text-center text-2xl">
          The dungeon is a dangerous place. Be careful.
        </Text>
        <View>
          {levelArr.map((level) => {
            return (
              <View key={level} className="mx-auto my-2">
                <Pressable
                  onPress={() => router.push(`/DungeonLevel/${level}`)}
                  className="my-2 rounded-xl px-6 py-4 active:scale-95 active:opacity-50"
                  style={{
                    backgroundColor:
                      dangerColorStep[level - height + 5] ?? "#fee2e2",
                  }}
                >
                  <Text
                    style={{ color: "white" }}
                  >{`Enter Level ${level}`}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    );
  }
}
