import { Text, View } from "../../components/Themed";
import { Pressable, ScrollView, View as NonThemedView } from "react-native";
import { router, usePathname } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import {
  GameContext,
  PlayerCharacterContext,
  PlayerStatusCompactContext,
} from "../_layout";
import { useVibration } from "../../utility/customHooks";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { DungeonInstance } from "../../classes/dungeon";
import { toTitleCase } from "../../utility/functions/misc/words";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { observer } from "mobx-react-lite";

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

const DungeonScreen = observer(() => {
  const gameContext = useContext(GameContext);
  const playerContext = useContext(PlayerCharacterContext);
  const playerStatusCompact = useContext(PlayerStatusCompactContext);
  if (!gameContext || !playerContext || !playerStatusCompact) {
    throw new Error("Missing Context");
  }
  const { gameState } = gameContext;
  const { playerState } = playerContext;
  const { isCompact } = playerStatusCompact;
  const [instances, _] = useState<DungeonInstance[]>(
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
        className="shadow-diffuse w-full absolute z-50 px-8"
        style={{ paddingTop: useHeaderHeight(), paddingBottom: 4 }}
      >
        <Text className="text-center text-2xl">
          The dungeon is a dangerous place. Be careful.
        </Text>
      </View>
      <View
        className="flex-1 px-8"
        style={{
          paddingTop: useHeaderHeight() + 64,
        }}
      >
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
          <View
            style={{ height: useBottomTabBarHeight() + (isCompact ? 0 : 28) }}
          />
          {/* ^ Bottom Pad ^ */}
        </ScrollView>
      </View>
    </>
  );
});
export default DungeonScreen;
