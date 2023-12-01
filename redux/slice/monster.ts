import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MonsterState {
  monster?: Record<string, any>;
}

let initialState: MonsterState = {
  monster: undefined,
};

const monsterSlice = createSlice({
  name: "monster",
  initialState,

  reducers: {
    setMonster: (state, action: PayloadAction<Object | undefined>) => {
      if (action.payload) {
        state.monster = action.payload;
      } else {
        state.monster = undefined;
      }
    },
  },
});

export const { setMonster } = monsterSlice.actions;

export default monsterSlice.reducer;
