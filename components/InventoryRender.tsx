import React from "react";
import type { RefObject } from "react";
import { Item } from "../classes/item";
import { Pressable, View, LayoutChangeEvent, ScrollView } from "react-native";
import { useVibration } from "../utility/customHooks";
import { checkReleasePositionProps } from "../utility/types";
import { Shop } from "../classes/shop";
import { Text } from "./Themed";
import { InventoryItem } from "./Draggable";
import {
  useDraggableDataState,
  useGameState,
  useLayout,
} from "../stores/AppData";

type InventoryRenderBase = {
  selfRef?: RefObject<View>;
  inventory: {
    item: Item[];
  }[];
  displayItem: {
    item: Item[];
    side?: "shop" | "inventory";
    positon: {
      left: number;
      top: number;
    };
  } | null;
  setDisplayItem: React.Dispatch<
    React.SetStateAction<{
      item: Item[];
      side?: "shop" | "inventory";
      positon: {
        left: number;
        top: number;
      };
    } | null>
  >;
  keyItemInventory?: Item[];
  setInventoryBounds?: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>
  >;
  setIconString: React.Dispatch<React.SetStateAction<string | null>>;
};

type InventoryRenderHome = InventoryRenderBase & {
  headTarget: RefObject<View>;
  bodyTarget: RefObject<View>;
  mainHandTarget: RefObject<View>;
  offHandTarget: RefObject<View>;
  quiverTarget: RefObject<View>;
};

type InventoryRenderDungeon = InventoryRenderBase & {
  pouchTarget: RefObject<View>;
  addItemToPouch: ({ items }: { items: Item[] }) => void;
};

type InventoryRenderShop = InventoryRenderBase & {
  shopInventoryTarget: RefObject<View>;
  shop: Shop;
  sellItem: (item: Item) => void;
  sellStack: (items: Item[]) => void;
};

type InventoryRenderProps =
  | InventoryRenderHome
  | InventoryRenderDungeon
  | InventoryRenderShop;

export default function InventoryRender({
  selfRef,
  inventory,
  displayItem,
  setDisplayItem,
  keyItemInventory,
  setInventoryBounds,
  setIconString,
  ...props
}: InventoryRenderProps) {
  const vibration = useVibration();
  const { playerState } = useGameState();
  const { dimensions, blockSize, setBlockSize } = useLayout();
  const { position, isDragging } = useDraggableDataState();

  const onLayoutView = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width && height) {
      if (dimensions.width === dimensions.lesser) {
        const blockSize = Math.min(height / 5, width / 7.5);
        setBlockSize(blockSize);
      } else {
        const blockSize = width / 14;
        setBlockSize(blockSize);
      }
    }

    if (setInventoryBounds) {
      setTimeout(() => {
        if (selfRef?.current) {
          selfRef.current.measure((x, y, w, h, pageX, pageY) => {
            setInventoryBounds({
              x: pageX,
              y: pageY,
              width,
              height,
            });
          });
        }
      }, 100);
    }
  };

  function checkReleasePosition({
    itemStack,
    xPos,
    yPos,
    size,
    equipped,
  }: checkReleasePositionProps) {
    if (itemStack) {
      if ("headTarget" in props) {
        const {
          headTarget,
          bodyTarget,
          mainHandTarget,
          offHandTarget,
          quiverTarget,
        } = props;
        if (itemStack[0].slot) {
          let refs: React.RefObject<View>[] = [];
          switch (itemStack[0].slot) {
            case "head":
              refs.push(headTarget);
              break;
            case "body":
              refs.push(bodyTarget);
              break;
            case "two-hand":
              refs.push(mainHandTarget, offHandTarget);
              break;
            case "one-hand":
              refs.push(mainHandTarget, offHandTarget);
              break;
            case "off-hand":
              refs.push(offHandTarget);
              break;
            case "quiver":
              refs.push(quiverTarget);
              break;
          }
          refs.forEach((ref) => {
            ref.current?.measureInWindow(
              (targetX, targetY, targetWidth, targetHeight) => {
                const isWidthAligned =
                  xPos + size / 2 >= targetX &&
                  xPos - size / 2 <= targetX + targetWidth;
                const isHeightAligned =
                  yPos + size / 2 >= targetY &&
                  yPos - size / 2 <= targetY + targetHeight;
                if (isWidthAligned && isHeightAligned) {
                  setDisplayItem(null);
                  vibration({ style: "light", essential: true });
                  if (
                    equipped &&
                    playerState &&
                    playerState.inventory.length < 24
                  ) {
                    playerState?.unEquipItem(itemStack);
                  } else {
                    playerState?.equipItem(itemStack);
                  }
                  return false;
                }
              },
            );
          });
        }
      } else if ("pouchTarget" in props) {
        const { pouchTarget, addItemToPouch } = props;
        pouchTarget.current?.measureInWindow(
          (targetX, targetY, targetWidth, targetHeight) => {
            const isWidthAligned =
              xPos + size / 2 >= targetX &&
              xPos - size / 2 <= targetX + targetWidth;
            const isHeightAligned =
              yPos + size / 2 >= targetY &&
              yPos - size / 2 <= targetY + targetHeight;
            if (isWidthAligned && isHeightAligned) {
              setDisplayItem(null);
              vibration({ style: "light", essential: true });
              playerState?.removeFromInventory(itemStack);
              addItemToPouch(itemStack);
              return false;
            }
          },
        );
      } else {
        const { shopInventoryTarget, shop } = props;
        shopInventoryTarget.current?.measureInWindow(
          (targetX, targetY, targetWidth, targetHeight) => {
            const isWidthAligned =
              xPos + size / 2 >= targetX &&
              xPos - size / 2 <= targetX + targetWidth;
            const isHeightAligned =
              yPos + size / 2 >= targetY &&
              yPos - size / 2 <= targetY + targetHeight;
            if (isWidthAligned && isHeightAligned) {
              setDisplayItem(null);
              vibration({ style: "light", essential: true });
              const price = itemStack[0].getSellPrice(
                shop.shopKeeper.affection,
              );
              if (price <= shop.currentGold) {
                playerState?.sellItem(itemStack, price);
                shop.buyItem(itemStack, price);
              }
              return false;
            }
          },
        );
      }
    }
    return true;
  }

  return (
    <>
      <View
        collapsable={false}
        ref={selfRef}
        className={`z-top ${"headTarget" in props ? "max-h-[60%]" : ""}`}
      >
        <ScrollView
          horizontal
          pagingEnabled
          onLayout={(e) => {
            onLayoutView(e);
          }}
          scrollEnabled={!!keyItemInventory}
          contentContainerClassName={
            !!keyItemInventory ? "z-top overflow-visible" : "mx-auto z-top"
          }
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
              width: dimensions.width,
            }}
            ref={selfRef}
          >
            {!!keyItemInventory && (
              <View
                style={{
                  width: dimensions.width,
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
                    dimensions.width === dimensions.greater
                      ? {
                          left: `${(index % 12) * 8.33 + 0.5}%`,
                          top: `${Math.floor(index / 12) * 48 + 8}%`,
                        }
                      : {
                          left: `${(index % 6) * 16.67 + 1.5}%`,
                          top: `${Math.floor(index / 6) * 24 + 5.5}%`,
                        }
                  }
                  key={"bg-" + index}
                >
                  <View
                    className="rounded-lg border-zinc-300 dark:border-zinc-700 border z-0"
                    style={{ height: blockSize, width: blockSize }}
                  />
                </View>
              ))}
              {inventory.slice(0, 24).map((item, index) => (
                <View
                  className="absolute items-center justify-center z-top"
                  style={
                    dimensions.width === dimensions.greater
                      ? {
                          left: `${(index % 12) * 8.33 + 0.5}%`,
                          top: `${Math.floor(index / 12) * 48 + 8}%`,
                        }
                      : {
                          left: `${(index % 6) * 16.67 + 1.5}%`,
                          top: `${Math.floor(index / 6) * 24 + 5.5}%`,
                        }
                  }
                  key={index}
                >
                  <View>
                    <InventoryItem
                      item={item.item}
                      vibration={vibration}
                      blockSize={blockSize ?? 0}
                      setDisplayItem={setDisplayItem}
                      checkReleasePosition={checkReleasePosition}
                      displayItem={displayItem}
                      setIconString={setIconString}
                      position={position}
                      isDragging={isDragging}
                    />
                  </View>
                </View>
              ))}
            </Pressable>
          </View>
          {/* Key Item Inventory Panel */}
          {keyItemInventory && (
            <View style={{ width: dimensions.width }}>
              <View
                style={{
                  width: dimensions.width,
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
                  "headTarget" in props
                    ? dimensions.greater == dimensions.height
                      ? "h-[100%] mx-2"
                      : "mx-2 h-[50%]"
                    : "shop" in props
                    ? "mt-4 h-[90%]"
                    : "h-full mx-2"
                } rounded-lg border border-zinc-600 relative`}
              >
                {Array.from({ length: 24 }).map((_, index) => (
                  <View
                    className="absolute items-center justify-center"
                    style={
                      dimensions.width === dimensions.greater
                        ? {
                            left: `${(index % 12) * 8.33 + 0.5}%`,
                            top: `${Math.floor(index / 12) * 48 + 8}%`,
                          }
                        : {
                            left: `${(index % 6) * 16.67 + 1.5}%`,
                            top: `${Math.floor(index / 6) * 24 + 4}%`,
                          }
                    }
                    key={"key-bg-" + index}
                  >
                    <View
                      className="rounded-lg border-zinc-300 dark:border-zinc-700 border z-0"
                      style={{ height: blockSize, width: blockSize }}
                    />
                  </View>
                ))}
                {keyItemInventory.map((item, index) => (
                  <View
                    className="absolute items-center justify-center"
                    style={
                      dimensions.width === dimensions.greater
                        ? {
                            left: `${(index % 12) * 8.33 + 0.5}%`,
                            top: `${Math.floor(index / 12) * 48 + 8}%`,
                          }
                        : {
                            left: `${(index % 6) * 16.67 + 1.5}%`,
                            top: `${Math.floor(index / 6) * 24 + 4}%`,
                          }
                    }
                    key={index}
                  >
                    <View>
                      <InventoryItem
                        item={[item]}
                        vibration={vibration}
                        blockSize={blockSize ?? 0}
                        setDisplayItem={setDisplayItem}
                        checkReleasePosition={checkReleasePosition}
                        displayItem={displayItem}
                        setIconString={setIconString}
                        position={position}
                        isDragging={isDragging}
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
