import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./slice/game";

const store = configureStore({
  reducer: gameReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "game/setPlayerCharacter",
          "game/setGameData",
          "game/setMonster",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
