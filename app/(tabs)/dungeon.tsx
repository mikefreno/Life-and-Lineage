import { Text, View, ScrollView } from "../../components/Themed";
import { Pressable } from "react-native";
import { router } from "expo-router";
import dungeons from "../../assets/json/dungeons.json";
import { toTitleCase } from "../../utility/functions";
import { useSelector } from "react-redux";
import { selectGame } from "../../redux/selectors";

const dangerColorStep = [
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171",
  "#ef4444",
  "#dc2626",
];

export default function DungeonScreen() {
  const gameData = useSelector(selectGame);

  let height = 0;

  if (gameData) {
    const dungeonDepth = gameData.getFuthestDepth();
    let filteredDungeonInstances: {
      instance: string;
      levels: {
        level: number;
        stepsBeforeBoss: number;
        boss: string;
      }[];
    }[] = [];
    for (let i = 0; i < dungeons.length; i++) {
      if (dungeons[i].instance == dungeonDepth.instance) {
        const filteredLevels = dungeons[i].levels.filter(
          (level) => level.level <= dungeonDepth.level,
        );
        const instanceFiltered = {
          instance: dungeons[i].instance,
          levels: filteredLevels,
        };
        filteredDungeonInstances.push(instanceFiltered);
        height++;
      } else {
        filteredDungeonInstances.push(dungeons[i]);
        const levelCount = dungeons[i].levels.length;
        height += levelCount;
      }
    }

    return (
      <View className="h-full px-4 py-8">
        <Text className="pb-4 text-center text-2xl">
          The dungeon is a dangerous place. Be careful.
        </Text>
        <ScrollView>
          {filteredDungeonInstances.map(
            (dungeonInstance, dungeonInstanceIdx) => (
              <View
                key={dungeonInstanceIdx}
                className="rounded-lg border border-zinc-900 bg-zinc-700 px-4 py-2 dark:border-zinc-100"
              >
                <Text className="text-center text-2xl underline">
                  {toTitleCase(dungeonInstance.instance)}
                </Text>
                <View className="mx-auto">
                  {dungeonInstance.levels.map((level, levelIdx) => (
                    <View key={levelIdx}>
                      <Pressable
                        onPress={() =>
                          router.push(
                            `/DungeonLevel/${dungeonInstance.instance}/${level.level}`,
                          )
                        }
                        className="my-2 rounded-xl px-6 py-4 active:scale-95 active:opacity-50"
                        style={{
                          backgroundColor:
                            dangerColorStep[level.level - height + 5] ??
                            "#fee2e2",
                        }}
                      >
                        <Text
                          style={{ color: "white" }}
                        >{`Enter Level ${level.level}`}</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ),
          )}
        </ScrollView>
      </View>
    );
  }
}
