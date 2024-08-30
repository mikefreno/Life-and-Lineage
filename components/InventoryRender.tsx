import React, { useContext, useRef, useState } from "react";
import type { RefObject } from "react";
import { Item } from "../classes/item";
import { Pressable, View, Image } from "react-native";
import Draggable from "react-native-draggable";
import { useVibration } from "../utility/customHooks";
import { checkReleasePositionProps } from "../utility/types";
import { Shop } from "../classes/shop";
import { Text, View as ThemedView } from "./Themed";
import { AppContext } from "../app/_layout";

type InventoryRenderBase = {
  selfRef: RefObject<View> | null;
  inventory: {
    item: Item;
    count: number;
  }[];
  displayItem: {
    item: Item;
    count: number;
    side?: "shop" | "inventory";
    positon: {
      left: number;
      top: number;
    };
  } | null;
  setDisplayItem: React.Dispatch<
    React.SetStateAction<{
      item: Item;
      count: number;
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
};

type InventoryRenderDungeon = InventoryRenderBase & {
  pouchTarget: RefObject<View>;
  addItemToPouch: (item: Item) => void;
};

type InventoryRenderShop = InventoryRenderBase & {
  shopInventoryTarget: RefObject<View>;
  shop: Shop;
  sellItem: (item: Item) => void;
  sellStack: (item: Item) => void;
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

  function checkReleasePosition({
    item,
    xPos,
    yPos,
    size,
    equipped,
  }: checkReleasePositionProps) {
    if (item) {
      if ("headTarget" in props) {
        const { headTarget, bodyTarget, mainHandTarget, offHandTarget } = props;
        if (item.slot) {
          let refs: React.RefObject<View>[] = [];
          switch (item.slot) {
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
                    playerState?.unEquipItem(item);
                  } else {
                    playerState?.equipItem(item);
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
              playerState?.removeFromInventory(item);
              addItemToPouch(item);
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
              const price = item.getSellPrice(shop.shopKeeper.affection);
              playerState?.sellItem(item, price);
              shop.buyItem(item, price);
            }
          },
        );
      }
    }
  }

  interface ItemRenderProps {
    item: Item;
    count: number;
  }

  const blockSize = Math.min(dimensions.lesser / 7.5, 84);

  const ItemRender = ({ item, count }: ItemRenderProps) => {
    const [buzzed, setBuzzed] = useState(false);
    const ref = useRef<View>(null);

    const handlePress = () => {
      vibration({ style: "light" });
      if (displayItem && displayItem.item.equals(item)) {
        setDisplayItem(null);
      } else {
        if ("shop" in props) {
          ref.current?.measureInWindow((x, y) => {
            setDisplayItem({
              item,
              count,
              side: "inventory",
              positon: { left: x, top: y },
            });
          });
        } else {
          ref.current?.measureInWindow((x, y) => {
            setDisplayItem({ item, count, positon: { left: x, top: y } });
          });
        }
      }
    };

    return (
      <Draggable
        onDragRelease={(_, g) => {
          checkReleasePosition({
            item: item,
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
        disabled={!item.isEquippable}
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
            <Image source={item.getItemIcon()} />
            {item.stackable && count > 1 && (
              <ThemedView className="absolute bottom-0 right-0 bg-opacity-50 rounded px-1">
                <Text>{count}</Text>
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
                    top: `${Math.floor(index / 12) * 48 + blockSize / 10}%`,
                  }
                : {
                    left: `${(index % 6) * 16.67 + 1.2}%`,
                    top: `${Math.floor(index / 6) * 24 + blockSize / 12}%`,
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
                    top: `${Math.floor(index / 12) * 48 + blockSize / 10}%`,
                  }
                : {
                    left: `${(index % 6) * 16.67 + 1.2}%`,
                    top: `${Math.floor(index / 6) * 24 + blockSize / 12}%`,
                  }
            }
            key={index}
          >
            <ItemRender item={item.item} count={item.count} />
          </View>
        ))}
      </View>
    </>
  );
}
