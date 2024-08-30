import { RefObject, useContext, useState } from "react";
import { View, Image, Pressable } from "react-native";
import { Text } from "./Themed";
import Draggable from "react-native-draggable";
import type { Item } from "../classes/item";
import { useVibration } from "../utility/customHooks";
import { checkReleasePositionProps } from "../utility/types";
import { AppContext } from "../app/_layout";

interface EquipmentDisplayProps {
  headTarget: RefObject<View>;
  bodyTarget: RefObject<View>;
  mainHandTarget: RefObject<View>;
  offHandTarget: RefObject<View>;
  inventoryTarget: RefObject<View>;
  displayItem: {
    item: Item;
    count: number;
    positon: {
      left: number;
      top: number;
    };
  } | null;
  setDisplayItem: React.Dispatch<
    React.SetStateAction<{
      item: Item;
      count: number;
      positon: {
        left: number;
        top: number;
      };
    } | null>
  >;
}

export default function EquipmentDisplay({
  headTarget,
  bodyTarget,
  mainHandTarget,
  offHandTarget,
  inventoryTarget,
  displayItem,
  setDisplayItem,
}: EquipmentDisplayProps) {
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
    if (item && item.slot) {
      let refs: React.RefObject<View>[] = [];
      if (equipped) {
        refs.push(inventoryTarget);
      } else {
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
              vibration({ style: "light", essential: true });
              setDisplayItem(null);
              if (
                equipped &&
                playerState &&
                playerState.getInventory().length < 24
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
  }

  const blockSize = Math.min(dimensions.lesser / 7.5, 84);

  interface EquipmentSlotProps {
    slot: "Head" | "Main-Hand" | "Off-Hand" | "Body";
  }

  const EquipmentSlot = ({ slot }: EquipmentSlotProps) => {
    const [buzzed, setBuzzed] = useState<boolean>(false);
    let ref: RefObject<View>;
    let item: Item | null = null;
    if (playerState) {
      switch (slot) {
        case "Head":
          ref = headTarget;
          item = playerState.equipment.head;
          break;
        case "Main-Hand":
          ref = mainHandTarget;
          item =
            playerState.equipment.mainHand.name !== "unarmored"
              ? playerState.equipment.mainHand
              : null;
          break;
        case "Off-Hand":
          ref = offHandTarget;
          item = playerState.equipment.offHand;
          break;
        case "Body":
          ref = bodyTarget;
          item = playerState.equipment.body;
          break;
      }

      const isTwoHanded = playerState.equipment.mainHand?.slot === "two-hand";

      return (
        <View>
          <Text className="mb-1 text-center">{slot}</Text>
          {item ? (
            <View
              className="z-50 mx-auto border border-zinc-400 rounded-lg"
              style={{ height: blockSize, width: blockSize }}
            >
              <Draggable
                onDragRelease={(_, g) => {
                  checkReleasePosition({
                    item: item!,
                    xPos: g.moveX,
                    yPos: g.moveY,
                    size: blockSize,
                    equipped: true,
                  });
                  setBuzzed(false);
                }}
                onDrag={() => {
                  if (!buzzed) {
                    vibration({ style: "medium", essential: true });
                    setBuzzed(true);
                  }
                }}
                shouldReverse
              >
                <Pressable
                  onPress={() => {
                    vibration({ style: "light" });
                    if (displayItem && displayItem.item.equals(item!)) {
                      setDisplayItem(null);
                    } else {
                      ref.current?.measureInWindow((x, y) => {
                        setDisplayItem({
                          item: item!,
                          positon: { left: x, top: y },
                        });
                      });
                    }
                  }}
                  className="active:scale-90 active:opacity-50"
                >
                  <View
                    className="items-center rounded-lg bg-zinc-400"
                    ref={ref}
                    style={{
                      height: blockSize,
                      width: blockSize,
                    }}
                  >
                    <Image
                      className="my-auto z-top"
                      source={item.getItemIcon()}
                    />
                  </View>
                </Pressable>
              </Draggable>
            </View>
          ) : slot === "Off-Hand" && isTwoHanded ? (
            <View
              className="mx-auto z-10 items-center rounded-lg border border-zinc-400 bg-zinc-400"
              style={{ height: blockSize, width: blockSize }}
            >
              <Image
                className="my-auto opacity-50"
                source={playerState.equipment.mainHand?.getItemIcon()}
              />
            </View>
          ) : (
            <View
              ref={ref}
              className="mx-auto rounded-lg border border-zinc-400"
              style={{
                height: blockSize,
                width: blockSize,
              }}
            />
          )}
        </View>
      );
    }
  };

  return (
    <View className="pb-2 -mt-2 z-10">
      <View className="items-center ">
        <EquipmentSlot slot={"Head"} />
      </View>
      <View className="flex flex-row justify-evenly">
        <View className="-ml-2 -mt-4 mr-2">
          <EquipmentSlot slot={"Main-Hand"} />
        </View>
        <View className="-mt-4">
          <EquipmentSlot slot={"Off-Hand"} />
        </View>
      </View>
      <View
        className={`mx-auto items-center ${
          dimensions.width == dimensions.greater ? "-mt-20" : "-mt-8"
        }`}
      >
        <EquipmentSlot slot={"Body"} />
      </View>
    </View>
  );
}
