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
import weapons from "../assets/json/items/weapons.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
import mageBooks from "../assets/json/items/mageBooks.json";
import * as Crypto from "expo-crypto";
import { Item, isStackable } from "./item";
import { action, makeObservable, observable } from "mobx";
import summons from "../assets/json/summons.json";
import { ItemClassType, BeingType } from "../utility/types";
import { rollD20 } from "../utility/functions/roll";
import { damageReduction } from "../utility/functions/misc/numbers";
import { getRandomInt, toTitleCase } from "../utility/functions/misc/words";
import { Attack } from "./attack";
import { PlayerCharacter } from "./character";
import { AttackUse } from "../utility/types";

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
};

export class Creature {
  readonly id: string;
  readonly beingType: BeingType;
  readonly creatureSpecies: string;
  health: number;
  readonly healthMax: number;
  sanity: number | null;
  readonly sanityMax: number | null;
  readonly attackPower: number;
  readonly baseArmor: number;
  energy: number | null;
  readonly energyMax: number | null;
  readonly energyRegen: number | null;
  readonly attacks: Attack[];
  conditions: Condition[];
  gotDrops: boolean;

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
    this.id = id ?? Crypto.randomUUID();
    this.beingType = beingType;
    this.creatureSpecies = creatureSpecies;
    this.health = health;
    this.sanity = sanity ?? null;
    this.sanityMax = sanityMax ?? null;
    this.healthMax = healthMax;
    this.attackPower = attackPower;
    this.baseArmor = baseArmor ?? 0;
    this.energy = energy ?? null;
    this.energyMax = energyMax ?? null;
    this.energyRegen = energyRegen ?? null;
    this.attacks = this.initAttacks(attacks);
    this.conditions = conditions ?? [];
    this.gotDrops = false;
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
  public getMaxHealth() {
    const { healthMult, healthFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return this.healthMax * healthMult + healthFlat;
  }

  public damageHealth(damage: number | null) {
    this.health -= damage ?? 0;
    return this.health;
  }

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
  public getMaxSanity() {
    const { sanityMult, sanityFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return this.sanityMax ? this.sanityMax * sanityMult + sanityFlat : null;
  }
  public damageSanity(damage?: number | null) {
    if (this.sanity) {
      this.sanity -= damage ?? 0;
      return this.sanity;
    }
  }
  //---------------------------Energy---------------------------//
  public regenerate() {
    if (this.energy && this.energyRegen && this.energyMax) {
      if (this.energy + this.energyRegen >= this.energyMax) {
        this.energy = this.energyMax;
      } else {
        this.energy += this.energyRegen;
      }
    }
  }
  public expendEnergy(energyCost: number) {
    if (this.energy && this.energy < energyCost) {
      this.energy = 0;
    } else if (this.energy) {
      this.energy -= energyCost;
    }
  }
  //---------------------------Armor---------------------------//
  public getDamageReduction() {
    const { armorMult, armorFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return damageReduction(this.baseArmor * armorMult + armorFlat);
  }
  //---------------------------Battle---------------------------//
  get isStunned() {
    return getConditionEffectsOnMisc(this.conditions).isStunned;
  }

  protected endTurn() {
    setTimeout(() => {
      this.conditionTicker();
      this.regenerate();
    }, 250);
  }
  public addCondition(condition?: Condition | null) {
    if (condition) {
      this.conditions.push(condition);
    }
  }

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
   * Currently, this simply chooses a random attack, this should be improved - (this is to be wrapped)
   */
  protected _takeTurn({
    target,
  }: {
    target: PlayerCharacter | Minion | Enemy;
  }):
    | { result: AttackUse.success; logString: string; chosenAttack: Attack }
    | {
        result:
          | AttackUse.lowEnergy
          | AttackUse.miss
          | AttackUse.block
          | AttackUse.stunned;
        logString: string;
      } {
    if (this.isStunned) {
      this.endTurn();
      return {
        result: AttackUse.stunned,
        logString: `${toTitleCase(this.creatureSpecies)} was stunned!`,
      };
    } else {
      const availableAttacks = this.attacks.filter(
        (attack) => !this.energy || this.energy >= attack.energyCost,
      );
      if (availableAttacks.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableAttacks.length);
        const chosenAttack = availableAttacks[randomIndex];
        const res = chosenAttack.use({
          target,
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
  //---------------------------Misc---------------------------//
  public getDrops(
    playerClass: "necromancer" | "paladin" | "mage",
    bossFight: boolean,
  ) {
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

export class Enemy extends Creature {
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

  public takeTurn({ target }: { target: PlayerCharacter | Minion }) {
    return this._takeTurn({ target }); //this is done as a way to easily add additional effects, note this function in Minion
  }

  //---------------------------Minions---------------------------//
  /**
   * Returns the species(name) of the created minion, adds the minion to the minion list
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
    });
    this.addMinion(minion);
    return minion.creatureSpecies;
  }

  public addMinion(minion: Minion) {
    this.minions.push(minion);
  }

  public removeMinion(minionToRemove: Minion) {
    let newList: Minion[] = [];
    this.minions.forEach((minion) => {
      if (!minion.equals(minionToRemove.id)) {
        newList.push(minion);
      }
    });
    this.minions = newList;
  }

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

export class Minion extends Creature {
  turnsLeftAlive: number;

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

    makeObservable(this, {
      turnsLeftAlive: observable,
      takeTurn: action,
    });
  }

  public takeTurn({ target }: { target: PlayerCharacter | Minion | Enemy }) {
    if (this.turnsLeftAlive > 0) {
      this.turnsLeftAlive--;
      return this._takeTurn({ target });
    } else {
      throw new Error("Minion not properly removed!");
    }
  }

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
    });
  }
}

function itemList(
  itemType: string,
  playerClass: "mage" | "paladin" | "necromancer",
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
      if (playerClass == "necromancer") {
        return necroBooks;
      } else if (playerClass == "paladin") {
        return paladinBooks;
      } else return mageBooks;
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
    case "weapon":
      return weapons;
    default:
      throw new Error("invalid itemType");
  }
}
