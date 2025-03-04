import React, { useCallback, useEffect, useMemo } from "react";
import {
  Pressable,
  View,
  LayoutChangeEvent,
  ScrollView,
  type DimensionValue,
} from "react-native";
import { Text } from "./Themed";
import { InventoryItem } from "./Draggable";
import type { Item } from "../entities/item";
import { useVibration } from "../hooks/generic";
import { useDraggableStore, useRootStore } from "../hooks/stores";
import { useRef } from "react";
import { observer } from "mobx-react-lite";
import { useStyles } from "../hooks/styles";
import { useIsFocused } from "@react-navigation/native";

const InventoryRender = observer(
  ({
    displayItem,
    setDisplayItem,
    targetBounds,
    runOnSuccess,
    screen,
  }: {
    displayItem: {
      item: Item[];
      side?: "shop" | "inventory";
      position: {
        left: number;
        top: number;
      };
    } | null;
    setDisplayItem: React.Dispatch<
      React.SetStateAction<{
        item: Item[];
        side?: "shop" | "inventory";
        position: {
          left: number;
          top: number;
        };
      } | null>
    >;
    targetBounds: {
      key: string;
      bounds:
        | {
            x: number;
            y: number;
            width: number;
            height: number;
          }
        | null
        | undefined;
    }[];
    runOnSuccess: (args?: any, args2?: any) => void;
    screen: "home" | "shop" | "dungeon";
  }) => {
    const selfRef = useRef<View | null>(null);
    const vibration = useVibration();
    const { playerState, uiStore } = useRootStore();
    const { draggableClassStore } = useDraggableStore();
    const styles = useStyles();
    const isFocused = useIsFocused();

    const gridCalculations = useMemo(() => {
      const height = draggableClassStore.inventoryBounds?.height ?? 0;
      const width = draggableClassStore.inventoryBounds?.width ?? 0;
      const isLandscape =
        uiStore.dimensions.width === uiStore.dimensions.greater;
      const rows = isLandscape ? 2 : 4;
      const columns = 24 / rows;
      const itemSize = uiStore.itemBlockSize;

      const excessHeight = height - rows * itemSize;
      const excessWidth = width - columns * itemSize;

      const verticalGaps = rows + 1;
      const horizontalGaps = columns + 1;

      const verticalSpacing = excessHeight / verticalGaps;
      const horizontalSpacing = excessWidth / horizontalGaps;

      const slotPositions = Array.from({ length: 24 }).map((_, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;

        const left = horizontalSpacing + col * (itemSize + horizontalSpacing);
        const top = verticalSpacing + row * (itemSize + verticalSpacing);

        const leftPercent = width > 0 ? (left / width) * 100 : 0;
        const topPercent = height > 0 ? (top / height) * 100 : 0;

        return {
          left: `${leftPercent}%` as DimensionValue,
          top: `${topPercent}%` as DimensionValue,
          index,
        };
      });

      return {
        rows,
        columns,
        itemSize,
        slotPositions,
        isLandscape,
      };
    }, [
      draggableClassStore.inventoryBounds?.height,
      draggableClassStore.inventoryBounds?.width,
      uiStore.dimensions.width,
      uiStore.dimensions.greater,
      uiStore.itemBlockSize,
    ]);

    const dropHandler = useCallback(
      (droppedOnKey: string, item: Item[]) => {
        vibration({ style: "light" });
        switch (droppedOnKey) {
          case "shopInventory":
            runOnSuccess(item);
            setDisplayItem(null);
            break;
          case "head":
          case "main-hand":
          case "off-hand":
          case "body":
          case "quiver":
            playerState?.equipItem(item, droppedOnKey);
            setDisplayItem(null);
            break;
          case "stash":
            runOnSuccess(item);
            setDisplayItem(null);
            break;
        }
      },
      [playerState, runOnSuccess, setDisplayItem, vibration],
    );

    const onLayoutView = useCallback(
      (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;

        if (selfRef.current) {
          selfRef.current.measure((x, y, w, h, pageX, pageY) => {
            draggableClassStore.setInventoryBounds({
              x: pageX,
              y: pageY,
              width,
              height,
            });
          });
        }
      },
      [draggableClassStore],
    );

    useEffect(() => {
      if (isFocused && selfRef.current) {
        setTimeout(() => {
          selfRef.current?.measure((x, y, w, h, pageX, pageY) => {
            if (w && h) {
              draggableClassStore.setInventoryBounds({
                x: pageX,
                y: pageY,
                width: w,
                height: h,
              });
            }
          });
        }, 150);
      }
    }, [isFocused, draggableClassStore]);

    const renderInventorySlot = useCallback(
      (index: number) => {
        const position = gridCalculations.slotPositions[index];
        return (
          <View
            style={[
              styles.inventorySlot,
              {
                position: "absolute",
                left: position.left,
                top: position.top,
              },
            ]}
            key={"bg-" + index}
          >
            <View
              style={[
                styles.slotBackground,
                {
                  height: uiStore.itemBlockSize,
                  width: uiStore.itemBlockSize,
                },
              ]}
            />
          </View>
        );
      },
      [gridCalculations.slotPositions, styles, uiStore.itemBlockSize],
    );

    const renderInventoryItem = useCallback(
      (item: { item: Item[] }, index: number) => {
        const position = gridCalculations.slotPositions[index];
        return (
          <View
            style={[
              {
                position: "absolute",
                left: position.left,
                top: position.top,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              },
            ]}
            key={item.item[0].id}
          >
            <View>
              <InventoryItem
                item={item.item}
                setDisplayItem={(params) => {
                  if (params) {
                    setDisplayItem({
                      ...params,
                      side: "inventory",
                    });
                  } else {
                    setDisplayItem(null);
                  }
                }}
                displayItem={displayItem}
                isDraggable={true}
                targetBounds={targetBounds}
                runOnSuccess={(droppedOnKey) =>
                  dropHandler(droppedOnKey, item.item)
                }
              />
            </View>
          </View>
        );
      },
      [
        gridCalculations.slotPositions,
        displayItem,
        targetBounds,
        dropHandler,
        setDisplayItem,
      ],
    );

    const renderKeyItemSlot = useCallback(
      (index: number) => {
        const position = gridCalculations.slotPositions[index];
        return (
          <View
            style={[
              styles.inventorySlot,
              {
                position: "absolute",
                left: position.left,
                top: position.top,
              },
            ]}
            key={"key-bg-" + index}
          >
            <View
              style={[
                styles.slotBackground,
                {
                  height: uiStore.itemBlockSize,
                  width: uiStore.itemBlockSize,
                },
              ]}
            />
          </View>
        );
      },
      [gridCalculations.slotPositions, styles, uiStore.itemBlockSize],
    );

    const renderKeyItem = useCallback(
      (item: Item, index: number) => {
        const position = gridCalculations.slotPositions[index];
        return (
          <View
            style={[
              styles.inventorySlot,
              {
                position: "absolute",
                left: position.left,
                top: position.top,
              },
            ]}
            key={index}
          >
            <View>
              <InventoryItem
                item={[item]}
                setDisplayItem={setDisplayItem}
                displayItem={displayItem}
                targetBounds={[]}
                runOnSuccess={() => null}
              />
            </View>
          </View>
        );
      },
      [gridCalculations.slotPositions, styles, displayItem, setDisplayItem],
    );

    const inventorySlots = useMemo(
      () =>
        Array.from({ length: 24 }).map((_, index) =>
          renderInventorySlot(index),
        ),
      [renderInventorySlot],
    );

    const inventoryItems = useMemo(
      () =>
        playerState?.inventory
          .slice(0, 24)
          .map((item, index) => renderInventoryItem(item, index)) || [],
      [playerState?.inventory, renderInventoryItem],
    );

    const keyItemSlots = useMemo(
      () =>
        Array.from({ length: 24 }).map((_, index) => renderKeyItemSlot(index)),
      [renderKeyItemSlot],
    );

    const keyItems = useMemo(
      () =>
        playerState?.keyItems.map((item, index) =>
          renderKeyItem(item, index),
        ) || [],
      [playerState?.keyItems, renderKeyItem],
    );

    if (!playerState) return null;

    return (
      <View
        collapsable={false}
        ref={selfRef}
        style={[
          screen === "home"
            ? styles.inventoryContainer
            : screen === "shop"
            ? {
                zIndex: 10,
                marginLeft: -8,
              }
            : null,
        ]}
      >
        <ScrollView
          horizontal
          pagingEnabled
          onLayout={onLayoutView}
          scrollEnabled={playerState.keyItems.length > 0}
          onScrollBeginDrag={() => setDisplayItem(null)}
          disableScrollViewPanResponder={true}
          directionalLockEnabled={true}
          bounces={false}
          overScrollMode="never"
          collapsable={false}
          scrollIndicatorInsets={{ top: 0, left: 10, bottom: 0, right: 10 }}
        >
          {/* Regular Inventory Panel */}
          <View style={{ width: uiStore.dimensions.width }}>
            {playerState.keyItems.length > 0 && (
              <View
                style={[
                  styles.keyItemsText,
                  { width: uiStore.dimensions.width },
                ]}
              >
                <Text style={styles["text-3xl"]}>Inventory</Text>
              </View>
            )}
            <Pressable
              onPress={() => setDisplayItem(null)}
              style={styles.inventoryPanel}
            >
              {inventorySlots}
              {inventoryItems}
            </Pressable>
          </View>

          {/* Key Item Inventory Panel */}
          {playerState.keyItems.length > 0 && (
            <View style={{ width: uiStore.dimensions.width }}>
              <View
                style={[
                  styles.keyItemsText,
                  { width: uiStore.dimensions.width },
                ]}
              >
                <Text style={styles["text-3xl"]}>Key Items</Text>
              </View>
              <Pressable
                onPress={() => setDisplayItem(null)}
                style={[
                  screen == "home"
                    ? styles.keyItemPanel
                    : screen == "shop"
                    ? styles.shopKeyItemPanel
                    : { height: "100%", marginHorizontal: 8 },
                  {
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#52525b",
                    position: "relative",
                  },
                ]}
              >
                {keyItemSlots}
                {keyItems}
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    );
  },
);

export default InventoryRender;
