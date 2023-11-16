import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { PlayerCharacter } from "../classes/character";
import { Monster } from "../classes/creatures";
import { Game } from "../classes/game";

export const selectPlayerCharacter = createSelector(
  (state: RootState) => state.playerCharacter,
  (playerCharacter) =>
    playerCharacter ? PlayerCharacter.fromJSON(playerCharacter) : null,
);

export const selectMonster = createSelector(
  (state: RootState) => state.monster,
  (monster) => (monster ? Monster.fromJSON(monster) : null),
);

export const selectGame = createSelector(
  (state: RootState) => state.gameData,
  (gameData) => (gameData ? Game.fromJSON(gameData) : null),
);
