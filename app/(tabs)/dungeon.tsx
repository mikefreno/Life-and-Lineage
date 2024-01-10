import { Text, View } from "../../components/Themed";
import {
  Pressable,
  ScrollView,
  View as NonThemedView,
  Switch,
} from "react-native";
import { router } from "expo-router";
import dungeons from "../../assets/json/dungeons.json";
import { savePlayer, toTitleCase } from "../../utility/functions";
import PlayerStatus from "../../components/PlayerStatus";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { useVibration } from "../../utility/customHooks";
import Modal from "react-native-modal";
import { Entypo } from "@expo/vector-icons";

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
  const [tutorialState, setTutorialState] = useState<boolean>(
    gameState?.tutorialsEnabled ?? true,
  );
  const [tutorialStep, setTutorialStep] = useState<number>(1);

  useEffect(() => {
    if (!showDungeonTutorial && gameState) {
      gameState.updateTutorialState("dungeon", true);
    }
  }, [showDungeonTutorial]);

  useEffect(() => {
    setTutorialState(gameState?.tutorialsEnabled ?? true);
  }, [gameState?.tutorialsEnabled]);

  useEffect(() => setDungeonDepth(gameState?.furthestDepth), [gameState]);

  useEffect(() => {
    if (gameState) {
      if (tutorialState == false) {
        gameState.disableTutorials();
      } else {
        gameState.enableTutorials();
      }
    }
  }, [tutorialState]);

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
      <Modal
        animationIn="slideInUp"
        animationOut="fadeOut"
        isVisible={showDungeonTutorial && gameState?.tutorialsEnabled}
        backdropOpacity={0.2}
        animationInTiming={500}
        onBackdropPress={() => setShowDungeonTutorial(false)}
        onBackButtonPress={() => setShowDungeonTutorial(false)}
      >
        <View
          className="mx-auto w-5/6 rounded-xl bg-zinc-50 px-6 py-4 dark:bg-zinc-700"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },

            shadowOpacity: 0.25,
            shadowRadius: 5,
          }}
        >
          <View
            className={`flex flex-row ${
              tutorialStep != 1 ? "justify-between" : "justify-end"
            }`}
          >
            {tutorialStep != 1 ? (
              <Pressable onPress={() => setTutorialStep((prev) => prev - 1)}>
                <Entypo
                  name="chevron-left"
                  size={24}
                  color={colorScheme == "dark" ? "#f4f4f5" : "black"}
                />
              </Pressable>
            ) : null}
            <Text>{tutorialStep}/3</Text>
          </View>
          {tutorialStep == 1 ? (
            <>
              <Text className="text-center text-2xl">Dungeon</Text>
              <Text className="my-4 text-center text-lg">
                Here you will put all your gear and spells to work. Be prepared
                and you will be rewarded.
              </Text>
              <View className="mx-auto flex flex-row">
                <Text className="my-auto text-lg">Tutorials Enabled: </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  ios_backgroundColor="#3e3e3e"
                  thumbColor={"white"}
                  onValueChange={(bool) => setTutorialState(bool)}
                  value={tutorialState}
                />
              </View>
              <Pressable
                onPress={() => setTutorialStep(2)}
                className="mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Next</Text>
              </Pressable>
            </>
          ) : tutorialStep == 2 ? (
            <>
              <Text className="text-center text-2xl">
                Dungeons are very dangerous.
              </Text>
              <Text className="my-4 text-center text-lg">
                You may find yourself faced with monsters you simply can not
                defeat at your current state, attempting to flee is your best
                bet, but you may not succeed.
              </Text>
              <View className="mx-auto flex flex-row">
                <Text className="my-auto text-lg">Tutorials Enabled: </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  ios_backgroundColor="#3e3e3e"
                  thumbColor={"white"}
                  onValueChange={(bool) => setTutorialState(bool)}
                  value={tutorialState}
                />
              </View>
              <Pressable
                onPress={() => setTutorialStep((prev) => prev + 1)}
                className="mx-auto mt-2 rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Next</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-center text-xl">
                Each level brings greater danger.
              </Text>
              <Text className="my-4 text-center text-lg">
                And greater rewards. Unlock more levels by defeating each levels
                boss.
              </Text>
              <View className="mx-auto flex flex-row">
                <Text className="my-auto text-lg">Tutorials Enabled: </Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  ios_backgroundColor="#3e3e3e"
                  thumbColor={"white"}
                  onValueChange={(bool) => setTutorialState(bool)}
                  value={tutorialState}
                />
              </View>
              <Pressable
                onPress={() => {
                  vibration({ style: "light" });
                  setShowDungeonTutorial(false);
                }}
                className="mx-auto rounded-xl border border-zinc-900 px-6 py-2 text-lg active:scale-95 active:opacity-50 dark:border-zinc-50"
              >
                <Text>Close</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
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
                              dangerColorStep[level.level - height + 5],
                            backgroundColor:
                              dangerColorStep[level.level - height + 5] ??
                              "#fee2e2",
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
