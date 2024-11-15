import { parse, stringify } from "flatted";
import { Enemy } from "../entities/creatures";
import { storage } from "../utility/functions/storage";
import { RootStore } from "./RootStore";
import { action, makeObservable, observable } from "mobx";
import { AnimationStore } from "./AnimationStore";
import { throttle } from "lodash";

export default class EnemyStore {
  enemies: Enemy[];
  animationStoreMap: Map<string, AnimationStore>;
  attackAnimationsOnGoing: boolean;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    this.attackAnimationsOnGoing = false;

    const { enemies, map } = this.hydrateEnemies();

    this.enemies = enemies;
    this.animationStoreMap = map;

    makeObservable(this, {
      enemies: observable,
      addToEnemyList: action,
      removeEnemy: action,
      clearEnemyList: action,
    });
  }
  set attackAnimationSet(state: boolean) {
    this.attackAnimationsOnGoing = state;
  }

  public addToEnemyList(enemy: Enemy) {
    this.enemies.push(enemy);
    this.animationStoreMap.set(enemy.id, new AnimationStore());
  }

  public removeEnemy(enemy: Enemy) {
    this.animationStoreMap.delete(enemy.id);
    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
  }

  public clearEnemyList() {
    this.enemies = [];
    this.animationStoreMap.clear();
  }

  public hydrateEnemies() {
    const storedIds = storage.getString("enemyIDs");
    const map = new Map<string, AnimationStore>();
    if (!storedIds) {
      return { enemies: [], map };
    }
    const enemies: Enemy[] = [];
    (parse(storedIds) as string[]).forEach((str) => {
      const retrieved = storage.getString(`enemy_${str}`);
      if (!retrieved) return;
      const enemy = Enemy.fromJSON({ ...parse(retrieved), root: this.root });
      map.set(enemy.id, new AnimationStore());
      enemies.push(enemy);
    });
    return { enemies, map };
  }

  public getAnimationStore(enemyId: string): AnimationStore | undefined {
    return this.animationStoreMap.get(enemyId);
  }

  private enemySave = async (enemy: Enemy) => {
    const str = this.enemies.map((enemy) => enemy.id);
    storage.set("enemyIDs", stringify(str));
    try {
      storage.set(`enemy_${enemy?.id}`, stringify({ ...enemy, root: null }));
    } catch (e) {
      console.log("Error in _playerSave:", e);
    }
  };
  public saveEnemy = throttle(this.enemySave, 250);
}
