import React from "react";
import { Pressable, TouchableWithoutFeedback, View } from "react-native";
import { Text, ThemedView } from "@/components/Themed";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "@/components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import InventoryRender from "@/components/InventoryRender";
import "expo-router/entry";
import { StatsDisplay } from "@/components/StatsDisplay";
import EquipmentDisplay from "@/components/EquipmentDisplay";
import { TutorialOption } from "@/utility/types";
import { useDraggableStore, useRootStore } from "@/hooks/stores";
import D20DieAnimation from "@/components/DieRollAnim";
import type { Item } from "@/entities/item";
import { Image } from "expo-image";
import { StashDisplay } from "@/components/StashDisplay";
import { normalize, useStyles } from "../../hooks/styles";
import { useVibration } from "@/hooks/generic";
import SeasonDisplay from "@/components/SeasonDisplay";

const HomeScreen = observer(() => {
  const { playerState, uiStore, stashStore, time } = useRootStore();
  const { draggableClassStore } = useDraggableStore();
  const [showStash, setShowStash] = useState(false);
  const stashButtonRef = useRef<View>(null);
  const isDark = uiStore.colorScheme === "dark";
  const styles = useStyles();

  const [displayItem, setDisplayItem] = useState<{
    item: Item[];
    position: { left: number; top: number };
  } | null>(null);

  const tabBarHeight = useBottomTabBarHeight() + 10;
  const header = useHeaderHeight();
  const isFocused = useIsFocused();
  const vibration = useVibration();

  const clearDisplayItem = useCallback(() => setDisplayItem(null), []);

  useEffect(() => {
    if (isFocused) {
      setTimeout(() => {
        if (stashButtonRef.current) {
          measureAndSetStashBounds();
        }
      }, 150);
    } else {
      draggableClassStore.removeAncillaryBounds("stash");
    }
  }, [isFocused]);

  const measureAndSetStashBounds = useCallback(() => {
    if (stashButtonRef.current) {
      stashButtonRef.current.measure((x, y, w, h, pageX, pageY) => {
        draggableClassStore.setAncillaryBounds("stash", {
          x: pageX,
          y: pageY,
          width: w,
          height: h,
        });
      });
    }
  }, [draggableClassStore]);

  const setStashBoundsOnLayout = useCallback(() => {
    if (!isFocused) return;

    setTimeout(() => {
      measureAndSetStashBounds();
    }, 100);
  }, [isFocused, measureAndSetStashBounds]);

  const topViewStyle = useMemo(() => {
    return {
      flex: 1,
      paddingTop: header,
      paddingBottom: uiStore.compactRoutePadding,
    };
  }, [
    uiStore.playerStatusExpandedOnAllRoutes,
    uiStore.playerStatusCompactHeight,
  ]);

  if (!playerState) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <D20DieAnimation keepRolling={true} />
      </View>
    );
  }

  return (
    <>
      <TutorialModal
        tutorial={TutorialOption.intro}
        isFocused={isFocused}
        pageOne={{
          title: "Welcome!",
          body: "On this page you can view your inventory and equip items to you hands, head, quiver or body.",
        }}
        pageTwo={{
          title: "",
          body: "A great place to start is to study the book you were given.",
        }}
      />

      <StashDisplay
        clear={() => setShowStash(false)}
        showingStash={showStash}
      />
      <View style={topViewStyle}>
        <TouchableWithoutFeedback onPress={clearDisplayItem}>
          <View
            style={{
              width: "90%",
              alignSelf: "center",
              alignItems: "center",
              paddingVertical: normalize(4),
              ...styles.rowBetween,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles["text-lg"], { textAlign: "center" }]}>
                {`It is ${time.currentMonth}\n of the year ${time.year}`}
              </Text>
            </View>

            <View
              style={{ flex: 1, alignItems: "center", marginHorizontal: 8 }}
            >
              <SeasonDisplay
                season={time.currentSeason}
                size={uiStore.dimensions.height / 12}
              />
              <Text style={{ textAlign: "center" }}>
                It is currently {time.currentSeason}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  textAlign: "center",
                  color: isDark ? "white" : "black",
                  ...styles["text-xl"],
                }}
              >
                {`You are\n${playerState.age} years old`}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={clearDisplayItem}>
          <View style={styles.inventoryContainer}>
            <EquipmentDisplay
              displayItem={displayItem}
              setDisplayItem={setDisplayItem}
            />
            <Pressable
              ref={stashButtonRef}
              onLayout={setStashBoundsOnLayout}
              onPress={() => {
                vibration({ style: "light" });
                setShowStash(true);
              }}
              style={[styles.stashButton, { paddingBottom: normalize(4) }]}
            >
              <Image
                source={require("../../assets/images/icons/Chest.png")}
                style={{ width: normalize(48), height: normalize(48) }}
              />
            </Pressable>
            <InventoryRender
              screen="home"
              displayItem={displayItem}
              setDisplayItem={setDisplayItem}
              targetBounds={[
                {
                  key: "head",
                  bounds: draggableClassStore.ancillaryBoundsMap.get("head"),
                },
                {
                  key: "main-hand",
                  bounds:
                    draggableClassStore.ancillaryBoundsMap.get("main-hand"),
                },
                {
                  key: "off-hand",
                  bounds:
                    draggableClassStore.ancillaryBoundsMap.get("off-hand"),
                },
                {
                  key: "body",
                  bounds: draggableClassStore.ancillaryBoundsMap.get("body"),
                },
                {
                  key: "quiver",
                  bounds: draggableClassStore.ancillaryBoundsMap.get("quiver"),
                },
                {
                  key: "stash",
                  bounds: draggableClassStore.ancillaryBoundsMap.get("stash"),
                },
              ]}
              runOnSuccess={(item) => stashStore.addItem(item)}
            />
          </View>
        </TouchableWithoutFeedback>
        {displayItem && (
          <View
            style={{ position: "absolute", zIndex: 10 }}
            pointerEvents="box-none"
          >
            <StatsDisplay
              displayItem={displayItem}
              clearItem={clearDisplayItem}
              tabBarHeight={tabBarHeight}
            />
          </View>
        )}
      </View>
    </>
  );
});

export default HomeScreen;
