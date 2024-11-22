import { Pressable, View, LayoutChangeEvent, ScrollView } from "react-native";
import { Text } from "./Themed";
import { InventoryItem } from "./Draggable";
import type { Item } from "../entities/item";
import { useVibration } from "../hooks/generic";
import { useDraggableStore, useRootStore } from "../hooks/stores";
import { useRef } from "react";
import { usePathname } from "expo-router";

export default function InventoryRender({
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
}) {
  const selfRef = useRef<View | null>(null);
  const vibration = useVibration();
  const { playerState, uiStore } = useRootStore();
  const { draggableClassStore } = useDraggableStore();

  const dropHandler = (droppedOnKey: string, item: Item[]) => {
    vibration({ style: "light" });
    switch (droppedOnKey) {
      case "shopInventory":
        runOnSuccess(item);
        break;
      case "head":
      case "main-hand":
      case "off-hand":
      case "body":
      case "quiver":
        playerState?.equipItem(item, droppedOnKey);
        break;
    }
  };

  const onLayoutView = (event: LayoutChangeEvent) => {
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
  };

  if (playerState) {
    return (
      <>
        <View
          collapsable={false}
          ref={selfRef}
          className={`z-top ${
            screen === "home" ? "max-h-[60%]" : screen === "shop" ? "-ml-2" : ""
          }`}
        >
          <ScrollView
            horizontal
            pagingEnabled
            onLayout={(e) => {
              onLayoutView(e);
            }}
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
              style={{
                width: uiStore.dimensions.width,
              }}
              ref={selfRef}
            >
              {playerState.keyItems.length > 0 && (
                <View
                  style={{
                    width: uiStore.dimensions.width,
                  }}
                  className="items-center absolute justify-center py-2 top-[40%]"
                >
                  <Text className="text-3xl tracking-widest opacity-70">
                    Inventory
                  </Text>
                </View>
              )}
              <Pressable
                onPress={() => setDisplayItem(null)}
                className="rounded-lg mx-2 border border-zinc-600 relative h-full"
              >
                {Array.from({ length: 24 }).map((_, index) => (
                  <View
                    className="absolute items-center justify-center"
                    style={
                      uiStore.dimensions.width === uiStore.dimensions.greater
                        ? {
                            left: `${(index % 12) * 8.33 + 0.5}%`,
                            top: `${
                              Math.floor(index / 12) * 48 +
                              (uiStore.playerStatusIsCompact ? 8.0 : 7.5)
                            }%`,
                          }
                        : {
                            left: `${(index % 6) * 16.67 + 1.5}%`,
                            top: `${
                              Math.floor(index / 6) * 24 +
                              (uiStore.playerStatusIsCompact ? 5.5 : 5.0)
                            }%`,
                          }
                    }
                    key={"bg-" + index}
                  >
                    <View
                      className="rounded-lg border-zinc-300 dark:border-zinc-700 border z-0"
                      style={{
                        height: uiStore.itemBlockSize,
                        width: uiStore.itemBlockSize,
                      }}
                    />
                  </View>
                ))}
                {playerState.inventory.slice(0, 24).map((item, index) => (
                  <View
                    className="absolute items-center justify-center z-top"
                    style={
                      uiStore.dimensions.width === uiStore.dimensions.greater
                        ? {
                            left: `${(index % 12) * 8.33 + 0.5}%`,
                            top: `${Math.floor(index / 12) * 48 + 8}%`,
                          }
                        : {
                            left: `${(index % 6) * 16.67 + 1.5}%`,
                            top: `${
                              Math.floor(index / 6) * 24 +
                              (uiStore.playerStatusIsCompact ? 5.5 : 5.0)
                            }%`,
                          }
                    }
                    key={item.item[0].id}
                  >
                    <View>
                      <InventoryItem
                        item={item.item}
                        setDisplayItem={(params) => {
                          if (params) {
                            setDisplayItem({ ...params, side: "inventory" });
                          } else {
                            setDisplayItem(null);
                          }
                        }}
                        displayItem={displayItem}
                        isDraggable={
                          screen == "home" ? !!item.item[0].slot : true
                        }
                        targetBounds={targetBounds}
                        runOnSuccess={(droppedOnKey) =>
                          dropHandler(droppedOnKey, item.item)
                        }
                      />
                    </View>
                  </View>
                ))}
              </Pressable>
            </View>
            {/* Key Item Inventory Panel */}
            {playerState.keyItems.length > 0 && (
              <View style={{ width: uiStore.dimensions.width }}>
                <View
                  style={{
                    width: uiStore.dimensions.width,
                  }}
                  className="items-center absolute justify-center py-2 top-[40%]"
                >
                  <Text className="text-3xl tracking-widest opacity-70">
                    Key Items
                  </Text>
                </View>
                <Pressable
                  onPress={() => setDisplayItem(null)}
                  className={`${
                    screen == "home"
                      ? uiStore.dimensions.greater == uiStore.dimensions.height
                        ? "h-[100%] mx-2"
                        : "mx-2 h-[50%]"
                      : screen == "shop"
                      ? "mt-4 h-[90%]"
                      : "h-full mx-2"
                  } rounded-lg border border-zinc-600 relative`}
                >
                  {Array.from({ length: 24 }).map((_, index) => (
                    <View
                      className="absolute items-center justify-center"
                      style={
                        uiStore.dimensions.width === uiStore.dimensions.greater
                          ? {
                              left: `${(index % 12) * 8.33 + 0.5}%`,
                              top: `${
                                Math.floor(index / 12) * 48 +
                                (uiStore.playerStatusIsCompact ? 8.0 : 7.5)
                              }%`,
                            }
                          : {
                              left: `${(index % 6) * 16.67 + 1.5}%`,
                              top: `${
                                Math.floor(index / 6) * 24 +
                                (uiStore.playerStatusIsCompact ? 5.5 : 5.0)
                              }%`,
                            }
                      }
                      key={"key-bg-" + index}
                    >
                      <View
                        className="rounded-lg border-zinc-300 dark:border-zinc-700 border z-0"
                        style={{
                          height: uiStore.itemBlockSize,
                          width: uiStore.itemBlockSize,
                        }}
                      />
                    </View>
                  ))}
                  {playerState.keyItems.map((item, index) => (
                    <View
                      className="absolute items-center justify-center"
                      style={
                        uiStore.dimensions.width === uiStore.dimensions.greater
                          ? {
                              left: `${(index % 12) * 8.33 + 0.5}%`,
                              top: `${
                                Math.floor(index / 12) * 48 +
                                (uiStore.playerStatusIsCompact ? 8.0 : 7.5)
                              }%`,
                            }
                          : {
                              left: `${(index % 6) * 16.67 + 1.5}%`,
                              top: `${
                                Math.floor(index / 6) * 24 +
                                (uiStore.playerStatusIsCompact ? 5.5 : 5.0)
                              }%`,
                            }
                      }
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
                  ))}
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </>
    );
  }
}
