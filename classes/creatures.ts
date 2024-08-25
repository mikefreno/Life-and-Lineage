import attacks from "../assets/json/enemyAttacks.json";
import enemies from "../assets/json/enemy.json";
import bosses from "../assets/json/bosses.json";
import {
  createBuff,
  createDebuff,
  getConditionEffectsOnAttacks,
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
import { AttackObj, ItemClassType, beingType } from "../utility/types";
import { rollD20 } from "../utility/functions/roll";
import { damageReduction } from "../utility/functions/misc/numbers";
import { getRandomInt } from "../utility/functions/misc/words";

type CreatureType = {
  id?: string;
  beingType: beingType;
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
  attacks: string[];
  conditions?: Condition[];
};

type EnemyType = CreatureType & {
  minions?: Minion[];
};

type MinionType = CreatureType & {
  turnsLeftAlive: number;
};

interface attackProps {
  targetMaxHealth: number;
  targetMaxSanity: number | null;
  targetDR: number;
  targetConditions: Condition[];
  chosenAttack: AttackObj;
}

interface takeTurnProps {
  defenderMaxHealth: number;
  defenderMaxSanity: number | null;
  defenderDR: number;
  defenderConditions: Condition[];
}

export class Creature {
  readonly id: string;
  readonly beingType: beingType;
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
  readonly attacks: string[];
  conditions: Condition[];

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
    this.attacks = attacks;
    this.conditions = conditions ?? [];
    makeObservable(this, {
      id: observable,
      health: observable,
      creatureSpecies: observable,
      sanity: observable,
      energy: observable,
      conditions: observable,
      damageHealth: action,
      damageSanity: action,
      addCondition: action,
      conditionTicker: action,
      getDrops: action,
      equals: action,
      attack: action,
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
  public getFullArmor() {
    const { armorMult, armorFlat } = getConditionEffectsOnDefenses(
      this.conditions,
    );
    return this.baseArmor * armorMult + armorFlat;
  }
  public getDamageReduction() {
    return damageReduction(this.getFullArmor());
  }
  //---------------------------Battle---------------------------//
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

  public attack({
    targetDR,
    targetMaxHealth,
    targetMaxSanity,
    targetConditions,
    chosenAttack,
  }: attackProps) {
    let rollToHit: number;
    const { hitChanceMultiplier, damageMult, damageFlat } =
      getConditionEffectsOnAttacks({
        selfConditions: this.conditions,
        enemyConditions: targetConditions,
        beingType: this.beingType,
      });
    if (chosenAttack.hitChance) {
      rollToHit = 20 - (chosenAttack.hitChance * 100 * hitChanceMultiplier) / 5;
    } else {
      rollToHit = 0;
    }
    const roll = rollD20();
    let damagePreDR: number = 0;
    if (roll >= rollToHit) {
      if (chosenAttack.damageMult) {
        damagePreDR = chosenAttack.damageMult * this.attackPower;
      } else if (chosenAttack.flatHealthDamage) {
        damagePreDR = chosenAttack.flatHealthDamage;
      }
      if (chosenAttack.selfDamage) {
        this.damageHealth(chosenAttack.selfDamage);
      }
      let damage = damagePreDR * (1 - targetDR);
      damage *= damageMult; // from conditions
      damage += damageFlat; // from conditions
      const unRoundedDamage = damage;
      damage = Math.round(damage * 4) / 4;
      const sanityDamage = chosenAttack.flatSanityDamage;
      let debuffs: Condition[] = [];
      let healedFor: number = 0;
      if (chosenAttack.debuffs) {
        chosenAttack.debuffs.forEach((debuff) => {
          if (debuff.name == "lifesteal") {
            const roll = rollD20();
            if (roll * 5 >= 100 - debuff.chance * 100) {
              const heal = Math.round(unRoundedDamage * 0.5 * 4) / 4;
              if (this.health + heal >= this.healthMax) {
                healedFor = this.healthMax - this.health;
                this.health = this.healthMax;
              } else {
                healedFor = heal;
                this.health += heal;
              }
            }
          } else {
            const res = createDebuff({
              debuffName: debuff.name,
              debuffChance: debuff.chance,
              enemyMaxHP: targetMaxHealth,
              enemyMaxSanity: targetMaxSanity,
              primaryAttackDamage: damagePreDR,
              applierNameString: this.creatureSpecies,
            });
            if (res) debuffs.push(res);
          }
        });
      }
      let buffsForLogs: Condition[] = [];
      if (chosenAttack.buffs) {
        chosenAttack.buffs.forEach((buff) => {
          const res = createBuff({
            buffName: buff.name,
            buffChance: buff.chance,
            attackPower: this.attackPower,
            maxHealth: this.healthMax,
            maxSanity: this.sanityMax,
            applierNameString: this.creatureSpecies,
          });
          if (res) {
            this.addCondition(res);
            buffsForLogs.push(res);
          }
        });
      }
      this.endTurn();
      return {
        name: chosenAttack.name,
        damage: damage,
        heal: healedFor,
        selfDamage: chosenAttack.selfDamage,
        sanityDamage: sanityDamage,
        debuffs: debuffs.length > 0 ? debuffs : undefined,
        buffs: buffsForLogs.length > 0 ? buffsForLogs : undefined,
        summons: chosenAttack.summons,
      };
    } else {
      this.endTurn();
      return "miss";
    }
  }
  //---------------------------Misc---------------------------//
  public getDrops(
    playerClass: "necromancer" | "paladin" | "mage",
    bossFight: boolean,
  ) {
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
        if (roll * 5 > drop.chance * 100) {
          const items = itemList(drop.itemType, playerClass);
          const itemObj = items.find((item) => item.name == drop.item);
          if (itemObj) {
            drops.push(
              new Item({
                name: itemObj.name,
                slot: itemObj.slot as
                  | "head"
                  | "body"
                  | "one-hand"
                  | "two-hand"
                  | "off-hand"
                  | undefined
                  | null,
                stats: itemObj.stats,
                baseValue: itemObj.baseValue,
                itemClass: drop.itemType as ItemClassType,
                icon: itemObj.icon,
                stackable: isStackable(drop.itemType as ItemClassType),
              }),
            );
          }
        }
      });
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

  public takeTurn({
    defenderMaxHealth,
    defenderMaxSanity,
    defenderDR,
    defenderConditions,
  }: takeTurnProps) {
    const { isStunned } = getConditionEffectsOnMisc(this.conditions);
    if (isStunned) {
      this.endTurn();
      return "stun";
    } else {
      const availableAttacks = attacks.filter(
        (attack) =>
          this.attacks.includes(attack.name) &&
          (!this.energy || this.energy >= attack.energyCost),
      );
      if (availableAttacks.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableAttacks.length);
        const chosenAttack = availableAttacks[randomIndex] as AttackObj;
        if (this.energy && chosenAttack.energyCost) {
          this.expendEnergy(chosenAttack.energyCost);
        }
        if (chosenAttack.summons) {
          chosenAttack.summons.forEach((summon) => {
            const summonObj = summons.find(
              (summonObj) => summonObj.name == summon,
            );
            if (summonObj) {
              const newMinion = new Minion({
                beingType: summonObj.beingType,
                creatureSpecies: summonObj.name,
                health: summonObj.health,
                healthMax: summonObj.health,
                attackPower: summonObj.attackPower,
                attacks: summonObj.attacks,
                turnsLeftAlive: summonObj.turns,
              });
              this.addMinion(newMinion);
            } else {
              throw new Error(`Failed to find ${summon} minion obj`);
            }
          });
        }
        return this.attack({
          targetMaxHealth: defenderMaxHealth,
          targetMaxSanity: defenderMaxSanity,
          targetDR: defenderDR,
          chosenAttack: chosenAttack,
          targetConditions: defenderConditions,
        });
      } else {
        this.endTurn();
        return "pass";
      }
    }
  }
  //---------------------------Minions---------------------------//
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
      attacks: json.attacks,
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

  public takeTurn({
    defenderMaxHealth,
    defenderMaxSanity,
    defenderDR,
    defenderConditions,
  }: takeTurnProps) {
    if (this.turnsLeftAlive > 0) {
      this.turnsLeftAlive--;
      const { isStunned } = getConditionEffectsOnMisc(this.conditions);
      if (isStunned) {
        this.endTurn();
        return "stun";
      } else {
        const availableAttacks = attacks.filter(
          (attack) =>
            this.attacks.includes(attack.name) &&
            (!this.energy || this.energy >= attack.energyCost),
        );
        if (availableAttacks.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * availableAttacks.length,
          );
          const chosenAttack = availableAttacks[randomIndex] as AttackObj;
          if (this.energy && chosenAttack.energyCost) {
            this.expendEnergy(chosenAttack.energyCost);
          }
          return this.attack({
            targetConditions: defenderConditions,
            targetMaxSanity: defenderMaxSanity,
            targetMaxHealth: defenderMaxHealth,
            targetDR: defenderDR,
            chosenAttack: chosenAttack,
          });
        } else {
          this.endTurn();
          return "pass";
        }
      }
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
      attacks: json.attacks,
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
