import { RefObject } from "react";
import { View, Image } from "react-native";
import { Text } from "./Themed";
import { checkReleasePositionProps } from "../utility/types";
import { InventoryItem } from "./Draggable";
import type { Item } from "../entities/item";
import { useVibration } from "../hooks/generic";
import { usePlayerStore, useUIStore } from "../hooks/stores";

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
  setDisplayItem,
}: EquipmentDisplayProps) {
  const vibration = useVibration();
  const playerState = usePlayerStore();
  const { itemBlockSize, dimensions } = useUIStore();

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
    return true;
  }

  interface EquipmentSlotProps {
    slot: "Head" | "Main-Hand" | "Off-Hand" | "Body" | "Quiver";
  }

  const EquipmentSlot = ({ slot }: EquipmentSlotProps) => {
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

      while (!itemBlockSize) {
        return <></>;
      }

      return (
        <View>
          <Text className="mb-1 text-center">{slot}</Text>
          {itemStack.length > 0 ? (
            <View
              className="z-50 mx-auto border border-zinc-400 rounded-lg"
              style={{ height: itemBlockSize, width: itemBlockSize }}
            >
              <InventoryItem
                item={itemStack}
                displayItem={null}
                checkReleasePosition={checkReleasePosition}
                setDisplayItem={setDisplayItem}
              />
            </View>
          ) : slot === "Off-Hand" && isTwoHanded ? (
            <View
              className={`${
                playerState.equipment.mainHand.playerHasRequirements
                  ? "bg-zinc-400"
                  : "bg-red-800"
              } mx-auto z-10 items-center rounded-lg border border-zinc-400`}
              style={{ height: itemBlockSize, width: itemBlockSize }}
            >
              <Image
                className="my-auto opacity-50"
                source={playerState.equipment.mainHand?.getItemIcon()}
                style={{
                  height: Math.min(itemBlockSize * 0.65, 52),
                  width: Math.min(itemBlockSize * 0.65, 52),
                }}
              />
            </View>
          ) : (
            <View
              ref={ref}
              className="mx-auto rounded-lg border border-zinc-400"
              style={{
                height: itemBlockSize,
                width: itemBlockSize,
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
          dimensions.window.width == dimensions.window.greater
            ? "-mt-20"
            : "-mt-8"
        }`}
      >
        <EquipmentSlot slot={"Body"} />
      </View>
    </View>
  );
}
