import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { Text } from "./Themed";
import { InventoryItem } from "./Draggable";
import type { Item } from "../entities/item";
import { useDraggableStore, useRootStore } from "../hooks/stores";
import { useCallback, useRef } from "react";
import { PlayerCharacter } from "../entities/character";
import UIStore from "../stores/UIStore";
import { DraggableDataStore } from "../stores/DraggableDataStore";
import { observer } from "mobx-react-lite";
import { normalize, normalizeLineHeight, useStyles } from "../hooks/styles";
import { useIsFocused } from "@react-navigation/native";

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
  const styles = useStyles();

  if (playerState) {
    return (
      <View
        style={{
          paddingVertical: normalize(8),
          zIndex: 10,
          flexDirection: "row",
          justifyContent: "space-evenly",
          width: "70%",
          alignSelf: "center",
        }}
      >
        <View style={styles.columnCenter}>
          <View
            style={{
              height: uiStore.itemBlockSize + normalizeLineHeight(20), // size of an EquipmentSlot
              width: uiStore.itemBlockSize,
            }}
          />
          <EquipmentSlot
            slot={"Main-Hand"}
            playerState={playerState}
            uiStore={uiStore}
            draggableClassStore={draggableClassStore}
            setDisplayItem={setDisplayItem}
            inventoryBounds={draggableClassStore.inventoryBounds}
          />
        </View>
        <View style={styles.columnBetween}>
          <EquipmentSlot
            slot="Head"
            playerState={playerState}
            uiStore={uiStore}
            draggableClassStore={draggableClassStore}
            setDisplayItem={setDisplayItem}
            inventoryBounds={draggableClassStore.inventoryBounds}
          />

          <View style={{ paddingTop: "30%" }}>
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
        <View style={styles.columnCenter}>
          <View style={{ marginRight: "-50%" }}>
            <EquipmentSlot
              slot="Quiver"
              playerState={playerState}
              uiStore={uiStore}
              draggableClassStore={draggableClassStore}
              setDisplayItem={setDisplayItem}
              inventoryBounds={draggableClassStore.inventoryBounds}
            />
          </View>
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
    const styles = useStyles();
    const slotKey = slot.toLowerCase();
    const isFocused = useIsFocused();

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

      const measureAndSetBounds = useCallback(() => {
        if (selfRef.current) {
          selfRef.current.measure((x, y, w, h, pageX, pageY) => {
            draggableClassStore.setAncillaryBounds(slotKey, {
              x: pageX,
              y: pageY,
              width: w,
              height: h,
            });
          });
        }
      }, [draggableClassStore, slotKey]);

      useEffect(() => {
        if (isFocused) {
          setTimeout(() => {
            measureAndSetBounds();
          }, 150);
        } else {
          draggableClassStore.removeAncillaryBounds(slotKey);
        }

        return () => {
          draggableClassStore.removeAncillaryBounds(slotKey);
        };
      }, [isFocused, measureAndSetBounds, draggableClassStore, slotKey]);

      const setBoundsOnLayout = useCallback(() => {
        if (!isFocused) return;
        setTimeout(() => {
          measureAndSetBounds();
        }, 100);
      }, [isFocused, measureAndSetBounds]);

      return (
        <View style={styles.columnCenter}>
          <Text
            style={{
              paddingBottom: normalize(2),
              textAlign: "center",
            }}
          >
            {slot}
          </Text>
          <View onLayout={setBoundsOnLayout} ref={selfRef}>
            {itemStack.length > 0 ? (
              <View
                style={[
                  styles.equipmentSlotContainer,
                  {
                    height: uiStore.itemBlockSize,
                    width: uiStore.itemBlockSize,
                  },
                ]}
              >
                <View style={{ marginLeft: -1, marginTop: -1 }}>
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
                          draggableClassStore.ancillaryBoundsMap.get(
                            "main-hand",
                          ),
                      },
                      {
                        key: "off-hand",
                        bounds:
                          draggableClassStore.ancillaryBoundsMap.get(
                            "off-hand",
                          ),
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
                      {
                        key: "stash",
                        bounds:
                          draggableClassStore.ancillaryBoundsMap.get("stash"),
                      },
                    ]}
                    runOnSuccess={(droppedOnKey) => {
                      if (droppedOnKey === "stash") {
                        playerState.unEquipItem(itemStack, false);
                        playerState.root.stashStore.addItem(itemStack);
                      } else {
                        playerState.unEquipItem(itemStack);
                      }
                      setDisplayItem(null);
                    }}
                    displayItem={null}
                    isDraggable={true}
                    bgColor={
                      itemStack[0].playerHasRequirements ? "#a1a1aa" : "#991b1b"
                    }
                  />
                </View>
              </View>
            ) : slot === "Off-Hand" && isTwoHanded ? (
              <View
                style={[
                  styles.equipmentSlotContainer,
                  {
                    alignItems: "center",
                    height: uiStore.itemBlockSize,
                    width: uiStore.itemBlockSize,
                    backgroundColor: playerState.equipment.mainHand
                      .playerHasRequirements
                      ? "#a1a1aa"
                      : "#991b1b",
                  },
                ]}
              >
                <Image
                  style={[
                    { marginVertical: "auto", opacity: 0.5 },
                    {
                      height: Math.min(uiStore.itemBlockSize * 0.65, 52),
                      width: Math.min(uiStore.itemBlockSize * 0.65, 52),
                    },
                  ]}
                  source={playerState.equipment.mainHand?.getItemIcon()}
                />
              </View>
            ) : (
              <View
                style={[
                  styles.equipmentSlotContainer,
                  {
                    zIndex: 0,
                    height: uiStore.itemBlockSize,
                    width: uiStore.itemBlockSize,
                  },
                ]}
              />
            )}
          </View>
        </View>
      );
    }
  },
);
