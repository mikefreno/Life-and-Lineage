import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Game } from "../../classes/game";
import { PlayerCharacter } from "../../classes/character";
import { Monster } from "../../classes/creatures";
import { enemyGenerator } from "../../utility/monster";

interface GameState {
  gameData?: Record<string, any>;
  playerCharacter?: Record<string, any>;
  monster?: Record<string, any>;
  logs: { logLine: string }[];
}

let initialState: GameState = {
  gameData: undefined,
  playerCharacter: undefined,
  monster: undefined,
  logs: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,

  reducers: {
    setGameData: (state, action: PayloadAction<Game>) => {
      state.gameData = action.payload.toJSON();
    },
    setPlayerCharacter: (state, action: PayloadAction<PlayerCharacter>) => {
      state.playerCharacter = action.payload.toJSON();
    },
    setMonster: (state, action: PayloadAction<Monster | null>) => {
      if (action.payload) {
        state.monster = action.payload.toJSON();
      } else {
        state.monster = undefined;
      }
    },
    refreshMonster: (state, action: PayloadAction<number>) => {
      const newEnemy = enemyGenerator(action.payload);
      console.log(newEnemy);
      state.monster = newEnemy.toJSON();
      console.log("should match above", state.monster);
    },
    setLogs: (state, action: PayloadAction<{ logLine: string }[]>) => {
      state.logs = action.payload;
    },
    appendLogs: (state, action: PayloadAction<{ logLine: string }>) => {
      state.logs = [...state.logs, action.payload];
    },
  },
});

export const {
  setGameData,
  setPlayerCharacter,
  setMonster,
  refreshMonster,
  setLogs,
  appendLogs,
} = gameSlice.actions;

export default gameSlice.reducer;
