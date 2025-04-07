import { parse, stringify } from "flatted";
import { Enemy, Minion } from "@/entities/creatures";
import { storage } from "@/utility/functions/storage";
import { RootStore } from "@/stores/RootStore";
import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import { EnemyAnimationStore } from "@/stores/EnemyAnimationStore";
import { BeingType, ItemClassType } from "@/utility/types";
import { Being } from "@/entities/being";
import { Character } from "@/entities/character";
import { getAnimatedSpriteForNPC } from "@/utility/functions/misc";
import { EnemyImageKeyOption } from "@/utility/animation/enemy";
import { jsonServiceStore } from "./SingletonSource";

export default class EnemyStore {
  enemies: Being[];
  animationStoreMap: Map<string, EnemyAnimationStore>;
  root: RootStore;

  constructor({ root }: { root: RootStore }) {
    this.root = root;

    const { enemies, map } = this.hydrateEnemies();

    this.enemies = enemies;
    this.animationStoreMap = map;

    __DEV__ && this.setupDevActions();

    makeObservable(this, {
      enemies: observable,
      animationStoreMap: observable,

      addToEnemyList: action,
      removeEnemy: action,
      clearEnemyList: action,
      _enemyTester: action,
      enemyTurnOngoing: computed,
      allBeings: computed,
      enemiesIDString: computed,
    });

    reaction(
      () => [this.enemies.length, this.animationStoreMap.size],
      () => {
        this.enemies.forEach((enemy) => this.saveEnemy(enemy));
      },
    );

    reaction(
      () => this.enemies.length,
      () => {
        if (this.enemies.length == 0) {
          this.clearEnemyList();
          this.root.dungeonStore.setInCombat(false);
        }
      },
    );
  }

  setupDevActions() {
    this.root.addDevAction([
      {
        action: (value: string) =>
          this._enemyTester(value.replaceAll("_", " ")),
        name: "Enemy tester",
        stringInput: true,
        autocompleteType: "enemyOptions",
      },
      {
        action: (value: string) => this._bossTester(value.replaceAll("_", " ")),
        name: "Boss tester",
        stringInput: true,
        autocompleteType: "bossOptions",
      },
    ]);
  }
  //TODO
  _enemyTester(val: string) {
    let enemyJSON = jsonServiceStore
      .readJsonFileSync("enemy")
      .find((json) => json.name == val);
    if (!enemyJSON) {
      console.error(`invalid enemy name: ${val}`);
      return;
    }
    const hp =
      Math.floor(
        Math.random() *
          (enemyJSON.healthRange.maximum - enemyJSON.healthRange.minimum + 1),
      ) + enemyJSON.healthRange.minimum;

    this.clearEnemyList();
    const enemy = new Enemy({
      beingType: enemyJSON.beingType as BeingType,
      creatureSpecies: enemyJSON.name,
      currentHealth: hp,
      baseHealth: hp,
      currentSanity: enemyJSON.sanity,
      baseSanity: enemyJSON.sanity,
      baseArmor: enemyJSON.armorValue,
      currentMana: enemyJSON.mana.maximum,
      baseMana: enemyJSON.mana.maximum,
      baseDamageTable: enemyJSON.baseDamageTable,
      baseResistanceTable: enemyJSON.baseResistanceTable,
      baseManaRegen: enemyJSON.mana.regen,
      goldDropRange: enemyJSON.goldDropRange,
      drops: enemyJSON.drops as {
        item: string;
        itemType: ItemClassType;
        chance: number;
      }[],
      attackStrings: enemyJSON.attackStrings,
      animationStrings: enemyJSON.animationStrings,
      sprite: enemyJSON.sprite as EnemyImageKeyOption,
      root: this.root,
    });

    this.enemies.push(enemy);
    this.animationStoreMap.set(
      enemy.id,
      new EnemyAnimationStore({
        root: this.root,
        sprite: enemy.sprite,
        id: enemy.id,
      }),
    );
    this.saveEnemy(enemy);
  }

  get enemiesIDString() {
    return this.enemies.map((enemy) => enemy.id);
  }

  _bossTester(val: string) {
    let bossJSON = jsonServiceStore
      .readJsonFileSync("bosses")
      .find((json) => json.name == val);
    if (!bossJSON) {
      console.error(`invalid enemy name: ${val}`);
      return;
    }

    this.clearEnemyList();
    const enemy = new Enemy({
      beingType: bossJSON.beingType as BeingType,
      creatureSpecies: bossJSON.name,
      currentHealth: bossJSON.health,
      baseHealth: bossJSON.health,
      currentSanity: bossJSON.sanity,
      baseSanity: bossJSON.sanity,
      baseArmor: bossJSON.armorValue,
      currentMana: bossJSON.mana.maximum,
      baseMana: bossJSON.mana.maximum,
      baseDamageTable: bossJSON.baseDamageTable,
      baseResistanceTable: bossJSON.baseResistanceTable,
      baseManaRegen: bossJSON.mana.regen,
      goldDropRange: bossJSON.goldDropRange,
      drops: bossJSON.drops as {
        item: string;
        itemType: ItemClassType;
        chance: number;
      }[],
      phases: bossJSON.phases,
      attackStrings: bossJSON.attackStrings,
      animationStrings: bossJSON.animationStrings,
      sprite: bossJSON.sprite as EnemyImageKeyOption,
      root: this.root,
    });

    this.enemies.push(enemy);
    this.animationStoreMap.set(
      enemy.id,
      new EnemyAnimationStore({
        root: this.root,
        sprite: enemy.sprite,
        id: enemy.id,
      }),
    );
    this.saveEnemy(enemy);
  }

  get allBeings(): Being[] {
    const beingSet = new Map<string, Being>();

    this.enemies.forEach((enemy) => {
      beingSet.set(enemy.id, enemy);

      if (enemy instanceof Enemy) {
        enemy.minions.forEach((minion) => {
          beingSet.set(minion.id, minion);
        });
      }
    });

    return Array.from(beingSet.values());
  }

  get enemyTurnOngoing() {
    const stores = Array.from(this.animationStoreMap.values());
    if (stores.length) {
      return (
        stores.some((store) => !store.isIdle) ||
        this.root.playerAnimationStore.playerTurnOngoing
      );
    } else return this.root.playerAnimationStore.playerTurnOngoing;
  }

  //TODO: return the id of the accociated animation store (or maybe enemy) or null
  //get enemyGivingDialogue(){
  //if( this.animationStoreMap.values().find((animStore)=>animStore.dialogue)){

  //}
  //}

  public addToEnemyList(enemy: Being) {
    if (!enemy.sprite) {
      if (enemy instanceof Character) {
        runInAction(() => (enemy.sprite = getAnimatedSpriteForNPC(enemy)));
      } else if (enemy instanceof Minion) {
        console.warn(`May want to add sprite to ${enemy.nameReference}`);
      } else {
        throw new Error(`No sprite on ${enemy.nameReference}`);
      }
    }

    this.enemies.push(enemy);
    this.animationStoreMap.set(
      enemy.id,
      new EnemyAnimationStore({
        root: this.root,
        sprite: enemy.sprite,
        id: enemy.id,
      }),
    );
    this.saveEnemy(enemy);
  }

  public removeEnemy(enemy: Being) {
    this.animationStoreMap.delete(enemy.id);
    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
    this.clearPersistedEnemy(enemy.id);
  }

  public clearEnemyList() {
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
      const enemy = Enemy.fromJSON({ ...parse(retrieved), root: this.root });
      if (!enemy.sprite) {
        throw new Error(`No sprite on ${enemy.nameReference}`);
      }
      map.set(
        enemy.id,
        new EnemyAnimationStore({
          root: this.root,
          sprite: enemy.sprite,
          id: enemy.id,
        }),
      );
      enemies.push(enemy);
    });
    return { enemies, map };
  }

  public getAnimationStore(enemyId: string): EnemyAnimationStore | undefined {
    return this.animationStoreMap.get(enemyId);
  }

  public saveEnemy = (enemy: Being) => {
    const str = this.enemies.map((enemy) => enemy.id);

    storage.set("enemyIDs", stringify(str));
    try {
      storage.set(
        `enemy_${enemy?.id}`,
        stringify({ ...enemy, enemyStore: null }),
      );
    } catch (e) {
      __DEV__ && console.error(e);
    }
  };

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

  clearPersistedEnemy(enemyId: string) {
    storage.delete(`enemy_${enemyId}`);

    const storedIds = storage.getString("enemyIDs");
    if (storedIds) {
      const ids = parse(storedIds) as string[];
      const updatedIds = ids.filter((id) => id !== enemyId);
      storage.set("enemyIDs", stringify(updatedIds));
    }
  }
}
