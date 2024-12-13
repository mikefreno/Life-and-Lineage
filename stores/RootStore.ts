import {
  PlayerCharacter,
  getStartingBook,
  savePlayer,
  serializeJobs,
} from "../entities/character";
import { storage } from "../utility/functions/storage";
import { parse, stringify } from "flatted";
import UIStore from "./UIStore";
import EnemyStore from "./EnemyStore";
import { DungeonStore } from "./DungeonStore";
import { ShopStore } from "./ShopsStore";
import { action, makeObservable, observable } from "mobx";
import { AuthStore } from "./AuthStore";
import { TimeStore } from "./TimeStore";
import { CharacterStore } from "./CharacterStore";
import { TutorialStore } from "./TutorialStore";
import { Condition } from "../entities/conditions";
import sanityDebuffs from "../assets/json/sanityDebuffs.json";
import { ConditionObjectType, EffectOptions } from "../utility/types";
import * as SQLite from "expo-sqlite";
import { CheckpointRow } from "../utility/database";

export class RootStore {
  playerState: PlayerCharacter | null;
  time: TimeStore;
  enemyStore: EnemyStore;
  shopsStore: ShopStore;
  dungeonStore: DungeonStore;
  uiStore: UIStore;
  authStore: AuthStore;

  characterStore: CharacterStore;
  tutorialStore: TutorialStore;

  constructed: boolean = false;
  atDeathScreen: boolean = false;
  startingNewGame: boolean = false;

  // @ts-ignore
  private db: SQLite.SQLiteDatabase;

  constructor() {
    const retrieved_player = storage.getString("player");
    this.playerState = retrieved_player
      ? PlayerCharacter.fromJSON({ ...parse(retrieved_player), root: this })
      : null;

    this.time = new TimeStore({ root: this });
    this.authStore = new AuthStore({ root: this });
    this.uiStore = new UIStore({ root: this });
    this.shopsStore = new ShopStore({ root: this });
    this.enemyStore = new EnemyStore({ root: this });
    this.dungeonStore = new DungeonStore({ root: this });
    this.characterStore = new CharacterStore({ root: this });
    this.tutorialStore = new TutorialStore({ root: this });

    this.constructed = true;

    this.initializeDatabase();

    makeObservable(this, {
      constructed: observable,
      atDeathScreen: observable,
      startingNewGame: observable,
      hitDeathScreen: action,
      clearDeathScreen: action,
      loadRemoteCheckpoint: action,
    });
  }

  gameTick() {
    this.time.tick();
    if (!this.playerState) throw new Error("Missing player in root!");

    if (this.playerState.currentSanity < 0) {
      this.generateLowSanityDebuff();
    }

    this.playerState.gameTurnHandler();
  }

  inheritance() {
    let points = 0;
    for (const inst of this.dungeonStore.dungeonInstances) {
      for (const level of inst.levels) {
        if (level.bossDefeated) {
          points += 3;
        }
      }
    }
    return points;
  }

  newGame(newPlayer: PlayerCharacter) {
    const starterBook = getStartingBook(newPlayer);
    newPlayer.addToInventory(starterBook);
    this.enemyStore.clearEnemyList();
    this.playerState = newPlayer;
    this.shopsStore.setShops(this.shopsStore.getInitShopsState());
    savePlayer(newPlayer);
    this.clearDeathScreen();
  }

  private generateLowSanityDebuff() {
    if (Math.random() < 0.75) return;

    const debuffObj = this.getRandomSanityDebuff();
    const debuff = this.createDebuffFromObject(debuffObj);
    this.playerState?.addCondition(debuff);
  }

  private getRandomSanityDebuff() {
    return sanityDebuffs[
      Math.floor(Math.random() * sanityDebuffs.length)
    ] as ConditionObjectType;
  }

  private createDebuffFromObject(debuffObj: ConditionObjectType): Condition {
    const healthMultiplier = this.playerState?.nonConditionalMaxHealth;
    const sanityMultiplier = this.playerState?.nonConditionalMaxSanity;

    const healthDamage = this.calculateDamage(
      debuffObj,
      "health damage",
      healthMultiplier ?? 1,
    );
    const sanityDamage = this.calculateDamage(
      debuffObj,
      "sanity damage",
      sanityMultiplier ?? 1,
    );

    return new Condition({
      name: debuffObj.name,
      style: "debuff",
      turns: debuffObj.turns,
      effect: debuffObj.effect as EffectOptions[],
      healthDamage,
      sanityDamage,
      effectStyle: debuffObj.effectStyle,
      effectMagnitude: debuffObj.effectAmount,
      placedby: "low sanity",
      icon: debuffObj.icon,
      aura: debuffObj.aura,
      placedbyID: "low sanity",
      on: null,
    });
  }

  private calculateDamage(
    debuffObj: ConditionObjectType,
    damageType: string,
    multiplier: number,
  ): number[] {
    return debuffObj.effect.map((effect, index) => {
      if (effect !== damageType || debuffObj.effectAmount[index] === null)
        return 0;
      const amount = debuffObj.effectAmount[index]!;
      const style = debuffObj.effectStyle[index];
      return style === "multiplier" || style === "percentage"
        ? amount * multiplier
        : amount;
    });
  }

  hitDeathScreen() {
    this.atDeathScreen = true;
  }
  clearDeathScreen() {
    this.atDeathScreen = false;
  }

  startNewGame() {
    this.startingNewGame = true;
  }

  setPlayer(player: PlayerCharacter) {
    this.playerState = player;
  }

  leaveDungeon() {
    this.playerState?.clearMinions();
    this.enemyStore.clearEnemyList();
    this.dungeonStore.clearDungeonState();
    this.uiStore.clearDungeonColor();
  }

  private async initializeDatabase() {
    this.db = await SQLite.openDatabaseAsync("checkpoints.db");
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        player_age INTEGER NOT NULL,
        player_data TEXT,
        time_data TEXT,
        dungeon_data TEXT,
        character_data TEXT,
        shops_data TEXT
      )
    `);
  }

  async createCheckpoint() {
    const timestamp = Date.now();
    const playerAge = this.playerState?.age || 0;
    const playerData = stringify({
      ...this.playerState,
      jobs: serializeJobs(this.playerState!.jobs),
      root: null,
    });
    const timeData = stringify(this.time.toCheckpointData());
    const dungeonData = stringify(this.dungeonStore.toCheckpointData());
    const characterData = stringify(this.characterStore.toCheckpointData());
    const shopsData = stringify(this.shopsStore.toCheckpointData());

    await this.db.runAsync(
      `INSERT INTO checkpoints (timestamp, player_age, player_data, time_data, dungeon_data, character_data, shops_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        timestamp,
        playerAge,
        playerData,
        timeData,
        dungeonData,
        characterData,
        shopsData,
      ],
    );

    await this.db.runAsync(`
      DELETE FROM checkpoints 
      WHERE id NOT IN (
        SELECT id FROM checkpoints 
        ORDER BY timestamp DESC 
        LIMIT 5
      )
    `);
  }

  async loadCheckpoint(id?: number) {
    let query: string;
    let params: any[] = [];

    if (id !== undefined) {
      query = "SELECT * FROM checkpoints WHERE id = ? LIMIT 1";
      params = [id];
    } else {
      query = "SELECT * FROM checkpoints ORDER BY timestamp DESC LIMIT 1";
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
        this.playerState = PlayerCharacter.fromJSON({
          ...parse(result.player_data),
          root: this,
        });
        this.time.fromCheckpointData(parse(result.time_data));
        this.dungeonStore.fromCheckpointData(parse(result.dungeon_data));
        this.characterStore.fromCheckpointData(parse(result.character_data));
        this.shopsStore.fromCheckpointData(parse(result.shops_data));

        this.dungeonStore.resetVolatileState();

        return true;
      }
    } catch (error) {
      console.error("Error loading checkpoint:", error);
    }

    return false;
  }

  loadRemoteCheckpoint = async (id: number) => {
    let loading = "playerstate";
    try {
      const checkpoint = await this.authStore.getRemoteCheckpoint(id);
      if (checkpoint) {
        this.playerState = PlayerCharacter.fromJSON({
          ...checkpoint.player_data,
          root: this,
        });
        this.time.fromCheckpointData(checkpoint.time_data);
        this.dungeonStore.fromCheckpointData(checkpoint.dungeon_data);
        this.characterStore.fromCheckpointData(checkpoint.character_data);
        this.shopsStore.fromCheckpointData(checkpoint.shops_data);

        this.dungeonStore.resetVolatileState();

        return true;
      }
    } catch (error) {
      console.log("Error during ", loading);
      console.error("Error loading remote checkpoint:", error);
    }
  };

  async getCheckpointsList() {
    const results = await this.db.getAllAsync<{
      id: number;
      timestamp: number;
      player_age: number;
    }>(
      "SELECT id, timestamp, player_age FROM checkpoints ORDER BY timestamp DESC",
    );

    return results.map((result) => ({
      id: result.id,
      timestamp: result.timestamp,
      playerAge: result.player_age,
    }));
  }
}
