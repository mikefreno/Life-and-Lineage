import { useContext, useRef, useState } from "react";
import type { RefObject } from "react";
import { Item } from "../classes/item";
import { Dimensions, Pressable, View, Image, Text } from "react-native";
import Draggable from "react-native-draggable";
import { useVibration } from "../utility/customHooks";
import { StatsDisplay } from "./StatsDisplay";
import { PlayerCharacterContext } from "../app/_layout";
import { checkReleasePositonProps } from "../utility/types";

interface ItemRenderProps {
  item: Item;
  count: number;
}

export type InventoryRenderBase = {
  selfRef: RefObject<View> | null;
  inventory: {
    item: Item;
    count: number;
  }[];
};

export type InventoryRenderHome = InventoryRenderBase & {
  location: "home";
  headTarget: RefObject<View>;
  bodyTarget: RefObject<View>;
  mainHandTarget: RefObject<View>;
  offHandTarget: RefObject<View>;
};
export type InventoryRenderDungeon = InventoryRenderBase & {
  location: "dungeon";
};
export type InventoryRenderShop = InventoryRenderBase & {
  location: "shop";
};

export type InventoryRenderProps =
  | InventoryRenderHome
  | InventoryRenderDungeon
  | InventoryRenderShop;

export default function InventoryRender({
  location,
  selfRef,
  inventory,
  ...props
}: InventoryRenderProps) {
  const deviceHeight = Dimensions.get("window").height;
  const deviceWidth = Dimensions.get("window").width;
  const vibration = useVibration();
  const [statsLeftPos, setStatsLeftPos] = useState<number | undefined>();
  const [statsTopPos, setStatsTopPos] = useState<number | undefined>();
  const [showingStats, setShowingStats] = useState<Item | null>(null);
  const playerStateData = useContext(PlayerCharacterContext);
  if (!playerStateData) throw new Error("missing contexts");
  const { playerState } = playerStateData;

  function checkReleasePositon({
    item,
    xPos,
    yPos,
    size,
    equipped,
  }: checkReleasePositonProps) {
    switch (location) {
      case "home":
        const { headTarget, bodyTarget, mainHandTarget, offHandTarget } =
          props as InventoryRenderHome;
        if (item && item.slot) {
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
      case "dungeon":
      case "shop":
    }
  }

  const ItemRender = ({ item }: ItemRenderProps) => {
    const [buzzed, setBuzzed] = useState(false);
    const localRef = useRef<View>(null);

    const handlePress = () => {
      vibration({ style: "light" });
      if (showingStats && showingStats.equals(item)) {
        setShowingStats(null);
      } else {
        setShowingStats(item);
        localRef.current?.measureInWindow((x, y) => {
          setStatsLeftPos(x);
          setStatsTopPos(y);
        });
      }
    };

    return (
      <Draggable
        onDragRelease={(_, g) => {
          checkReleasePositon({
            item: item,
            xPos: g.moveX,
            yPos: g.moveY,
            size: 48,
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
        disabled={location == "home" ? !item.slot : false}
        shouldReverse
      >
        <Pressable
          className="z-10 h-14 w-14 items-center justify-center rounded-lg bg-zinc-400 active:scale-90 active:opacity-50"
          ref={localRef}
          onPress={handlePress}
        >
          <Image source={item.getItemIcon()} />
        </Pressable>
      </Draggable>
    );
  };

  return (
    <>
      <View
        ref={selfRef}
        className={`${
          location == "home"
            ? "h-[60%]"
            : location == "shop"
            ? "-mt-2 h-[40%]"
            : "mt-1 h-[99%]"
        } mx-auto flex w-full flex-wrap rounded-lg border border-zinc-600`}
      >
        {Array.from({ length: 24 }).map((_, index) => (
          <View
            className="absolute items-center justify-center"
            style={{
              left: `${
                (index % 6) * 16.67 + 1 * (Math.floor(deviceWidth / 400) + 1)
              }%`,
              top: `${
                Math.floor(index / 6) * 25 + Math.floor(deviceHeight / 300)
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
                (index % 6) * 16.67 + 1 * (Math.floor(deviceWidth / 400) + 1)
              }%`,
              top: `${
                Math.floor(index / 6) * 25 + Math.floor(deviceHeight / 300)
              }%`,
            }}
            key={index}
          >
            <ItemRender item={item.item} count={item.count} />
          </View>
        ))}
      </View>
      {showingStats && statsLeftPos && statsTopPos && (
        <StatsDisplay
          statsLeftPos={statsLeftPos}
          statsTopPos={statsTopPos}
          showingStats={showingStats}
          setShowingStats={setShowingStats}
          topOffset={
            location == "home" ? -240 : location == "dungeon" ? -360 : 0
          }
        />
      )}
    </>
  );
}
