import { Text, View } from "../../components/Themed";
import { Pressable, ScrollView, View as NonThemedView } from "react-native";
import { router } from "expo-router";
import dungeons from "../../assets/json/dungeons.json";
import { toTitleCase } from "../../utility/functions";
import PlayerStatus from "../../components/PlayerStatus";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { GameContext } from "../_layout";

const dangerColorStep = [
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171",
  "#ef4444",
  "#dc2626",
];

export default function DungeonScreen() {
  const gameData = useContext(GameContext);
  const game = gameData?.gameState;
  const [dungeonDepth, setDungeonDepth] = useState(game?.furthestDepth);
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

  const { colorScheme } = useColorScheme();
  useEffect(() => setDungeonDepth(game?.furthestDepth), [game]);

  useEffect(() => {
    let newInstances: {
      instance: string;
      levels: {
        level: number;
        stepsBeforeBoss: number;
        boss: string[];
      }[];
    }[] = [];
    let localHeight = 0;
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
          localHeight += 1;
        }
        newInstances.push(filteredInstance);
      }
      setHeight(localHeight);
    });
    setInstances(newInstances);
  }, [dungeonDepth]);

  if (gameData) {
    return (
      <>
        <PlayerStatus />
        <View className="h-full px-4">
          <View className="-mx-4 border-b border-zinc-300 py-4 dark:border-zinc-600">
            <Text className=" px-4 text-center text-2xl">
              The dungeon is a dangerous place. Be careful.
            </Text>
          </View>
          <ScrollView>
            {instances.map((dungeonInstance, dungeonInstanceIdx) => (
              <View
                key={dungeonInstanceIdx}
                className="m-2 rounded-xl"
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 3,
                    height: 1,
                  },
                  backgroundColor:
                    colorScheme == "light" ? "#fafafa" : "#27272a",
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <NonThemedView className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500 dark:bg-zinc-800">
                  <Text className="text-center text-2xl tracking-widest underline">
                    {toTitleCase(dungeonInstance.instance)}
                  </Text>
                  <NonThemedView className="mx-auto">
                    {dungeonInstance.levels.map((level, levelIdx) => (
                      <Pressable
                        key={levelIdx}
                        onPress={() =>
                          router.push(
                            `/DungeonLevel/${dungeonInstance.instance}/${level.level}`,
                          )
                        }
                        className="active:scale-95 active:opacity-50"
                      >
                        <View
                          className="my-2 rounded-xl px-6 py-4"
                          style={{
                            shadowColor:
                              dangerColorStep[level.level - height + 5],
                            shadowOffset: {
                              width: 0,
                              height: 2,
                            },
                            backgroundColor:
                              dangerColorStep[level.level - height + 5] ??
                              "#fee2e2",
                            shadowOpacity: 0.25,
                            shadowRadius: 5,
                          }}
                        >
                          <Text
                            style={{ color: "white" }}
                          >{`Enter Floor ${level.level}`}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </NonThemedView>
                </NonThemedView>
              </View>
            ))}
          </ScrollView>
        </View>
      </>
    );
  }
}
