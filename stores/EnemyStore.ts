import { parse } from "flatted";
import { Enemy } from "../entities/creatures";
import { storage } from "../utility/functions/storage";
import { RootStore } from "./RootStore";
import { action, makeObservable, observable } from "mobx";
import { AnimationStore } from "./AnimationStore";

export default class EnemyStore {
  enemies: Enemy[];
  saveReferenceMap: Map<string, number>;
  animationStoreMap: Map<string, AnimationStore>;
  attackAnimationsOnGoing: boolean;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    const retrieved_enemies: Enemy[] = [];
    let i = 1;
    let enemy;
    const map = new Map<string, number>();

    while ((enemy = storage.getString(`enemy_${i}`)) !== undefined) {
      const hydratedEnemy = Enemy.fromJSON({
        ...parse(enemy),
        enemyStore: this,
      });
      map.set(hydratedEnemy.id, i);
      retrieved_enemies.push(hydratedEnemy);
      i++;
    }

    this.attackAnimationsOnGoing = false;
    this.enemies = retrieved_enemies;
    this.saveReferenceMap = map;

    this.animationStoreMap = new Map();
    this.enemies.forEach((enemy) => {
      this.animationStoreMap.set(enemy.id, new AnimationStore());
    });

    this.root = root;

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
    this.saveReferenceMap.set(enemy.id, this.enemies.length);
    this.animationStoreMap.set(enemy.id, new AnimationStore());
  }

  public removeEnemy(enemy: Enemy) {
    this.saveReferenceMap.delete(enemy.id);
    this.animationStoreMap.delete(enemy.id);
    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
  }

  public clearEnemyList() {
    this.enemies = [];
    this.saveReferenceMap.clear();
    this.animationStoreMap.clear();
  }

  public getAnimationStore(enemyId: string): AnimationStore | undefined {
    return this.animationStoreMap.get(enemyId);
  }

  public getSaveReference(enemy: Enemy) {
    return this.saveReferenceMap.get(enemy.id);
  }
}
