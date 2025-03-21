import React from "react";
import { useRouter } from "expo-router";
import GenericModal from "@/components/GenericModal";
import { Text } from "@/components/Themed";
import { View, Image } from "react-native";
import { toTitleCase, wait } from "@/utility/functions/misc";
import { Coins } from "@/assets/icons/SVGIcons";
import GenericFlatButton from "@/components/GenericFlatButton";
import { useLootState } from "@/providers/DungeonData";
import type { Item } from "@/entities/item";
import { useVibration } from "@/hooks/generic";
import { useRootStore } from "@/hooks/stores";
import { rarityColors } from "@/constants/Colors";
import { Rarity } from "@/utility/types";
import { flex, tw, useStyles } from "@/hooks/styles";

export default function DroppedItemsModal() {
  const { playerState, dungeonStore, uiStore } = useRootStore();
  const {
    inventoryFullNotifier,
    droppedItems,
    setLeftBehindDrops,
    setDroppedItems,
    setInventoryFullNotifier,
  } = useLootState();
  const styles = useStyles();
  const router = useRouter();

  function closeImmediateItemDrops() {
    if (droppedItems && droppedItems.itemDrops.length > 0) {
      setLeftBehindDrops((prev) => [...prev, ...droppedItems.itemDrops]);
    }
    setDroppedItems(null);
  }

  function takeItem(item: Item) {
    if (playerState && droppedItems) {
      if (playerState.inventory.length < 24) {
        playerState.addToInventory(item);
        setDroppedItems((prevState) => {
          const updatedDrops = prevState!.itemDrops.filter(
            (itemDrop) => !itemDrop.equals(item),
          );
          const updatedStoryDrops = prevState!.storyDrops.filter(
            (itemDrop) => !itemDrop.equals(item),
          );
          if (updatedDrops.length == 0 && updatedStoryDrops.length == 0) {
            return null;
          }
          return {
            ...prevState,
            gold: prevState!.gold,
            itemDrops: updatedDrops,
            storyDrops: updatedStoryDrops,
          };
        });

        closeRoutingCheck();
      } else {
        setInventoryFullNotifier(true);
      }
    }
  }

  function takeAllItems() {
    if (playerState && droppedItems) {
      const availableSpace = 24 - playerState.inventory.length;
      if (availableSpace === 0) {
        setInventoryFullNotifier(true);
        return;
      }
      droppedItems.itemDrops
        .slice(0, availableSpace)
        .forEach((item) => playerState.addToInventory(item));
      setDroppedItems((prevState) => {
        const remainingDrops = prevState!.itemDrops.slice(availableSpace);
        if (remainingDrops.length > 0) setInventoryFullNotifier(true);
        return remainingDrops.length > 0
          ? {
              ...prevState,
              gold: prevState!.gold,
              itemDrops: remainingDrops,
              storyDrops: prevState?.storyDrops ?? [],
            }
          : null;
      });
      closeRoutingCheck();
    }
  }
  const doneLooting = () => {
    closeImmediateItemDrops();
    closeRoutingCheck();
  };

  const closeRoutingCheck = () => {
    if (dungeonStore.currentInstance?.name === "Activities") {
      wait(600).then(() => {
        router.dismissAll();
        router.replace("/shops");
        router.push("/Activities");
      });
    }
    if (dungeonStore.currentInstance?.name === "Personal") {
      wait(600).then(() => {
        router.dismissAll();
        router.replace("/");
        router.push("/Relationships");
      });
    }
  };

  const vibration = useVibration();

  return (
    <GenericModal
      isVisibleCondition={!!droppedItems}
      backFunction={doneLooting}
    >
      <>
        <View
          style={{
            marginTop: 16,
            ...flex.rowCenter,
          }}
        >
          <Text>You picked up {droppedItems?.gold}</Text>
          <Coins
            width={uiStore.iconSizeSmall}
            height={uiStore.iconSizeSmall}
            style={{ marginLeft: 6 }}
          />
        </View>
        <Text
          style={[
            styles.inventoryFullText,
            { opacity: inventoryFullNotifier ? 1 : 0 },
          ]}
        >
          Inventory is full!
        </Text>
        <View style={styles.mb2}>
          {droppedItems?.itemDrops.map((item) => (
            <View
              key={item.id}
              style={[
                styles.droppedItemRow,
                {
                  backgroundColor:
                    uiStore.colorScheme === "dark"
                      ? rarityColors[item.rarity].background.dark
                      : rarityColors[item.rarity].background.light,
                },
              ]}
            >
              <View
                style={{
                  ...flex.rowCenter,
                  alignItems: "center",
                }}
              >
                <Image source={item.getItemIcon()} />
                {item.rarity !== Rarity.NORMAL && (
                  <View
                    style={{
                      ...styles.itemRarityDot,
                      backgroundColor:
                        rarityColors[item.rarity].background.light,
                    }}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.itemNameText,
                  {
                    color: rarityColors[item.rarity].text ?? "white",
                  },
                ]}
              >
                {toTitleCase(item.name)}
              </Text>
              <GenericFlatButton
                onPress={() => {
                  vibration({ style: "light" });
                  takeItem(item);
                }}
              >
                <Text>Take</Text>
              </GenericFlatButton>
            </View>
          ))}
        </View>
        {droppedItems && droppedItems.itemDrops.length > 0 ? (
          <GenericFlatButton
            style={tw.my2}
            onPress={() => {
              takeAllItems();
            }}
          >
            <Text>Take All</Text>
          </GenericFlatButton>
        ) : null}
        <GenericFlatButton style={tw.my2} onPress={doneLooting}>
          <Text>Done Looting</Text>
        </GenericFlatButton>
      </>
    </GenericModal>
  );
}
