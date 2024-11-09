import { RefObject, useContext, useState } from "react";
import { View, Image, Pressable } from "react-native";
import { Text, ThemedView } from "./Themed";
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
  quiverTarget: RefObject<View>;
  inventoryTarget: RefObject<View>;
  displayItem: {
    item: Item[];
    positon: {
      left: number;
      top: number;
    };
  } | null;
  setDisplayItem: React.Dispatch<
    React.SetStateAction<{
      item: Item[];
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
  quiverTarget,
  displayItem,
  setDisplayItem,
}: EquipmentDisplayProps) {
  const vibration = useVibration();
  const appData = useContext(AppContext);
  if (!appData) throw new Error("missing contexts");
  const { playerState, dimensions, blockSize } = appData;

  function checkReleasePosition({
    itemStack,
    xPos,
    yPos,
    size,
    equipped,
  }: checkReleasePositionProps) {
    if (itemStack && itemStack[0].slot) {
      let refs: React.RefObject<View>[] = [];
      if (equipped) {
        refs.push(inventoryTarget);
      } else {
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
                playerState?.unEquipItem(itemStack);
              } else {
                playerState?.equipItem(itemStack);
              }
            }
          },
        );
      });
    }
  }

  interface EquipmentSlotProps {
    slot: "Head" | "Main-Hand" | "Off-Hand" | "Body" | "Quiver";
  }

  const EquipmentSlot = ({ slot }: EquipmentSlotProps) => {
    const [buzzed, setBuzzed] = useState<boolean>(false);
    let ref: RefObject<View>;
    let itemStack: Item[] = [];
    if (playerState) {
      switch (slot) {
        case "Head":
          ref = headTarget;
          playerState.equipment.head &&
            itemStack.push(playerState.equipment.head);
          break;
        case "Main-Hand":
          ref = mainHandTarget;
          playerState.equipment.mainHand.name !== "unarmored" &&
            itemStack.push(playerState.equipment.mainHand);
          break;
        case "Off-Hand":
          ref = offHandTarget;
          playerState.equipment.offHand &&
            itemStack.push(playerState.equipment.offHand);
          break;
        case "Body":
          ref = bodyTarget;
          playerState.equipment.body &&
            itemStack.push(playerState.equipment.body);
          break;
        case "Quiver":
          ref = quiverTarget;
          itemStack = playerState.equipment.quiver ?? [];
          break;
      }

      const isTwoHanded = playerState.equipment.mainHand?.slot === "two-hand";

      while (!blockSize) {
        return <></>;
      }

      return (
        <View>
          <Text className="mb-1 text-center">{slot}</Text>
          {itemStack.length > 0 ? (
            <View
              className="z-50 mx-auto border border-zinc-400 rounded-lg"
              style={{ height: blockSize, width: blockSize }}
            >
              <Draggable
                onDragRelease={(_, g) => {
                  checkReleasePosition({
                    itemStack,
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
                    if (
                      displayItem &&
                      displayItem.item[0].equals(itemStack[0])
                    ) {
                      setDisplayItem(null);
                    } else {
                      ref.current?.measureInWindow((x, y) => {
                        setDisplayItem({
                          item: itemStack,
                          positon: { left: x, top: y },
                        });
                      });
                    }
                  }}
                  className="active:scale-90 active:opacity-50"
                >
                  <View
                    className={`${
                      itemStack[0].playerHasRequirements
                        ? "bg-zinc-400"
                        : "bg-red-800"
                    } items-center rounded-lg`}
                    ref={ref}
                    style={{
                      height: blockSize,
                      width: blockSize,
                      marginLeft: -1,
                      marginTop: -1,
                    }}
                  >
                    <Image
                      className="my-auto z-top"
                      source={itemStack[0].getItemIcon()}
                      style={{
                        height: Math.min(blockSize * 0.65, 52),
                        width: Math.min(blockSize * 0.65, 52),
                      }}
                    />
                    {itemStack[0].stackable && itemStack.length > 1 && (
                      <ThemedView className="absolute bottom-0 right-0 bg-opacity-50 rounded px-1">
                        <Text>{itemStack.length}</Text>
                      </ThemedView>
                    )}
                  </View>
                </Pressable>
              </Draggable>
            </View>
          ) : slot === "Off-Hand" && isTwoHanded ? (
            <View
              className={`${
                playerState.equipment.mainHand.playerHasRequirements
                  ? "bg-zinc-400"
                  : "bg-red-800"
              } mx-auto z-10 items-center rounded-lg border border-zinc-400`}
              style={{ height: blockSize, width: blockSize }}
            >
              <Image
                className="my-auto opacity-50"
                source={playerState.equipment.mainHand?.getItemIcon()}
                style={{
                  height: Math.min(blockSize * 0.65, 52),
                  width: Math.min(blockSize * 0.65, 52),
                }}
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
    <View className="pb-2 my-auto z-10">
      <View className="flex flex-row items-center justify-between w-full">
        <View className="flex-1" />
        <View className="flex-1 flex items-center justify-center -ml-[10vw]">
          <EquipmentSlot slot="Head" />
        </View>
        <View className="flex-1 flex items-center justify-end -mt-[4vh] -ml-[10vw]">
          <EquipmentSlot slot="Quiver" />
        </View>
      </View>

      <View className="flex flex-row justify-evenly -mt-4">
        <View className="-ml-2 mr-2">
          <EquipmentSlot slot={"Main-Hand"} />
        </View>
        <View className="">
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
