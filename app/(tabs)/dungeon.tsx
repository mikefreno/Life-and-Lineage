import React, { useLayoutEffect, useRef } from "react";
import { Text } from "../../components/Themed";
import {
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type LayoutChangeEvent,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { toTitleCase, wait } from "../../utility/functions/misc";
import { useHeaderHeight } from "@react-navigation/elements";
import { observer } from "mobx-react-lite";
import ThemedCard from "../../components/ThemedCard";
import { TutorialOption } from "../../utility/types";
import PlatformDependantBlurView from "../../components/PlatformDependantBlurView";
import { useVibration } from "../../hooks/generic";
import type { DungeonInstance } from "../../entities/dungeon";
import { useRootStore } from "../../hooks/stores";
import { flex, tw_base, useStyles } from "../../hooks/styles";
import GenericFlatButton from "@/components/GenericFlatButton";
import Colors from "@/constants/Colors";
import { AntDesign } from "@expo/vector-icons";
import GenericRaisedButton from "@/components/GenericRaisedButton";

const MIN_RED = 20;
const MAX_RED = 255;

const DungeonScreen = observer(() => {
  const root = useRootStore();
  const { dungeonStore, uiStore } = root;
  const { dungeonInstances } = dungeonStore;

  const [sorted, setSorted] = useState<DungeonInstance[]>([]);
  const [sort, setSort] = useState<"ascending" | "descending">("ascending");
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentPage, setCurrentPage] = useState(0);

  const vibration = useVibration();
  const isFocused = useIsFocused();
  const headerHeight = useHeaderHeight();
  const styles = useStyles();

  useEffect(() => {
    const sorted = dungeonInstances
      .filter((inst) => inst.name !== "training grounds")
      .sort((a, b) =>
        sort == "ascending"
          ? a.difficulty - b.difficulty
          : b.difficulty - a.difficulty,
      );
    setSorted(sorted);
  }, [dungeonInstances, sort]);

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

      const bgColor = `rgb(255, ${255 - red}, ${255 - red})`;
      const textColor = red < 128 ? "black" : "white";

      const result = { bgColor, textColor };
      cache.set(cacheKey, result);
      return result;
    };
  }, []);

  const [blurHeaderHeight, setBlurHeaderHeight] = useState<number>(100);

  const handleLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    if (typeof height === "number" && !isNaN(height)) {
      setBlurHeaderHeight(height);
    }
  };

  const scaleAnimUpArrow = useRef(new Animated.Value(1)).current;
  const scaleAnimDownArrow = useRef(new Animated.Value(1)).current;

  const animatePress = (ref: Animated.Value) => {
    Animated.spring(ref, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
    }).start();
  };

  const animateRelease = (ref: Animated.Value) => {
    Animated.spring(ref, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
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
      <View
        style={[
          styles.warningContainer,
          {
            marginTop: headerHeight,
          },
        ]}
        onLayout={handleLayout}
      >
        <PlatformDependantBlurView
          style={{
            flex: 1,
            paddingHorizontal: tw_base[6],
            paddingBottom: tw_base[1],
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 24, lineHeight: 32 }}>
            The dungeon is a dangerous place. Be careful.
          </Text>
        </PlatformDependantBlurView>
      </View>
      <View
        style={[
          {
            flex: 1,
            paddingTop: headerHeight + blurHeaderHeight,
            paddingHorizontal: tw_base[2],
          },
        ]}
      >
        {sorted.length > 1 && (
          <>
            <View
              style={{
                marginTop: headerHeight + blurHeaderHeight + tw_base[1],
                position: "absolute",
                zIndex: 10,
              }}
            >
              <View
                style={[
                  flex.rowBetween,
                  {
                    width: "100%",
                    paddingHorizontal: tw_base[2],
                  },
                ]}
              >
                <GenericFlatButton
                  onPress={() => {
                    setSort(sort == "ascending" ? "descending" : "ascending");
                    vibration({ style: "light" });
                  }}
                  innerStyle={{
                    paddingHorizontal: tw_base[2],
                    paddingTop: tw_base[1],
                    backgroundColor: Colors[uiStore.colorScheme].background,
                  }}
                >
                  <Text
                    style={{ textAlign: "center" }}
                  >{`Sort by:\n${toTitleCase(sort)} Difficulty`}</Text>
                </GenericFlatButton>
                <Text style={{ fontSize: 16 }}>
                  {currentPage + 1} of {sorted.length}
                </Text>
              </View>
            </View>
            <View
              style={{
                position: "absolute",
                marginTop: uiStore.dimensions.height / 2,
                marginLeft: 4,
                zIndex: 10,
              }}
            >
              <Pressable
                style={{
                  marginBottom: tw_base[1],
                }}
                onPressIn={() => animatePress(scaleAnimUpArrow)}
                onPressOut={() => animateRelease(scaleAnimUpArrow)}
                onPress={() => {
                  vibration({ style: "light" });
                  scrollViewRef.current?.scrollTo({
                    x: 0,
                    y: 0,
                    animated: true,
                  });
                }}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: scaleAnimUpArrow }],
                  }}
                >
                  <AntDesign
                    name="upcircleo"
                    size={28}
                    color={Colors[uiStore.colorScheme].border}
                  />
                </Animated.View>
              </Pressable>
              <Pressable
                onPressIn={() => animatePress(scaleAnimDownArrow)}
                onPressOut={() => animateRelease(scaleAnimDownArrow)}
                onPress={() => {
                  vibration({ style: "light" });
                  scrollViewRef.current?.scrollToEnd();
                }}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: scaleAnimDownArrow }],
                  }}
                >
                  <AntDesign
                    name="downcircleo"
                    size={28}
                    color={Colors[uiStore.colorScheme].border}
                  />
                </Animated.View>
              </Pressable>
            </View>
          </>
        )}
        <ScrollView
          key={`dungeon-scroll-${isFocused}`}
          pagingEnabled
          ref={scrollViewRef}
          onScroll={onScroll}
          onLayout={onLayout}
          scrollEventThrottle={16}
          contentContainerStyle={{
            height: `${100 * sorted.length}%`,
            paddingHorizontal: 12,
          }}
          style={{ marginTop: -(headerHeight + blurHeaderHeight) }}
        >
          {sorted.map((dungeonInstance, dungeonInstanceIdx) => (
            <ThemedCard
              key={`dungeon-${dungeonInstance.name}-${dungeonInstanceIdx}`}
              style={styles.dungeonInstanceCard}
            >
              <Text style={styles.dungeonInstanceTitle}>
                {toTitleCase(dungeonInstance.name)}
              </Text>
              <View
                style={{ marginHorizontal: "auto", justifyContent: "center" }}
              >
                {dungeonInstance.levels
                  .filter((level) => level.unlocked || __DEV__)
                  .map((level, levelIdx) => {
                    const { bgColor, textColor } = getLevelColor(
                      dungeonInstance,
                      levelIdx,
                      sorted[sort == "ascending" ? sorted.length - 1 : 0]
                        .difficulty,
                      sorted[
                        sort == "ascending"
                          ? dungeonInstanceIdx + 1
                          : dungeonInstanceIdx - 1
                      ],
                    );
                    return (
                      <GenericRaisedButton
                        key={levelIdx}
                        onPress={() => {
                          uiStore.setTotalLoadingSteps(5);
                          vibration({ style: "warning" });
                          dungeonStore
                            .setUpDungeon(dungeonInstance, level)
                            .then(() => uiStore.incrementLoadingStep());
                          wait(100).then(() => {
                            router.replace(`/DungeonLevel`);
                            uiStore.incrementLoadingStep();
                          });
                        }}
                        backgroundColor={bgColor}
                      >
                        <Text style={{ color: textColor }}>
                          {`Delve to Floor ${level.level}`}
                        </Text>
                      </GenericRaisedButton>
                    );
                  })}
              </View>
            </ThemedCard>
          ))}
        </ScrollView>
      </View>
    </>
  );
});
export default DungeonScreen;
