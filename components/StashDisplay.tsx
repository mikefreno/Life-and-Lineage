import { View, ScrollView, Pressable } from "react-native";
import { observer } from "mobx-react-lite";
import { Item } from "../entities/item";
import { useRootStore } from "../hooks/stores";
import { InventoryItem } from "./Draggable";
import { Text } from "./Themed";
import GenericModal from "./GenericModal";
import { useCallback, useState } from "react";
import { StatsDisplay } from "./StatsDisplay";

type StashDisplayProps = {
  showingStash: boolean;
  clear: () => void;
};
export const StashDisplay = observer(
  ({ showingStash, clear }: StashDisplayProps) => {
    const { uiStore, stashStore } = useRootStore();
    const [displayItem, setDisplayItem] = useState<{
      item: Item[];
      position: { left: number; top: number };
    } | null>(null);

    const SLOTS_PER_PAGE = 24;
    const totalPages = Math.max(
      1,
      Math.ceil(stashStore.items.length / SLOTS_PER_PAGE),
    );

    const clearDisplayItem = useCallback(() => setDisplayItem(null), []);

    return (
      <GenericModal
        isVisibleCondition={showingStash}
        backFunction={() => {
          clear();
          setDisplayItem(null);
        }}
        size={100}
      >
        <View
          style={{ height: uiStore.dimensions.height * 0.66 }}
          className="w-full"
        >
          <ScrollView
            horizontal
            pagingEnabled
            scrollEnabled={totalPages > 1}
            onScrollBeginDrag={() => setDisplayItem(null)}
            disableScrollViewPanResponder={true}
            directionalLockEnabled={true}
            bounces={false}
            overScrollMode="never"
            collapsable={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <View key={`page-${pageIndex}`} className="flex-1">
                <View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: -1, // Ensure it's behind the slots
                  }}
                >
                  <Text className="text-3xl tracking-widest opacity-70">
                    Stash Tab {pageIndex + 1}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setDisplayItem(null)}
                  className="border border-zinc-600 rounded-lg relative flex-1"
                >
                  {/* Background slots */}
                  {Array.from({ length: SLOTS_PER_PAGE }).map((_, index) => (
                    <View
                      className="absolute items-center justify-center"
                      style={
                        uiStore.dimensions.width === uiStore.dimensions.greater
                          ? {
                              // Change from 12 columns to 8 columns for greater width
                              left: `${(index % 8) * 12.5 + 8}%`, // 100 / 8 = 12.5
                              top: `${
                                Math.floor(index / 8) * 33.33 + // 3 rows: 100 / 3 = 33.33
                                (uiStore.playerStatusIsCompact ? 8.0 : 7.5)
                              }%`,
                            }
                          : {
                              // Change from 6 columns to 4 columns for smaller width
                              left: `${(index % 4) * 25 + 5}%`, // 100 / 4 = 25
                              top: `${
                                Math.floor(index / 4) * 16.67 + 4.5 // 6 rows: 100 / 6 = 16.67
                              }%`,
                            }
                      }
                      key={`bg-${pageIndex}-${index}`}
                    >
                      <View
                        className="rounded-lg border-zinc-300 dark:border-zinc-700 border z-0"
                        style={{
                          height: uiStore.itemBlockSize,
                          width: uiStore.itemBlockSize,
                        }}
                      />
                    </View>
                  ))}

                  {/* Items */}
                  {stashStore.items
                    .slice(
                      pageIndex * SLOTS_PER_PAGE,
                      (pageIndex + 1) * SLOTS_PER_PAGE,
                    )
                    .map((item, index) => (
                      <View
                        className="absolute items-center justify-center z-top"
                        style={
                          uiStore.dimensions.width ===
                          uiStore.dimensions.greater
                            ? {
                                // Change from 12 columns to 8 columns for greater width
                                left: `${(index % 8) * 12.5 + 8}%`, // 100 / 8 = 12.5
                                top: `${
                                  Math.floor(index / 8) * 33.33 + // 3 rows: 100 / 3 = 33.33
                                  (uiStore.playerStatusIsCompact ? 8.0 : 7.5)
                                }%`,
                              }
                            : {
                                // Change from 6 columns to 4 columns for smaller width
                                left: `${(index % 4) * 25 + 5}%`, // 100 / 4 = 25
                                top: `${
                                  Math.floor(index / 4) * 16.67 + 4.5 // 6 rows: 100 / 6 = 16.67
                                }%`,
                              }
                        }
                        key={item.item[0].id}
                      >
                        <View>
                          <InventoryItem
                            item={item.item}
                            setDisplayItem={(params) => {
                              if (params) {
                                setDisplayItem({ ...params, side: "stash" });
                              } else {
                                setDisplayItem(null);
                              }
                            }}
                            displayItem={displayItem}
                            isDraggable={false}
                            runOnSuccess={() => null}
                            targetBounds={[]}
                          />
                        </View>
                      </View>
                    ))}
                </Pressable>
              </View>
            ))}
            {displayItem && (
              <View
                className="absolute z-top"
                style={{ top: -uiStore.dimensions.height * 0.17, left: -20 }}
                pointerEvents="box-none"
              >
                <StatsDisplay
                  displayItem={displayItem}
                  clearItem={clearDisplayItem}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </GenericModal>
    );
  },
);
