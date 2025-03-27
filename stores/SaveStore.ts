import * as SQLite from "expo-sqlite";
import { parse, stringify } from "flatted";
import { PlayerCharacter, serializeJobs } from "@/entities/character";
import { RootStore } from "@/stores/RootStore";
import {
  action,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { storage } from "@/utility/functions/storage";

export class SaveStore {
  db: SQLite.SQLiteDatabase | null = null;
  currentGameId: number | null = null;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.initializeDatabase();
    this.hydrateCurrentGameId();

    makeObservable(this, {
      db: observable,
      currentGameId: observable,
      setCurrentGameID: action,
      initializeDatabase: action,
      deleteGame: action,
      loadCheckpoint: action,
    });

    reaction(
      () => [this.currentGameId],
      () => {
        if (this.currentGameId) {
          storage.set("currentGameId", this.currentGameId);
        }
      },
    );
  }

  setCurrentGameID(id: number) {
    this.currentGameId = id;
  }

  private hydrateCurrentGameId() {
    const storedGameId = storage.getNumber("currentGameId");
    if (storedGameId) {
      this.setCurrentGameID(storedGameId);
    }
  }

  //----------------------------------Local----------------------------------//
  async initializeDatabase() {
    this.db = await SQLite.openDatabaseAsync("game_data.db");
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        player_age INTEGER NOT NULL,
        player_data TEXT,
        time_data TEXT,
        dungeon_data TEXT,
        character_data TEXT,
        shops_data TEXT,
        is_auto_save BOOLEAN NOT NULL,
        FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE
      );
    `);
  }

  async createNewGame(name: string) {
    if (this.db) {
      const result = await this.db.runAsync(
        "INSERT INTO games (name, created_at) VALUES (?, ?)",
        [name, Date.now()],
      );
      const newGameId = result.lastInsertRowId;
      this.setCurrentGameID(newGameId);
      this.createCheckpoint(true);
      return newGameId;
    }
  }

  async getGamesList() {
    if (!this.db) {
      throw new Error("DB not initialized");
    }
    return await this.db.getAllAsync<{
      id: number;
      name: string;
      created_at: number;
    }>("SELECT * FROM games ORDER BY created_at DESC");
  }

  async deleteGame(gameId: number) {
    if (this.db) {
      await this.db.runAsync("DELETE FROM games WHERE id = ?", [gameId]);
      if (this.currentGameId === gameId) {
        this.currentGameId = null;
      }
    }
  }

  async createCheckpoint(isAutoSave: boolean) {
    if (this.db) {
      if (this.currentGameId === null) {
        throw new Error("No current game selected");
      }
      const timestamp = Date.now();
      const playerAge = this.root.playerState?.age || 0;
      const playerData = stringify({
        ...this.root.playerState,
        jobs: serializeJobs(this.root.playerState!.jobs),
        root: null,
      });
      const timeData = stringify(this.root.time.toCheckpointData());
      const dungeonData = stringify(this.root.dungeonStore.toCheckpointData());
      const characterData = stringify(
        this.root.characterStore.toCheckpointData(),
      );
      const shopsData = stringify(this.root.shopsStore.toCheckpointData());

      await this.db.runAsync(
        `INSERT INTO checkpoints (
        game_id, timestamp, player_age, player_data, time_data, dungeon_data, character_data, shops_data, is_auto_save
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.currentGameId,
          timestamp,
          playerAge,
          playerData,
          timeData,
          dungeonData,
          characterData,
          shopsData,
          isAutoSave ? 1 : 0,
        ],
      );

      if (isAutoSave) {
        await this.cleanupAutoSaves();
      }
    }
  }

  private async cleanupAutoSaves() {
    if (this.db) {
      await this.db.runAsync(
        `
      DELETE FROM checkpoints 
      WHERE game_id = ? AND is_auto_save = 1 AND id NOT IN (
        SELECT id FROM checkpoints 
        WHERE game_id = ? AND is_auto_save = 1
        ORDER BY timestamp DESC 
        LIMIT 5
      )
    `,
        [this.currentGameId, this.currentGameId],
      );
    }
  }

  async getCheckpointsListForGame(gameId: number) {
    if (!this.db) {
      throw new Error("DB not initialized");
    }
    return await this.db.getAllAsync<{
      id: number;
      timestamp: number;
      player_age: number;
      is_auto_save: boolean;
      player_data: string;
    }>(
      "SELECT id, timestamp, player_age, is_auto_save, player_data FROM checkpoints WHERE game_id = ? ORDER BY timestamp DESC",
      [gameId],
    );
  }

  async getCheckpointsList() {
    if (this.currentGameId === null) {
      throw new Error("No current game selected");
    }
    return this.getCheckpointsListForGame(this.currentGameId);
  }

  async loadCheckpoint({
    gameId = this.currentGameId,
    checkpointId,
  }: {
    gameId?: number | null;
    checkpointId?: number;
  }) {
    if (this.db) {
      if (!gameId) {
        throw new Error("Missing gameID");
      }
      let query: string;
      let params: any[] = [gameId];

      if (checkpointId !== undefined) {
        query =
          "SELECT * FROM checkpoints WHERE game_id = ? AND id = ? LIMIT 1";
        params.push(checkpointId);
      } else {
        query =
          "SELECT * FROM checkpoints WHERE game_id = ? ORDER BY timestamp DESC LIMIT 1";
      }

      try {
        const result = await this.db.getFirstAsync<{
          player_data: string;
          time_data: string;
          dungeon_data: string;
          character_data: string;
          shops_data: string;
        }>(query, params);

        if (result) {
          // Set current game ID first to ensure context is available
          runInAction(() => {
            this.currentGameId = gameId;
          });

          // Parse all data before applying any changes
          const parsedData = {
            timeData: parse(result.time_data),
            playerData: parse(result.player_data),
            dungeonData: parse(result.dungeon_data),
            characterData: parse(result.character_data),
            shopsData: parse(result.shops_data),
          };

          // Apply data in the correct order to avoid dependency issues
          // First, restore time data as many things depend on it
          this.root.time.fromCheckpointData(parsedData.timeData);

          // Then restore character data
          this.root.characterStore.fromCheckpointData(parsedData.characterData);

          // Then restore shops data
          this.root.shopsStore.fromCheckpointData(parsedData.shopsData);

          // Then restore dungeon data
          this.root.dungeonStore.fromCheckpointData(parsedData.dungeonData);

          // Finally restore player data which may depend on all the above
          this.root.setPlayer(
            PlayerCharacter.fromJSON({
              ...parsedData.playerData,
              root: this.root,
            }),
          );

          // Reset volatile state after everything is loaded
          this.root.dungeonStore.resetVolatileState();
          this.root.clearDeathScreen();

          return true;
        }
      } catch (error) {
        console.error("Error loading checkpoint:", error);
      }
    }
    return false;
  }

  async deleteCheckpoint(checkpointId: number) {
    if (this.db) {
      await this.db.runAsync("DELETE FROM checkpoints WHERE id = ?", [
        checkpointId,
      ]);
    }
  }

  async overwriteCheckpoint(checkpointId: number) {
    if (this.db) {
      if (this.currentGameId === null) {
        throw new Error("No current game selected");
      }
      const timestamp = Date.now();
      const playerAge = this.root.playerState?.age || 0;
      const playerData = stringify({
        ...this.root.playerState,
        jobs: serializeJobs(this.root.playerState!.jobs),
        root: null,
      });
      const timeData = stringify(this.root.time.toCheckpointData());
      const dungeonData = stringify(this.root.dungeonStore.toCheckpointData());
      const characterData = stringify(
        this.root.characterStore.toCheckpointData(),
      );
      const shopsData = stringify(this.root.shopsStore.toCheckpointData());

      await this.db.runAsync(
        `UPDATE checkpoints SET
        timestamp = ?, 
        player_age = ?, 
        player_data = ?, 
        time_data = ?, 
        dungeon_data = ?, 
        character_data = ?, 
        shops_data = ?
      WHERE id = ? AND game_id = ?`,
        [
          timestamp,
          playerAge,
          playerData,
          timeData,
          dungeonData,
          characterData,
          shopsData,
          checkpointId,
          this.currentGameId,
        ],
      );
    }
  }

  //----------------------------------Remote----------------------------------//
  async makeRemoteSave(name: string) {
    if (!this.root.authStore.isConnected) {
      throw new Error("Device is offline");
    }
    try {
      const timestamp = this.formatDate(new Date());
      const playerAge = this.root.playerState?.age || 0;

      const playerData = stringify({
        ...this.root.playerState,
        jobs: serializeJobs(this.root.playerState!.jobs),
        root: null,
      });
      const timeData = stringify(this.root.time.toCheckpointData());
      const dungeonData = stringify(this.root.dungeonStore.toCheckpointData());
      const characterData = stringify(
        this.root.characterStore.toCheckpointData(),
      );
      const shopsData = stringify(this.root.shopsStore.toCheckpointData());

      await this.root.authStore.databaseExecute({
        sql: `
        INSERT INTO checkpoints (
          name,
          created_at,
          last_updated, 
          player_age, 
          player_data, 
          time_data, 
          dungeon_data, 
          character_data, 
          shops_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        args: [
          name,
          timestamp.toString(),
          timestamp.toString(),
          playerAge.toString(),
          playerData,
          timeData,
          dungeonData,
          characterData,
          shopsData,
        ],
      });
    } catch (e) {
      console.error("Error creating remote checkpoint:", e);
    }
  }

  async overwriteRemoteSave(id: number) {
    if (!this.root.authStore.isConnected) {
      throw new Error("Device is offline");
    }
    try {
      const timestamp = this.formatDate(new Date());
      const playerAge = this.root.playerState?.age || 0;

      const playerData = stringify({
        ...this.root.playerState,
        jobs: serializeJobs(this.root.playerState!.jobs),
        root: null,
      });
      const timeData = stringify(this.root.time.toCheckpointData());
      const dungeonData = stringify(this.root.dungeonStore.toCheckpointData());
      const characterData = stringify(
        this.root.characterStore.toCheckpointData(),
      );
      const shopsData = stringify(this.root.shopsStore.toCheckpointData());

      await this.root.authStore.databaseExecute({
        sql: `
        UPDATE checkpoints 
        SET 
          last_updated = ?,
          player_age = ?,
          player_data = ?,
          time_data = ?,
          dungeon_data = ?,
          character_data = ?,
          shops_data = ?
        WHERE id = ?
      `,
        args: [
          timestamp,
          playerAge.toString(),
          playerData,
          timeData,
          dungeonData,
          characterData,
          shopsData,
          id.toString(),
        ],
      });
    } catch (e) {
      console.error("Error overwriting remote checkpoint:", e);
    }
  }

  async getRemoteCheckpoints() {
    if (!this.root.authStore.isConnected) {
      throw new Error("Device is offline");
    }
    try {
      const response = await this.root.authStore.databaseExecute({
        sql: `SELECT * FROM checkpoints ORDER BY last_updated DESC`,
      });

      if (!response?.results?.[0]?.response?.result?.rows) {
        console.warn(
          "No rows found in response or unexpected response structure",
        );
        return [];
      }

      const convertedRows = this.convertHTTPResponseCheckpointRow(
        response.results[0].response.result.rows,
      );

      return convertedRows;
    } catch (e) {
      console.error("Error fetching remote checkpoints:", e);
      return [];
    }
  }

  async getRemoteCheckpoint(id: number) {
    if (!this.root.authStore.isConnected) {
      throw new Error("Device is offline");
    }
    try {
      const response = await this.root.authStore.databaseExecute({
        sql: `SELECT * FROM checkpoints WHERE id = ? LIMIT 1`,
        args: [id.toString()],
      });

      if (
        !response?.results?.[0]?.response?.result?.rows ||
        response.results[0].response.result.rows.length === 0
      ) {
        console.warn(`No checkpoint found with id: ${id}`);
        return null;
      }

      const rawRows = response.results[0].response.result.rows;

      const convertedRows = this.convertHTTPResponseCheckpointRow(rawRows);

      if (convertedRows.length === 0) {
        console.warn(`No checkpoint data after conversion for id: ${id}`);
        return null;
      }

      const checkpoint = convertedRows[0];

      return checkpoint;
    } catch (e) {
      console.error(`Error fetching remote checkpoint with id ${id}:`, e);
      throw e;
    }
  }

  async deleteRemoteCheckpoint(id: number) {
    if (!this.root.authStore.isConnected) {
      throw new Error("Device is offline");
    }
    try {
      await this.root.authStore.databaseExecute({
        sql: `DELETE FROM checkpoints WHERE id = ?`,
        args: [id.toString()],
      });
    } catch (e) {
      console.error("Error deleting remote checkpoint:", e);
    }
  }

  loadRemoteCheckpoint = async (id: number) => {
    try {
      const checkpoint = await this.getRemoteCheckpoint(id);
      if (checkpoint) {
        this.root.time.fromCheckpointData(checkpoint.time_data);

        this.root.characterStore.fromCheckpointData(checkpoint.character_data);

        this.root.shopsStore.fromCheckpointData(checkpoint.shops_data);

        this.root.dungeonStore.fromCheckpointData(checkpoint.dungeon_data);

        this.root.setPlayer(
          PlayerCharacter.fromJSON({
            ...checkpoint.player_data,
            root: this.root,
          }),
        );

        this.root.dungeonStore.resetVolatileState();
        this.root.clearDeathScreen();

        return true;
      }
    } catch (error) {
      console.error("Error loading remote checkpoint:", error);
    }
    return false;
  };

  private convertHTTPResponseCheckpointRow(rows: any[][]) {
    return rows.map((row) => {
      const converted = {
        id: parseInt(row[0].value),
        name: row[1].value,
        created_at: row[2].value,
        last_updated: row[3].value,
        player_age: parseInt(row[4].value),
        player_data: parse(row[5].value),
        time_data: parse(row[6].value),
        dungeon_data: parse(row[7].value),
        character_data: parse(row[8].value),
        shops_data: parse(row[9].value),
      };
      return converted;
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
