import attacks from "../assets/json/monsterAttacks.json";
import monsters from "../assets/json/monsters.json";
import {
  createDebuff,
  flipCoin,
  getRandomInt,
  rollD20,
} from "../utility/functions";
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
import { Item } from "./item";

interface familiarOptions {
  name: string;
  species: string;
  level: number;
  sex: "male" | "female";
  health: number;
}

interface monsterInterface {
  creatureSpecies: string;
  health: number;
  healthMax: number;
  sanity: number | null;
  sanityMax: number | null;
  attackPower: number;
  energy: number;
  energyMax: number;
  energyRegen: number;
  attacks: string[];
  conditions?: Condition[];
}

export class Monster {
  readonly creatureSpecies: string;
  private health: number;
  private sanity: number | null;
  private sanityMax: number | null;
  private healthMax: number;
  private attackPower: number;
  private energy: number;
  private energyMax: number;
  private energyRegen: number;
  private attacks: string[];
  private conditions: Condition[];

  constructor({
    creatureSpecies,
    health,
    healthMax,
    sanity,
    sanityMax,
    attackPower,
    energy,
    energyMax,
    energyRegen,
    attacks,
    conditions,
  }: monsterInterface) {
    this.creatureSpecies = creatureSpecies;
    this.health = health;
    this.sanity = sanity ?? null;
    this.sanityMax = sanityMax ?? null;
    this.healthMax = healthMax;
    this.attackPower = attackPower;
    this.energy = energy;
    this.energyMax = energyMax;
    this.energyRegen = energyRegen;
    this.attacks = attacks;
    this.conditions = conditions ?? [];
  }

  //---------------------------Health---------------------------//
  public damageHealth(damage: number | null) {
    this.health -= damage ?? 0;
    return this.health;
  }
  public getHealth() {
    return this.health;
  }
  public getMaxHealth() {
    return this.healthMax;
  }
  //---------------------------Sanity---------------------------//
  public damageSanity(damage: number | null) {
    if (this.sanity) {
      this.sanity -= damage ?? 0;
      return this.sanity;
    }
  }
  //---------------------------Battle---------------------------//

  public addCondition(condition: Condition | null) {
    if (condition) {
      this.conditions.push(condition);
    }
  }

  public takeTurn(
    playerMaxHealth: number,
    playerDR: number,
  ): {
    attack:
      | "stun"
      | "miss"
      | "pass"
      | {
          name: string;
          damage: number;
          heal?: number;
          sanityDamage: number;
          debuffs: Condition[] | null;
        };
    monsterHealth: number;
  } {
    const stun = this.conditions.find((condition) => {
      condition.name == "stun";
    });
    if (!stun) {
      const accuracy_halved = this.conditions.find((condition) => {
        condition.name == "accuracy_halved";
      });
      if (accuracy_halved) {
        const res = flipCoin();
        this.conditionTicker();
        if (res == "Heads") {
          return {
            attack: this.attack(playerMaxHealth, playerDR),
            monsterHealth: this.health,
          };
        } else return { attack: "miss", monsterHealth: this.health };
      }
      this.conditionTicker();
      return {
        attack: this.attack(playerMaxHealth, playerDR),
        monsterHealth: this.health,
      };
    } else {
      this.conditionTicker();
      return { attack: "stun", monsterHealth: this.health };
    }
  }

  private conditionTicker() {
    for (let i = this.conditions.length - 1; i >= 0; i--) {
      const { effect, damage, turns } = this.conditions[i].tick();

      effect.forEach((eff) => {
        if (eff == "sanity") {
          this.damageSanity(damage);
        } else if (eff == "damage") {
          this.damageHealth(damage);
        }
      });

      if (turns == 0) {
        this.conditions.splice(i, 1);
      }
    }
  }

  private attack(playerMaxHealth: number, playerDR: number) {
    const availableAttacks = attacks.filter(
      (attack) =>
        this.attacks.includes(attack.name) && this.energy >= attack.energyCost,
    );
    if (availableAttacks.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableAttacks.length);
      this.energy += this.energyRegen;
      const chosenAttack = availableAttacks[randomIndex];
      const rollToHit = 20 - (chosenAttack.hitChance * 100) / 5;
      const roll = rollD20();
      const damage =
        Math.round(
          chosenAttack.damageMult * this.attackPower * (1 - playerDR) * 4,
        ) / 4;
      const sanityDamage = chosenAttack.sanityDamage;
      if (roll >= rollToHit) {
        if (chosenAttack.debuffs) {
          let debuffs: Condition[] = [];
          let healedFor = 0;
          chosenAttack.debuffs.forEach((debuff) => {
            if (debuff.name == "lifesteal") {
              const heal = Math.round(damage * 0.5 * 4) / 4;
              if (this.health + heal >= this.healthMax) {
                this.health = this.healthMax;
              } else {
                this.health += heal;
              }
            } else {
              const res = createDebuff(
                debuff.name,
                debuff.chance,
                playerMaxHealth,
                damage,
              );
              if (res) debuffs.push(res);
            }
          });
          return {
            name: chosenAttack.name,
            damage: damage,
            heal: healedFor > 0 ? healedFor : undefined,
            sanityDamage: sanityDamage,
            debuffs: debuffs,
          };
        }
        return {
          name: chosenAttack.name,
          damage: damage,
          sanityDamage: sanityDamage,
          debuffs: null,
        };
      } else {
        return "miss";
      }
    } else {
      this.energy += this.energyRegen;
      return "pass";
    }
  }

  //---------------------------Misc---------------------------//
  public getDrops(playerClass: "necromancer" | "paladin" | "mage") {
    const monsterObj = monsters.find(
      (monster) => monster.name == this.creatureSpecies,
    );
    if (monsterObj) {
      const dropList = monsterObj.drops;
      const gold = getRandomInt(
        monsterObj.goldDropRange.minimum,
        monsterObj.goldDropRange.maximum,
      );
      let drops: Item[] = [];
      dropList.forEach((drop) => {
        const roll = rollD20();
        if (roll * 5 > drop.chance) {
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
                itemClass: drop.itemType as
                  | "poison"
                  | "weapon"
                  | "junk"
                  | "ingredient"
                  | "bodyArmor"
                  | "helmet"
                  | "artifact"
                  | "potion"
                  | "wand"
                  | "focus"
                  | "shield"
                  | "robe"
                  | "hat"
                  | "book",
              }),
            );
          }
        }
      });
      return { itemDrops: drops, gold: gold };
    }
    throw new Error("No found monster on Monster.getDrops()");
  }

  public toJSON(): object {
    return {
      creatureSpecies: this.creatureSpecies,
      health: this.health,
      healthMax: this.healthMax,
      sanity: this.sanity,
      sanityMax: this.sanityMax,
      attackPower: this.attackPower,
      energy: this.energy,
      energyMax: this.energyMax,
      energyRegen: this.energyRegen,
      attacks: this.attacks,
      conditions: this.conditions.map((condition) => condition.toJSON()),
    };
  }

  public static fromJSON(json: any): Monster {
    return new Monster({
      creatureSpecies: json.creatureSpecies,
      health: json.health,
      healthMax: json.healthMax,
      sanity: json.sanity,
      sanityMax: json.sanityMax,
      attackPower: json.attackPower,
      energy: json.energy,
      energyMax: json.energyMax,
      energyRegen: json.energyRegen,
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
  stats?: Record<string, number | undefined> | null;
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
