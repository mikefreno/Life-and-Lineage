import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GameState {
  gameData?: Record<string, any>;
}

let initialState: GameState = {
  gameData: undefined,
};

const gameSlice = createSlice({
  name: "game",
  initialState,

  reducers: {
    setGameData: (state, action: PayloadAction<Object>) => {
      state.gameData = action.payload;
    },
  },
});

export const { setGameData } = gameSlice.actions;

export default gameSlice.reducer;
