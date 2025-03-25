import React, { useEffect, useCallback, useRef } from "react";
import { View, Image } from "react-native";
import { Text } from "@/components/Themed";
import { InventoryItem } from "@/components/Draggable";
import type { Item } from "@/entities/item";
import { useDraggableStore, useRootStore } from "@/hooks/stores";
import { PlayerCharacter } from "@/entities/character";
import UIStore from "@/stores/UIStore";
import { DraggableDataStore } from "@/stores/DraggableDataStore";
import { observer } from "mobx-react-lite";
import { useStyles } from "@/hooks/styles";
import { useIsFocused } from "@react-navigation/native";
import { useScaling } from "@/hooks/scaling";

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

type SlotType = "Head" | "Main-Hand" | "Off-Hand" | "Body" | "Quiver";
const ALL_SLOTS: SlotType[] = [
  "Head",
  "Main-Hand",
  "Body",
  "Off-Hand",
  "Quiver",
];

const EquipmentDisplay = observer(
  ({ setDisplayItem }: EquipmentDisplayProps) => {
    const { playerState, uiStore } = useRootStore();
    const { draggableClassStore } = useDraggableStore();
    const styles = useStyles();
    const { getNormalizedSize, getNormalizedLineSize } = useScaling();

    if (!playerState) return null;

    if (uiStore.dimensions.height < 500 && uiStore.isLandscape) {
      return (
        <View style={styles.rowEvenly}>
          {ALL_SLOTS.map((slot) => (
            <EquipmentSlot
              key={slot}
              slot={slot}
              playerState={playerState}
              uiStore={uiStore}
              draggableClassStore={draggableClassStore}
              setDisplayItem={setDisplayItem}
              inventoryBounds={draggableClassStore.inventoryBounds}
            />
          ))}
        </View>
      );
    }

    return (
      <View
        style={{
          paddingVertical: getNormalizedSize(8),
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
              height: uiStore.itemBlockSize + getNormalizedLineSize(20),
              width: uiStore.itemBlockSize,
            }}
          />
          <EquipmentSlot
            slot="Main-Hand"
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
              slot="Body"
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
            slot="Off-Hand"
            playerState={playerState}
            uiStore={uiStore}
            draggableClassStore={draggableClassStore}
            setDisplayItem={setDisplayItem}
            inventoryBounds={draggableClassStore.inventoryBounds}
          />
        </View>
      </View>
    );
  },
);

const useTargetBounds = (
  draggableClassStore: DraggableDataStore,
  inventoryBounds: any,
) => {
  return React.useMemo(
    () => [
      { key: "playerInventory", bounds: inventoryBounds },
      {
        key: "head",
        bounds: draggableClassStore.ancillaryBoundsMap.get("head"),
      },
      {
        key: "main-hand",
        bounds: draggableClassStore.ancillaryBoundsMap.get("main-hand"),
      },
      {
        key: "off-hand",
        bounds: draggableClassStore.ancillaryBoundsMap.get("off-hand"),
      },
      {
        key: "body",
        bounds: draggableClassStore.ancillaryBoundsMap.get("body"),
      },
      {
        key: "quiver",
        bounds: draggableClassStore.ancillaryBoundsMap.get("quiver"),
      },
      {
        key: "stash",
        bounds: draggableClassStore.ancillaryBoundsMap.get("stash"),
      },
    ],
    [draggableClassStore.ancillaryBoundsMap, inventoryBounds],
  );
};

const getItemsForSlot = (
  slot: SlotType,
  playerState: PlayerCharacter,
): Item[] => {
  if (!playerState.equipment) return [];

  switch (slot) {
    case "Head":
      return playerState.equipment.head ? [playerState.equipment.head] : [];
    case "Main-Hand":
      return playerState.equipment.mainHand.name.toLowerCase() !== "unarmored"
        ? [playerState.equipment.mainHand]
        : [];
    case "Off-Hand":
      return playerState.equipment.offHand
        ? [playerState.equipment.offHand]
        : [];
    case "Body":
      return playerState.equipment.body ? [playerState.equipment.body] : [];
    case "Quiver":
      return playerState.equipment.quiver ?? [];
    default:
      return [];
  }
};

const EquipmentSlot = observer(
  ({
    slot,
    playerState,
    uiStore,
    draggableClassStore,
    setDisplayItem,
    inventoryBounds,
  }: {
    slot: SlotType;
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
    const selfRef = useRef<View | null>(null);
    const styles = useStyles();
    const slotKey = slot.toLowerCase();
    const isFocused = useIsFocused();
    const targetBounds = useTargetBounds(draggableClassStore, inventoryBounds);

    if (!playerState.equipment || !uiStore.itemBlockSize) return null;

    const itemStack = getItemsForSlot(slot, playerState);
    const isTwoHanded = playerState.equipment.mainHand?.slot === "two-hand";

    const measureAndSetBounds = useCallback(() => {
      if (!selfRef.current) return;

      selfRef.current.measure((x, y, w, h, pageX, pageY) => {
        draggableClassStore.setAncillaryBounds(slotKey, {
          x: pageX,
          y: pageY,
          width: w,
          height: h,
        });
      });
    }, [draggableClassStore, slotKey]);

    useEffect(() => {
      let timeoutId: NodeJS.Timeout;

      if (isFocused) {
        timeoutId = setTimeout(measureAndSetBounds, 150);
      } else {
        draggableClassStore.removeAncillaryBounds(slotKey);
      }

      return () => {
        timeoutId && clearTimeout(timeoutId);
        draggableClassStore.removeAncillaryBounds(slotKey);
      };
    }, [isFocused, measureAndSetBounds, draggableClassStore, slotKey]);

    const handleSuccessfulDrop = useCallback(
      (droppedOnKey: string) => {
        if (droppedOnKey === "stash") {
          playerState.unEquipItem(itemStack, false);
          playerState.root.stashStore.addItem(itemStack);
        } else {
          playerState.unEquipItem(itemStack);
        }
        setDisplayItem(null);
      },
      [itemStack, playerState, setDisplayItem],
    );

    const handleSetDisplayItem = useCallback(
      (params: any) => {
        setDisplayItem(params);
      },
      [setDisplayItem],
    );

    const setBoundsOnLayout = useCallback(() => {
      if (!isFocused) return;
      const timeoutId = setTimeout(measureAndSetBounds, 100);
      return () => clearTimeout(timeoutId);
    }, [isFocused, measureAndSetBounds]);

    const bgColor = itemStack[0]?.playerHasRequirements ? "#a1a1aa" : "#991b1b";

    return (
      <View style={styles.columnCenter}>
        <Text style={{ paddingBottom: 2, textAlign: "center" }}>{slot}</Text>
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
                  setDisplayItem={handleSetDisplayItem}
                  targetBounds={targetBounds}
                  runOnSuccess={handleSuccessfulDrop}
                  displayItem={null}
                  isDraggable={true}
                  bgColor={bgColor}
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
  },
);

export default EquipmentDisplay;
