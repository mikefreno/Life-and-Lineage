import {
  View,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  DimensionValue,
  LayoutAnimation,
} from "react-native";
import { observer } from "mobx-react-lite";
import { Item } from "@/entities/item";
import { useRootStore } from "@/hooks/stores";
import { InventoryItem } from "@/components/Draggable";
import { Text } from "@/components/Themed";
import GenericModal from "@/components/GenericModal";
import { useCallback, useMemo, useRef, useState } from "react";
import { StatsDisplay } from "@/components/StatsDisplay";
import GenericStrikeAround from "@/components/GenericStrikeAround";
import { useStyles } from "@/hooks/styles";

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
    const [modalDimensions, setModalDimensions] = useState<{
      height: number;
      width: number;
    }>({ height: 0, width: 0 });

    const clearDisplayItem = useCallback(() => setDisplayItem(null), []);

    const [targetPage, setTargetPage] = useState<number | null>(null);

    const handleTabPress = useCallback(
      (pageIndex: number) => {
        setTargetPage(pageIndex); // Set the target page before scrolling
        setCurrentPage(pageIndex); // Immediately update current page

        scrollViewRef.current?.scrollTo({
          x: pageIndex * modalDimensions?.width,
          animated: true,
        });
      },
      [modalDimensions.width],
    );

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Only update currentPage from scroll events if we're not handling a button press
        if (targetPage === null) {
          const page = Math.round(
            event.nativeEvent.contentOffset.x / modalDimensions.width,
          );
          setCurrentPage(page);
        }
      },
      [modalDimensions.width, targetPage],
    );

    const handleScrollEnd = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setTargetPage(null); // Clear the target page when scrolling ends
        const page = Math.round(
          event.nativeEvent.contentOffset.x / modalDimensions.width,
        );
        setCurrentPage(page);
      },
      [modalDimensions.width],
    );

    const gridCalculations = useMemo(() => {
      const height = modalDimensions.height ?? 0;
      const width = modalDimensions.width ?? 0;
      const rows = uiStore.isLandscape ? 3 : 6;
      const columns = 24 / rows;
      const itemSize = uiStore.itemBlockSize;

      const excessHeight = height - rows * itemSize;
      const excessWidth = width - columns * itemSize;

      const verticalGaps = rows + 1;
      const horizontalGaps = columns + 1;

      const verticalSpacing = excessHeight / verticalGaps;
      const horizontalSpacing = excessWidth / horizontalGaps;

      const slotPositions = Array.from({ length: 24 }).map((_, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;

        const left = horizontalSpacing + col * (itemSize + horizontalSpacing);
        const top = verticalSpacing + row * (itemSize + verticalSpacing);

        const leftPercent = width > 0 ? (left / width) * 100 : 0;
        const topPercent = height > 0 ? (top / height) * 100 : 0;

        return {
          left: `${leftPercent}%` as DimensionValue,
          top: `${topPercent}%` as DimensionValue,
          index,
        };
      });

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return {
        rows,
        columns,
        itemSize,
        slotPositions,
      };
    }, [
      modalDimensions,
      uiStore.dimensions,
      uiStore.playerStatusExpandedOnAllRoutes,
    ]);

    const renderInventorySlot = useCallback(
      (index: number) => {
        const position = gridCalculations.slotPositions[index];
        return (
          <View
            style={[
              styles.inventorySlot,
              {
                position: "absolute",
                left: position.left,
                top: position.top,
              },
            ]}
            key={"bg-" + index}
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
        );
      },
      [gridCalculations.slotPositions, styles, uiStore.itemBlockSize],
    );

    const renderInventoryItem = useCallback(
      (item: { item: Item[] }, index: number) => {
        const position = gridCalculations.slotPositions[index];
        return (
          <View
            style={[
              {
                position: "absolute",
                left: position.left,
                top: position.top,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              },
            ]}
            key={item.item[0].id}
          >
            <View>
              <InventoryItem
                item={item.item}
                setDisplayItem={(params) => {
                  if (params) {
                    setDisplayItem({
                      ...params,
                      side: "stash",
                    });
                  } else {
                    setDisplayItem(null);
                  }
                }}
                displayItem={displayItem}
                isDraggable={true}
                runOnSuccess={() => null}
                targetBounds={[]}
              />
            </View>
          </View>
        );
      },
      [gridCalculations.slotPositions, displayItem, setDisplayItem],
    );

    const inventorySlots = useMemo(
      () =>
        Array.from({ length: 24 }).map((_, index) =>
          renderInventorySlot(index),
        ),
      [renderInventorySlot],
    );

    const inventoryItems = useMemo(
      () =>
        stashStore.items
          .slice(0, 24)
          .map((item, index) => renderInventoryItem(item, index)) || [],
      [stashStore.items, renderInventoryItem],
    );

    const onModalLayout = (event: LayoutChangeEvent) => {
      const { height, width } = event.nativeEvent.layout;
      setModalDimensions({ height, width });
    };

    return (
      <GenericModal
        isVisibleCondition={showingStash}
        backFunction={() => {
          clear();
          setDisplayItem(null);
        }}
        scrollEnabled={uiStore.isLandscape}
        size={100}
      >
        <View
          style={[
            {
              height: uiStore.isLandscape
                ? uiStore.dimensions.height
                : uiStore.dimensions.height * 0.66,
            },
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
                style={{
                  width: modalDimensions.width,
                  flex: 1,
                  paddingHorizontal: 8,
                }}
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
                  {inventorySlots}
                  {inventoryItems}
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
