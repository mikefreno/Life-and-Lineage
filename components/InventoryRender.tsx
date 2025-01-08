import React from "react";
import { Pressable, View, LayoutChangeEvent, ScrollView } from "react-native";
import { Text } from "./Themed";
import { InventoryItem } from "./Draggable";
import type { Item } from "../entities/item";
import { useVibration } from "../hooks/generic";
import { useDraggableStore, useRootStore } from "../hooks/stores";
import { useRef } from "react";
import { observer } from "mobx-react-lite";
import { useStyles } from "../hooks/styles";

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

    const dropHandler = (droppedOnKey: string, item: Item[]) => {
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
              onLayout={(e) => onLayoutView(e)}
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
              <View style={{ width: uiStore.dimensions.width }} ref={selfRef}>
                {playerState.keyItems.length > 0 && (
                  <View
                    style={[
                      styles.keyItemsText,
                      { width: uiStore.dimensions.width },
                    ]}
                  >
                    <Text style={styles["3xl"]}>Inventory</Text>
                  </View>
                )}
                <Pressable
                  onPress={() => setDisplayItem(null)}
                  style={styles.inventoryPanel}
                >
                  {Array.from({ length: 24 }).map((_, index) => (
                    <View
                      style={[
                        styles.inventorySlot,
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
                  ))}
                  {playerState.inventory.slice(0, 24).map((item, index) => (
                    <View
                      style={[
                        {
                          position: "absolute",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 10,
                        },
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
                            },
                      ]}
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
                          isDraggable={true}
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
                    style={[
                      styles.keyItemsText,
                      { width: uiStore.dimensions.width },
                    ]}
                  >
                    <Text style={styles["3xl"]}>Key Items</Text>
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
                    {Array.from({ length: 24 }).map((_, index) => (
                      <View
                        style={[
                          styles.inventorySlot,
                          uiStore.dimensions.width ===
                          uiStore.dimensions.greater
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
                    ))}
                    {playerState.keyItems.map((item, index) => (
                      <View
                        style={[
                          styles.inventorySlot,
                          uiStore.dimensions.width ===
                          uiStore.dimensions.greater
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
                    ))}
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </>
      );
    }
  },
);
export default InventoryRender;
