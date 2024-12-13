import { View, Image, type LayoutChangeEvent } from "react-native";
import { Text } from "./Themed";
import { InventoryItem } from "./Draggable";
import type { Item } from "../entities/item";
import { useDraggableStore, useRootStore } from "../hooks/stores";
import { useCallback, useRef } from "react";
import { PlayerCharacter } from "../entities/character";
import UIStore from "../stores/UIStore";
import { DraggableDataStore } from "../stores/DraggableDataStore";
import { observer } from "mobx-react-lite";

interface EquipmentDisplayProps {
  displayItem: {
    item: Item[];
    position: {
      left: number;
      top: number;
    };
  } | null;
  setDisplayItem: React.Dispatch<
    React.SetStateAction<{
      item: Item[];
      position: {
        left: number;
        top: number;
      };
    } | null>
  >;
}

export default function EquipmentDisplay({
  setDisplayItem,
}: EquipmentDisplayProps) {
  const { playerState, uiStore } = useRootStore();
  const { draggableClassStore } = useDraggableStore();

  if (playerState) {
    return (
      <View className="pb-2 my-auto z-10">
        <View className="flex flex-row items-center justify-between w-full">
          <View className="flex-1" />
          <View className="flex-1 flex items-center justify-center -ml-[10vw]">
            <EquipmentSlot
              slot="Head"
              playerState={playerState}
              uiStore={uiStore}
              draggableClassStore={draggableClassStore}
              setDisplayItem={setDisplayItem}
              inventoryBounds={draggableClassStore.inventoryBounds}
            />
          </View>
          <View className="flex-1 flex items-center justify-end -mt-[3vh] -ml-[10vw]">
            <EquipmentSlot
              slot="Quiver"
              playerState={playerState}
              uiStore={uiStore}
              draggableClassStore={draggableClassStore}
              setDisplayItem={setDisplayItem}
              inventoryBounds={draggableClassStore.inventoryBounds}
            />
          </View>
        </View>

        <View className="flex flex-row justify-evenly -mt-4">
          <View className="-ml-2 mr-2">
            <EquipmentSlot
              slot={"Main-Hand"}
              playerState={playerState}
              uiStore={uiStore}
              draggableClassStore={draggableClassStore}
              setDisplayItem={setDisplayItem}
              inventoryBounds={draggableClassStore.inventoryBounds}
            />
          </View>
          <View className="">
            <EquipmentSlot
              slot={"Off-Hand"}
              playerState={playerState}
              uiStore={uiStore}
              draggableClassStore={draggableClassStore}
              setDisplayItem={setDisplayItem}
              inventoryBounds={draggableClassStore.inventoryBounds}
            />
          </View>
        </View>
        <View
          className={`mx-auto items-center ${
            uiStore.dimensions.width == uiStore.dimensions.greater
              ? "-mt-20"
              : "-mt-8"
          }`}
        >
          <EquipmentSlot
            slot={"Body"}
            playerState={playerState}
            uiStore={uiStore}
            draggableClassStore={draggableClassStore}
            setDisplayItem={setDisplayItem}
            inventoryBounds={draggableClassStore.inventoryBounds}
          />
        </View>
      </View>
    );
  }
}

const EquipmentSlot = observer(
  ({
    slot,
    playerState,
    uiStore,
    draggableClassStore,
    setDisplayItem,
    inventoryBounds,
  }: {
    slot: "Head" | "Main-Hand" | "Off-Hand" | "Body" | "Quiver";
    playerState: PlayerCharacter;
    uiStore: UIStore;
    draggableClassStore: DraggableDataStore;
    setDisplayItem: React.Dispatch<
      React.SetStateAction<{
        item: Item[];
        position: {
          left: number;
          top: number;
        };
      } | null>
    >;
    inventoryBounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  }) => {
    let itemStack: Item[] = [];
    const selfRef = useRef<View | null>(null);
    if (playerState) {
      switch (slot) {
        case "Head":
          playerState.equipment.head &&
            itemStack.push(playerState.equipment.head);
          break;
        case "Main-Hand":
          playerState.equipment.mainHand.name.toLowerCase() !== "unarmored" &&
            itemStack.push(playerState.equipment.mainHand);
          break;
        case "Off-Hand":
          playerState.equipment.offHand &&
            itemStack.push(playerState.equipment.offHand);
          break;
        case "Body":
          playerState.equipment.body &&
            itemStack.push(playerState.equipment.body);
          break;
        case "Quiver":
          itemStack = playerState.equipment.quiver ?? [];
          break;
      }

      const isTwoHanded = playerState.equipment.mainHand?.slot === "two-hand";

      while (!uiStore.itemBlockSize) {
        return <></>;
      }

      const setBoundsOnLayout = useCallback(
        (event: LayoutChangeEvent) => {
          const { width, height } = event.nativeEvent.layout;

          setTimeout(() => {
            if (selfRef.current) {
              selfRef.current.measure((x, y, w, h, pageX, pageY) => {
                draggableClassStore.setAncillaryBounds(slot.toLowerCase(), {
                  x: pageX,
                  y: pageY,
                  width,
                  height,
                });
              });
            }
          }, 100);
        },
        [uiStore.dimensions],
      );

      return (
        <>
          <Text className="mb-1 text-center">{slot}</Text>
          <View onLayout={(e) => setBoundsOnLayout(e)} ref={selfRef}>
            {itemStack.length > 0 ? (
              <View
                className="z-50 mx-auto border border-zinc-400 rounded-lg"
                style={{
                  height: uiStore.itemBlockSize,
                  width: uiStore.itemBlockSize,
                }}
              >
                <InventoryItem
                  item={itemStack}
                  setDisplayItem={(params) => {
                    setDisplayItem(params);
                  }}
                  targetBounds={[
                    { key: "playerInventory", bounds: inventoryBounds },
                    {
                      key: "head",
                      bounds:
                        draggableClassStore.ancillaryBoundsMap.get("head"),
                    },
                    {
                      key: "main-hand",
                      bounds:
                        draggableClassStore.ancillaryBoundsMap.get("main-hand"),
                    },
                    {
                      key: "off-hand",
                      bounds:
                        draggableClassStore.ancillaryBoundsMap.get("off-hand"),
                    },
                    {
                      key: "body",
                      bounds:
                        draggableClassStore.ancillaryBoundsMap.get("body"),
                    },
                    {
                      key: "quiver",
                      bounds:
                        draggableClassStore.ancillaryBoundsMap.get("quiver"),
                    },
                  ]}
                  runOnSuccess={() => {
                    playerState.unEquipItem(itemStack);
                  }}
                  displayItem={null}
                  isDraggable={true}
                />
              </View>
            ) : slot === "Off-Hand" && isTwoHanded ? (
              <View
                className={`${
                  playerState.equipment.mainHand.playerHasRequirements
                    ? "bg-zinc-400"
                    : "bg-red-800"
                } mx-auto z-10 items-center rounded-lg border border-zinc-400`}
                style={{
                  height: uiStore.itemBlockSize,
                  width: uiStore.itemBlockSize,
                }}
              >
                <Image
                  className="my-auto opacity-50"
                  source={playerState.equipment.mainHand?.getItemIcon()}
                  style={{
                    height: Math.min(uiStore.itemBlockSize * 0.65, 52),
                    width: Math.min(uiStore.itemBlockSize * 0.65, 52),
                  }}
                />
              </View>
            ) : (
              <View
                className="mx-auto rounded-lg border border-zinc-400"
                style={{
                  height: uiStore.itemBlockSize,
                  width: uiStore.itemBlockSize,
                }}
              />
            )}
          </View>
        </>
      );
    }
  },
);
