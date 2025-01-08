import {
  View,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from "react-native";
import { observer } from "mobx-react-lite";
import { Item } from "../entities/item";
import { useRootStore } from "../hooks/stores";
import { InventoryItem } from "./Draggable";
import { Text } from "./Themed";
import GenericModal from "./GenericModal";
import { useCallback, useRef, useState } from "react";
import { StatsDisplay } from "./StatsDisplay";
import GenericStrikeAround from "./GenericStrikeAround";
import { useStyles } from "../hooks/styles";

type StashDisplayProps = {
  showingStash: boolean;
  clear: () => void;
};
export const StashDisplay = observer(
  ({ showingStash, clear }: StashDisplayProps) => {
    const { uiStore, stashStore } = useRootStore();
    const styles = useStyles();
    const [displayItem, setDisplayItem] = useState<{
      item: Item[];
      position: { left: number; top: number };
    } | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const SLOTS_PER_PAGE = 24;
    const totalPages = Math.max(
      1,
      Math.ceil(stashStore.items.length / SLOTS_PER_PAGE),
    );
    const [modalWidth, setModalWidth] = useState(0);

    const clearDisplayItem = useCallback(() => setDisplayItem(null), []);

    const [targetPage, setTargetPage] = useState<number | null>(null);

    const handleTabPress = useCallback(
      (pageIndex: number) => {
        setTargetPage(pageIndex); // Set the target page before scrolling
        setCurrentPage(pageIndex); // Immediately update current page

        scrollViewRef.current?.scrollTo({
          x: pageIndex * modalWidth,
          animated: true,
        });
      },
      [modalWidth],
    );

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Only update currentPage from scroll events if we're not handling a button press
        if (targetPage === null) {
          const page = Math.round(
            event.nativeEvent.contentOffset.x / modalWidth,
          );
          setCurrentPage(page);
        }
      },
      [modalWidth, targetPage],
    );

    const handleScrollEnd = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setTargetPage(null); // Clear the target page when scrolling ends
        const page = Math.round(event.nativeEvent.contentOffset.x / modalWidth);
        setCurrentPage(page);
      },
      [modalWidth],
    );

    const onModalLayout = (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      setModalWidth(width);
    };

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
          style={[
            { height: uiStore.dimensions.height * 0.66 },
            { width: "100%" },
          ]}
          onLayout={onModalLayout}
        >
          <View style={styles.tabsContainer}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <Pressable
                key={`tab-${index}`}
                onPress={() => handleTabPress(index)}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor:
                      currentPage === index
                        ? "#3b82f6"
                        : uiStore.colorScheme === "dark"
                        ? "#374151"
                        : "#d1d5db",
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      currentPage === index
                        ? "#ffffff"
                        : uiStore.colorScheme === "dark"
                        ? "#d1d5db"
                        : "#374151",
                  }}
                >
                  {index + 1}
                </Text>
              </Pressable>
            ))}
          </View>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEnabled={totalPages > 1}
            onScrollBeginDrag={() => setDisplayItem(null)}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
            disableScrollViewPanResponder={true}
            directionalLockEnabled={true}
            bounces={false}
            overScrollMode="never"
            collapsable={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => (
              <View
                key={`page-${pageIndex}`}
                style={{ width: modalWidth, flex: 1, paddingHorizontal: 8 }}
              >
                <View style={styles.stashPageOverlay}>
                  <Text style={styles.stashPageText}>
                    Stash Tab {pageIndex + 1}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setDisplayItem(null)}
                  style={styles.stashContainer}
                >
                  {Array.from({ length: SLOTS_PER_PAGE }).map((_, index) => (
                    <View
                      style={[
                        styles.inventorySlot,
                        uiStore.dimensions.width === uiStore.dimensions.greater
                          ? {
                              left: `${(index % 8) * 12.5 + 8}%`,
                              top: `${Math.floor(index / 8) * 33.33 + 6}%`,
                            }
                          : {
                              left: `${(index % 4) * 25 + 5}%`,
                              top: `${Math.floor(index / 4) * 16.67 + 3}%`,
                            },
                      ]}
                      key={`bg-${pageIndex}-${index}`}
                    >
                      <View
                        style={[
                          styles.slotBackground,
                          {
                            height: uiStore.itemBlockSize,
                            width: uiStore.itemBlockSize,
                          },
                        ]}
                      />
                    </View>
                  ))}

                  {stashStore.items
                    .slice(
                      pageIndex * SLOTS_PER_PAGE,
                      (pageIndex + 1) * SLOTS_PER_PAGE,
                    )
                    .map((item, index) => (
                      <View
                        style={[
                          styles.inventorySlot,
                          { zIndex: 10 },
                          uiStore.dimensions.width ===
                          uiStore.dimensions.greater
                            ? {
                                left: `${(index % 8) * 12.5 + 8}%`,
                                top: `${Math.floor(index / 8) * 33.33 + 6}%`,
                              }
                            : {
                                left: `${(index % 4) * 25 + 5}%`,
                                top: `${Math.floor(index / 4) * 16.67 + 3}%`,
                              },
                        ]}
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
                style={[
                  styles.raisedAbsolutePosition,
                  {
                    top: -uiStore.dimensions.height * 0.17,
                    left: -uiStore.dimensions.width * 0.065,
                  },
                ]}
                pointerEvents="box-none"
              >
                <StatsDisplay
                  displayItem={displayItem}
                  clearItem={clearDisplayItem}
                />
              </View>
            )}
          </ScrollView>
          {totalPages === 1 && (
            <GenericStrikeAround style={{ textAlign: "center" }}>
              {`More tabs will be added\n as items are added`}
            </GenericStrikeAround>
          )}
        </View>
      </GenericModal>
    );
  },
);
