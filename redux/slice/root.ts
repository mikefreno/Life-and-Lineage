import { combineReducers } from "@reduxjs/toolkit";
import gameReducer from "./game";
import playerReducer from "./player";
import monsterReducer from "./monster";
import logsReducer from "./logs";

const rootReducer = combineReducers({
  game: gameReducer,
  player: playerReducer,
  monster: monsterReducer,
  logs: logsReducer,
});

export default rootReducer;
