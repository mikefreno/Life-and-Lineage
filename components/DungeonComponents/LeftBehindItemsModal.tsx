import React from "react";
import { Pressable, View, Image } from "react-native";
import GenericModal from "../GenericModal";
import { ThemedView, Text } from "../Themed";
import { useLootState } from "../../providers/DungeonData";
import type { Item } from "../../entities/item";
import { useRootStore } from "../../hooks/stores";
import { tw_base, useStyles } from "../../hooks/styles";
import GenericFlatButton from "../GenericFlatButton";

interface LeftBehindItemsModalProps {
  showLeftBehindItemsScreen: boolean;
  setShowLeftBehindItemsScreen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LeftBehindItemsModal({
  showLeftBehindItemsScreen,
  setShowLeftBehindItemsScreen,
}: LeftBehindItemsModalProps) {
  const { playerState } = useRootStore();
  const styles = useStyles();
  const {
    leftBehindDrops,
    setLeftBehindDrops,
    inventoryFullNotifier,
    setInventoryFullNotifier,
  } = useLootState();

  function takeItemFromPouch(item: Item) {
    if (playerState) {
      if (playerState.inventory.length < 24) {
        playerState.addToInventory(item);
        setLeftBehindDrops((prev) =>
          prev.filter((dropItem) => !dropItem.equals(item)),
        );
      } else {
        setInventoryFullNotifier(true);
      }
    }
  }

  function takeAllItemsFromPouch() {
    if (playerState) {
      const availableSpace = 24 - playerState.inventory.length;
      if (availableSpace === 0) {
        setInventoryFullNotifier(true);
        return;
      }
      leftBehindDrops
        .slice(0, availableSpace)
        .forEach((item) => playerState.addToInventory(item));
      setLeftBehindDrops((prev) => {
        const remainingItems = prev.slice(availableSpace);
        if (remainingItems.length > 0) setInventoryFullNotifier(true);
        return remainingItems;
      });
    }
  }

  return (
    <GenericModal
      isVisibleCondition={showLeftBehindItemsScreen}
      backFunction={() => setShowLeftBehindItemsScreen(false)}
    >
      <>
        <Text
          style={{
            ...styles.xl,
            textAlign: "center",
            color: "#ef4444",
            opacity: inventoryFullNotifier ? 1 : 0,
          }}
        >
          Inventory is full!
        </Text>
        {leftBehindDrops.length > 0 ? (
          <>
            {leftBehindDrops.map((item) => (
              <View key={item.id} style={styles.leftBehindItemRow}>
                <View style={{ flexDirection: "row" }}>
                  <Image source={item.getItemIcon()} />
                  <Text style={{ marginVertical: "auto" }}>{item.name}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    takeItemFromPouch(item);
                  }}
                  style={styles.flatButtonContainer}
                >
                  <Text>Take</Text>
                </Pressable>
              </View>
            ))}
            <Pressable
              style={[styles.flatButtonContainer, { marginTop: 16 }]}
              onPress={takeAllItemsFromPouch}
            >
              <Text>Take All</Text>
            </Pressable>
          </>
        ) : (
          <ThemedView>
            <Text style={{ textAlign: "center" }}>
              You find no items on the ground
            </Text>
          </ThemedView>
        )}
        <GenericFlatButton
          style={{ marginTop: tw_base[4] }}
          onPress={() => setShowLeftBehindItemsScreen(false)}
        >
          Close
        </GenericFlatButton>
      </>
    </GenericModal>
  );
}
