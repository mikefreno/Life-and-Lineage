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
import { useRef } from "react";
import { checkReleasePositionProps } from "../utility/types";
import { ThemedView, Text } from "./Themed";
import { Item, itemMap } from "../entities/item";
import { useVibration } from "../hooks/generic";
import { useDraggableStore, useRootStore } from "../hooks/stores";

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

const Draggable = ({
  children,
  onDragStart,
  onDrag,
  onDragEnd,
  shouldSnapBack,
  isDraggable = true,
  x: initialX = 0,
  y: initialY = 0,
}: DraggableProps) => {
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

      if (!shouldSnapBack.value) {
        translateX.value = withSpring(initialX, springConfig);
        translateY.value = withSpring(initialY, springConfig);
        contextX.value = 0;
        contextY.value = 0;

        isDragging.value = false;
      }
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
};

export type ShopDisplayItem = {
  item: Item[];
  side?: "shop" | "inventory" | undefined;
  positon: {
    left: number;
    top: number;
  };
} | null;

export type ShopSetDisplayItem = React.Dispatch<
  React.SetStateAction<{
    item: Item[];
    side?: "shop" | "inventory" | undefined;
    positon: {
      left: number;
      top: number;
    };
  } | null>
>;

const InventoryItem = ({
  item,
  displayItem,
  setDisplayItem,
  checkReleasePosition,
  isDraggable,
}: {
  item: Item[];
  displayItem: ShopDisplayItem;
  setDisplayItem: ShopSetDisplayItem;
  checkReleasePosition: ({
    itemStack,
    xPos,
    yPos,
    size,
    equipped,
  }: checkReleasePositionProps) => boolean;
  isDraggable?: boolean;
}) => {
  const ref = useRef<View>(null);
  const opacity = useSharedValue(1);
  const shouldSnapBack = useSharedValue(false);
  const { isDragging, position, setIconString } = useDraggableStore();
  const vibration = useVibration();
  const { uiStore } = useRootStore();

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
        setDisplayItem({ item, side: "shop", positon: { left: x, top: y } });
      });
    }
  };

  const handleDragStart = (x: number, y: number) => {
    vibration({ style: "light" });
    position.offsetX.value = -x;
    position.offsetY.value = -y;
    isDragging.value = true;
    setIconString(item[0].icon ?? null);
    opacity.value = withTiming(0, { duration: 0 });
  };

  const handleDragEnd = (x: number, y: number) => {
    shouldSnapBack.value = checkReleasePosition({
      itemStack: item,
      xPos: x,
      yPos: y,
      size: uiStore.itemBlockSize,
    });
    setIconString(null);
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
    >
      <Animated.View style={animatedStyle}>
        <Pressable ref={ref} onPress={handlePress}>
          <View
            className="items-center justify-center rounded-lg bg-zinc-400 z-top"
            style={{
              height: uiStore.itemBlockSize,
              width: uiStore.itemBlockSize,
            }}
          >
            <Image
              source={item[0].getItemIcon()}
              style={{
                width: Math.min(uiStore.itemBlockSize * 0.65, 40),
                height: Math.min(uiStore.itemBlockSize * 0.65, 40),
              }}
            />
            {item[0].stackable && item.length > 1 && (
              <ThemedView className="absolute bottom-0 right-0 bg-opacity-50 rounded px-1">
                <Text>{item.length}</Text>
              </ThemedView>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </Draggable>
  );
};

const ProjectedImage = () => {
  const { position, isDragging, iconString } = useDraggableStore();
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

  if (!iconString || !uiStore.itemBlockSize) {
    return null;
  }

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          zIndex: 1000,
        },
      ]}
    >
      <View
        className="items-center justify-center rounded-lg bg-zinc-400"
        style={{
          height: uiStore.itemBlockSize,
          width: uiStore.itemBlockSize,
        }}
      >
        <Image
          source={itemMap[iconString]}
          style={{
            width: Math.min(uiStore.itemBlockSize * 0.65, 40),
            height: Math.min(uiStore.itemBlockSize * 0.65, 40),
          }}
        />
      </View>
    </Animated.View>
  );
};

export { InventoryItem, ProjectedImage };
export default Draggable;
