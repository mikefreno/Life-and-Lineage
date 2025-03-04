import React from "react";
import { Pressable, TouchableWithoutFeedback, View } from "react-native";
import { Text, ThemedView } from "../../components/Themed";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useIsFocused } from "@react-navigation/native";
import TutorialModal from "../../components/TutorialModal";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import InventoryRender from "../../components/InventoryRender";
import {
  NecromancerSkull,
  PaladinHammer,
  RangerIcon,
  WizardHat,
} from "../../assets/icons/SVGIcons";
import "expo-router/entry";
import BlessingDisplay from "../../components/BlessingsDisplay";
import { StatsDisplay } from "../../components/StatsDisplay";
import EquipmentDisplay from "../../components/EquipmentDisplay";
import { TutorialOption } from "../../utility/types";
import { useDraggableStore, useRootStore } from "../../hooks/stores";
import D20DieAnimation from "../../components/DieRollAnim";
import type { Item } from "../../entities/item";
import { Image } from "expo-image";
import { StashDisplay } from "../../components/StashDisplay";
import { normalize, useStyles } from "../../hooks/styles";

const HomeScreen = observer(() => {
  const { playerState, uiStore, stashStore } = useRootStore();
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

  const clearDisplayItem = useCallback(() => setDisplayItem(null), []);

  const playerIcon = useMemo(() => {
    const iconSize =
      uiStore.dimensions.height / 9 > 100
        ? 100
        : uiStore.dimensions.height / 10;
    switch (playerState?.playerClass) {
      case "necromancer":
        return (
          <NecromancerSkull
            width={iconSize}
            height={iconSize}
            color={uiStore.colorScheme === "dark" ? "#9333ea" : "#6b21a8"}
          />
        );
      case "paladin":
        return <PaladinHammer width={iconSize} height={iconSize} />;
      case "mage":
        return (
          <WizardHat
            width={iconSize}
            height={iconSize}
            color={uiStore.colorScheme === "dark" ? "#2563eb" : "#1e40af"}
          />
        );
      default:
        return <RangerIcon width={iconSize} height={iconSize} />;
    }
  }, [
    playerState?.playerClass,
    uiStore.dimensions.height,
    uiStore.colorScheme,
  ]);

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

  if (!playerState) {
    return (
      <ThemedView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <D20DieAnimation keepRolling={true} />
      </ThemedView>
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
      <View
        style={{
          flex: 1,
          paddingTop: header,
          paddingBottom: uiStore.bottomBarHeight + 4,
        }}
      >
        <TouchableWithoutFeedback onPress={clearDisplayItem}>
          <View style={{ padding: 4 }}>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View style={{ marginHorizontal: "auto" }}>{playerIcon}</View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: isDark ? "white" : "black",
                    ...styles["text-xl"],
                  }}
                >
                  {playerState.fullName}
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    color: isDark ? "white" : "black",
                    ...styles["text-xl"],
                  }}
                >
                  {playerState.job}
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    color: isDark ? "white" : "black",
                    ...styles["text-xl"],
                  }}
                >{`${playerState.age} years old`}</Text>
              </View>
              <View style={{ marginHorizontal: "auto" }}>
                <BlessingDisplay
                  blessing={playerState.blessing}
                  colorScheme={uiStore.colorScheme}
                  size={
                    uiStore.dimensions.height / 9 > 100
                      ? 100
                      : uiStore.dimensions.height / 10
                  }
                />
              </View>
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
              onPress={() => setShowStash(true)}
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
