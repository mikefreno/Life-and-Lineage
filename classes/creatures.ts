import attacks from "../assets/monsterAttacks.json";
import { flipCoin, rollD20 } from "../utility/functions";
import conditions from "../assets/conditions.json";
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
  sanity: number | null;
  attackPower: number;
  energy: number;
  energyRegen: number;
  attacks: string[];
  conditions?: Condition[];
}

export class Monster {
  public creatureSpecies: string;
  public health: number;
  public sanity: number | null;
  public healthMax: number;
  public attackPower: number;
  public energy: number;
  public energyMax: number;
  public energyRegen: number;
  public attacks: string[];
  public conditions: Condition[];
  constructor({
    creatureSpecies,
    health,
    sanity,
    attackPower,
    energy,
    energyRegen,
    attacks,
    conditions,
  }: monsterInterface) {
    this.creatureSpecies = creatureSpecies;
    this.health = health;
    this.sanity = sanity ?? null;
    this.healthMax = health;
    this.attackPower = attackPower;
    this.energy = energy;
    this.energyMax = energy;
    this.energyRegen = energyRegen;
    this.attacks = attacks;
    this.conditions = conditions ?? [];
  }
  public damageHealth(damage: number | null) {
    this.health -= damage ?? 0;
    return this.health;
  }
  public damageSanity(damage: number | null) {
    if (this.sanity) {
      this.sanity -= damage ?? 0;
      return this.sanity;
    }
  }

  public addCondition(condition: Condition | null) {
    if (condition) {
      this.conditions.push(condition);
    }
  }

  public takeTurn(playerMaxHealth: number): {
    attack:
      | "stunned"
      | "miss"
      | "pass"
      | {
          damage: number;
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
      return { attack: "stunned", monsterHealth: this.health };
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
      const damage = chosenAttack.damageMult * this.attackPower;
      const sanityDamage = chosenAttack.sanityDamage;
      if (roll >= rollToHit) {
        const effectChance = chosenAttack.secondaryEffectChance;
        if (effectChance) {
          let effect: Condition | null = null;
          const rollToEffect = 20 - (effectChance * 100) / 5;
          const roll = rollD20();
          if (roll > rollToEffect) {
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
          }
          return {
            damage: damage,
            sanityDamage: sanityDamage,
            secondaryEffects: effect,
          };
        } else {
          return {
            damage: damage,
            sanityDamage: sanityDamage,
            secondaryEffects: null,
          };
        }
      } else {
        return "miss";
      }
    } else {
      this.energy += this.energyRegen;
      return "pass";
    }
  }
}
