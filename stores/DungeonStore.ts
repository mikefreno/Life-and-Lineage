import {
  DungeonInstance,
  DungeonLevel,
  SpecialEncounter,
} from "../entities/dungeon";
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
  reaction,
  runInAction,
  toJS,
} from "mobx";
import {
  BoundingBox,
  Tile,
  generateTiles,
  getBoundingBox,
} from "../components/DungeonComponents/DungeonMap";
import { Dimensions } from "react-native";
import { generateEnemyFromNPC, wait } from "../utility/functions/misc";
import { ParallaxOptions } from "../components/DungeonComponents/Parallax";
import { Character } from "../entities/character";

export class DungeonStore {
  root: RootStore;
  dungeonInstances: DungeonInstance[];

  currentInstance: DungeonInstance | undefined;
  currentLevel: DungeonLevel | undefined;
  currentMap: Tile[] | undefined;
  currentMapDimensions: BoundingBox | undefined;
  currentPosition: Tile | undefined;
  currentSpecialEncounter: SpecialEncounter | null = null;
  inCombat: boolean = false;
  inSpecialRoom: boolean = false;
  fightingBoss: boolean = false;
  movementQueued: boolean = false;

  fleeModalShowing: boolean = false;
  heldColorScheme: "light" | "dark" | "system" | undefined;
  logs: string[] = [];

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.dungeonInstances = this.hydrateDungeonState();

    const currentDungeonHydration = this.hydrateCurrentDungeonState();
    if (!currentDungeonHydration) {
      this.clearDungeonState();
    } else {
      const {
        currentInstance,
        currentLevel,
        currentMap,
        currentMapDimensions,
        currentPosition,
        inCombat,
        fightingBoss,
        logs,
      } = currentDungeonHydration;

      this.currentInstance = currentInstance;
      this.currentLevel = currentLevel;
      this.currentMap = currentMap;
      this.currentMapDimensions = currentMapDimensions;
      this.currentPosition = currentPosition;
      this.inCombat = inCombat;
      this.fightingBoss = fightingBoss;
      this.logs = logs;
    }

    makeObservable(this, {
      inCombat: observable,
      currentMap: observable,
      currentMapDimensions: observable,
      currentPosition: observable,
      currentLevel: observable,
      currentInstance: observable,
      fightingBoss: observable,
      logs: observable,
      movementQueued: observable,
      toggleMovement: action,
      addLog: action,
      setUpDungeon: action,
      move: action,
      reversedLogs: computed,
      setInCombat: action,
      fleeModalShowing: observable,
      setFleeModalShowing: action,
      setEncounter: action,
      setInBossFight: action,
      hasPersistedState: computed,
      clearDungeonState: action,
      resetVolatileState: action,
      resetForNewGame: action,
    });

    reaction(
      () => this.currentInstance,
      (instance) => {
        if (instance) {
          storage.set("currentInstanceId", instance.id);
        }
      },
    );

    reaction(
      () => this.currentLevel,
      (level) => {
        if (level) {
          storage.set("currentLevelNumber", level.level);
        }
      },
    );

    reaction(
      () => toJS(this.currentMap),
      (map) => {
        if (map) {
          storage.set("currentMap", stringify(map));
        }
      },
    );

    reaction(
      () => this.currentMapDimensions,
      (dimensions) => {
        if (dimensions) {
          storage.set("currentMapDimensions", stringify(dimensions));
        }
      },
    );

    reaction(
      () => this.currentPosition,
      (position) => {
        if (position) {
          storage.set("currentPosition", stringify(position));
        }
      },
    );

    reaction(
      () => this.inCombat,
      (inCombat) => {
        storage.set("inCombat", inCombat);
      },
    );

    reaction(
      () => this.fightingBoss,
      (fightingBoss) => {
        storage.set("fightingBoss", fightingBoss);
      },
    );

    reaction(
      () => this.logs,
      (logs) => {
        storage.set("logs", stringify(logs));
      },
    );
  }

  public toggleMovement() {
    this.movementQueued = !this.movementQueued;
  }

  public setInBossFight(state: boolean) {
    this.fightingBoss = state;
  }

  public setUpDungeon(
    instance: string | DungeonInstance,
    level: string | DungeonLevel,
  ) {
    this.root.saveStore.createCheckpoint(true);
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
    const specials = this.currentLevel.specialEncounters.map(
      (specialEncounter) => {
        return { count: specialEncounter.countForLevel, specialEncounter };
      },
    );
    this.currentMap = generateTiles({
      numTiles: this.currentLevel.tiles,
      tileSize: TILE_SIZE,
      bossDefeated: this.currentLevel.bossDefeated,
      specials,
    });
    this.currentMapDimensions = getBoundingBox(this.currentMap, TILE_SIZE);
    this.currentPosition = this.currentMap[0];
  }

  private updateCurrentPosition(tile: Tile) {
    this.currentPosition = tile;
  }

  setInCombat(state: boolean) {
    this.inCombat = state;
  }

  setFleeModalShowing(state: boolean) {
    this.fleeModalShowing = state;
  }

  private initiateSpecialBattle(enemyNames: string[]) {
    enemyNames.map((name) => {
      const enemy = this.root.enemyStore.addToEnemyList(enemy);
    });
    this.inCombat = true;
  }

  public move(direction: "up" | "down" | "left" | "right") {
    if (!this.currentPosition || !this.currentMap) return;
    this.toggleMovement();

    const { x, y } = directionsMapping[direction];
    const newX = this.currentPosition.x + x * TILE_SIZE;
    const newY = this.currentPosition.y + y * TILE_SIZE;

    const newPosition = this.currentMap.find(
      (tile) => tile.x === newX && tile.y === newY,
    );

    if (newPosition) {
      this.updateCurrentPosition(newPosition);

      if (!newPosition.clearedRoom) {
        wait(350).then(() => {
          runInAction(() => {
            this.inCombat = true;
            this.fightingBoss = newPosition.isBossRoom;
            this.setEncounter(newPosition.isBossRoom);
            this.visitRoom(newPosition);
            this.toggleMovement();
          });
        });
      } else {
        this.toggleMovement();
      }
    }
  }

  get reversedLogs() {
    return this.logs.slice().reverse();
  }

  public addLog(whatHappened: string) {
    if (!this.logs) {
      this.logs = [];
    }
    runInAction(() => {
      const timeOfLog = new Date().toLocaleTimeString();
      const log = `${timeOfLog}: ${whatHappened}`;
      this.logs.push(log);
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
    if (!enemies) return;
    enemies.forEach((enemy) => this.root.enemyStore.addToEnemyList(enemy));

    if (enemies.length === 1) {
      this.addLog(`You have run into a ${enemies[0].creatureSpecies}`);
    } else {
      const speciesCount = enemies.reduce(
        (acc, enemy) => {
          acc[enemy.creatureSpecies] = (acc[enemy.creatureSpecies] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const speciesStrings = Object.entries(speciesCount).map(
        ([species, count]) => {
          return count === 1 ? `a ${species}` : `${count} ${species}s`;
        },
      );

      const lastSpecies = speciesStrings.pop();
      const log = speciesStrings.length
        ? `You have run into ${speciesStrings.join(", ")} and ${lastSpecies}.`
        : `You have run into ${lastSpecies}.`;

      this.addLog(log);
    }
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
        _dungeonInstanceSave(inst);
      });
    }
  }

  resetForNewGame() {
    this.clearDungeonState();
    this.dungeonInstances = this.getInitDungeonState();
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

  hydrateCurrentDungeonState() {
    try {
      const currentInstanceId = storage.getNumber("currentInstanceId");
      const currentLevelNumber = storage.getNumber("currentLevelNumber");
      const currentMapStr = storage.getString("currentMap");
      const currentMapDimensionsStr = storage.getString("currentMapDimensions");
      const currentPositionStr = storage.getString("currentPosition");
      const inCombat = storage.getBoolean("inCombat") ?? false;
      const fightingBoss = storage.getBoolean("fightingBoss") ?? false;
      const logsStr = storage.getString("logs") ?? "";

      if (
        currentInstanceId === undefined ||
        currentLevelNumber === undefined ||
        !currentMapStr ||
        !currentMapDimensionsStr ||
        !currentPositionStr
      ) {
        return;
      }

      const currentInstance = this.dungeonInstances.find(
        (instance) => instance.id === currentInstanceId,
      );

      if (!currentInstance) return;

      const currentLevel = currentInstance.levels.find(
        (level) => level.level === currentLevelNumber,
      );

      if (!currentLevel) return;

      const currentMap: Tile[] = parse(currentMapStr).map((tile: any) => ({
        x: tile.x,
        y: tile.y,
        clearedRoom: Boolean(tile.clearedRoom),
        isBossRoom: Boolean(tile.isBossRoom),
      }));

      const currentMapDimensions = parse(currentMapDimensionsStr);
      const currentPosition = parse(currentPositionStr);
      const logs = logsStr ? parse(logsStr) : [];

      return {
        currentInstance,
        currentLevel,
        currentMap,
        currentMapDimensions,
        currentPosition,
        inCombat,
        fightingBoss,
        logs,
      };
    } catch (error) {
      return false;
    }
  }

  get hasPersistedState(): boolean {
    return !!(
      this.currentInstance &&
      this.currentLevel &&
      this.currentMap &&
      this.currentMapDimensions &&
      this.currentPosition
    );
  }

  public clearDungeonState() {
    this.currentInstance = undefined;
    this.currentLevel = undefined;
    this.currentMap = undefined;
    this.currentMapDimensions = undefined;
    this.currentPosition = undefined;
    this.inCombat = false;
    this.fightingBoss = false;
    this.logs = [];

    storage.delete("currentInstance");
    storage.delete("currentLevel");
    storage.delete("currentMap");
    storage.delete("currentMapDimensions");
    storage.delete("currentPosition");
    storage.delete("inCombat");
    storage.delete("fightingBoss");
    storage.delete("logs");
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

  setUpAssault(character: Character) {
    const characterAsEnemy = generateEnemyFromNPC(character);
  }

  //setActivityName(name: string) {
  //this.activityInstance.name = name.replaceAll("%20", " ");
  //}

  initActivityDungeon(background: ParallaxOptions) {
    const activityInstance = new DungeonInstance({
      name: "activity",
      levels: [] as DungeonLevel[],
      unlocks: [],
      id: -1,
      difficulty: -1,
      dungeonStore: this,
      bgName: background,
    });

    const activityDungeon = new DungeonLevel({
      level: 0,
      bossEncounter: [],
      normalEncounters: [],
      tiles: 0,
      bossDefeated: true,
      unlocked: true,
      dungeonStore: this,
      parent: activityInstance,
    });
    activityInstance.setLevels([activityDungeon]);

    return activityInstance;
  }

  toCheckpointData() {
    return {
      dungeonInstances: this.dungeonInstances.map((instance) => ({
        ...instance,
        dungeonStore: null,
        levels: instance.levels.map((level) => ({
          ...level,
          dungeonStore: null,
          parent: null,
        })),
      })),
    };
  }

  fromCheckpointData(data: any) {
    this.dungeonInstances = data.dungeonInstances.map((instanceData: any) =>
      DungeonInstance.fromJSON({ ...instanceData, dungeonStore: this }),
    );
  }

  resetVolatileState() {
    this.currentInstance = undefined;
    this.currentLevel = undefined;
    this.currentMap = undefined;
    this.currentMapDimensions = undefined;
    this.currentPosition = undefined;
    this.inCombat = false;
    this.fightingBoss = false;
    this.movementQueued = false;
    this.fleeModalShowing = false;
    this.heldColorScheme = undefined;
    this.logs = [];
  }
}

const _dungeonInstanceSave = async (dungeon: DungeonInstance | undefined) => {
  if (dungeon) {
    try {
      storage.set(
        `dungeon_${dungeon.id}`,
        stringify({ ...dungeon, dungeonStore: null }),
      );
    } catch (e) {}
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
