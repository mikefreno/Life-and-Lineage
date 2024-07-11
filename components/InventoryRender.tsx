import { useContext, useRef, useState } from "react";
import type { RefObject } from "react";
import { Item } from "../classes/item";
import { Dimensions, Pressable, View, Image, Platform } from "react-native";
import Draggable from "react-native-draggable";
import { useVibration } from "../utility/customHooks";
import { StatsDisplay } from "./StatsDisplay";
import { PlayerCharacterContext } from "../app/_layout";
import { checkReleasePositionProps } from "../utility/types";
import { Shop } from "../classes/shop";
import { Text, View as ThemedView } from "./Themed";

type InventoryRenderBase = {
  selfRef: RefObject<View> | null;
  inventory: {
    item: Item;
    count: number;
  }[];
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
  ...props
}: InventoryRenderProps) {
  const deviceHeight = Dimensions.get("window").height;
  const deviceWidth = Dimensions.get("window").width;
  const vibration = useVibration();
  const [statsLeftPos, setStatsLeftPos] = useState<number | undefined>();
  const [statsTopPos, setStatsTopPos] = useState<number | undefined>();
  const [showingStats, setShowingStats] = useState<{
    item: Item;
    count: number;
  } | null>(null);
  const playerStateData = useContext(PlayerCharacterContext);
  if (!playerStateData) throw new Error("missing contexts");
  const { playerState } = playerStateData;

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
                  setShowingStats(null);
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
              setShowingStats(null);
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
              setShowingStats(null);
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

  const ItemRender = ({ item, count }: ItemRenderProps) => {
    const [buzzed, setBuzzed] = useState(false);
    const localRef = useRef<View>(null);
    const [z, setZ] = useState<number>(10);

    const handlePress = () => {
      vibration({ style: "light" });
      if (showingStats && showingStats.item.equals(item)) {
        setShowingStats(null);
      } else {
        setShowingStats({ item, count });
        localRef.current?.measureInWindow((x, y) => {
          setStatsLeftPos(x);
          setStatsTopPos(y);
        });
      }
    };

    return (
      <Draggable
        onDragRelease={(_, g) => {
          checkReleasePosition({
            item: item,
            xPos: g.moveX,
            yPos: g.moveY,
            size: 48,
            equipped: false,
          });
          setBuzzed(false);
          setZ(10);
        }}
        onDrag={() => {
          if (!buzzed) {
            vibration({ style: "medium", essential: true });
            setBuzzed(true);
            setZ(50);
          }
        }}
        disabled={"headTarget" in props ? !item.slot : false}
        shouldReverse
      >
        <Pressable
          className={`h-14 w-14 absolute items-center justify-center rounded-lg bg-zinc-400 active:scale-90 active:opacity-50`}
          ref={localRef}
          onPress={handlePress}
          style={{ zIndex: z }}
        >
          <Image source={item.getItemIcon()} />
          {item.stackable && count > 1 && (
            <ThemedView className="absolute bottom-0 right-0 bg-opacity-50 rounded px-1">
              <Text>{count}</Text>
            </ThemedView>
          )}
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
            ? "h-[60%]"
            : "shop" in props
            ? "mt-4 h-[75%]"
            : "mt-1 h-[99%]"
        } mx-auto flex w-full flex-wrap rounded-lg border border-zinc-600`}
      >
        {Array.from({ length: 24 }).map((_, index) => (
          <View
            className="absolute items-center justify-center"
            style={{
              left: `${
                (index % 6) * 16.67 + 1.2 * Math.floor(deviceWidth / 200)
              }%`,
              top: `${
                Math.floor(index / 6) * 25 + Math.floor(deviceHeight / 200)
              }%`,
            }}
            key={"bg-" + index}
          >
            <View className="h-14 w-14 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          </View>
        ))}
        {inventory.slice(0, 24).map((item, index) => (
          <View
            className="absolute h-1/4 w-1/6 items-center justify-center"
            style={{
              left: `${
                (index % 6) * 16.67 + 1.2 * Math.floor(deviceWidth / 200)
              }%`,
              top: `${
                Math.floor(index / 6) * 25 + Math.floor(deviceHeight / 200)
              }%`,
            }}
            key={index}
          >
            <ItemRender item={item.item} count={item.count} />
          </View>
        ))}
      </View>
      {showingStats &&
        statsLeftPos &&
        statsTopPos &&
        playerState &&
        ("addItemToPouch" in props ? (
          <StatsDisplay
            statsLeftPos={statsLeftPos}
            statsTopPos={statsTopPos}
            item={showingStats.item}
            count={showingStats.count}
            setShowingStats={setShowingStats}
            addItemToPouch={props.addItemToPouch}
            topOffset={
              Platform.OS == "ios"
                ? -(50 + deviceHeight / 2.2)
                : -(80 + deviceHeight / 10)
            }
          />
        ) : "shopInventoryTarget" in props ? (
          <StatsDisplay
            statsLeftPos={statsLeftPos}
            statsTopPos={statsTopPos}
            item={showingStats.item}
            count={showingStats.count}
            setShowingStats={setShowingStats}
            shop={props.shop}
            topOffset={
              Platform.OS == "ios"
                ? -(40 + deviceHeight / 2.2)
                : -(40 + deviceHeight / 2.3)
            }
            leftOffset={-4}
            sellItem={props.sellItem}
            sellStack={props.sellStack}
          />
        ) : (
          <StatsDisplay
            statsLeftPos={statsLeftPos}
            statsTopPos={statsTopPos}
            item={showingStats.item}
            count={showingStats.count}
            setShowingStats={setShowingStats}
            topOffset={
              Platform.OS == "ios"
                ? -(120 + deviceHeight / 10)
                : -(10 + deviceHeight / 4)
            }
          />
        ))}
    </>
  );
}
