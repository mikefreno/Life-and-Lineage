import { parse } from "flatted";
import { Enemy } from "../entities/creatures";
import { storage } from "../utility/functions/storage";
import { RootStore } from "./RootStore";
import { action, makeObservable, observable } from "mobx";

export default class EnemyStore {
  enemies: Enemy[];
  referenceMap: Map<string, number>;
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
    this.enemies = retrieved_enemies;
    this.referenceMap = map;
    this.root = root;

    makeObservable(this, {
      enemies: observable,
      addToEnemyList: action,
      removeEnemy: action,
      clearEnemyList: action,
    });
  }

  public clearEnemyList() {
    this.enemies = [];
  }

  public addToEnemyList(enemy: Enemy) {
    this.enemies.push(enemy);
    this.referenceMap.set(enemy.id, this.enemies.length);
  }

  public removeEnemy(enemy: Enemy) {
    this.referenceMap.delete(enemy.id);
    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
  }

  public getSaveReference(enemy: Enemy) {
    return this.referenceMap.get(enemy.id);
  }
}
