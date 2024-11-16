import { DungeonInstance, DungeonLevel } from "../entities/dungeon";
import type { RootStore } from "./RootStore";
import dungeonsJSON from "../assets/json/dungeons.json";
import { storage } from "../utility/functions/storage";
import { parse, stringify } from "flatted";
import { throttle } from "lodash";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import {
  BoundingBox,
  Tile,
  generateTiles,
  getBoundingBox,
} from "../components/DungeonComponents/DungeonMap";
import { Dimensions } from "react-native";

export class DungeonStore {
  root: RootStore;
  dungeonInstances: DungeonInstance[];
  activityInstance: DungeonInstance;
  currentInstance: DungeonInstance | undefined;
  currentLevel: DungeonLevel | undefined;

  currentMap: Tile[] | undefined;
  currentMapDimensions: BoundingBox | undefined;
  currentPosition: Tile | undefined;
  inCombat: boolean;
  fightingBoss: boolean;

  logs: string[] = [];

  constructor({ root }: { root: RootStore }) {
    console.log("Creating DungeonStore instance");
    this.dungeonInstances = this.hydrateDungeonState();
    this.activityInstance = this.initActivityDungeon();
    this.inCombat = false;
    this.fightingBoss = false;
    this.currentMap = undefined;
    this.currentMapDimensions = undefined;
    this.currentPosition = undefined;

    this.root = root;

    makeObservable(this, {
      inCombat: observable,
      currentMap: observable,
      currentMapDimensions: observable,
      currentPosition: observable,
      fightingBoss: observable,
      logs: observable,
      addLog: action,
      setUpDungeon: action,
      move: action,
      reversedLogs: computed,
    });
  }

  public setInBossFight(state: boolean) {
    this.fightingBoss = state;
  }

  public setUpDungeon(
    instance: string | DungeonInstance,
    level: string | DungeonLevel,
  ) {
    if (instance instanceof DungeonInstance && level instanceof DungeonLevel) {
      this.currentInstance = instance;
      this.currentLevel = level;
    } else {
      const foundInstance = this.dungeonInstances.find(
        (dungeonInstance) => dungeonInstance.name == instance,
      );
      if (foundInstance) {
        this.currentInstance = foundInstance;
        const found = foundInstance.levels.find(
          (dungeonLevel) => dungeonLevel.level == Number(level),
        );
        this.currentLevel = found;
      }
    }
    if (!this.currentLevel) {
      throw new Error("Failed to set up dungeon: No valid level found");
    }
    this.currentMap = generateTiles({
      numTiles: this.currentLevel.tiles,
      tileSize: TILE_SIZE,
      bossDefeated: this.currentLevel.bossDefeated,
    });
    this.currentMapDimensions = getBoundingBox(this.currentMap, TILE_SIZE);
    this.currentPosition = this.currentMap[0];
  }

  private updateCurrentPosition(tile: Tile) {
    this.currentPosition = tile;
  }

  public move(direction: "up" | "down" | "left" | "right") {
    if (!this.currentPosition || !this.currentMap) return;

    const { x, y } = directionsMapping[direction];
    const newX = this.currentPosition.x + x * TILE_SIZE;
    const newY = this.currentPosition.y + y * TILE_SIZE;

    const newPosition = this.currentMap.find(
      (tile) => tile.x === newX && tile.y === newY,
    );

    if (newPosition) {
      this.updateCurrentPosition(newPosition);

      if (!newPosition.clearedRoom) {
        this.inCombat = true;
        this.fightingBoss = newPosition.isBossRoom;
        this.setEncounter(newPosition.isBossRoom);
        this.visitRoom(newPosition);
      }
    }
  }

  get reversedLogs() {
    return this.logs.slice().reverse();
  }

  public addLog(whatHappened: string) {
    if (!this.logs) {
      console.log("no logs");
      this.logs = []; // Ensure logs exists
    }
    runInAction(() => {
      const timeOfLog = new Date().toLocaleTimeString();
      const log = `${timeOfLog}: ${whatHappened}`;
      this.logs.push(log);
      console.log("All logs:", this.logs);
    });
  }

  private visitRoom(room: Tile) {
    if (this.currentMap) {
      for (let tile of this.currentMap) {
        if (tile.x == room.x && tile.y == room.y) {
          tile.clearedRoom = true;
        }
      }
    }
  }

  public setEncounter(isBossFight: boolean) {
    if (!this.currentLevel) {
      throw new Error("No dungeon level set!");
    }
    const enemies = isBossFight
      ? this.currentLevel.generateBossEncounter
      : this.currentLevel.generateNormalEncounter;
    this.root.enemyStore.clearEnemyList();
    enemies.forEach((enemy) => this.root.enemyStore.addToEnemyList(enemy));
  }

  public getInstance(instanceName: string) {
    return this.dungeonInstances.find(
      (instance) => instance.name == instanceName,
    );
  }

  /**
   * Unlocks the next dungeon(s) when a boss has been defeated, given the name of the current dungeon the player is in.
   */
  public openNextDungeonLevel(currentInstance: DungeonInstance) {
    const successfullLevelUnlock = currentInstance.unlockNextLevel();
    if (!successfullLevelUnlock) {
      const unlockObjects: any[] = [];
      currentInstance.unlocks.forEach((unlock) => {
        const matchingObj = dungeonsJSON.find((obj) => obj.name == unlock);
        if (matchingObj) {
          unlockObjects.push(matchingObj);
        }
      });
      unlockObjects.forEach((obj) => {
        const inst = DungeonInstance.fromJSON(obj);
        this.dungeonInstances.push(inst);
      });
    }
  }

  hydrateDungeonState() {
    const ids = dungeonsJSON.map((inst) => inst.id);
    const dungeonInstances: DungeonInstance[] = [];
    ids.forEach((id) => {
      const retrieved = storage.getString(`dungeon_${id}`);
      if (retrieved) {
        dungeonInstances.push(
          DungeonInstance.fromJSON({ ...parse(retrieved), dungeonStore: this }),
        );
      }
    });
    return dungeonInstances.length > 0
      ? dungeonInstances
      : this.getInitDungeonState();
  }

  getInitDungeonState() {
    const nearbyCave = DungeonInstance.fromJSON({
      ...dungeonsJSON.find((inst) => inst.name == "nearby cave"),
      dungeonStore: this,
    });
    const trainingGrounds = DungeonInstance.fromJSON({
      ...dungeonsJSON.find((inst) => inst.name == "training grounds"),
      dungeonStore: this,
    });

    _dungeonInstanceSave(nearbyCave);
    _dungeonInstanceSave(trainingGrounds);

    return [trainingGrounds, nearbyCave];
  }

  setActivityName(name: string) {
    this.activityInstance.name = name.replaceAll("%20", " ");
  }

  initActivityDungeon() {
    const activityDungeon = new DungeonLevel({
      level: 0,
      bossEncounter: [],
      normalEncounters: [],
      tiles: 0,
      bossDefeated: true,
      unlocked: true,
      dungeonStore: this,
    });

    const activityInstance = new DungeonInstance({
      name: "activity",
      levels: [activityDungeon],
      unlocks: [],
      id: -1,
      difficulty: -1,
      dungeonStore: this,
    });

    return activityInstance;
  }
}

const _dungeonInstanceSave = async (dungeon: DungeonInstance | undefined) => {
  if (dungeon) {
    try {
      storage.set(`dungeon_${dungeon.id}`, stringify(dungeon));
    } catch (e) {
      console.log("Error in _playerSave:", e);
    }
  }
};

export const saveDungeonInstance = throttle(_dungeonInstanceSave, 500);

export const TILE_SIZE = Math.max(
  Number((Dimensions.get("screen").width / 10).toFixed(0)),
  Number((Dimensions.get("screen").height / 10).toFixed(0)),
);

const directionsMapping: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
