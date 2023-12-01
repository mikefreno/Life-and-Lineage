import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";

import ExpoFileSystemStorage from "redux-persist-expo-filesystem";
import rootReducer from "./slice/root";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import { GameState } from "./slice/game";
import { PlayerState } from "./slice/player";
import { MonsterState } from "./slice/monster";
import { LogsState } from "./slice/logs";

type RootState = {
  game: GameState;
  player: PlayerState;
  monster: MonsterState;
  logs: LogsState;
};

const persistConfig = {
  key: "root",
  stateReconciler: hardSet,
  storage: ExpoFileSystemStorage,
};

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export default () => {
  let store = createStore(persistedReducer);
  let persistor = persistStore(store);
  return { store, persistor };
};
