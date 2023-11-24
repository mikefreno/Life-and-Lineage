import { Text, View, ScrollView } from "../../components/Themed";
import { Pressable } from "react-native";
import { router } from "expo-router";
import dungeons from "../../assets/json/dungeons.json";
import { toTitleCase } from "../../utility/functions";
import { useSelector } from "react-redux";
import { selectGame } from "../../redux/selectors";
import PlayerStatus from "../../components/PlayerStatus";
import { useEffect, useState } from "react";

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
  const [dungeonDepth, setDungeonDepth] = useState(gameData?.getFuthestDepth());
  const [instances, setInstances] = useState<
    {
      instance: string;
      levels: {
        level: number;
        stepsBeforeBoss: number;
        boss: string[];
      }[];
    }[]
  >([]);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => setDungeonDepth(gameData?.getFuthestDepth()), [gameData]);

  useEffect(() => {
    let newInstances: {
      instance: string;
      levels: {
        level: number;
        stepsBeforeBoss: number;
        boss: string[];
      }[];
    }[] = [];
    dungeonDepth?.forEach((dungeonInstanceDepth) => {
      const instance = dungeons.find(
        (dungeon) => dungeon.instance == dungeonInstanceDepth.instance,
      );
      if (instance) {
        const filteredInstance: {
          instance: string;
          levels: {
            level: number;
            stepsBeforeBoss: number;
            boss: string[];
          }[];
        } = { instance: instance.instance, levels: [] };
        for (let i = 0; i < dungeonInstanceDepth.level; i++) {
          filteredInstance.levels.push(instance.levels[i]);
          setHeight(height + 1);
        }
        newInstances.push(filteredInstance);
      }
    });
    setInstances(newInstances);
  }, [dungeonDepth]);

  if (gameData) {
    return (
      <View className="h-full px-4">
        <PlayerStatus />
        <Text className="py-4 text-center text-2xl">
          The dungeon is a dangerous place. Be careful.
        </Text>
        <ScrollView>
          {instances.map((dungeonInstance, dungeonInstanceIdx) => (
            <View
              key={dungeonInstanceIdx}
              className="my-2 rounded-lg border border-zinc-900 bg-zinc-700 px-4 py-2 dark:border-zinc-100"
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
          ))}
        </ScrollView>
      </View>
    );
  }
}
