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
import staves from "../assets/json/items/staves.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import mageBooks from "../assets/json/items/mageBooks.json";
import rangerBooks from "../assets/json/items/rangerBooks.json";
import storyItems from "../assets/json/items/storyItems.json";
import * as Crypto from "expo-crypto";
import { Item, isStackable } from "./item";
import { action, computed, makeObservable, observable, reaction } from "mobx";
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
import { ThreatTable } from "./threatTable";
import EnemyStore from "../stores/EnemyStore";

type CreatureType = {
  id?: string;
  beingType: BeingType;
  creatureSpecies: string;
  currentHealth: number;
  baseHealth: number;
  currentSanity?: number | null;
  baseSanity?: number | null;
  attackPower: number;
  baseArmor?: number;
  currentMana?: number;
  baseMana?: number;
  manaRegen?: number;
  attackStrings?: string[];
  spellStrings?: string[];
  conditions?: Condition[];
  enemyStore: EnemyStore;
};

type EnemyType = CreatureType & {
  minions?: Minion[];
};

type MinionType = CreatureType & {
  turnsLeftAlive: number;
  parent: Enemy | PlayerCharacter | null;
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

  currentHealth: number;

  readonly baseHealth: number;

  currentSanity: number | null;

  readonly baseSanity: number | null;

  /**
   * Base attack power of the creature
   */
  readonly attackPower: number;

  /**
   * Base armor value of the creature
   */
  readonly baseArmor: number;

  currentMana: number;

  readonly baseMana: number;

  /**
   * Mana regeneration per turn of the creature
   */
  readonly manaRegen: number;

  /**
   * List of attack names the creature can perform
   */
  readonly attackStrings: string[];
  /**
   * List of spell names the creature can perform
   */
  readonly spellStrings: string[];

  /**
   * List of conditions affecting the creature
   */
  conditions: Condition[];

  /**
   * Flag indicating if the creature has dropped items
   */
  gotDrops: boolean;

  threatTable: ThreatTable = new ThreatTable();

  enemyStore: EnemyStore;

  constructor({
    id,
    beingType,
    creatureSpecies,
    currentHealth,
    baseHealth,
    currentSanity,
    baseSanity,
    attackPower,
    baseArmor,
    currentMana,
    baseMana,
    manaRegen,
    attackStrings,
    spellStrings,
    conditions,
    enemyStore,
  }: CreatureType) {
    this.id = id ?? Crypto.randomUUID(); // Assign a random UUID if id is not provided
    this.beingType = beingType;
    this.creatureSpecies = creatureSpecies;
    this.currentHealth = currentHealth;
    this.currentSanity = currentSanity ?? null; // Initialize sanity to null if not provided
    this.baseSanity = baseSanity ?? null; // Initialize baseSanity to null if not provided
    this.baseHealth = baseHealth;
    this.attackPower = attackPower;
    this.baseArmor = baseArmor ?? 0; // Default base armor to 0 if not provided
    this.currentMana = currentMana ?? 0; // Initialize Mana to 0 if not provided
    this.baseMana = baseMana ?? 0; // Initialize baseMana to 0 if not provided
    this.manaRegen = manaRegen ?? 0; // Initialize ManaRegen to 0 if not provided
    this.attackStrings = attackStrings ?? [];
    this.spellStrings = spellStrings ?? [];
    this.conditions = conditions ?? []; // Initialize conditions to an empty array if not provided
    this.gotDrops = false; // Initialize gotDrops to false
    this.enemyStore = enemyStore;

    makeObservable(this, {
      id: observable,
      currentHealth: observable,
      creatureSpecies: observable,
      currentSanity: observable,
      currentMana: observable,
      conditions: observable,
      damageHealth: action,
      restoreHealth: action,
      damageSanity: action,
      addCondition: action,
      conditionTicker: action,
      getDrops: action,
      equals: action,
      regenerate: action,
      expendMana: action,
      attacks: computed,
      removeCondition: action,
    });
  }

  /**
   * The built Attacks of the Creature
   */
  get attacks() {
    const builtAttacks: Attack[] = [];
    this.attackStrings.forEach((attackName) => {
      const foundAttack = attacks.find(
        (attackObj) => attackObj.name == attackName,
      );
      if (!foundAttack)
        throw new Error(
          `No matching attack found for ${attackName} in creating a ${this.creatureSpecies}`,
        ); // name should be set before this
      const {
        name,
        manaCost,
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
        manaCost,
        hitChance,
        targets: targets as "single" | "aoe" | "dual",
        damageMult,
        flatHealthDamage,
        flatSanityDamage,
        buffs,
        debuffs,
        summons,
        user: this as unknown as Enemy | Minion,
      });
      builtAttacks.push(builtAttack);
    });
    return builtAttacks;
  }

  get spells() {}

  //---------------------------Equivalency---------------------------//
  public equals(otherMonsterID: string) {
    return this.id === otherMonsterID;
  }
  //---------------------------Health---------------------------//
  /**
   * Calculates the maximum health of the creature considering any condition effects.
   * @returns The maximum health value.
   */
  get maxHealth() {
    const { healthMult, healthFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return this.baseHealth * healthMult + healthFlat;
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
    this.currentHealth -= damage ?? 0;
    this.threatTable.addThreat(attackerId, damage ?? 0);

    return this.currentHealth;
  }

  /**
   * Restores the creature's health by the specified amount, up to the maximum health.
   * @param amount - The amount of health to restore.
   * @returns The actual amount of health restored.
   */
  public restoreHealth(amount: number) {
    if (this.currentHealth + amount < this.baseHealth) {
      this.currentHealth += amount;
      return amount;
    } else {
      const amt = this.baseHealth - this.currentHealth;
      this.currentHealth = this.baseHealth;
      return amt;
    }
  }
  //---------------------------Sanity---------------------------//
  /**
   * Calculates the maximum sanity of the creature considering any condition effects.
   * @returns The maximum sanity value, or null if baseSanity is not set.
   */
  public maxSanity() {
    const { sanityMult, sanityFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return this.baseSanity ? this.baseSanity * sanityMult + sanityFlat : null;
  }

  /**
   * Damages the creature's sanity by the specified amount.
   * @param damage - The amount of sanity damage to apply. If not provided, defaults to 0.
   * @returns The new sanity value after applying the damage, or null if sanity is not set.
   */
  public damageSanity(damage?: number | null) {
    if (this.currentSanity) {
      this.currentSanity -= damage ?? 0;
      return this.currentSanity;
    }
  }
  //---------------------------Mana---------------------------//
  /**
   * Calculates the maximum sanity of the creature considering any condition effects.
   * @returns The maximum sanity value, or null if baseSanity is not set.
   */
  public maxSanity() {
    const { sanityMult, sanityFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return this.baseSanity ? this.baseSanity * sanityMult + sanityFlat : null;
  }
  /**
   * Regenerates the creature's Mana based on its regeneration rate.
   */
  public regenerate() {
    if (this.currentMana + this.ManaRegen >= this.baseMana) {
      this.currentMana = this.baseMana;
    } else {
      this.currentMana += this.ManaRegen;
    }
  }

  /**
   * Expends the creature's Mana by the specified amount.
   * @param ManaCost - The amount of Mana to expend.
   */
  public expendMana(ManaCost: number) {
    if (this.currentMana && this.currentMana < ManaCost) {
      this.currentMana = 0;
    } else if (this.currentMana) {
      this.currentMana -= ManaCost;
    }
  }

  /**
   * Decreases the creature's Mana by the specified amount, and adds threat.
   * @param ManaCost - The amount of Mana to expend.
   */
  public damageMana({
    damage,
    attackerId,
  }: {
    damage: number;
    attackerId: string;
  }) {
    if (this.currentMana && this.currentMana < damage) {
      this.currentMana = 0;
      this.threatTable.addThreat(attackerId, damage / 2);
    } else if (this.currentMana) {
      this.currentMana -= damage;
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
   * Adds a condition to the creature's list of conditions. Sets the `on` property.
   * @param condition - The condition to add. If null, does nothing.
   */
  public addCondition(condition?: Condition | null) {
    if (condition) {
      condition.on = this as unknown as Enemy | Minion;
      this.conditions.push(condition);
    }
  }

  public removeCondition(condition: Condition) {
    this.conditions = this.conditions.filter((cond) => cond !== condition);
  }

  /**
   * Updates the list of conditions, removing those that have expired.
   */
  public conditionTicker() {
    let undeadDeathCheck = -1;
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { effect } = this.conditions[i].tick(this);

      if (effect.includes("destroy undead")) {
        undeadDeathCheck = getMagnitude(this.conditions[i].effectMagnitude);
      }
    }
    if (this.currentHealth <= undeadDeathCheck) {
      this.currentHealth = 0;
    }
  }

  /**
   * This method is meant to be overridden by derived classes. It currently chooses a random attack.
   * @param {Object} params - An object containing the target to attack.
   * @param {PlayerCharacter | Minion | Enemy} params.target - The target to attack.
   * @returns {Object} - An object indicating the result of the turn, including the chosen attack.
   */
  protected _takeTurn({ target }: { target: PlayerCharacter | Enemy }) {
    const execute = this.conditions.find((cond) => cond.name == "execute");
    if (execute) {
      this.damageHealth({ attackerId: execute.placedbyID, damage: 9999 });
      this.endTurn();
      return [
        {
          result: AttackUse.stunned,
          logString: `${toTitleCase(this.creatureSpecies)} was executed!`,
        },
      ];
    }
    if (this.isStunned) {
      const allStunSources = this.conditions.filter((cond) =>
        cond.effect.includes("stun"),
      );
      allStunSources.forEach((stunSource) => {
        this.threatTable.addThreat(stunSource.placedbyID, 10);
      });
      this.endTurn();
      return {
        result: AttackUse.stunned,
        logString: `${toTitleCase(this.creatureSpecies)} was stunned!`,
      };
    } else {
      const allTargets = [
        target,
        ...(target instanceof PlayerCharacter
          ? target.minionsAndPets
          : target.minions),
      ];

      const availableAttacks = this.attacks.filter(
        (attack) => !this.currentMana || this.currentMana >= attack.ManaCost,
      );
      if (availableAttacks.length > 0) {
        const { attack, numTargets } = this.chooseAttack(
          availableAttacks,
          allTargets.length,
        );

        const bestTargets = this.threatTable.getHighestThreatTargets(
          allTargets,
          numTargets,
        );

        const res: {
          result: AttackUse;
          logString: string;
        }[] = [];
        bestTargets.forEach((target) => attack.use({ target: target }));
        this.endTurn();
        return { ...res, attack };
      } else {
        this.endTurn();
        return {
          result: AttackUse.lowMana,
          logString: `${toTitleCase(this.creatureSpecies)} passed (low Mana)!`,
        };
      }
    }
  }

  protected chooseAttack(
    availableAttacks: Attack[],
    numberOfPotentialTargets: number,
  ): { attack: Attack; numTargets: number } {
    const scoredAttacks = availableAttacks.map((attack) => {
      const baseDamage = attack.baseDamage;
      const numTargets =
        attack.attackStyle === "aoe"
          ? numberOfPotentialTargets
          : attack.attackStyle === "dual"
          ? numberOfPotentialTargets > 1
            ? 2
            : 1
          : 1;
      const totalDamage = baseDamage * numTargets;
      const heal = attack.buffs.filter((buff) => buff.effect.includes("heal"));
      const nonHealBuffCount = attack.buffs.filter(
        (buff) => !buff.effect.includes("heal"),
      ).length;
      const debuffCount = attack.debuffStrings.length;
      const summonCount = attack.summons.length;
      const healthPercentage = this.currentHealth / this.baseHealth;

      // Calculate the priority score
      let priorityScore = totalDamage;

      // Add bonus for buffs and debuffs
      priorityScore += nonHealBuffCount * 1.25; // adjust the multiplier as needed
      priorityScore += debuffCount * 1.25; // adjust the multiplier as needed

      if (heal && healthPercentage < 0.85) {
        if (healthPercentage > 0.5) {
          priorityScore * 5;
        } else {
          priorityScore * 10;
        }
      }
      // Add bonus for summons based on HP and current count
      if (summonCount > 0 && this instanceof Enemy) {
        if (healthPercentage > 0.75) {
          if (this.minions.length === 0) {
            priorityScore *= 5;
          } else if (this.minions.length === 1) {
            priorityScore *= 1.5;
          } else if (this.minions.length >= 2) {
            priorityScore /= 2;
          }
        } else if (healthPercentage > 0.5) {
          if (this.minions.length === 0) {
            priorityScore *= 2;
          } else if (this.minions.length === 1) {
            priorityScore /= 2;
          } else if (this.minions.length >= 2) {
            priorityScore /= 3;
          }
        } else {
          priorityScore /= 4;
        }
      }

      // Add a small random factor to introduce randomness
      priorityScore += Math.random() * 1.25;

      return { attack, priorityScore, numTargets };
    });

    // Sort the attacks by priority score in descending order
    scoredAttacks.sort((a, b) => b.priorityScore - a.priorityScore);

    // Return the attack with the highest priority score
    return {
      attack: scoredAttacks[0].attack,
      numTargets: scoredAttacks[0].numTargets,
    };
  }

  //---------------------------Misc---------------------------//
  /**
   * Retrieves drops from the creature, if not already retrieved.
   * @param playerClass - The class of the player.
   * @param bossFight - Indicates if the fight is against a boss.
   * @returns An object containing item drops and gold.
   */
  public getDrops(player: PlayerCharacter, bossFight: boolean) {
    if (this.gotDrops) return {};
    let enemyObj;
    let storyDrops: Item[] = [];
    if (bossFight) {
      enemyObj = bosses.find((monster) => monster.name == this.creatureSpecies);
      const storyDropsList = enemyObj?.storyDrops;
      if (storyDropsList) {
        storyDropsList.forEach((drop) => {
          const storyItemObj = storyItems.find(
            (item) => item.name == drop.item,
          );
          if (storyItemObj) {
            const storyItem = Item.fromJSON({
              ...storyItemObj,
              itemClass: ItemClassType.StoryItem,
              stackable: false,
              player,
            });
            storyDrops.push(storyItem);
          }
        });
      }
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
      let itemDrops: Item[] = [];
      dropList.forEach((drop) => {
        const roll = rollD20();
        if (roll >= 20 - drop.chance * 20) {
          const items = itemList(
            drop.itemType as ItemClassType,
            player.playerClass,
          );
          const itemObj = items.find((item) => item.name == drop.item);
          if (itemObj) {
            itemDrops.push(
              Item.fromJSON({
                ...itemObj,
                itemClass: drop.itemType,
                stackable: isStackable(drop.itemType as ItemClassType),
                player,
              }),
            );
          }
        }
      });
      this.gotDrops = true;
      return { itemDrops, gold, storyDrops };
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
    currentHealth,
    baseHealth,
    currentSanity,
    baseSanity,
    minions,
    attackPower,
    baseArmor,
    currentMana,
    baseMana,
    manaRegen,
    attackStrings,
    spellStrings,
    conditions,
    enemyStore,
  }: EnemyType) {
    super({
      id,
      beingType,
      creatureSpecies,
      currentHealth,
      baseHealth,
      currentSanity,
      baseSanity,
      attackPower,
      baseArmor,
      currentMana,
      baseMana,
      manaRegen,
      attackStrings,
      spellStrings,
      conditions,
      enemyStore,
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
      currentHealth: minionObj.health,
      baseHealth: minionObj.health,
      attackPower: minionObj.attackPower,
      attackStrings: minionObj.attackStrings,
      spellStrings: minionObj.spellStrings,
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
    const enemy = new Enemy({
      id: json.id,
      beingType: json.beingType,
      creatureSpecies: json.creatureSpecies,
      currentHealth: json.currentHealth,
      baseHealth: json.maxHealth,
      currentSanity: json.sanity,
      baseSanity: json.baseSanity,
      attackPower: json.attackPower,
      currentMana: json.currentMana,
      baseMana: json.baseMana,
      ManaRegen: json.ManaRegen,
      minions: json.minions
        ? json.minions.map((minion: any) => Minion.fromJSON(minion))
        : [],
      attackStrings: json.attackStrings,
      spellStrings: json.spellStrings,
      conditions: json.conditions
        ? json.conditions.map((condition: any) => Condition.fromJSON(condition))
        : [],
    });
    enemy.minions = enemy.minions.map((minion) =>
      minion.reinstateParent(enemy),
    );
    enemy.conditions = enemy.conditions.map((cond) =>
      cond.reinstateParent(enemy),
    );
    return enemy;
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
    currentHealth,
    baseHealth,
    currentSanity,
    baseSanity,
    attackPower,
    baseArmor,
    currentMana,
    baseMana,
    manaRegen,
    attackStrings,
    spellStrings,
    conditions,
    turnsLeftAlive,
    parent,
    enemyStore,
  }: MinionType) {
    super({
      id,
      beingType,
      creatureSpecies,
      currentHealth,
      baseHealth,
      currentSanity,
      baseSanity,
      attackPower,
      baseArmor,
      currentMana,
      baseMana,
      manaRegen,
      attackStrings,
      spellStrings,
      conditions,
      enemyStore,
    });
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

  public reinstateParent(parent: PlayerCharacter | Enemy) {
    this.parent = parent;
    return this;
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
      baseHealth: json.maxHealth,
      currentSanity: json.currentSanity,
      baseSanity: json.baseSanity,
      attackPower: json.attackPower,
      currentMana: json.currentMana,
      baseMana: json.baseMana,
      manaRegen: json.manaRegen,
      turnsLeftAlive: json.turnsLeftAlive,
      attackStrings: json.attackStrings,
      spellStrings: json.spellStrings,
      conditions: json.conditions
        ? json.conditions.map((condition: any) => Condition.fromJSON(condition))
        : [],
      parent: null,
    });
    minion.conditions = minion.conditions.map((cond) =>
      cond.reinstateParent(minion),
    );
    return minion;
  }
}

function itemList(
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
