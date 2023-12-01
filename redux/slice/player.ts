import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PlayerState {
  playerCharacter?: Record<string, any>;
}

let initialState: PlayerState = {
  playerCharacter: undefined,
};

const playerSlice = createSlice({
  name: "player",
  initialState,

  reducers: {
    setPlayerCharacter: (state, action: PayloadAction<Object>) => {
      state.playerCharacter = action.payload;
    },
  },
});

export const { setPlayerCharacter } = playerSlice.actions;

export default playerSlice.reducer;
