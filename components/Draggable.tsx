import React from "react";
import { Pressable, View, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { ThemedView, Text } from "./Themed";
import { Item, itemMap } from "../entities/item";
import { useVibration } from "../hooks/generic";
import { useDraggableStore, useRootStore } from "../hooks/stores";
import { checkReleasePosition } from "../utility/functions/misc";
import { observer } from "mobx-react-lite";
import { useStyles } from "../hooks/styles";
import Colors from "../constants/Colors";

type DraggableProps = {
  children: React.ReactNode;
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  shouldSnapBack: SharedValue<boolean>;
  isDraggable?: boolean;
  x?: number;
  y?: number;
};

const Draggable = forwardRef(
  (
    {
      children,
      onDragStart,
      onDrag,
      onDragEnd,
      shouldSnapBack,
      isDraggable = true,
      x: initialX = 0,
      y: initialY = 0,
    }: DraggableProps,
    ref,
  ) => {
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const springConfig = {
      damping: 15,
      mass: 0.5,
      stiffness: 150,
    };

    useImperativeHandle(ref, () => ({
      snapToInitialPosition: () => {
        translateX.value = withSpring(initialX, springConfig);
        translateY.value = withSpring(initialY, springConfig);
        contextX.value = 0;
        contextY.value = 0;
      },
      //These may at some point have utility, but do not currently
      //snapToPosition: (x: number, y: number) => {
      //translateX.value = withSpring(x, springConfig);
      //translateY.value = withSpring(y, springConfig);
      //contextX.value = x - initialX;
      //contextY.value = y - initialY;
      //},
      //getPosition: () => ({
      //x: translateX.value,
      //y: translateY.value,
      //}),
    }));

    const gesture = Gesture.Pan()
      .enabled(isDraggable)
      .onStart((e) => {
        isDragging.value = true;
        if (onDragStart) {
          runOnJS(onDragStart)(e.x, e.y);
        }
      })
      .onUpdate((e) => {
        translateX.value = e.translationX + contextX.value;
        translateY.value = e.translationY + contextY.value;
        if (onDrag) {
          const absoluteX = e.absoluteX;
          const absoluteY = e.absoluteY;
          runOnJS(onDrag)(absoluteX, absoluteY);
        }
      })
      .onEnd((e) => {
        if (onDragEnd) {
          runOnJS(onDragEnd)(e.absoluteX, e.absoluteY);
        }

        if (shouldSnapBack.value) {
          translateX.value = withSpring(initialX, springConfig);
          translateY.value = withSpring(initialY, springConfig);
          contextX.value = 0;
          contextY.value = 0;
        } else {
          contextX.value = translateX.value;
          contextY.value = translateY.value;
        }

        isDragging.value = false;
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      zIndex: isDragging.value ? 999 : 1,
    }));

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ position: "absolute" }, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    );
  },
);

const InventoryItem = observer(
  ({
    item,
    displayItem,
    targetBounds,
    setDisplayItem,
    isDraggable,
    runOnSuccess,
  }: {
    item: Item[];
    targetBounds: {
      key: string;
      bounds:
        | {
            x: number;
            y: number;
            width: number;
            height: number;
          }
        | null
        | undefined;
    }[];
    displayItem: {
      item: Item[];
      side?: "shop" | "inventory" | undefined;
      position: {
        left: number;
        top: number;
      };
    } | null;
    setDisplayItem: (
      params: {
        item: Item[];
        position: {
          left: number;
          top: number;
        };
      } | null,
    ) => void;
    isDraggable?: boolean;
    runOnSuccess: (droppedOnKey: string) => void;
  }) => {
    const ref = useRef<View>(null);
    const opacity = useSharedValue(1);
    const shouldSnapBack = useSharedValue(false);
    const { isDragging, position, draggableClassStore } = useDraggableStore();
    const vibration = useVibration();
    const { uiStore } = useRootStore();
    const styles = useStyles();

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    while (!uiStore.itemBlockSize) {
      return <></>;
    }

    const handlePress = () => {
      vibration({ style: "light" });
      if (displayItem && displayItem.item[0].equals(item[0])) {
        setDisplayItem(null);
      } else {
        ref.current?.measureInWindow((x, y) => {
          setDisplayItem({ item, position: { left: x, top: y } });
        });
      }
    };

    const draggableRef = useRef(null);
    const handleSnapBack = () => {
      draggableRef.current?.snapToInitialPosition();
    };

    const handleDragStart = (x: number, y: number) => {
      vibration({ style: "light" });
      position.offsetX.value = -x;
      position.offsetY.value = -y;
      isDragging.value = true;
      draggableClassStore.setIconString(item[0].icon ?? null);
      opacity.value = withTiming(0, { duration: 0 });
    };

    const handleDragEnd = (x: number, y: number) => {
      checkReleasePosition({
        bounds: targetBounds,
        handleSnapBack,
        runOnSuccess,
        position: { x, y },
      });
      draggableClassStore.setIconString(null);
      isDragging.value = false;
      position.x.value = 0;
      position.y.value = 0;
      opacity.value = withTiming(1, { duration: 50 });
    };

    return (
      <Draggable
        onDragStart={handleDragStart}
        onDrag={(x, y) => {
          position.x.value = x;
          position.y.value = y;
        }}
        onDragEnd={handleDragEnd}
        shouldSnapBack={shouldSnapBack}
        isDraggable={isDraggable}
        ref={draggableRef}
      >
        <Animated.View style={animatedStyle}>
          <Pressable ref={ref} onPress={handlePress}>
            <View
              style={[
                styles.inventoryItemContainer,
                {
                  height: uiStore.itemBlockSize,
                  width: uiStore.itemBlockSize,
                },
              ]}
            >
              <Image
                source={item[0].getItemIcon()}
                style={{
                  width: uiStore.itemBlockSize * 0.65,
                  height: uiStore.itemBlockSize * 0.65,
                }}
              />
              {item[0].stackable && item.length > 1 && (
                <ThemedView style={styles.stackIndicator}>
                  <Text style={{ color: Colors["dark"].text }}>
                    {item.length}
                  </Text>
                </ThemedView>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </Draggable>
    );
  },
);

const ProjectedImage = observer(() => {
  const { position, isDragging, draggableClassStore } = useDraggableStore();
  const { uiStore } = useRootStore();

  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      transform: [
        {
          translateX: position.x.value + position.offsetX.value,
        },
        {
          translateY: position.y.value + position.offsetY.value,
        },
      ],
      opacity: isDragging.value ? 1 : 0,
    };
  });

  const styles = useStyles();

  if (!draggableClassStore.iconString || !uiStore.itemBlockSize) {
    return null;
  }

  return (
    <Animated.View style={[animatedStyle, styles.projectedImageContainer]}>
      <View
        style={[
          styles.inventoryItemContainer,
          {
            height: uiStore.itemBlockSize,
            width: uiStore.itemBlockSize,
          },
        ]}
      >
        <Image
          source={itemMap[draggableClassStore.iconString]}
          style={{
            width: uiStore.itemBlockSize * 0.65,
            height: uiStore.itemBlockSize * 0.65,
          }}
        />
      </View>
    </Animated.View>
  );
});

export { InventoryItem, ProjectedImage };
export default Draggable;
