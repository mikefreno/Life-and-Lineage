import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  Pressable,
  View,
  ScrollView,
  type DimensionValue,
  LayoutAnimation,
  Platform,
  LayoutChangeEvent,
  findNodeHandle,
  UIManager,
} from "react-native";
import { Text } from "@/components/Themed";
import { InventoryItem } from "@/components/Draggable";
import type { Item } from "@/entities/item";
import { useVibration } from "@/hooks/generic";
import { useDraggableStore, useRootStore } from "@/hooks/stores";
import { observer } from "mobx-react-lite";
import { useStyles } from "@/hooks/styles";
import { runInAction } from "mobx";
import { useScaling } from "@/hooks/scaling";
import { SCREEN_TRANSITION_TIMING } from "@/stores/UIStore";

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
    const [layoutCompleted, setLayoutCompleted] = useState(false);
    const { getNormalizedFontSize } = useScaling();

    const [containerDimensions, setContainerDimensions] = useState<{
      width: number;
      height: number;
    } | null>(null);

    const measureInWindow = useCallback(() => {
      if (!selfRef.current) return;

      const nodeHandle = findNodeHandle(selfRef.current);
      if (nodeHandle) {
        UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
          if (width && height) {
            draggableClassStore.setInventoryBounds({
              x: pageX,
              y: pageY,
              width,
              height,
            });

            setContainerDimensions({ width, height });
          }
        });
      }
    }, [uiStore.orientation]);

    const onLayoutHandler = useCallback(
      (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        setContainerDimensions({ width, height });

        setTimeout(
          () =>
            requestAnimationFrame(() => {
              measureInWindow();
            }),
          SCREEN_TRANSITION_TIMING,
        );
      },
      [measureInWindow],
    );

    const gridCalculations = useMemo(() => {
      const width = containerDimensions?.width ?? 0;
      const height = containerDimensions?.height ?? 0;

      if (height <= 0 || width <= 0) {
        return {
          rows: uiStore.isLandscape ? 2 : 4,
          columns: uiStore.isLandscape ? 12 : 6,
          itemSize: uiStore.itemBlockSize,
          slotPositions: [],
        };
      }

      const rows = uiStore.isLandscape ? 2 : 4;
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

      if (Platform.OS === "ios") {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      return {
        rows,
        columns,
        itemSize,
        slotPositions,
      };
    }, [containerDimensions, uiStore.isLandscape, uiStore.itemBlockSize]);

    useEffect(() => {
      if (
        gridCalculations.slotPositions.length > 0 &&
        draggableClassStore.inventoryBounds &&
        !layoutCompleted
      ) {
        setLayoutCompleted(true);
        setTimeout(
          () =>
            runInAction(() => (uiStore.storeLoadingStatus["inventory"] = true)),
          0,
        );
      }
    }, [
      gridCalculations.slotPositions,
      draggableClassStore.inventoryBounds,
      layoutCompleted,
      uiStore,
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

    const renderInventorySlot = useCallback(
      (index: number) => {
        const position = gridCalculations.slotPositions[index];
        if (!position) return null;

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
        if (!position) return null;

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
        if (!position) return null;

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
        if (!position) return null;

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

    // Get the effective width from local dimensions or fallback to store bounds or screen width
    const effectiveWidth =
      containerDimensions?.width ||
      draggableClassStore.inventoryBounds?.width ||
      uiStore.dimensions.width;

    return (
      <View
        collapsable={false}
        ref={selfRef}
        onLayout={onLayoutHandler}
        style={styles.inventoryContainer}
      >
        <ScrollView
          horizontal
          pagingEnabled
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
          <View
            style={[styles.notchAvoidingLanscapePad, { width: effectiveWidth }]}
          >
            <View style={[styles.keyItemsText, { width: effectiveWidth }]}>
              <Text
                style={[
                  styles["text-3xl"],
                  {
                    opacity: 0.3,
                    position: "absolute",
                    top: getNormalizedFontSize(28),
                  },
                ]}
              >
                Inventory
              </Text>
            </View>
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
                <Text style={[styles["text-3xl"], { opacity: 0.3 }]}>
                  Key Items
                </Text>
              </View>
              <Pressable
                onPress={() => setDisplayItem(null)}
                style={[
                  screen === "home"
                    ? styles.keyItemPanel
                    : screen === "shop"
                    ? styles.shopKeyItemPanel
                    : {
                        height:
                          containerDimensions?.height ||
                          draggableClassStore.inventoryBounds?.height ||
                          "100%",
                        marginHorizontal: 8,
                      },
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
