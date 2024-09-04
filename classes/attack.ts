import {
  createBuff,
  createDebuff,
  getConditionEffectsOnAttacks,
} from "../utility/functions/conditions";
import { toTitleCase } from "../utility/functions/misc/words";
import { rollD20 } from "../utility/functions/roll";
import { PlayerCharacter } from "./character";
import { Enemy, Minion } from "./creatures";
import { AttackUse } from "../utility/types";

interface AttackFields {
  name: string;
  user: PlayerCharacter | Enemy | Minion;
  energyCost?: number;
  hitChance?: number;
  targets?: "single" | "cleave" | "aoe";
  damageMult?: number;
  flatHealthDamage?: number;
  selfDamage?: number;
  flatSanityDamage?: number;
  buffs?: { name: string; chance: number }[];
  debuffs?: { name: string; chance: number }[];
  summons?: string[];
}

export class Attack {
  name: string;
  user: PlayerCharacter | Enemy | Minion;
  energyCost: number;
  attackStyle: "single" | "cleave" | "aoe"; // at time of writing, only implementing single target
  baseHitChance: number;
  damageMult: number;
  flatHealthDamage: number;
  selfDamage: number;
  flatSanityDamage: number;
  buffs: { name: string; chance: number }[];
  debuffs: { name: string; chance: number }[];
  summons: string[];

  constructor({
    name,
    user,
    energyCost = 0,
    hitChance = 1.0,
    targets = "single",
    damageMult = 0,
    flatHealthDamage = 0,
    selfDamage = 0,
    flatSanityDamage = 0,
    buffs = [],
    debuffs = [],
    summons = [],
  }: AttackFields) {
    this.name = name;
    this.user = user;
    this.energyCost = energyCost;
    this.damageMult = damageMult;
    this.baseHitChance = hitChance;
    this.attackStyle = targets;
    this.flatHealthDamage = flatHealthDamage;
    this.selfDamage = selfDamage;
    this.flatSanityDamage = flatSanityDamage;
    this.buffs = buffs;
    this.debuffs = debuffs;
    this.summons = summons;
  }

  get baseDamage() {
    if (this.damageMult == 0) {
      return 0;
    }
    return this.user.attackPower * this.damageMult + this.flatHealthDamage;
  }

  get canBeUsed() {
    if (this.user.isStunned) {
      return false;
    }
    if (
      !(this.user instanceof PlayerCharacter) &&
      this.user.energy &&
      this.user.energy < this.energyCost
    ) {
      return false;
    }
    return true;
  }

  public use(target: Enemy | PlayerCharacter | Minion): {
    result: AttackUse;
    logString: string;
  } {
    const { hitChanceMultiplier, damageFlat, damageMult } =
      getConditionEffectsOnAttacks({
        selfConditions: this.user.conditions,
        enemyConditions: target.conditions,
      });
    if (!this.canBeUsed)
      if (this.user.isStunned) {
        return {
          result: AttackUse.stunned,
          logString: `${toTitleCase(
            this.getNameReference(this.user),
          )} was stunned!`,
        };
      } else {
        return {
          result: AttackUse.lowEnergy,
          logString: `${toTitleCase(
            this.getNameReference(this.user),
          )} passed (low energy)!`,
        };
      }
    if (!(this.user instanceof PlayerCharacter)) {
      // PlayerCharacter's do no not have energy (can freely use attacks) - minions and enemies do (usually)
      this.user.expendEnergy(this.energyCost);
    }

    const attemptResult = this.doesHit({
      target,
      conditionalHitChanceMultiplier: hitChanceMultiplier,
    });
    if (attemptResult == AttackUse.success) {
      // attack has hit, now we do the damage calculation
      const damagePreDR = this.baseDamage * damageMult + damageFlat;
      const enemyDR = target.getDamageReduction();
      const damage = damagePreDR * (1 - enemyDR);
      const finalDamage = Math.round(damage * 4) / 4; // physical damage
      target.damageHealth(finalDamage);
      target.damageSanity(this.flatSanityDamage);
      this.user.damageHealth(this.selfDamage);
      // create debuff loop
      const debuffNames: string[] = []; // only storing names, collecting for logBuilder
      let amountHealed = 0;
      this.debuffs.forEach((debuff) => {
        if (debuff.name == "lifesteal") {
          const roll = rollD20();
          if (roll * 5 >= 100 - debuff.chance * 100) {
            const heal = Math.round(damage * 0.5 * 4) / 4;
            amountHealed += this.user.restoreHealth(heal);
          }
        } else {
          const newDebuff = createDebuff({
            debuffName: debuff.name,
            debuffChance: debuff.chance,
            enemyMaxHP:
              target instanceof PlayerCharacter
                ? target.nonConditionalMaxHealth
                : target.healthMax,
            enemyMaxSanity:
              target instanceof PlayerCharacter
                ? target.nonConditionalMaxSanity
                : target.sanityMax,
            primaryAttackDamage: damagePreDR,
            applierNameString: this.getNameReference(this.user),
          });
          if (newDebuff) {
            debuffNames.push(newDebuff.name);
            target.addCondition(newDebuff);
          }
        }
      });
      const buffNames: string[] = []; // only storing names, collecting for logBuilder
      this.buffs.forEach((buff) => {
        const newBuff = createBuff({
          buffName: buff.name,
          buffChance: buff.chance,
          attackPower: damagePreDR,
          maxHealth:
            this.user instanceof PlayerCharacter
              ? this.user.nonConditionalMaxHealth
              : this.user.healthMax,
          maxSanity:
            this.user instanceof PlayerCharacter
              ? this.user.nonConditionalMaxSanity
              : this.user.sanityMax,
          applierNameString: this.getNameReference(this.user),
        });
        if (newBuff) {
          buffNames.push(newBuff.name);
          this.user.addCondition(newBuff);
        }
      });
      let minionSpecies: string[] = [];
      if (this.user instanceof PlayerCharacter || this.user instanceof Enemy) {
        this.summons.forEach((summon) => {
          const type = (this.user as PlayerCharacter | Enemy).createMinion(
            summon,
          );
          minionSpecies.push(type);
        });
      }

      return {
        result: AttackUse.success,
        logString: this.logBuilder({
          result: attemptResult,
          targetName: this.getNameReference(target),
          healthDamage: finalDamage,
          sanityDamage: this.flatSanityDamage,
          debuffNames,
          buffNames,
          minionSpecies,
        }),
      };
    }

    return {
      result: attemptResult,
      logString: this.logBuilder({
        result: attemptResult,
        targetName: this.getNameReference(target),
      }),
    };
  }

  private doesHit({
    target,
    conditionalHitChanceMultiplier,
  }: {
    target: Enemy | PlayerCharacter | Minion;
    conditionalHitChanceMultiplier: number;
  }) {
    //first roll based on base hit chance combined with conditional effects (this includes both user and target)
    const rollToHit =
      20 - this.baseHitChance * conditionalHitChanceMultiplier * 20; // d&d style :)
    if (rollD20() >= rollToHit) {
      if ("equipment" in target && target.equipmentStats.blockChance > 0) {
        const rollToPassBlock = 20 - target.equipmentStats.blockChance * 20;
        if (rollToPassBlock < rollD20()) {
          return AttackUse.block;
        }
      }
      return AttackUse.success;
    }
    return AttackUse.miss;
  }

  private logBuilder({ result, targetName, ...props }: LogProps): string {
    const userString =
      this.user instanceof PlayerCharacter
        ? "You"
        : `The ${toTitleCase(this.user.creatureSpecies)}`;
    const targetString =
      this.user instanceof PlayerCharacter
        ? `the ${toTitleCase(targetName)}`
        : "you";

    switch (result) {
      case AttackUse.miss:
        return `${userString} missed the attack against ${targetString}!`;

      case AttackUse.block:
        return `${toTitleCase(targetName)} blocked the attack!`;

      case AttackUse.success:
        if (!("healthDamage" in props)) throw new Error("Malformed props");
        const {
          healthDamage,
          sanityDamage,
          debuffNames,
          buffNames,
          minionSpecies,
        } = props;

        let returnString = `${userString} used ${toTitleCase(
          this.name,
        )} on ${targetString}.\n`;

        // Health damage
        if (healthDamage > 0) {
          returnString += `  • It dealt ${healthDamage} health damage.\n`;
        }

        // Sanity damage
        if (sanityDamage > 0) {
          returnString += `  • It caused ${sanityDamage} sanity damage.\n`;
        }

        // Debuffs
        if (debuffNames.length > 0) {
          returnString += `  • ${targetString} ${
            this.user instanceof PlayerCharacter ? "was" : "were"
          } afflicted with: ${debuffNames.join(", ")}.\n`;
        }

        // Buffs
        if (buffNames.length > 0) {
          returnString += `  • ${userString} gained: ${buffNames.join(
            ", ",
          )}.\n`;
        }

        // Summons
        if (minionSpecies.length > 0) {
          returnString += `  • ${userString} summoned: ${minionSpecies.join(
            ", ",
          )}.\n`;
        }

        // Self-damage
        if (this.selfDamage > 0) {
          returnString += `  • ${userString} took ${this.selfDamage} self-damage.\n`;
        }

        return returnString.trim();
    }
  }
  /*
   * Returns a string to refer to the target or user with
   */
  private getNameReference(target: PlayerCharacter | Enemy | Minion) {
    if (target instanceof PlayerCharacter) {
      return target.fullName;
    }
    return target.creatureSpecies;
  }
}

type AttackFailureLogProps = {
  result: AttackUse.block | AttackUse.miss;
  targetName: string;
};

type AttackSuccessLogProps = {
  result: AttackUse.success;
  targetName: string;
  healthDamage: number;
  sanityDamage: number;
  debuffNames: string[];
  buffNames: string[];
  minionSpecies: string[];
};

type LogProps = AttackSuccessLogProps | AttackFailureLogProps;
