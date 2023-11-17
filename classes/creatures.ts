import attacks from "../assets/json/monsterAttacks.json";
import { flipCoin, rollD20 } from "../utility/functions";
import conditions from "../assets/json/conditions.json";
import { Condition } from "./conditions";

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

  public takeTurn(playerMaxHealth: number): {
    attack:
      | "stun"
      | "miss"
      | "pass"
      | {
          name: string;
          damage: number;
          heal?: number;
          sanityDamage: number;
          secondaryEffects: Condition | null;
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
            attack: this.attack(playerMaxHealth),
            monsterHealth: this.health,
          };
        } else return { attack: "miss", monsterHealth: this.health };
      }
      this.conditionTicker();
      return {
        attack: this.attack(playerMaxHealth),
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

  private attack(playerMaxHealth: number) {
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
        Math.round(chosenAttack.damageMult * this.attackPower * 4) / 4;
      const sanityDamage = chosenAttack.sanityDamage;
      if (roll >= rollToHit) {
        const effectChance = chosenAttack.secondaryEffectChance;
        if (effectChance) {
          let effect: Condition | null = null;
          const rollToEffect = 20 - (effectChance * 100) / 5;
          const roll = rollD20();
          if (roll >= rollToEffect) {
            if (chosenAttack.secondaryEffect == "lifesteal") {
              const heal = Math.round(0.25 * damage * 4) / 4;
              if (heal + this.health > this.healthMax) {
                this.health = this.healthMax;
              } else {
                this.health += heal;
              }
              return {
                name: chosenAttack.name,
                damage: damage,
                sanityDamage: sanityDamage,
                heal: heal,
                secondaryEffects: null,
              };
            } else {
              const conditionJSON = conditions.find(
                (condition) => condition.name == chosenAttack.secondaryEffect,
              );
              if (conditionJSON?.damageAmount) {
                let damage = conditionJSON.damageAmount;
                if (conditionJSON.damageStyle == "multiplier") {
                  damage *= this.attackPower;
                } else if (conditionJSON.damageStyle == "percentage") {
                  damage *= playerMaxHealth;
                }
                effect = new Condition({
                  name: conditionJSON.name,
                  style: "debuff",
                  turns: conditionJSON.turns,
                  effect: conditionJSON.effect as (
                    | "skip"
                    | "accuracy halved"
                    | "damage"
                    | "sanity"
                  )[],
                  damage: damage,
                });
              }
              return {
                name: chosenAttack.name,
                damage: damage,
                sanityDamage: sanityDamage,
                secondaryEffects: effect,
              };
            }
          }
        }
        return {
          name: chosenAttack.name,
          damage: damage,
          sanityDamage: sanityDamage,
          secondaryEffects: null,
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
