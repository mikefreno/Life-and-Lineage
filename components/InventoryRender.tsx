import React, { useContext, useRef, useState } from "react";
import type { RefObject } from "react";
import { Item } from "../classes/item";
import { Pressable, View, Image, LayoutChangeEvent } from "react-native";
import Draggable from "react-native-draggable";
import { useVibration } from "../utility/customHooks";
import { checkReleasePositionProps } from "../utility/types";
import { Shop } from "../classes/shop";
import { Text, View as ThemedView } from "./Themed";
import { AppContext } from "../app/_layout";

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
  addItemToPouch: (item: Item[]) => void;
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
  ...props
}: InventoryRenderProps) {
  const vibration = useVibration();
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing contexts");
  const { playerState, dimensions } = appData;
  const [blockSize, setBlockSize] = useState<number>();

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
            }
          },
        );
      }
    }
  }

  interface ItemRenderProps {
    item: Item[];
  }

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
  };

  const ItemRender = ({ item }: ItemRenderProps) => {
    const [buzzed, setBuzzed] = useState(false);
    const ref = useRef<View>(null);

    const handlePress = () => {
      vibration({ style: "light" });
      if (displayItem && displayItem.item[0].equals(item[0])) {
        setDisplayItem(null);
      } else {
        if ("shop" in props) {
          ref.current?.measureInWindow((x, y) => {
            setDisplayItem({
              item,
              side: "inventory",
              positon: { left: x, top: y },
            });
          });
        } else {
          ref.current?.measureInWindow((x, y) => {
            setDisplayItem({ item, positon: { left: x, top: y } });
          });
        }
      }
    };

    while (!blockSize) {
      return <></>;
    }

    return (
      <Draggable
        onDragRelease={(_, g) => {
          checkReleasePosition({
            itemStack: item,
            xPos: g.moveX,
            yPos: g.moveY,
            size: blockSize,
            equipped: false,
          });
          setBuzzed(false);
        }}
        onDrag={() => {
          if (!buzzed) {
            vibration({ style: "medium", essential: true });
            setBuzzed(true);
          }
        }}
        disabled={!item[0].isEquippable && !("shop" in props)}
        shouldReverse
      >
        <Pressable
          ref={ref}
          onPress={handlePress}
          className="active:scale-90 active:opacity-50 z-top"
        >
          <View
            className="items-center justify-center rounded-lg bg-zinc-400 z-top"
            style={{
              height: blockSize,
              width: blockSize,
            }}
          >
            <Image
              source={item[0].getItemIcon()}
              style={{
                width: Math.min(blockSize * 0.65, 40),
                height: Math.min(blockSize * 0.65, 40),
              }}
            />
            {item[0].stackable && item.length > 1 && (
              <ThemedView className="absolute bottom-0 right-0 bg-opacity-50 rounded px-1">
                <Text>{item.length}</Text>
              </ThemedView>
            )}
          </View>
        </Pressable>
      </Draggable>
    );
  };

  return (
    <>
      <View
        ref={selfRef}
        onLayout={onLayoutView}
        className={`${
          "headTarget" in props
            ? dimensions.greater == dimensions.height
              ? "h-[55%] mx-2"
              : "mx-2 h-[50%]"
            : "shop" in props
            ? "mt-4 h-[75%]"
            : "h-full"
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
                    left: `${(index % 6) * 16.67 + 2}%`,
                    top: `${Math.floor(index / 6) * 24 + 4}%`,
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
            className="absolute items-center justify-center"
            style={
              dimensions.width === dimensions.greater
                ? {
                    left: `${(index % 12) * 8.33 + 0.5}%`,
                    top: `${Math.floor(index / 12) * 48 + 8}%`,
                  }
                : {
                    left: `${(index % 6) * 16.67 + 2}%`,
                    top: `${Math.floor(index / 6) * 24 + 4}%`,
                  }
            }
            key={index}
          >
            <ItemRender item={item.item} />
          </View>
        ))}
      </View>
    </>
  );
}
