import { DungeonInstance, DungeonLevel } from "../entities/dungeon";
import type { RootStore } from "./RootStore";
import dungeonsJSON from "../assets/json/dungeons.json";
import { storage } from "../utility/functions/storage";
import { parse, stringify } from "flatted";
import { throttle } from "lodash";

export class DungeonStore {
  dungeonInstances: DungeonInstance[];
  root: RootStore;

  activityInstance: DungeonInstance;

  constructor({ root }: { root: RootStore }) {
    this.dungeonInstances = this.hydrateDungeonState();
    this.activityInstance = this.initActivityDungeon();
    this.root = root;
  }

  public getDungeonLevel(
    instance: string,
    level: string,
  ): DungeonLevel | undefined {
    const foundInstance = this.dungeonInstances.find(
      (dungeonInstance) => dungeonInstance.name == instance,
    );
    if (foundInstance) {
      const found = foundInstance.levels.find(
        (dungeonLevel) => dungeonLevel.level == Number(level),
      );
      return found;
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
      });
    }
  }

  hydrateDungeonState() {
    const ids = dungeonsJSON.map((inst) => inst.id);
    const dungeonInstances: DungeonInstance[] = [];
    ids.forEach((id) => {
      const retrieved = storage.getString(`dungeon_${id}`);
      if (retrieved) {
        dungeonInstances.push(DungeonInstance.fromJSON(parse(retrieved)));
      }
    });
    return dungeonInstances.length > 0
      ? dungeonInstances
      : this.getInitDungeonState();
  }

  getInitDungeonState() {
    const nearbyCave = DungeonInstance.fromJSON({
      ...dungeonsJSON.find((inst) => inst.name == "nearby cave"),
      root: this,
    });
    const trainingGrounds = DungeonInstance.fromJSON({
      ...dungeonsJSON.find((inst) => inst.name == "training grounds"),
      root: this,
    });

    _dungeonInstanceSave(nearbyCave);
    _dungeonInstanceSave(trainingGrounds);

    return [trainingGrounds, nearbyCave];
  }

  setActivityName(name: string) {
    this.activityInstance.name = name;
  }

  initActivityDungeon() {
    const activityDungeon = new DungeonLevel({
      level: 0,
      boss: [],
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
