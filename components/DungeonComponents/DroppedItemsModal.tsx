import { router } from "expo-router";
import GenericModal from "../GenericModal";
import { Text } from "../Themed";
import { Pressable, View, Image } from "react-native";
import { toTitleCase, wait } from "../../utility/functions/misc";
import { Coins } from "../../assets/icons/SVGIcons";
import GenericFlatButton from "../GenericFlatButton";
import { useDungeonCore, useLootState } from "../../stores/DungeonData";
import { usePlayerStore } from "../../hooks/stores";
import type { Item } from "../../entities/item";
import { useVibration } from "../../hooks/generic";

export default function DroppedItemsModal() {
  const playerState = usePlayerStore();
  const { instanceName } = useDungeonCore();
  const {
    inventoryFullNotifier,
    droppedItems,
    setLeftBehindDrops,
    setDroppedItems,
    setInventoryFullNotifier,
  } = useLootState();

  function closeImmediateItemDrops() {
    if (droppedItems && droppedItems.itemDrops.length > 0) {
      setLeftBehindDrops((prev) => [...prev, ...droppedItems.itemDrops]);
    }
    setDroppedItems(null);
  }

  function takeItem(item: Item) {
    if (playerState && droppedItems) {
      if (playerState.getInventory().length < 24) {
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
      const availableSpace = 24 - playerState.getInventory().length;
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
    if (instanceName === "Activities") {
      wait(600).then(() => {
        while (router.canGoBack()) {
          router.back();
        }
        router.replace("/shops");
        router.push("/Activities");
      });
    }
    if (instanceName === "Personal") {
      wait(600).then(() => {
        while (router.canGoBack()) {
          router.back();
        }
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
        <View className="mt-4 flex flex-row justify-center">
          <Text>You picked up {droppedItems?.gold}</Text>
          <Coins width={16} height={16} style={{ marginLeft: 6 }} />
        </View>
        <Text
          className="text-center text-lg"
          style={{
            color: "#ef4444",
            opacity: inventoryFullNotifier ? 1 : 0,
          }}
        >
          Inventory is full!
        </Text>
        {droppedItems?.itemDrops.map((item) => (
          <View
            key={item.id}
            className="mt-2 flex flex-row justify-between items-center"
          >
            <Image source={item.getItemIcon()} />
            <Text className="my-auto ml-2 w-1/2">{toTitleCase(item.name)}</Text>
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
        {droppedItems && droppedItems.itemDrops.length > 0 ? (
          <Pressable
            className="mx-auto mt-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
            onPress={() => {
              takeAllItems();
            }}
          >
            <Text>Take All</Text>
          </Pressable>
        ) : null}
        <Pressable
          className="mx-auto my-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
          onPress={doneLooting}
        >
          <Text>Done Looting</Text>
        </Pressable>
      </>
    </GenericModal>
  );
}
