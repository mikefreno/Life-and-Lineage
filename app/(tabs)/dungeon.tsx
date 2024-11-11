import { ThemedView, Text } from "../../components/Themed";
import {
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type LayoutChangeEvent,
} from "react-native";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { useVibration } from "../../utility/customHooks";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { DungeonInstance } from "../../classes/dungeon";
import { toTitleCase } from "../../utility/functions/misc";
import { useHeaderHeight } from "@react-navigation/elements";
import { observer } from "mobx-react-lite";
import ThemedCard from "../../components/ThemedCard";
import { TutorialOption } from "../../utility/types";
import PlatformDependantBlurView from "../../components/PlatformDependantBlurView";
import { useGameState } from "../../stores/AppData";

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
  const { gameState } = useGameState();
  const [instances, _] = useState<DungeonInstance[]>(
    gameState?.dungeonInstances.filter(
      (instance) => instance.name !== "training grounds",
    ) ?? [],
  );
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const pathname = usePathname();
  const [height, setHeight] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);

  const vibration = useVibration();
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();

  const warningHeight = 64;

  useEffect(() => {
    if (isFocused) {
      let deepestDungeonDepth = 0;
      gameState?.dungeonInstances.forEach((dungeonInstance) => {
        let dungeonDepth = levelOffset[dungeonInstance.name];
        const unlockedCount = dungeonInstance.levels.filter(
          (level) => level.unlocked,
        ).length;
        if (dungeonDepth + unlockedCount > deepestDungeonDepth) {
          deepestDungeonDepth = dungeonDepth + unlockedCount;
        }
      });
      setHeight(deepestDungeonDepth);
    }
  }, [isFocused, gameState?.dungeonInstances, pathname]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const pageIndex = Math.round(offsetY / scrollViewHeight);
    setCurrentPage(pageIndex);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.dungeon}
        isFocused={isFocused}
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
      />
      <PlatformDependantBlurView
        className="shadow-diffuse w-full absolute z-10 px-8"
        style={{ marginTop: useHeaderHeight(), paddingBottom: 4 }}
      >
        <Text className="text-center text-2xl">
          The dungeon is a dangerous place. Be careful.
        </Text>
      </PlatformDependantBlurView>
      <View
        className="flex-1"
        style={{
          paddingTop: headerHeight + warningHeight,
        }}
      >
        {instances.length > 1 && (
          <View
            className="absolute right-4 z-top"
            style={{ marginTop: headerHeight + warningHeight }}
          >
            <Text style={{ fontSize: 16 }}>
              {currentPage + 1} of {instances.length}
            </Text>
          </View>
        )}
        <ScrollView
          pagingEnabled
          className="-mt-20"
          onScroll={onScroll}
          onLayout={onLayout}
          scrollEventThrottle={16}
          contentContainerStyle={{
            height: `${100 * instances.length}%`,
            marginTop: -64,
            paddingHorizontal: 12,
          }}
          scrollIndicatorInsets={{ top: 92, right: 0, left: 0, bottom: 48 }}
        >
          {instances.map((dungeonInstance, dungeonInstanceIdx) => (
            <ThemedCard
              key={dungeonInstanceIdx}
              className="flex-1 justify-center mx-8"
            >
              <Text className="text-center text-2xl tracking-widest underline">
                {toTitleCase(dungeonInstance.name)}
              </Text>
              <View className="mx-auto justify-center">
                {dungeonInstance.levels
                  .filter((level) => level.unlocked)
                  .map((level, levelIdx) => (
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
              </View>
            </ThemedCard>
          ))}
        </ScrollView>
      </View>
    </>
  );
});
export default DungeonScreen;
