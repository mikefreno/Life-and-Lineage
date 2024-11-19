import { Text } from "../../components/Themed";
import {
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type LayoutChangeEvent,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { toTitleCase } from "../../utility/functions/misc";
import { useHeaderHeight } from "@react-navigation/elements";
import { observer } from "mobx-react-lite";
import ThemedCard from "../../components/ThemedCard";
import { TutorialOption } from "../../utility/types";
import PlatformDependantBlurView from "../../components/PlatformDependantBlurView";
import { useVibration } from "../../hooks/generic";
import type { DungeonInstance } from "../../entities/dungeon";
import { useRootStore } from "../../hooks/stores";

const MIN_RED = 20;
const MAX_RED = 255;

const DungeonScreen = observer(() => {
  const { dungeonStore } = useRootStore();
  const { dungeonInstances } = dungeonStore;

  const [sorted, setSorted] = useState(
    dungeonInstances
      .filter((inst) => inst.name !== "training grounds")
      .sort((a, b) => a.difficulty - b.difficulty),
  );
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const [currentPage, setCurrentPage] = useState(0);

  const vibration = useVibration();
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();

  const warningHeight = 64;

  useEffect(() => {
    const sorted = dungeonInstances
      .filter((inst) => inst.name !== "training grounds")
      .sort((a, b) => a.difficulty - b.difficulty);
    setSorted(sorted);
  }, [dungeonInstances]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const pageIndex = Math.round(offsetY / scrollViewHeight);
    setCurrentPage(pageIndex);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  const getLevelColor = useMemo(() => {
    const cache = new Map();

    return (
      instance: DungeonInstance,
      levelIdx: number,
      highestInsDiff: number,
      nextInst?: DungeonInstance,
    ) => {
      const cacheKey = `${instance.name}-${levelIdx}-${highestInsDiff}-${
        nextInst?.name || "none"
      }`;

      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      const currentInstanceRed =
        MIN_RED + ((MAX_RED - MIN_RED) * instance.difficulty) / highestInsDiff;

      const nextInstanceRed = !nextInst
        ? Math.min(
            MAX_RED,
            currentInstanceRed + (instance.levels.length - 1) * 20,
          )
        : MIN_RED +
          ((MAX_RED - MIN_RED) * nextInst.difficulty) / highestInsDiff;

      const totalLevels = instance.levels.length;
      const redStep =
        (nextInstanceRed - currentInstanceRed) / (levelIdx - totalLevels);

      const red = Math.round(currentInstanceRed - redStep * levelIdx);

      const color = `rgb(255, ${255 - red}, ${255 - red})`;
      cache.set(cacheKey, color);
      return color;
    };
  }, []);

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
        {sorted.length > 1 && (
          <View
            className="absolute right-4 z-top"
            style={{ marginTop: headerHeight + warningHeight }}
          >
            <Text style={{ fontSize: 16 }}>
              {currentPage + 1} of {sorted.length}
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
            height: `${100 * sorted.length}%`,
            marginTop: -64,
            paddingHorizontal: 12,
          }}
          scrollIndicatorInsets={{ top: 92, right: 0, left: 0, bottom: 48 }}
        >
          {sorted.map((dungeonInstance, dungeonInstanceIdx) => {
            return (
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
                          dungeonStore.setUpDungeon(dungeonInstance, level);
                          vibration({ style: "warning" });
                          router.replace(`/DungeonLevel`);
                        }}
                      >
                        {({ pressed }) => (
                          <View
                            className={`my-2 rounded-lg px-6 py-4 ${
                              pressed ? "scale-95 opacity-50" : ""
                            }`}
                            style={{
                              backgroundColor: getLevelColor(
                                dungeonInstance,
                                levelIdx,
                                sorted[sorted.length - 1].difficulty,
                                sorted[dungeonInstanceIdx + 1],
                              ),
                              shadowOpacity: 0.25,
                              shadowRadius: 5,
                              elevation: 2,
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                              }}
                            >
                              {`Delve to Floor ${level.level}`}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                </View>
              </ThemedCard>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
});
export default DungeonScreen;
