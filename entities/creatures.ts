import { Condition } from "./conditions";
import arrows from "../assets/json/items/arrows.json";
import artifacts from "../assets/json/items/artifacts.json";
import bodyArmors from "../assets/json/items/bodyArmor.json";
import bows from "../assets/json/items/bows.json";
import foci from "../assets/json/items/foci.json";
import hats from "../assets/json/items/hats.json";
import helmets from "../assets/json/items/helmets.json";
import ingredients from "../assets/json/items/ingredients.json";
import junk from "../assets/json/items/junk.json";
import poisons from "../assets/json/items/poison.json";
import potions from "../assets/json/items/potions.json";
import robes from "../assets/json/items/robes.json";
import shields from "../assets/json/items/shields.json";
import wands from "../assets/json/items/wands.json";
import melee from "../assets/json/items/melee.json";
import staves from "../assets/json/items/staves.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import mageBooks from "../assets/json/items/mageBooks.json";
import rangerBooks from "../assets/json/items/rangerBooks.json";
import storyItems from "../assets/json/items/storyItems.json";
import { Item, isStackable } from "./item";
import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from "mobx";
import summons from "../assets/json/summons.json";
import {
  ItemClassType,
  BeingType,
  PlayerClassOptions,
  parseDamageTypeObject,
} from "../utility/types";
import { getRandomInt } from "../utility/functions/misc";
import { PlayerCharacter } from "./character";
import { AnimationOptions } from "../utility/enemyHelpers";
import {
  CreatureOptions,
  EnemyOptions,
  MinionOptions,
  Phase,
} from "./entityTypes";
import { Being } from "./being";

/**
 * This class is used as a base class for `Enemy` and `Minion` and is not meant to be instantiated directly.
 * It contains properties and methods that are shared between enemies and minions.
 * Most of the attributes here are readonly.
 */
export class Creature extends Being {
  readonly creatureSpecies: string;

  constructor({ creatureSpecies, ...props }: CreatureOptions) {
    super(props);
    this.creatureSpecies = creatureSpecies;

    makeObservable(this, {
      id: observable,
      creatureSpecies: observable,
      nameReference: computed,
    });
  }

  get nameReference() {
    return this.creatureSpecies;
  }
}

/**
 * When entering a dungeon tile (room), one of these is created. At times there will be rooms with multi-enemies,
 * in this case i == 0 is set as the `Enemy` then i >= 1 is created as a `Minion` attached to the `Enemy`
 */
export class Enemy extends Creature {
  minions: Minion[];
  private phases: Phase[];
  currentPhase: number;
  gotDrops: boolean;

  animationStrings: { [key: string]: AnimationOptions };

  drops: {
    item: string;
    itemType: ItemClassType;
    chance: number;
  }[];
  goldDropRange: {
    minimum: number;
    maximum: number;
  };
  storyDrops?: {
    item: string;
  }[];

  constructor({
    minions,
    gotDrops,
    drops,
    goldDropRange,
    storyDrops,
    phases,
    animationStrings,
    ...props
  }: EnemyOptions) {
    super({
      ...props,
    });
    this.minions = minions
      ? minions.map((minion: any) =>
          Minion.fromJSON({ ...minion, parent: this }),
        )
      : [];
    this.animationStrings = animationStrings ?? [];
    this.gotDrops = gotDrops ?? false;
    this.drops = drops ?? [];
    this.goldDropRange = goldDropRange ?? { minimum: 0, maximum: 0 };
    this.storyDrops = storyDrops;

    this.phases =
      phases?.sort((a, b) => b.triggerHealth - a.triggerHealth) || [];
    this.currentPhase = -1;

    makeObservable(this, {
      minions: observable,
      drops: observable,
      goldDropRange: observable,
      storyDrops: observable,
      addMinion: action,
      removeMinion: action,
      getDrops: action,
      currentPhase: observable,
    });

    reaction(
      () => [
        this.currentHealth,
        this.minions,
        this.currentSanity,
        this.currentMana,
      ],
      () => {
        if (this.root) {
          this.root.enemyStore.saveEnemy(this);
        }
      },
    );

    reaction(
      () => this.currentHealth,
      () => {
        if (
          this.phases[this.currentPhase + 1] &&
          this.currentHealth / this.maxHealth <=
            this.phases[this.currentPhase + 1].triggerHealth
        ) {
          this.triggerPhaseTransition();
        }
      },
    );
  }

  private triggerPhaseTransition() {
    while (
      this.phases[this.currentPhase + 1] &&
      this.currentHealth / this.baseHealth <=
        this.phases[this.currentPhase + 1].triggerHealth
    ) {
      this.currentPhase++;
      const phase = this.phases[this.currentPhase];

      if (phase.sprite) {
        runInAction(() => (this.sprite = phase.sprite!));
      }
      if (phase.baseArmor) {
        runInAction(() => (this.baseArmor = phase.baseArmor!));
      }
      if (phase.attackStrings) {
        runInAction(() => (this.attackStrings = phase.attackStrings!));
      }
      if (phase.animationStrings) {
        runInAction(() => (this.animationStrings = phase.animationStrings));
      }
      if (phase.manaRegen) {
        runInAction(() => (this.baseManaRegen = phase.manaRegen!));
      }
      if (phase.baseDamageTable) {
        runInAction(
          () =>
            (this.baseDamageTable = parseDamageTypeObject(
              phase.baseDamageTable,
            )),
        );
      }
      if (phase.baseResistanceTable) {
        runInAction(
          () =>
            (this.baseResistanceTable = parseDamageTypeObject(
              phase.baseResistanceTable,
            )),
        );
      }

      if (phase.dialogue && this.root) {
        const animationStore = this.root.enemyStore.getAnimationStore(this.id);
        if (animationStore) {
          runInAction(() => (animationStore.dialogue = phase.dialogue));
        }
      }
    }
  }

  /**
   * Allows the enemy to take its turn.
   * @param player - The player object, minions are sourced from this as well.
   * @returns {Object} - An object indicating the result of the turn, including the chosen attack.
   */
  public takeTurn({ player }: { player: PlayerCharacter }) {
    return this._takeTurn({
      targets: [player],
      nameReference: this.nameReference,
    }); //this is done as a way to easily add additional effects, note this function in Minion
  }

  /**
   * Retrieves drops from the creature, if not already retrieved.
   * @param playerClass - The class of the player.
   * @param bossFight - Indicates if the fight is against a boss.
   * @returns An object containing item drops and gold.
   */
  public getDrops(player: PlayerCharacter, bossFight: boolean) {
    if (this.gotDrops) return { itemDrops: [], gold: 0, storyDrops: [] };

    let storyDrops: Item[] = [];
    if (bossFight && this.storyDrops) {
      this.storyDrops.forEach((drop) => {
        const storyItemObj = storyItems.find((item) => item.name === drop.item);
        if (storyItemObj) {
          const storyItem = Item.fromJSON({
            ...storyItemObj,
            itemClass: ItemClassType.StoryItem,
            stackable: false,
            root: this.root,
          });
          storyDrops.push(storyItem);
        }
      });
    }

    const gold = Math.round(
      getRandomInt(this.goldDropRange.minimum, this.goldDropRange.maximum),
    );

    let itemDrops: Item[] = [];

    // Process enemy-specific drops
    this.drops.forEach((drop) => {
      const roll = Math.random();
      if (roll > 1 - drop.chance) {
        const items = itemList(drop.itemType, player.playerClass);
        const itemObj = items.find((item) => item.name === drop.item);
        if (itemObj) {
          itemDrops.push(
            Item.fromJSON({
              ...itemObj,
              itemClass: drop.itemType,
              stackable: isStackable(drop.itemType),
              root: this.root,
            }),
          );
        }
      }
    });

    // Process instance-specific drops
    const currentInstance = this.root?.dungeonStore.currentInstance;
    if (currentInstance?.instanceDrops) {
      currentInstance.instanceDrops.forEach((drop) => {
        const roll = Math.random();
        if (roll > 1 - drop.chance) {
          const items = itemList(drop.itemType, player.playerClass);
          const itemObj = items.find((item) => item.name === drop.item);
          if (itemObj) {
            itemDrops.push(
              Item.fromJSON({
                ...itemObj,
                itemClass: drop.itemType,
                stackable: isStackable(drop.itemType),
                root: this.root,
              }),
            );
          }
        }
      });
    }

    // Process level-specific drops
    const currentLevel = this.root?.dungeonStore.currentLevel;
    if (currentLevel?.levelDrops) {
      currentLevel.levelDrops.forEach((drop) => {
        const roll = Math.random();
        if (roll > 1 - drop.chance) {
          const items = itemList(drop.itemType, player.playerClass);
          const itemObj = items.find((item) => item.name === drop.item);
          if (itemObj) {
            itemDrops.push(
              Item.fromJSON({
                ...itemObj,
                itemClass: drop.itemType,
                stackable: isStackable(drop.itemType),
                root: this.root,
              }),
            );
          }
        }
      });
    }

    this.gotDrops = true;
    return { itemDrops, gold, storyDrops };
  }

  //---------------------------Minions---------------------------//
  /**
   * Creates a minion of the specified type and adds it to the enemy's list of minions.
   * @param minionName - The name of the minion to create.
   * @returns The species (name) of the created minion.
   */
  public createMinion(minionName: string) {
    const minionObj = summons.find(
      (summon) => summon.name.toLowerCase() == minionName.toLowerCase(),
    );
    if (!minionObj) {
      throw new Error(`Minion (${minionName}) not found!`);
    }
    const minion = new Minion({
      creatureSpecies: minionObj.name,
      currentHealth: minionObj.health,
      baseHealth: minionObj.health,
      currentMana: minionObj.mana?.maximum,
      baseMana: minionObj.mana?.maximum,
      baseManaRegen: minionObj.mana?.regen,
      attackStrings: minionObj.attackStrings,
      turnsLeftAlive: minionObj.turns,
      baseStrength: minionObj.baseStrength,
      baseIntelligence: minionObj.baseIntelligence,
      baseDexterity: minionObj.baseDexterity,
      baseDamageTable: minionObj.baseDamageTable,
      baseResistanceTable: minionObj.baseResistanceTable,
      beingType: minionObj.beingType as BeingType,
      root: this.root,
      parent: this,
    });
    this.addMinion(minion);
    return minion.creatureSpecies;
  }

  /**
   * Adds a minion to the enemy's list of minions.
   * @param minion - The minion to add.
   */
  public addMinion(minion: Minion) {
    this.minions.push(minion);
  }

  /**
   * Removes a minion from the enemy's list of minions.
   * @param minionToRemove - The minion to remove.
   */
  public removeMinion(minionToRemove: Minion) {
    let newList: Minion[] = [];
    this.minions.forEach((minion) => {
      if (!minion.equals(minionToRemove.id)) {
        newList.push(minion);
      }
    });
    this.minions = newList;
  }

  /**
   * Creates an enemy from a JSON object.
   * @param json - The JSON object representing the enemy.
   * @returns The created enemy.
   */
  public static fromJSON(json: any): Enemy {
    return new Enemy({
      id: json.id,
      beingType: json.beingType,
      creatureSpecies: json.creatureSpecies,
      currentHealth: json.currentHealth,
      baseHealth: json.baseHealth,
      currentSanity: json.currentSanity,
      baseSanity: json.baseSanity,
      currentMana: json.currentMana,
      baseMana: json.baseMana,
      baseManaRegen: json.baseManaRegen,
      baseDamageTable: json.baseDamageTable,
      baseResistanceTable: json.baseResistanceTable,
      baseStrength: json.baseStrength,
      baseIntelligence: json.baseIntelligence,
      baseDexterity: json.baseDexterity,
      minions: json.minions
        ? json.minions.map((minion: any) => Minion.fromJSON(minion))
        : [],
      attackStrings: json.attackStrings,
      animationStrings: json.animationStrings,
      conditions: json.conditions
        ? json.conditions.map((condition: any) => Condition.fromJSON(condition))
        : [],
      sprite: json.sprite,
      drops: json.drops,
      storyDrops: json.storyDrops,
      goldDropRange: json.goldDropRange,
      phases: json.phases || [],
      root: json.root,
    });
  }
}

/**
 * While this is an extension of the `Creature`, same as the `Enemy`, this can be attached to the `PlayerCharacter` in addition the `Enemy`
 * The only extension this has over the base class is the `turnsLeftAlive` property.
 */
export class Minion extends Creature {
  /**
   * The number of turns left before the minion is destroyed.
   */
  turnsLeftAlive: number;
  private parent: Enemy | PlayerCharacter | null;

  constructor({ turnsLeftAlive, parent, ...props }: MinionOptions) {
    super(props);
    this.turnsLeftAlive = turnsLeftAlive;
    this.parent = parent;

    makeObservable(this, {
      turnsLeftAlive: observable,
      takeTurn: action,
    });

    reaction(
      () => [this.turnsLeftAlive, this.currentHealth],
      () => {
        if (this.turnsLeftAlive <= 0 || this.currentHealth <= 0) {
          this.parent?.removeMinion(this);
        }
      },
    );
  }

  /**
   * Allows the minion to take its turn, reducing its lifespan by one turn.
   * @param {Object} params - An object containing the target to attack.
   * @param {PlayerCharacter | Minion | Enemy} params.target - The target to attack.
   * @returns {Object} - An object indicating the result of the turn, including the chosen attack.
   * @throws {Error} If the minion's lifespan has reached zero.
   */
  public takeTurn({ targets }: { targets: Being[] }) {
    if (this.turnsLeftAlive > 0) {
      if (
        !(
          this.parent instanceof PlayerCharacter &&
          this.parent.rangerPet?.equals(this.id)
        )
      ) {
        this.turnsLeftAlive--;
      }
      return this._takeTurn({ targets, nameReference: this.nameReference });
    } else {
      throw new Error("Minion not properly removed!");
    }
  }

  /**
   * Creates a minion from a JSON object.
   * @param json - The JSON object representing the minion.
   * @returns The created minion.
   */
  static fromJSON(json: any): Minion {
    const minion = new Minion({
      id: json.id,
      beingType: json.beingType,
      creatureSpecies: json.creatureSpecies,
      currentHealth: json.currentHealth,
      baseHealth: json.baseHealth,
      currentSanity: json.currentSanity,
      baseSanity: json.baseSanity,
      currentMana: json.currentMana,
      baseMana: json.baseMana,
      baseManaRegen: json.baseManaRegen,
      baseDamageTable: json.baseDamageTable,
      baseResistanceTable: json.baseResistanceTable,
      baseStrength: json.baseStrength,
      baseIntelligence: json.baseIntelligence,
      baseDexterity: json.baseDexterity,
      turnsLeftAlive: json.turnsLeftAlive,
      attackStrings: json.attackStrings,
      conditions: json.conditions
        ? json.conditions.map((condition: any) => Condition.fromJSON(condition))
        : [],
      parent: json.parent,
      root: json.root,
    });
    return minion;
  }
}

export function itemList(
  itemType: ItemClassType,
  playerClass: PlayerClassOptions,
): {
  name: string;
  baseValue: number;
  slot?: string;
  attacks?: string[];
  icon?: string;
  stats?: Record<string, number | undefined> | null;
}[] {
  switch (itemType) {
    case ItemClassType.Artifact:
      return artifacts;
    case ItemClassType.Bow:
      return bows;
    case ItemClassType.Potion:
      return potions;
    case ItemClassType.Poison:
      return poisons;
    case ItemClassType.Junk:
      return junk;
    case ItemClassType.Ingredient:
      return ingredients;
    case ItemClassType.Wand:
      return wands;
    case ItemClassType.Focus:
      return foci;
    case ItemClassType.Melee:
      return melee;
    case ItemClassType.Shield:
      return shields;
    case ItemClassType.BodyArmor:
      return bodyArmors;
    case ItemClassType.Helmet:
      return helmets;
    case ItemClassType.Robe:
      return robes;
    case ItemClassType.Hat:
      return hats;
    case ItemClassType.Book:
      switch (playerClass) {
        case "necromancer":
          return necroBooks;
        case "mage":
          return mageBooks;
        case "paladin":
          return paladinBooks;
        case "ranger":
          return rangerBooks;
      }
    case ItemClassType.Arrow:
      return arrows;
    case ItemClassType.Staff:
      return staves;
    case ItemClassType.StoryItem:
      return storyItems;
    default:
      throw new Error("invalid itemType");
  }
}
