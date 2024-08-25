import { PlayerCharacter } from "../../classes/character";
import type { Enemy } from "../../classes/creatures";
import { Game } from "../../classes/game";
import type { AppContextType, DungeonContextType } from "../types";
import { encode, decode } from "react-native-msgpack";
import * as FileSystem from "expo-file-system";
import { fromByteArray, toByteArray } from "react-native-quick-base64";

const fullSave = async (game: Game | null, player: PlayerCharacter | null) => {
  if (game && player) {
    try {
      const packedGame = encode(game);
      const packedPlayer = encode(player);
      await Promise.all([
        FileSystem.writeAsStringAsync(
          FileSystem.documentDirectory + "game.bin",
          fromByteArray(packedGame),
        ),
        FileSystem.writeAsStringAsync(
          FileSystem.documentDirectory + "player.bin",
          fromByteArray(packedPlayer),
        ),
      ]);
    } catch (e) {
      console.error(e);
    }
  }
};

const fullLoad = async (): Promise<{
  game: Game | null;
  player: PlayerCharacter | null;
}> => {
  try {
    const [gameData, playerData] = await Promise.all([
      FileSystem.readAsStringAsync(FileSystem.documentDirectory + "game.bin"),
      FileSystem.readAsStringAsync(FileSystem.documentDirectory + "player.bin"),
    ]);

    let game: Game | null = null;
    let player: PlayerCharacter | null = null;

    if (gameData) {
      const gameBuffer = toByteArray(gameData);
      game = Game.fromJSON(decode(gameBuffer));
    }

    if (playerData) {
      const playerBuffer = toByteArray(playerData);
      player = PlayerCharacter.fromJSON(decode(playerBuffer));
    }
    return { game, player };
  } catch (e) {
    console.error(e);
    return { game: null, player: null };
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
    slug,
    tiles,
    instanceName,
    currentPosition,
    fightingBoss,
    mapDimensions,
  } = dungeonData;
  if (playerState && gameState) {
    const level = slug.length > 2 ? slug[1] + "," + slug[2] : slug[1];
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
