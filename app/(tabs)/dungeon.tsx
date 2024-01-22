import { Text, View } from "../../components/Themed";
import {
  Pressable,
  ScrollView,
  View as NonThemedView,
  Platform,
  StyleSheet,
} from "react-native";
import { Stack, router, usePathname } from "expo-router";
import PlayerStatus from "../../components/PlayerStatus";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { GameContext, PlayerCharacterContext } from "../_layout";
import { useVibration } from "../../utility/customHooks";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { DungeonInstance } from "../../classes/dungeon";
import { toTitleCase } from "../../utility/functions/misc";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { BlurView } from "expo-blur";

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
  "rogue magi fortress": 7,
  "infested mine": 11,
  "forest dark": 13,
  "crystal mine": 15,
  "corrupted temple": 17,
};

export default function DungeonScreen() {
  const gameContext = useContext(GameContext);
  const playerContext = useContext(PlayerCharacterContext);
  if (!gameContext || !playerContext) {
    throw new Error("Missing Context");
  }
  const { gameState } = gameContext;
  const { playerState } = playerContext;
  const [instances, setInstances] = useState<DungeonInstance[]>(
    gameState?.dungeonInstances.filter(
      (instance) => instance.name !== "training grounds",
    ) ?? [],
  );
  const pathname = usePathname();
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

  useEffect(() => {
    let deepestDungeonDepth = 0;
    gameState?.dungeonInstances.forEach((dungeonInstance) => {
      let dungeonDepth = levelOffset[dungeonInstance.name];
      if (dungeonDepth + dungeonInstance.levels.length > deepestDungeonDepth) {
        deepestDungeonDepth = dungeonDepth + dungeonInstance.levels.length;
      }
    });
    setHeight(deepestDungeonDepth);
  }, [gameState?.dungeonInstances, pathname]);

  return (
    <>
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerTransparent: true,
          headerBackground: () => (
            <BlurView
              blurReductionFactor={4}
              tint={
                Platform.OS == "android"
                  ? colorScheme == "light"
                    ? "systemMaterialLight"
                    : "systemMaterialDark"
                  : "default"
              }
              intensity={100}
              style={StyleSheet.absoluteFill}
              experimentalBlurMethod={"dimezisBlurView"}
            />
          ),
        }}
      />
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
      <View
        style={{
          marginTop: useHeaderHeight() / 2,
          height: useHeaderHeight() * 0.5,
          backgroundColor: "#dc2626",
          opacity: 0.5,
        }}
      />
      <View className="flex-1">
        <NonThemedView style={{ paddingTop: 12, paddingBottom: 4 }}>
          <Text className="text-center text-2xl">
            The dungeon is a dangerous place. Be careful.
          </Text>
        </NonThemedView>
        <ScrollView
          style={{
            paddingBottom: useBottomTabBarHeight() + 74,
          }}
        >
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
                backgroundColor: colorScheme == "light" ? "#fafafa" : "#27272a",
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <NonThemedView className="flex justify-between rounded-xl px-4 py-2 text-zinc-950 dark:border dark:border-zinc-500 dark:bg-zinc-800">
                <Text className="text-center text-2xl tracking-widest underline">
                  {toTitleCase(dungeonInstance.name)}
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
                          `/DungeonLevel/${dungeonInstance.name}/${level.level}`,
                        );
                        setTimeout(() => {
                          if (playerState) {
                            playerState.setInDungeon({
                              state: true,
                              instance: dungeonInstance.name,
                              level: level.level,
                            });
                          }
                        }, 500);
                      }}
                    >
                      {({ pressed }) => (
                        <View
                          className={`my-2 rounded-lg px-6 py-4 ${
                            pressed ? "scale-95 opacity-50" : ""
                          }`}
                          style={{
                            shadowColor:
                              dangerColorStep[
                                level.level -
                                  height +
                                  5 +
                                  levelOffset[dungeonInstance.name]
                              ],
                            backgroundColor:
                              dangerColorStep[
                                level.level -
                                  height +
                                  5 +
                                  levelOffset[dungeonInstance.name]
                              ] ?? "#fee2e2",
                            shadowOpacity: 0.25,
                            shadowRadius: 5,
                            elevation: 2,
                          }}
                        >
                          <Text
                            style={{ color: "white" }}
                          >{`Delve to Floor ${level.level}`}</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </NonThemedView>
              </NonThemedView>
            </View>
          ))}
        </ScrollView>
      </View>
      <NonThemedView
        className="absolute z-50 w-full"
        style={{ bottom: useBottomTabBarHeight() + 70 }}
      >
        <PlayerStatus />
      </NonThemedView>
    </>
  );
}
