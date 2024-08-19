import { PlayerCharacter } from "../../classes/character";
import type { Enemy } from "../../classes/creatures";
import { Game } from "../../classes/game";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppContextType, DungeonContextType } from "../types";

export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

//just saves game, simpler interface
export const saveGame = async (game: Game | null) => {
  try {
    const jsonGame = JSON.stringify(game);
    await AsyncStorage.setItem("game", jsonGame);
  } catch (e) {
    console.error(e);
  }
};
export const savePlayer = async (player: PlayerCharacter) => {
  try {
    const jsonPlayer = JSON.stringify(player);
    await AsyncStorage.setItem("player", jsonPlayer);
  } catch (e) {
    console.error(e);
  }
};

export const fullSave = async (
  game: Game | null,
  player: PlayerCharacter | null,
) => {
  if (game && player) {
    try {
      const jsonGame = JSON.stringify(game);
      const jsonPlayer = JSON.stringify(player);
      await Promise.all([
        AsyncStorage.setItem("game", jsonGame),
        AsyncStorage.setItem("player", jsonPlayer),
      ]);
    } catch (e) {
      console.error(e);
    }
  }
};
//export const fullSaveDB = async (
//game: Game | null,
//player: PlayerCharacter | null,
//) => {
//if (game && player) {
//SQLite.openDatabaseAsync("gameDatabase.db").then((database) => {
//database.runAsync(
//"INSERT OR REPLACE INTO Game (id, date, dungeonInstances, completedInstances, atDeathScreen, shops, colorScheme, vibrationEnabled, healthWarning, tutorialsShown, tutorialsEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//[
//1, // Assuming there's only one game record
//game.date,
//JSON.stringify(game.dungeonInstances),
//JSON.stringify(game.completedInstances),
//game.atDeathScreen ? 1 : 0,
//JSON.stringify(game.shops),
//game.colorScheme,
//game.vibrationEnabled,
//game.healthWarning,
//JSON.stringify(game.tutorialsShown),
//game.tutorialsEnabled ? 1 : 0,
//],
//),
//database.runAsync(
//"INSERT OR REPLACE INTO Character (id, beingType, firstName, lastName, sex, alive, fertility, birthdate, deathdate, job, isPlayerPartner, sexuality, affection, qualifications, dateCooldownStart) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//[
//player.id,
//player.beingType,
//player.firstName,
//player.lastName,
//player.sex,
//player.alive ? 1 : 0,
//player.fertility,
//player.birthdate,
//player.deathdate,
//player.job,
//player.isPlayerPartner ? 1 : 0,
//player.sexuality,
//player.affection,
//JSON.stringify(player.qualifications),
//player.dateCooldownStart ?? null,
//],
//),
//database.runAsync(
//"INSERT OR REPLACE INTO PlayerCharacter (id, playerClass, blessing, health, healthMax, sanity, sanityMax, mana, manaMax, manaRegen, attackPower, jobExperience, learningSpells, magicProficiencies, qualificationProgress, minions, knownSpells, physicalAttacks, conditions, gold, inventory, currentDungeon, equipment, investments, savedEnemy, unAllocatedSkillPoints, allocatedSkillPoints) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//[
//player.id,
//player.playerClass,
//player.blessing,
//player.health,
//player.healthMax,
//player.sanity,
//player.sanityMax,
//player.mana,
//player.manaMax,
//player.manaRegen,
//player.attackPower,
//JSON.stringify(player.jobExperience),
//JSON.stringify(player.learningSpells),
//JSON.stringify(player.magicProficiencies),
//JSON.stringify(player.qualificationProgress),
//JSON.stringify(player.minions),
//JSON.stringify(player.knownSpells),
//JSON.stringify(player.physicalAttacks),
//JSON.stringify(player.conditions),
//player.gold,
//JSON.stringify(player.inventory),
//JSON.stringify(player.currentDungeon),
//JSON.stringify(player.equipment),
//JSON.stringify(player.investments),
//JSON.stringify(player.savedEnemy),
//player.unAllocatedSkillPoints,
//JSON.stringify(player.allocatedSkillPoints),
//],
//);
//});
//}
//};

export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(e);
  }
};

export const loadGame = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("game");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(e);
  }
};

export const loadPlayer = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("player");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(e);
  }
};

interface dungeonSave {
  enemy: Enemy | null;
  dungeonData: DungeonContextType | undefined;
  appData: AppContextType | undefined;
}

export function dungeonSave({ enemy, dungeonData, appData }: dungeonSave) {
  if (!appData || !dungeonData)
    throw new Error("missing context in dungeonSave()");
  const { playerState, gameState } = appData;
  const {
    tiles,
    instanceName,
    level,
    currentPosition,
    fightingBoss,
    mapDimensions,
  } = dungeonData;
  if (playerState && gameState) {
    if (tiles.length > 0) {
      playerState.setInDungeon({
        state: true,
        instance: instanceName,
        level: level,
        dungeonMap: tiles,
        currentPosition: currentPosition ?? tiles[0],
        mapDimensions: mapDimensions,
        enemy: enemy,
        fightingBoss: fightingBoss,
      });
      fullSave(gameState, playerState);
    }
  }
}
