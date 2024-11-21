import React, { createContext, type ReactNode, useMemo } from "react";
import { RootStore } from "../stores/RootStore";
import { type SharedValue, useSharedValue } from "react-native-reanimated";
import { DraggableDataStore } from "../stores/DraggableDataStore";

export const StoreContext = createContext<RootStore | undefined>(undefined);

export const DragContext = createContext<
  | {
      position: {
        x: SharedValue<number>;
        offsetX: SharedValue<number>;
        y: SharedValue<number>;
        offsetY: SharedValue<number>;
      };
      isDragging: SharedValue<boolean>;
      draggableClassStore: DraggableDataStore;
    }
  | undefined
>(undefined);

const StoreProvider = ({ children }: { children: ReactNode }) => {
  const store = new RootStore();

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

const DraggableDataProvider = ({ children }: { children: ReactNode }) => {
  const draggableClassStore = new DraggableDataStore();

  const position = {
    x: useSharedValue(0),
    offsetX: useSharedValue(0),
    y: useSharedValue(0),
    offsetY: useSharedValue(0),
  };

  const isDragging = useSharedValue<boolean>(false);

  const store = useMemo(
    () => ({
      position,
      isDragging,
      draggableClassStore,
    }),
    [isDragging.value, draggableClassStore.iconString],
  );

  return <DragContext.Provider value={store}>{children}</DragContext.Provider>;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <StoreProvider>
      <DraggableDataProvider>{children}</DraggableDataProvider>
    </StoreProvider>
  );
};
