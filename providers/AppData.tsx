import React, { createContext, type ReactNode, useMemo, useState } from "react";
import { RootStore } from "../stores/RootStore";
import { type SharedValue, useSharedValue } from "react-native-reanimated";

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
      iconString: string | null;
      setIconString: React.Dispatch<React.SetStateAction<string | null>>;
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
  const [iconString, setIconString] = useState<string | null>(null);

  const position = {
    x: useSharedValue(0),
    offsetX: useSharedValue(0),
    y: useSharedValue(0),
    offsetY: useSharedValue(0),
  };
  const isDragging = useSharedValue(false);

  const store = useMemo(
    () => ({
      position,
      isDragging,
      iconString,
      setIconString,
    }),
    [iconString],
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
