import { router } from "expo-router";
import GenericModal from "../GenericModal";
import { Item } from "../../classes/item";
import { Pressable, View, Image } from "react-native";
import Coins from "../../assets/icons/CoinsIcon";
import { Text } from "../Themed";
import { toTitleCase } from "../../utility/functions/misc/words";
import { useContext } from "react";
import { AppContext } from "../../app/_layout";
import { DungeonContext } from "./DungeonContext";

export default function DroppedItemsModal() {
  const appData = useContext(AppContext);
  const dungeonData = useContext(DungeonContext);
  if (!dungeonData || !appData) throw new Error("missing context");
  const { playerState } = appData;
  const {
    slug,
    inventoryFullNotifier,
    droppedItems,
    setLeftBehindDrops,
    setDroppedItems,
    setInventoryFullNotifier,
    shouldShowFirstBossKillTutorial,
    setShouldShowFirstBossKillTutorial,
    setShowingFirstBossKillTutorial,
  } = dungeonData;

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
          if (updatedDrops.length == 0) {
            return null;
          }
          return {
            ...prevState,
            gold: prevState!.gold,
            itemDrops: updatedDrops,
          };
        });
        if (!droppedItems) {
          if (shouldShowFirstBossKillTutorial) {
            setTimeout(() => {
              setShowingFirstBossKillTutorial(true);
              setShouldShowFirstBossKillTutorial(false);
            }, 250);
          }
        }
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
            }
          : null;
      });
    }
  }

  return (
    <GenericModal
      isVisibleCondition={droppedItems ? true : false}
      backFunction={() => {
        if (slug[0] == "Activities") {
          while (router.canGoBack()) {
            router.back();
          }
          router.replace("/shops");
          router.push("/Activities");
        } else {
          closeImmediateItemDrops();
          if (shouldShowFirstBossKillTutorial) {
            setTimeout(() => {
              setShowingFirstBossKillTutorial(true);
              setShouldShowFirstBossKillTutorial(false);
            }, 250);
          }
        }
      }}
    >
      <>
        <View className="mt-4 flex flex-row justify-center">
          <Text className="italic">You picked up {droppedItems?.gold}</Text>
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
          <View key={item.id} className="mt-2 flex flex-row justify-between">
            <View className="flex flex-row">
              <Image source={item.getItemIcon()} />
              <Text className="my-auto ml-2">{toTitleCase(item.name)}</Text>
            </View>
            <Pressable
              onPress={() => {
                takeItem(item);
              }}
              className="rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
            >
              <Text>Take</Text>
            </Pressable>
          </View>
        ))}
        {droppedItems && droppedItems.itemDrops.length > 0 ? (
          <Pressable
            className="mx-auto mt-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
            onPress={() => {
              takeAllItems();
              if (shouldShowFirstBossKillTutorial) {
                setTimeout(() => {
                  setShowingFirstBossKillTutorial(true);
                  setShouldShowFirstBossKillTutorial(false);
                }, 250);
              }
            }}
          >
            <Text>Take All</Text>
          </Pressable>
        ) : null}
        <Pressable
          className="mx-auto my-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
          onPress={() => {
            if (slug[0] == "Activities") {
              while (router.canGoBack()) {
                router.back();
              }
              router.replace("/shops");
              router.push("/Activities");
            } else {
              closeImmediateItemDrops();
              if (shouldShowFirstBossKillTutorial) {
                setTimeout(() => {
                  setShowingFirstBossKillTutorial(true);
                  setShouldShowFirstBossKillTutorial(false);
                }, 250);
              }
            }
          }}
        >
          <Text>Done Looting</Text>
        </Pressable>
      </>
    </GenericModal>
  );
}
