import { useContext } from "react";
import { DragContext, StoreContext } from "../stores/AppData";

// root hook
export const useRootStore = () => {
  const root = useContext(StoreContext);
  if (!root) throw new Error("useRootStore must be used within StoreProvider");
  return root;
};

// convenience hooks
export const usePlayerStore = () => {
  const { playerState } = useRootStore();
  if (!playerState) throw new Error("No player exists");
  return playerState;
};

export const useGameStore = () => {
  const { gameState } = useRootStore();
  if (!gameState) throw new Error("No game exists");
  return gameState;
};

export const useEnemyStore = () => {
  const { enemyStore } = useRootStore();
  return enemyStore;
};

export const useShopsStore = () => {
  const { shopsStore } = useRootStore();
  return shopsStore;
};

export const useDungeonStore = () => {
  const { dungeonStore } = useRootStore();
  return dungeonStore;
};

export const useUIStore = () => {
  const { uiStore } = useRootStore();
  return uiStore;
};

export const useDraggableStore = () => {
  const dragStore = useContext(DragContext);
  if (!dragStore)
    throw new Error(
      "useDraggableStore must be used with DraggableDataProvider",
    );
  return dragStore;
};
