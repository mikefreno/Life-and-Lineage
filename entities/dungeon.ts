import { Enemy, itemList } from "./creatures";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { DungeonStore, saveDungeonInstance } from "../stores/DungeonStore";
import enemiesJSON from "../assets/json/enemy.json";
import bossesJSON from "../assets/json/bosses.json";
import type { BeingType, ItemClassType } from "../utility/types";
import { ParallaxOptions } from "../components/DungeonComponents/Parallax";
import { EnemyImageKeyOption, EnemyImageMap } from "../utility/enemyHelpers";
import specialEncountersJSON from "../assets/json/specialEncounters.json";
import { Item, isStackable } from "./item";
import { getRandomInt } from "../utility/functions/misc";

interface DungeonLevelOptions {
  level: number;
  bossEncounter: { name: string; scaler: number }[];
  normalEncounters: { name: string; scaler: number }[][];
  specialEncounters: {
    name: string;
    countChances: {
      [key: string]: number;
    };
    scaler: number;
  }[];
  tiles: number;
  unlocked?: boolean;
  bossDefeated?: boolean;
  parent: DungeonInstance;
  dungeonStore: DungeonStore;
  parallaxOverride?: ParallaxOptions;
  levelDrops?: {
    item: string;
    itemType: ItemClassType;
    chance: number;
  }[];
}

interface DungeonInstanceOptions {
  id: number;
  bgName: ParallaxOptions;
  name: string;
  difficulty: number;
  unlocks: string[];
  levels: DungeonLevel[];
  dungeonStore: DungeonStore;
  instanceDrops?: {
    item: string;
    itemType: ItemClassType;
    chance: number;
  }[];
}

/**
 * This is the top level and in combination with the DungeonLevel, creates what a player experiences as a Dungeon. It holds levels
 * Which are the individual levels. These are created when the last in range is cleared as dictated by the dungeons.json
 */
export class DungeonInstance {
  readonly id: number;
  readonly bgName: ParallaxOptions;
  name: string;
  readonly difficulty: number;
  levels: DungeonLevel[];
  readonly unlocks: string[];
  dungeonStore: DungeonStore;
  readonly instanceDrops: {
    item: string;
    itemType: ItemClassType;
    chance: number;
  }[];

  constructor({
    id,
    bgName,
    name,
    difficulty,
    levels,
    unlocks,
    dungeonStore,
    instanceDrops,
  }: DungeonInstanceOptions) {
    this.id = id;
    this.bgName = bgName;
    this.name = name;
    this.difficulty = difficulty;
    this.levels = levels.map((level: any) =>
      DungeonLevel.fromJSON({ ...level, dungeonStore, parent: this }),
    );
    this.unlocks = unlocks;
    this.dungeonStore = dungeonStore;
    this.instanceDrops = instanceDrops ?? [];

    makeObservable(this, {
      levels: observable.deep,
      setLevels: action,
      unlockNextLevel: action,
    });

    reaction(
      () => [this.levels],
      () => saveDungeonInstance(this),
    );
  }

  public unlockNextLevel() {
    let currentMaxDepth = 0;
    this.levels.forEach((level) => {
      if (level.level > currentMaxDepth && level.unlocked) {
        currentMaxDepth = level.level;
      }
    });
    for (const level of this.levels) {
      if (level.level === currentMaxDepth + 1) {
        level.unlock();
        return true;
      }
    }
    return false;
  }

  /**
   * Use this for activity / assault instance set up
   */
  public setLevels(levels: DungeonLevel[]) {
    this.levels = levels;
  }

  static fromJSON(json: any): DungeonInstance {
    const instance = new DungeonInstance({
      id: json.id,
      bgName: json.bgName,
      name: json.name,
      difficulty: json.difficulty,
      levels: json.levels,
      unlocks: json.unlocks,
      dungeonStore: json.dungeonStore,
      instanceDrops: json.instanceDrops,
    });

    return instance;
  }
}

/**
 * This is at time of writing very simple, I plan on implementing the map logic to this class, maybe with a shaking function, maybe with the
 * map saved in state.
 */
export class DungeonLevel {
  readonly level: number;
  readonly bossEncounter: {
    name: string;
    scaler: number;
    spriteOverride?: string;
  }[];
  readonly normalEncounters: {
    name: string;
    scaler: number;
    spriteOverride?: string[];
  }[][];
  readonly specialEncounters: SpecialEncounter[];
  readonly tiles: number;
  unlocked: boolean;
  bossDefeated: boolean;
  parent: DungeonInstance;
  dungeonStore: DungeonStore;
  parallaxOverride: ParallaxOptions | null;
  readonly levelDrops: {
    item: string;
    itemType: ItemClassType;
    chance: number;
  }[];

  constructor({
    level,
    bossEncounter,
    normalEncounters,
    specialEncounters,
    tiles,
    bossDefeated,
    unlocked,
    parent,
    parallaxOverride,
    dungeonStore,
    levelDrops,
  }: DungeonLevelOptions) {
    this.level = level;
    this.bossEncounter = bossEncounter;
    this.normalEncounters = normalEncounters;
    this.specialEncounters = specialEncounters
      ? specialEncounters.map(
          (enc) => new SpecialEncounter({ name: enc.name, scaler: enc.scaler }),
        )
      : [];
    this.tiles = tiles;
    this.unlocked = unlocked ?? false;
    this.bossDefeated = bossDefeated ?? false;
    this.parent = parent;
    this.parallaxOverride = parallaxOverride ?? null;
    this.dungeonStore = dungeonStore;
    this.levelDrops = levelDrops ?? [];

    makeObservable(this, {
      unlocked: observable,
      bossDefeated: observable,
      generateBossEncounter: computed,
      generateNormalEncounter: computed,
      setBossDefeated: action,
    });

    reaction(
      () => [this.unlocked, this.bossDefeated],
      () => saveDungeonInstance(parent),
    );
  }

  public unlock() {
    this.unlocked = true;
  }

  public setBossDefeated() {
    this.bossDefeated = true;
  }

  get generateNormalEncounter(): Enemy[] {
    if (this.normalEncounters.length == 0)
      throw new Error("No normal encounters");
    const fightIdx = Math.floor(Math.random() * this.normalEncounters.length);
    const enemiesSpec = this.normalEncounters[fightIdx];
    const enemies = enemiesSpec.map((enemySpec) => {
      let enemyJSON = JSON.parse(
        JSON.stringify(enemiesJSON.find((json) => json.name == enemySpec.name)),
      );
      if (!enemyJSON) {
        throw new Error(`missing enemy: ${enemySpec.name}`);
      }
      if (enemySpec.scaler != 1) {
        enemyJSON.goldDropRange.minimum *= enemySpec.scaler;
        enemyJSON.goldDropRange.maximum *= enemySpec.scaler;
        enemyJSON.healthRange.minimum *= enemySpec.scaler;
        enemyJSON.healthRange.maximum *= enemySpec.scaler;
        enemyJSON.attackPowerRange.minimum *= enemySpec.scaler;
        enemyJSON.attackPowerRange.maximum *= enemySpec.scaler;
      }
      const hp =
        Math.floor(
          Math.random() *
            (enemyJSON.healthRange.maximum - enemyJSON.healthRange.minimum + 1),
        ) + enemyJSON.healthRange.minimum;
      const ap =
        Math.floor(
          Math.random() *
            (enemyJSON.attackPowerRange.maximum -
              enemyJSON.attackPowerRange.minimum +
              1),
        ) + enemyJSON.attackPowerRange.minimum;
      let sprite: string | undefined;
      if (enemySpec.spriteOverride) {
        sprite =
          enemySpec.spriteOverride[
            Math.floor(Math.random() * enemySpec.spriteOverride.length)
          ];
      } else {
        sprite = enemyJSON.defaultSprite;
      }
      if (!sprite || !(sprite in EnemyImageMap)) {
        throw new Error(`Missing sprite on ${enemyJSON.name}`);
      }

      return new Enemy({
        beingType: enemyJSON.beingType as BeingType,
        creatureSpecies: enemyJSON.name,
        currentHealth: hp,
        baseHealth: hp,
        currentSanity: enemyJSON.sanity,
        baseSanity: enemyJSON.sanity,
        attackPower: ap,
        baseArmor: enemyJSON.armorValue,
        currentEnergy: enemyJSON.energy.maximum,
        baseEnergy: enemyJSON.energy.maximum,
        energyRegen: enemyJSON.energy.regen,
        goldDropRange: enemyJSON.goldDropRange,
        drops: enemyJSON.drops,
        attackStrings: enemyJSON.attackStrings,
        sprite: sprite as EnemyImageKeyOption,
        enemyStore: this.dungeonStore.root.enemyStore,
      });
    });
    return enemies;
  }

  get generateBossEncounter(): Enemy[] {
    const bosses = this.bossEncounter.map((bossSpec) => {
      let bossJSON = bossesJSON.find((json) => json.name == bossSpec.name);
      if (!bossJSON) {
        throw new Error(`missing enemy: ${bossSpec.name}`);
      }

      // Create a deep copy of the boss JSON to avoid modifying the original
      let scaledBossJSON = JSON.parse(JSON.stringify(bossJSON));

      if (bossSpec.scaler != 1) {
        scaledBossJSON.goldDropRange.minimum *= bossSpec.scaler;
        scaledBossJSON.goldDropRange.maximum *= bossSpec.scaler;
        scaledBossJSON.health *= bossSpec.scaler;
        scaledBossJSON.attackPower *= bossSpec.scaler;
        scaledBossJSON.energy.maximum *= bossSpec.scaler;
        scaledBossJSON.energy.regen *= bossSpec.scaler;
      }

      return new Enemy({
        beingType: scaledBossJSON.beingType as BeingType,
        creatureSpecies: scaledBossJSON.name,
        currentHealth: scaledBossJSON.health,
        baseHealth: scaledBossJSON.health,
        currentSanity: scaledBossJSON.sanity,
        baseSanity: scaledBossJSON.sanity,
        attackPower: scaledBossJSON.attackPower,
        baseArmor: scaledBossJSON.armorValue,
        currentEnergy: scaledBossJSON.energy.maximum,
        baseEnergy: scaledBossJSON.energy.maximum,
        energyRegen: scaledBossJSON.energy.regen,
        attackStrings: scaledBossJSON.attackStrings,
        storyItems: scaledBossJSON.storyDrops,
        goldDropRange: scaledBossJSON.goldDropRange,
        drops: scaledBossJSON.drops,
        sprite: scaledBossJSON.sprite as EnemyImageKeyOption,
        enemyStore: this.dungeonStore.root.enemyStore,
      });
    });
    return bosses;
  }

  static fromJSON(json: any): DungeonLevel {
    const level = new DungeonLevel({
      level: json.level,
      bossEncounter: json.bossEncounter,
      normalEncounters: json.normalEncounters,
      specialEncounters: json.specialEncounters,
      tiles: json.tiles,
      bossDefeated: json.bossDefeated,
      unlocked: json.unlocked ? json.unlocked : json.level == 1 ? true : false,
      parent: json.parent,
      dungeonStore: json.dungeonStore,
      levelDrops: json.levelDrops,
    });
    level.specialEncounters.forEach((encounter) => encounter.setParent(level));
    return level;
  }
}

interface SpecialEncounterOutcome {
  chance: number;
  message: string;
  result: {
    drops?: {
      name: string;
      itemType: string;
      chance: number;
    }[];
    gold?: {
      min: number;
      max: number;
    };
    battle?: string[];
    effect?: {
      [stat: string]: number;
    };
  } | null;
}

export class SpecialEncounter {
  readonly countChances: Record<string, number>;
  readonly name: string;
  readonly prompt: string;
  readonly image: string;
  readonly scaler: number;
  readonly goodOutcome: SpecialEncounterOutcome;
  readonly badOutcome: SpecialEncounterOutcome;
  readonly neutralOutcome: SpecialEncounterOutcome;
  activated: boolean;
  parentLevel: DungeonLevel | null;

  constructor({
    name,
    scaler,
    countChances,
    activated,
  }: {
    name: string;
    scaler: number;
    countChances: Record<string, number>;
    activated?: boolean;
  }) {
    this.countChances = countChances;
    this.name = name;
    this.scaler = scaler;
    this.parentLevel = null;
    this.activated = activated ?? false;
    const encounter = specialEncountersJSON.find(
      (encounter) => encounter.name === name,
    );
    if (!encounter) {
      throw new Error(`Special encounter details not found for: ${name}`);
    }
    this.prompt = encounter.prompt;
    this.goodOutcome = encounter.goodOutcome ?? {
      chance: 0,
      message: "",
      result: null,
    };
    this.badOutcome = encounter.badOutcome ?? {
      chance: 0,
      message: "",
      result: null,
    };
    this.neutralOutcome = encounter.neutralOutcome ?? {
      chance: 0,
      message: "",
      result: null,
    };
    this.image = encounter.image;

    makeObservable(this, {
      activated: observable,
      parentLevel: observable,
      setParent: action,
      activate: action,
    });
  }

  get countForLevel() {
    const random = Math.random();
    let sum = 0;

    for (const [key, probability] of Object.entries(this.countChances)) {
      sum += probability;
      if (random <= sum) {
        return Number.parseInt(key);
      }
    }

    return Number.parseInt(
      Object.keys(this.countChances)[Object.keys(this.countChances).length - 1],
    );
  }

  public activate() {
    const random = Math.random();
    let cumulative = 0;

    const outcomes = [
      { type: "good", ...this.goodOutcome },
      { type: "neutral", ...this.neutralOutcome },
      { type: "bad", ...this.badOutcome },
    ];

    for (const outcome of outcomes) {
      cumulative += outcome.chance;
      if (random <= cumulative) {
        this.activated = true;
        return this.processOutcome(outcome);
      }
    }

    throw new Error(`Outcome selection failure on ${this.name}`);
  }

  private processOutcome(outcome: SpecialEncounterOutcome) {
    let drops: Item[] = [];
    let gold: number | undefined;
    let enemies: Enemy[] = [];
    let health: number | undefined;
    let mana: number | undefined;
    let sanity: number | undefined;
    const root = this.parentLevel?.parent.dungeonStore.root;
    if (!root) {
      throw new Error("Missing root link in SpecialEncounter");
    }
    if (outcome.result?.drops) {
      for (const potentialDrop of outcome.result.drops) {
        const roll = Math.random();
        if (roll >= 1 - potentialDrop.chance) {
          const items = itemList(
            potentialDrop.itemType as ItemClassType,
            root.playerState?.playerClass!,
          );
          const itemObj = items.find(
            (item) => item.name === potentialDrop.name,
          );
          if (itemObj) {
            drops.push(
              Item.fromJSON({
                ...itemObj,
                itemClass: potentialDrop.itemType,
                stackable: isStackable(potentialDrop.itemType as ItemClassType),
                root,
              }),
            );
          }
        }
      }
    }
    if (outcome.result?.gold) {
      gold = getRandomInt(outcome.result.gold.min, outcome.result.gold.max);
    }
    if (outcome.result?.battle) {
      enemies = outcome.result.battle.map((enemy) => {
        let enemyJSON = JSON.parse(
          JSON.stringify(enemiesJSON.find((json) => json.name == enemy)),
        );
        if (!enemyJSON) {
          throw new Error(`missing enemy: ${enemy}`);
        }
        if (this.scaler != 1) {
          enemyJSON.goldDropRange.minimum *= this.scaler;
          enemyJSON.goldDropRange.maximum *= this.scaler;
          enemyJSON.healthRange.minimum *= this.scaler;
          enemyJSON.healthRange.maximum *= this.scaler;
          enemyJSON.attackPowerRange.minimum *= this.scaler;
          enemyJSON.attackPowerRange.maximum *= this.scaler;
        }
        const hp =
          Math.floor(
            Math.random() *
              (enemyJSON.healthRange.maximum -
                enemyJSON.healthRange.minimum +
                1),
          ) + enemyJSON.healthRange.minimum;
        const ap =
          Math.floor(
            Math.random() *
              (enemyJSON.attackPowerRange.maximum -
                enemyJSON.attackPowerRange.minimum +
                1),
          ) + enemyJSON.attackPowerRange.minimum;

        return new Enemy({
          beingType: enemyJSON.beingType as BeingType,
          creatureSpecies: enemyJSON.name,
          currentHealth: hp,
          baseHealth: hp,
          currentSanity: enemyJSON.sanity,
          baseSanity: enemyJSON.sanity,
          attackPower: ap,
          baseArmor: enemyJSON.armorValue,
          currentEnergy: enemyJSON.energy.maximum,
          baseEnergy: enemyJSON.energy.maximum,
          energyRegen: enemyJSON.energy.regen,
          goldDropRange: enemyJSON.goldDropRange,
          drops: enemyJSON.drops,
          attackStrings: enemyJSON.attackStrings,
          sprite: enemyJSON.sprite as EnemyImageKeyOption,
          enemyStore: root.enemyStore,
        });
      });
    }
    if (outcome.result?.effect) {
      const healthEffect = outcome.result.effect["health"];
      const manaEffect = outcome.result.effect["mana"];
      const sanityEffect = outcome.result.effect["sanity"];
      if (healthEffect) {
        root.playerState?.restoreHealth(healthEffect);
        health = healthEffect;
      }
      if (manaEffect) {
        root.playerState?.restoreMana(manaEffect);
        mana = manaEffect;
      }
      if (sanityEffect) {
        root.playerState?.restoreSanity(sanityEffect);
        sanity = sanityEffect;
      }
    }
    return {
      message: outcome.message,
      health,
      sanity,
      mana,
      drops: drops.length > 0 ? drops : undefined,
      gold,
      enemies: enemies.length > 0 ? enemies : undefined,
    };
  }

  public setParent(level: DungeonLevel) {
    this.parentLevel = level;
  }

  static fromJSON(json: any) {
    return new SpecialEncounter({
      name: json.name,
      scaler: json.scaler,
      countChances: json.countChances,
    });
  }
}
