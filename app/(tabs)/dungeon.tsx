import { Text, View } from "../../components/Themed";
import { Pressable, ScrollView, View as NonThemedView } from "react-native";
import { router } from "expo-router";
import dungeons from "../../assets/json/dungeons.json";
import { savePlayer, toTitleCase } from "../../utility/functions";
import PlayerStatus from "../../components/PlayerStatus";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { useVibration } from "../../utility/customHooks";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";

const dangerColorStep = [
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171",
  "#ef4444",
  "#dc2626",
];
const levelOffset: Record<string, number> = {
  "nearby cave": 0,
  "goblin cave": 3,
  "bandit hideout": 5,
};

export default function DungeonScreen() {
  const gameContext = useContext(GameContext);
  const playerContext = useContext(PlayerCharacterContext);
  if (!gameContext || !playerContext) {
    throw new Error("Missing Context");
  }
  const { gameState } = gameContext;
  const { playerState } = playerContext;
  const [dungeonDepth, setDungeonDepth] = useState(gameState?.furthestDepth);
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
  const vibration = useVibration();
  const [showDungeonTutorial, setShowDungeonTutorial] = useState<boolean>(
    (gameState && !gameState.getTutorialState("dungeon")) ?? false,
  );
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!showDungeonTutorial && gameState) {
      gameState.updateTutorialState("dungeon", true);
    }
  }, [showDungeonTutorial]);

  useEffect(() => setDungeonDepth(gameState?.furthestDepth), [gameState]);

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

  return (
    <>
      <TutorialModal
        isVisibleCondition={
          (showDungeonTutorial && gameState?.tutorialsEnabled && isFocused) ??
          false
        }
        backFunction={() => setShowDungeonTutorial(false)}
        pageOne={{
          title: "Dungeon",
          body: "Here you will put all your gear and spells to work. Be prepared and you will be rewarded.",
        }}
        pageTwo={{
          title: "Dungeons are very dangerous.",
          body: "You may find yourself faced with monsters you simply can not defeat at your current state, attempting to flee is your best bet, but you may not succeed.",
        }}
        pageThree={{
          title: "Each level brings greater danger.",
          body: "And greater rewards. Unlock more levels by defeating each levels boss.",
        }}
        onCloseFunction={() => setShowDungeonTutorial(false)}
      />
      <View className="flex-1">
        <PlayerStatus onTop={true} />
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
                        onPress={() => {
                          while (router.canGoBack()) {
                            router.back();
                          }
                          vibration({ style: "warning" });
                          router.replace(
                            `/DungeonLevel/${dungeonInstance.instance}/${level.level}`,
                          );
                          setTimeout(() => {
                            if (playerState) {
                              playerState.setInDungeon({
                                state: true,
                                instance: dungeonInstance.instance,
                                level: level.level,
                              });
                              savePlayer(playerState);
                            }
                          }, 500);
                        }}
                        className="active:scale-95 active:opacity-50"
                      >
                        <View
                          className="my-2 rounded-md px-6 py-4"
                          style={{
                            shadowColor:
                              dangerColorStep[
                                level.level -
                                  height +
                                  5 +
                                  levelOffset[dungeonInstance.instance]
                              ],
                            backgroundColor:
                              dangerColorStep[
                                level.level -
                                  height +
                                  5 +
                                  levelOffset[dungeonInstance.instance]
                              ] ?? "#fee2e2",
                            shadowOpacity: 0.25,
                            shadowRadius: 5,
                          }}
                        >
                          <Text
                            style={{ color: "white" }}
                          >{`Delve to Floor ${level.level}`}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </NonThemedView>
                </NonThemedView>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
}
