import attacks from "../assets/json/enemyAttacks.json";
import enemies from "../assets/json/enemy.json";
import bosses from "../assets/json/bosses.json";
import {
  getConditionEffectsOnDefenses,
  getConditionEffectsOnMisc,
  getMagnitude,
} from "../utility/functions/conditions";
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
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import mageBooks from "../assets/json/items/mageBooks.json";
import rangerBooks from "../assets/json/items/rangerBooks.json";
import * as Crypto from "expo-crypto";
import { Item, isStackable } from "./item";
import { action, autorun, makeObservable, observable } from "mobx";
import summons from "../assets/json/summons.json";
import { ItemClassType, BeingType, PlayerClassOptions } from "../utility/types";
import {
  rollD20,
  damageReduction,
  getRandomInt,
  toTitleCase,
} from "../utility/functions/misc";
import { Attack } from "./attack";
import { PlayerCharacter } from "./character";
import { AttackUse } from "../utility/types";
import { AggroTable } from "./aggro_table";

type CreatureType = {
  id?: string;
  beingType: BeingType;
  creatureSpecies: string;
  health: number;
  healthMax: number;
  sanity?: number | null;
  sanityMax?: number | null;
  attackPower: number;
  baseArmor?: number;
  energy?: number;
  energyMax?: number;
  energyRegen?: number;
  attacks: string[] | Attack[];
  conditions?: Condition[];
};

type EnemyType = CreatureType & {
  minions?: Minion[];
};

type MinionType = CreatureType & {
  turnsLeftAlive: number;
  parent: Enemy | PlayerCharacter;
};

/**
 * This class is used as a base class for `Enemy` and `Minion` and is not meant to be instantiated directly.
 * It contains properties and methods that are shared between enemies and minions.
 * Most of the attributes here are readonly.
 */
export class Creature {
  /**
   * Unique identifier for the creature
   */
  readonly id: string;

  /**
   * Type of being (e.g., humanoid, animal)
   */
  readonly beingType: BeingType;

  /**
   * Species of the creature
   */
  readonly creatureSpecies: string;

  /**
   * Current health of the creature
   */
  health: number;

  /**
   * Maximum health of the creature
   */
  readonly healthMax: number;

  /**
   * Current sanity of the creature (can be null)
   */
  sanity: number | null;

  /**
   * Maximum sanity of the creature (can be null)
   */
  readonly sanityMax: number | null;

  /**
   * Base attack power of the creature
   */
  readonly attackPower: number;

  /**
   * Base armor value of the creature
   */
  readonly baseArmor: number;

  /**
   * Current energy of the creature (can be null)
   */
  energy: number | null;

  /**
   * Maximum energy of the creature (can be null)
   */
  readonly energyMax: number | null;

  /**
   * Energy regeneration rate of the creature (can be null)
   */
  readonly energyRegen: number | null;

  /**
   * List of attacks the creature can perform
   */
  attacks: Attack[];

  /**
   * List of conditions affecting the creature
   */
  conditions: Condition[];

  /**
   * Flag indicating if the creature has dropped items
   */
  gotDrops: boolean;

  aggroTable: AggroTable;

  constructor({
    id,
    beingType,
    creatureSpecies,
    health,
    healthMax,
    sanity,
    sanityMax,
    attackPower,
    baseArmor,
    energy,
    energyMax,
    energyRegen,
    attacks,
    conditions,
  }: CreatureType) {
    this.id = id ?? Crypto.randomUUID(); // Assign a random UUID if id is not provided
    this.beingType = beingType;
    this.creatureSpecies = creatureSpecies;
    this.health = health;
    this.sanity = sanity ?? null; // Initialize sanity to null if not provided
    this.sanityMax = sanityMax ?? null; // Initialize sanityMax to null if not provided
    this.healthMax = healthMax;
    this.attackPower = attackPower;
    this.baseArmor = baseArmor ?? 0; // Default base armor to 0 if not provided
    this.energy = energy ?? null; // Initialize energy to null if not provided
    this.energyMax = energyMax ?? null; // Initialize energyMax to null if not provided
    this.energyRegen = energyRegen ?? null; // Initialize energyRegen to null if not provided
    this.attacks = this.initAttacks(attacks); // Initialize attacks
    this.conditions = conditions ?? []; // Initialize conditions to an empty array if not provided
    this.gotDrops = false; // Initialize gotDrops to false

    this.aggroTable = new AggroTable();
    makeObservable(this, {
      id: observable,
      health: observable,
      creatureSpecies: observable,
      sanity: observable,
      energy: observable,
      conditions: observable,
      damageHealth: action,
      restoreHealth: action,
      damageSanity: action,
      addCondition: action,
      conditionTicker: action,
      getDrops: action,
      equals: action,
      regenerate: action,
      expendEnergy: action,
    });
  }

  //---------------------------Equivalency---------------------------//
  public equals(otherMonsterID: string) {
    return this.id === otherMonsterID;
  }
  //---------------------------Health---------------------------//
  /**
   * Calculates the maximum health of the creature considering any condition effects.
   * @returns The maximum health value.
   */
  public getMaxHealth() {
    const { healthMult, healthFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return this.healthMax * healthMult + healthFlat;
  }

  /**
   * Damages the creature's health by the specified amount.
   * @param damage - The amount of damage to apply. If null, defaults to 0.
   * @param attackerId - The id of the attacker
   * @returns The new health value after applying the damage.
   */
  public damageHealth({
    damage,
    attackerId,
  }: {
    damage: number | null;
    attackerId: string;
  }): number {
    this.health -= damage ?? 0;
    this.aggroTable.addAggro(attackerId, damage ?? 0);

    return this.health;
  }

  /**
   * Restores the creature's health by the specified amount, up to the maximum health.
   * @param amount - The amount of health to restore.
   * @returns The actual amount of health restored.
   */
  public restoreHealth(amount: number) {
    if (this.health + amount < this.healthMax) {
      this.health += amount;
      return amount;
    } else {
      const amt = this.healthMax - this.health;
      this.health = this.healthMax;
      return amt;
    }
  }
  //---------------------------Sanity---------------------------//
  /**
   * Calculates the maximum sanity of the creature considering any condition effects.
   * @returns The maximum sanity value, or null if sanityMax is not set.
   */
  public getMaxSanity() {
    const { sanityMult, sanityFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return this.sanityMax ? this.sanityMax * sanityMult + sanityFlat : null;
  }

  /**
   * Damages the creature's sanity by the specified amount.
   * @param damage - The amount of sanity damage to apply. If not provided, defaults to 0.
   * @returns The new sanity value after applying the damage, or null if sanity is not set.
   */
  public damageSanity(damage?: number | null) {
    if (this.sanity) {
      this.sanity -= damage ?? 0;
      return this.sanity;
    }
  }
  //---------------------------Energy---------------------------//
  /**
   * Regenerates the creature's energy based on its regeneration rate.
   */
  public regenerate() {
    if (this.energy && this.energyRegen && this.energyMax) {
      if (this.energy + this.energyRegen >= this.energyMax) {
        this.energy = this.energyMax;
      } else {
        this.energy += this.energyRegen;
      }
    }
  }

  /**
   * Expends the creature's energy by the specified amount.
   * @param energyCost - The amount of energy to expend.
   */
  public expendEnergy(energyCost: number) {
    if (this.energy && this.energy < energyCost) {
      this.energy = 0;
    } else if (this.energy) {
      this.energy -= energyCost;
    }
  }
  //---------------------------Armor---------------------------//
  /**
   * Calculates the damage reduction of the creature based on its armor and condition effects.
   * @returns The damage reduction percentage.
   */
  public getDamageReduction() {
    const { armorMult, armorFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return damageReduction(this.baseArmor * armorMult + armorFlat);
  }
  //---------------------------Battle---------------------------//
  /**
   * Checks if the creature is currently stunned.
   * @returns True if the creature is stunned, otherwise false.
   */
  get isStunned() {
    const isStunned = getConditionEffectsOnMisc(this.conditions).isStunned;
    return isStunned;
  }

  protected endTurn() {
    setTimeout(() => {
      this.conditionTicker();
      this.regenerate();
    }, 250);
  }

  /**
   * Adds a condition to the creature's list of conditions.
   * @param condition - The condition to add. If null, does nothing.
   */
  public addCondition(condition?: Condition | null) {
    if (condition) {
      this.conditions.push(condition);
    }
  }

  /**
   * Updates the list of conditions, removing those that have expired.
   */
  public conditionTicker() {
    let undeadDeathCheck = -1;
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { effect, turns } = this.conditions[i].tick(this);

      if (effect.includes("destroy undead")) {
        undeadDeathCheck = getMagnitude(this.conditions[i].effectMagnitude);
      }
      if (turns <= 0) {
        this.conditions.splice(i, 1);
      }
    }
    if (this.health <= undeadDeathCheck) {
      this.health = 0;
    }
  }

  /**
   * This is meant to remove conditions that are 'stale' - at 0 at end of enemy's turn
   * Unlike conditionTicker, this does not tick conditions
   */
  public conditionResolver() {
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      if (this.conditions[i].turns <= 0) {
        this.conditions.splice(i, 1);
      }
    }
  }
  /**
   * Initializes the attacks of the creature.
   * @param attackStrings - The attacks to initialize, either as strings or Attack objects.
   * @returns The initialized attacks as Attack objects.
   * @private
   */
  private initAttacks(attackStrings: string[] | Attack[]): Attack[] {
    if (attackStrings[0] instanceof Attack) {
      return attackStrings as Attack[];
    }
    const builtAttacks: Attack[] = [];
    attackStrings.forEach((attackName) => {
      const foundAttack = attacks.find(
        (attackObj) => attackObj.name == attackName,
      );
      if (!foundAttack)
        throw new Error(
          `No matching attack found for ${attackName} in creating a ${this.creatureSpecies}`,
        ); // name should be set before this
      const {
        name,
        energyCost,
        hitChance,
        targets,
        damageMult,
        flatHealthDamage,
        flatSanityDamage,
        buffs,
        debuffs,
        summons,
      } = foundAttack;
      const builtAttack = new Attack({
        name,
        energyCost,
        hitChance,
        targets: targets as "single" | "aoe" | "cleave",
        damageMult,
        flatHealthDamage,
        flatSanityDamage,
        buffs,
        debuffs,
        summons,
      });
      builtAttacks.push(builtAttack);
    });
    return builtAttacks;
  }

  /**
   * This method is meant to be overridden by derived classes. It currently chooses a random attack.
   * @param {Object} params - An object containing the target to attack.
   * @param {PlayerCharacter | Minion | Enemy} params.target - The target to attack.
   * @returns {Object} - An object indicating the result of the turn, including the chosen attack.
   */
  protected _takeTurn({ target }: { target: PlayerCharacter | Enemy }):
    | { result: AttackUse.success; logString: string; chosenAttack: Attack }
    | {
        result:
          | AttackUse.lowEnergy
          | AttackUse.miss
          | AttackUse.block
          | AttackUse.stunned;
        logString: string;
      } {
    const execute = this.conditions.find((cond) => cond.name == "execute");
    if (execute) {
      this.damageHealth({ attackerId: execute.placedbyID, damage: 9999 });
      this.endTurn();
      return {
        result: AttackUse.stunned,
        logString: `${toTitleCase(this.creatureSpecies)} was executed!`,
      };
    }
    if (this.isStunned) {
      const allStunSources = this.conditions.filter((cond) =>
        cond.effect.includes("stun"),
      );
      allStunSources.forEach((stunSource) => {
        this.aggroTable.addAggro(stunSource.placedbyID, 10);
      });
      this.endTurn();
      return {
        result: AttackUse.stunned,
        logString: `${toTitleCase(this.creatureSpecies)} was stunned!`,
      };
    } else {
      const allTargets = [
        target,
        ...(target instanceof PlayerCharacter ? target.minionsAndPets : []),
      ];
      const highestAggroTarget =
        this.aggroTable.getHighestAggroTarget(allTargets);

      if (!highestAggroTarget) {
        this.endTurn();
        return {
          result: AttackUse.lowEnergy,
          logString: `${toTitleCase(
            this.creatureSpecies,
          )} passed (low energy)!`,
        };
      }

      const availableAttacks = this.attacks.filter(
        (attack) => !this.energy || this.energy >= attack.energyCost,
      );
      if (availableAttacks.length > 0) {
        const chosenAttack = this.chooseAttack(availableAttacks);
        const res = chosenAttack.use({
          target: highestAggroTarget,
          user: this as unknown as Enemy | Minion,
        });
        this.endTurn();
        return { ...res, chosenAttack };
      } else {
        this.endTurn();
        return {
          result: AttackUse.lowEnergy,
          logString: `${toTitleCase(
            this.creatureSpecies,
          )} passed (low energy)!`,
        };
      }
    }
  }

  private chooseAttack(availableAttacks: Attack[]): Attack {
    const totalWeight = availableAttacks.reduce(
      (sum, attack) => sum + this.getAttackWeight(attack),
      0,
    );
    const randomValue = Math.random() * totalWeight;

    let accumulatedWeight = 0;
    for (const attack of availableAttacks) {
      accumulatedWeight += this.getAttackWeight(attack);
      if (randomValue <= accumulatedWeight) {
        return attack;
      }
    }

    // This should never happen, but as a safety net, return the last attack
    return availableAttacks[availableAttacks.length - 1];
  }

  private getAttackWeight(attack: Attack): number {
    const { damageMult, buffs, debuffs, summons } = attack;
    const { health, healthMax } = this;
    const healthPercentage = health / healthMax;

    const baseWeight = 100;

    let weight = baseWeight;

    if (healthPercentage > 0.75) {
      if (buffs.length > 0) {
        weight *= 2;
      }
    } else if (healthPercentage < 0.35) {
      weight += damageMult * 100;
    } else {
      if (debuffs.length > 0) {
        weight *= 1.5;
      }
    }

    if (this instanceof Enemy) {
      if (summons.length > 0 && healthPercentage > 0.5) {
        if (this.minions.length === 0) {
          weight *= 5;
        } else if (this.minions.length === 1) {
          weight *= 1.5;
        } else if (this.minions.length >= 2) {
          weight /= 2;
        }
      }
    }

    return weight;
  }

  //---------------------------Misc---------------------------//
  /**
   * Retrieves drops from the creature, if not already retrieved.
   * @param playerClass - The class of the player.
   * @param bossFight - Indicates if the fight is against a boss.
   * @returns An object containing item drops and gold.
   */
  public getDrops(playerClass: PlayerClassOptions, bossFight: boolean) {
    if (this.gotDrops) return "already retrieved";
    let enemyObj;
    if (bossFight) {
      enemyObj = bosses.find((monster) => monster.name == this.creatureSpecies);
    } else {
      enemyObj = enemies.find(
        (monster) => monster.name == this.creatureSpecies,
      );
    }
    if (!enemyObj) {
      enemyObj = enemies.find((monster) => monster.name == "generic npc");
    }
    if (enemyObj) {
      const dropList = enemyObj.drops;
      const gold = getRandomInt(
        enemyObj.goldDropRange.minimum,
        enemyObj.goldDropRange.maximum,
      );
      let drops: Item[] = [];
      dropList.forEach((drop) => {
        const roll = rollD20();
        if (roll >= 20 - drop.chance * 20) {
          const items = itemList(drop.itemType, playerClass);
          const itemObj = items.find((item) => item.name == drop.item);
          if (itemObj) {
            drops.push(
              Item.fromJSON({
                ...itemObj,
                itemClass: drop.itemType,
                stackable: isStackable(drop.itemType as ItemClassType),
                playerClass: playerClass,
              }),
            );
          }
        }
      });
      this.gotDrops = true;
      return { itemDrops: drops, gold: gold };
    }
    throw new Error("No found monster on Monster.getDrops()");
  }
}

/**
 * When entering a dungeon tile (room), one of these is created. At times there will be rooms with multi-enemies,
 * in this case i == 0 is set as the `Enemy` then i >= 1 is created as a `Minion` attached to the `Enemy`
 */
export class Enemy extends Creature {
  /**
   * List of minions controlled by this enemy
   */
  minions: Minion[];

  constructor({
    id,
    beingType,
    creatureSpecies,
    health,
    healthMax,
    sanity,
    sanityMax,
    minions,
    attackPower,
    baseArmor,
    energy,
    energyMax,
    energyRegen,
    attacks,
    conditions,
  }: EnemyType) {
    super({
      id,
      beingType,
      creatureSpecies,
      health,
      healthMax,
      sanity,
      sanityMax,
      attackPower,
      baseArmor,
      energy,
      energyMax,
      energyRegen,
      attacks,
      conditions,
    });
    this.minions = minions ?? [];

    makeObservable(this, {
      minions: observable,
      addMinion: action,
      removeMinion: action,
    });
  }

  /**
   * Allows the enemy to take its turn.
   * @param player - The player object, minions are sourced from this as well.
   * @returns {Object} - An object indicating the result of the turn, including the chosen attack.
   */
  public takeTurn({ player }: { player: PlayerCharacter }) {
    return this._takeTurn({ target: player }); //this is done as a way to easily add additional effects, note this function in Minion
  }

  //---------------------------Minions---------------------------//
  /**
   * Creates a minion of the specified type and adds it to the enemy's list of minions.
   * @param minionName - The name of the minion to create.
   * @returns The species (name) of the created minion.
   */
  public createMinion(minionName: string) {
    const minionObj = summons.find((summon) => summon.name == minionName);
    if (!minionObj) {
      throw new Error(`Minion (${minionName}) not found!`);
    }
    const minion = new Minion({
      creatureSpecies: minionObj.name,
      health: minionObj.health,
      healthMax: minionObj.health,
      attackPower: minionObj.attackPower,
      attacks: minionObj.attacks,
      turnsLeftAlive: minionObj.turns,
      beingType: minionObj.beingType as BeingType,
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
      health: json.health,
      healthMax: json.healthMax,
      sanity: json.sanity,
      sanityMax: json.sanityMax,
      attackPower: json.attackPower,
      energy: json.energy,
      energyMax: json.energyMax,
      energyRegen: json.energyRegen,
      minions: json.minions,
      attacks: json.attacks
        ? json.attacks.map((attack: any) => Attack.fromJSON(attack))
        : [],
      conditions: json.conditions
        ? json.conditions.map((condition: any) => Condition.fromJSON(condition))
        : [],
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

  constructor({
    id,
    beingType,
    creatureSpecies,
    health,
    healthMax,
    sanity,
    sanityMax,
    attackPower,
    baseArmor,
    energy,
    energyMax,
    energyRegen,
    attacks,
    conditions,
    turnsLeftAlive,
    parent,
  }: MinionType) {
    super({
      id,
      beingType,
      creatureSpecies,
      health,
      healthMax,
      sanity,
      sanityMax,
      attackPower,
      baseArmor,
      energy,
      energyMax,
      energyRegen,
      attacks,
      conditions,
    });
    this.turnsLeftAlive = turnsLeftAlive;
    this.parent = parent;

    makeObservable(this, {
      turnsLeftAlive: observable,
      takeTurn: action,
    });

    // automatically remove the minion when it reaches 0 turns left
    autorun(() => {
      if (this.turnsLeftAlive <= 0) {
        if (this.parent) {
          this.parent.removeMinion(this);
        }
      }
    });
  }

  /**
   * Allows the minion to take its turn, reducing its lifespan by one turn.
   * @param {Object} params - An object containing the target to attack.
   * @param {PlayerCharacter | Minion | Enemy} params.target - The target to attack.
   * @returns {Object} - An object indicating the result of the turn, including the chosen attack.
   * @throws {Error} If the minion's lifespan has reached zero.
   */
  public takeTurn({ target }: { target: PlayerCharacter | Enemy }) {
    if (this.turnsLeftAlive > 0) {
      if (
        !(
          this.parent instanceof PlayerCharacter &&
          this.parent.rangerPet?.equals(this.id)
        )
      ) {
        this.turnsLeftAlive--;
      }
      return this._takeTurn({ target });
    } else {
      throw new Error("Minion not properly removed!");
    }
  }
  public stripParent() {
    this.parent = null;
  }
  public reinstateParent(parent: PlayerCharacter | Enemy) {
    this.parent = parent;
  }

  /**
   * Creates a minion from a JSON object.
   * @param json - The JSON object representing the minion.
   * @returns The created minion.
   */
  public static fromJSON(json: any): Minion {
    return new Minion({
      id: json.id,
      beingType: json.beingType,
      creatureSpecies: json.creatureSpecies,
      health: json.health,
      healthMax: json.healthMax,
      sanity: json.sanity,
      sanityMax: json.sanityMax,
      attackPower: json.attackPower,
      energy: json.energy,
      energyMax: json.energyMax,
      energyRegen: json.energyRegen,
      turnsLeftAlive: json.turnsLeftAlive,
      attacks: json.attacks
        ? json.attacks.map((attack: any) => Attack.fromJSON(attack))
        : [],
      conditions: json.conditions
        ? json.conditions.map((condition: any) => Condition.fromJSON(condition))
        : [],
      parent:
        json.parent instanceof PlayerCharacter
          ? PlayerCharacter.fromJSON(json.parent)
          : Enemy.fromJSON(json.parent),
    });
  }
}

function itemList(
  itemType: string,
  playerClass: PlayerClassOptions,
): {
  name: string;
  baseValue: number;
  slot?: string;
  attacks?: string[];
  icon?: string;
  stats?: Record<string, number> | null;
}[] {
  switch (itemType) {
    case "arrow":
      return arrows;
    case "artifact":
      return artifacts;
    case "bodyArmor":
      return bodyArmors;
    case "book":
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
    case "bow":
      return bows;
    case "focus":
      return foci;
    case "hat":
      return hats;
    case "helmet":
      return helmets;
    case "ingredient":
      return ingredients;
    case "junk":
      return junk;
    case "poison":
      return poisons;
    case "potion":
      return potions;
    case "robe":
      return robes;
    case "shield":
      return shields;
    case "wand":
      return wands;
    case "melee":
      return melee;
    default:
      throw new Error("invalid itemType");
  }
}
