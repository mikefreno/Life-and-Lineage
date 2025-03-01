import { parse, stringify } from "flatted";
import { Enemy } from "../entities/creatures";
import { storage } from "../utility/functions/storage";
import { RootStore } from "./RootStore";
import { action, makeObservable, observable, reaction } from "mobx";
import { throttle } from "lodash";
import { EnemyAnimationStore } from "./EnemyAnimationStore";

export default class EnemyStore {
  enemies: Enemy[];
  animationStoreMap: Map<string, EnemyAnimationStore>;
  attackAnimationsOnGoing: boolean = false;
  deathAnimationsOnGoing: boolean = false;
  attackAnimationCount: number = 0;
  deathAnimationsCount: number = 0;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    const { enemies, map } = this.hydrateEnemies();

    this.enemies = enemies;
    this.animationStoreMap = map;

    makeObservable(this, {
      enemies: observable,
      attackAnimationsOnGoing: observable,
      addToEnemyList: action,
      setAttackAnimationOngoing: action,
      removeEnemy: action,
      clearEnemyList: action,
      attackAnimationCount: observable,
      deathAnimationsCount: observable,
      incrementAttackAnimations: action,
      decrementAttackAnimations: action,
      decrementDeathAnimations: action,
      incrementDeathAnimations: action,
    });

    reaction(
      () => [this.enemies.length, this.animationStoreMap.size],
      () => {
        this.enemies.forEach((enemy) => this.saveEnemy(enemy));
      },
    );

    reaction(
      () => [
        this.deathAnimationsCount,
        this.attackAnimationCount,
        this.enemies.length,
      ],
      () => {
        if (
          this.deathAnimationsCount == 0 &&
          this.attackAnimationCount == 0 &&
          this.enemies.length == 0
        ) {
          this.root.dungeonStore.setInCombat(false);
        }
      },
    );
  }

  incrementAttackAnimations() {
    this.attackAnimationCount++;
    this.setAttackAnimationOngoing(true);
  }

  decrementAttackAnimations() {
    this.attackAnimationCount--;
    if (this.attackAnimationCount <= 0) {
      this.attackAnimationCount = 0;
      this.setAttackAnimationOngoing(false);
    }
  }

  incrementDeathAnimations() {
    this.deathAnimationsCount++;
    this.setDeathAnimationOngoing(true);
  }

  decrementDeathAnimations() {
    this.deathAnimationsCount--;
    if (this.deathAnimationsCount <= 0) {
      this.deathAnimationsCount = 0;
      this.setDeathAnimationOngoing(false);
      if (this.root.enemyStore.enemies.length == 0) {
        this.root.dungeonStore.setInCombat(false);
      }
    }
  }

  public setAttackAnimationOngoing(state: boolean) {
    this.attackAnimationsOnGoing = state;
  }
  public setDeathAnimationOngoing(ongoing: boolean) {
    this.deathAnimationsOnGoing = ongoing;
  }

  public addToEnemyList(enemy: Enemy) {
    this.enemies.push(enemy);
    this.animationStoreMap.set(
      enemy.id,
      new EnemyAnimationStore({ root: this.root }),
    );
    this.enemySave(enemy);
  }

  public removeEnemy(enemy: Enemy) {
    this.animationStoreMap.delete(enemy.id);
    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
    this.clearPersistedEnemy(enemy.id);
  }

  public clearEnemyList() {
    this.setAttackAnimationOngoing(false);
    this.enemies = [];
    this.animationStoreMap.clear();
    this.clearPersistedEnemies();
  }

  public hydrateEnemies() {
    const storedIds = storage.getString("enemyIDs");
    const map = new Map<string, EnemyAnimationStore>();
    if (!storedIds) {
      return { enemies: [], map };
    }
    const enemies: Enemy[] = [];
    (parse(storedIds) as string[]).forEach((str) => {
      const retrieved = storage.getString(`enemy_${str}`);
      if (!retrieved) return;
      const enemy = Enemy.fromJSON({ ...parse(retrieved), enemyStore: this });
      map.set(enemy.id, new EnemyAnimationStore({ root: this.root }));
      enemies.push(enemy);
    });
    return { enemies, map };
  }

  public getAnimationStore(enemyId: string): EnemyAnimationStore | undefined {
    return this.animationStoreMap.get(enemyId);
  }

  private enemySave = async (enemy: Enemy) => {
    const str = this.enemies.map((enemy) => enemy.id);

    storage.set("enemyIDs", stringify(str));
    try {
      storage.set(
        `enemy_${enemy?.id}`,
        stringify({ ...enemy, enemyStore: null }),
      );
    } catch (e) {}
  };

  public saveEnemy = throttle(this.enemySave, 250);

  private clearPersistedEnemies() {
    storage.delete("enemyIDs");

    const allKeys = storage.getAllKeys();
    if (allKeys) {
      allKeys.forEach((key) => {
        if (key.startsWith("enemy_")) {
          storage.delete(key);
        }
      });
    }
  }

  private clearPersistedEnemy(enemyId: string) {
    storage.delete(`enemy_${enemyId}`);

    const storedIds = storage.getString("enemyIDs");
    if (storedIds) {
      const ids = parse(storedIds) as string[];
      const updatedIds = ids.filter((id) => id !== enemyId);
      storage.set("enemyIDs", stringify(updatedIds));
    }
  }
}
