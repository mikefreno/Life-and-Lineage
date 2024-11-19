import { useContext } from "react";
import { DragContext, StoreContext } from "../providers/AppData";

// root hook
export const useRootStore = () => {
  const root = useContext(StoreContext);
  if (!root) throw new Error("useRootStore must be used within StoreProvider");
  return root;
};

export const usePlayerStore = () => {
  const { playerState } = useRootStore();
  if (!playerState)
    throw new Error(
      "No player state when calling usePlayerStore, use Root if possibly undefined",
    );
  return playerState;
};

export const useDraggableStore = () => {
  const dragStore = useContext(DragContext);
  if (!dragStore)
    throw new Error(
      "useDraggableStore must be used with DraggableDataProvider",
    );
  return dragStore;
};
