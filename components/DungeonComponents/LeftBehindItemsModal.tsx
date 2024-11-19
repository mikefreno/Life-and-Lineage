import { Pressable, View, Image } from "react-native";
import GenericModal from "../GenericModal";
import { ThemedView, Text } from "../Themed";
import { useLootState } from "../../providers/DungeonData";
import type { Item } from "../../entities/item";
import { useRootStore } from "../../hooks/stores";

interface LeftBehindItemsModalProps {
  showLeftBehindItemsScreen: boolean;
  setShowLeftBehindItemsScreen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LeftBehindItemsModal({
  showLeftBehindItemsScreen,
  setShowLeftBehindItemsScreen,
}: LeftBehindItemsModalProps) {
  const { playerState } = useRootStore();
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
          className="text-center text-lg"
          style={{
            color: "#ef4444",
            opacity: inventoryFullNotifier ? 1 : 0,
          }}
        >
          Inventory is full!
        </Text>
        {leftBehindDrops.length > 0 ? (
          <>
            {leftBehindDrops.map((item) => (
              <View
                key={item.id}
                className="my-2 flex flex-row justify-between"
              >
                <View className="flex flex-row">
                  <Image source={item.getItemIcon()} />
                  <Text className="my-auto">{item.name}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    takeItemFromPouch(item);
                  }}
                  className="rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
                >
                  <Text>Take</Text>
                </Pressable>
              </View>
            ))}
            <Pressable
              className="mx-auto mt-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
              onPress={takeAllItemsFromPouch}
            >
              <Text>Take All</Text>
            </Pressable>
          </>
        ) : (
          <ThemedView>
            <Text className="text-center">You find no items on the ground</Text>
          </ThemedView>
        )}
        <Pressable
          className="mx-auto mt-4 rounded-xl border border-zinc-900 px-4 py-2 active:scale-95 active:opacity-50 dark:border-zinc-50"
          onPress={() => setShowLeftBehindItemsScreen(false)}
        >
          <Text>Close</Text>
        </Pressable>
      </>
    </GenericModal>
  );
}
