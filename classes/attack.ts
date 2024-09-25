import {
  createBuff,
  createDebuff,
  getConditionDamageToAttacker,
  getConditionEffectsOnAttacks,
} from "../utility/functions/conditions";
import { toTitleCase, rollD20, wait } from "../utility/functions/misc";
import type { PlayerCharacter } from "./character";
import type { Enemy, Minion } from "./creatures";
import { AttackUse } from "../utility/types";

interface AttackFields {
  name: string;
  energyCost?: number;
  hitChance?: number;
  targets?: "single" | "cleave" | "aoe";
  damageMult?: number;
  flatHealthDamage?: number;
  selfDamage?: number;
  flatSanityDamage?: number;
  buffs?: string[];
  debuffs?: { name: string; chance: number }[];
  summons?: string[];
}

/**
 * This class is used to store weapon provided player attacks and all enemy attacks. The indexing/finding is based on name, stored in JSON
 * An instance can be made with the constructor `new Attack({})` or with `fromJSON` in most cases `fromJSON` should be used
 * This used to store a reference to the user: [`PlayerCharacter`, `Enemy`, `Minion`]. This was abandoned due to creating cyclical data
 * `PlayerCharacter` attacks are free, while `Enemy`/`Minion` attacks typically have an energy cost
 * The heart of this class is the `use` method, no other method needed for use other than `canBeUsed` as a check in UI
 * The only property needed to create is the `name` property, but all properties of the JSON object (source) should be provided
 */
export class Attack {
  name: string;
  energyCost: number;
  attackStyle: "single" | "cleave" | "aoe"; // at time of writing, only implementing single target
  baseHitChance: number;
  damageMult: number;
  flatHealthDamage: number;
  selfDamage: number;
  flatSanityDamage: number;
  buffs: string[];
  debuffs: { name: string; chance: number }[];
  summons: string[];

  constructor({
    name,
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

  public baseDamage(user: PlayerCharacter | Enemy | Minion) {
    if (this.damageMult == 0) {
      return 0;
    }
    return user.attackPower * this.damageMult + this.flatHealthDamage;
  }

  public canBeUsed(user: PlayerCharacter | Enemy | Minion) {
    if (user.isStunned) {
      return false;
    }
    if ("energy" in user && user.energy && user.energy < this.energyCost) {
      return false;
    }
    return true;
  }

  public use({
    user,
    target,
  }: {
    user: PlayerCharacter | Enemy | Minion;
    target: Enemy | PlayerCharacter | Minion;
  }): {
    result: AttackUse;
    logString: string;
  } {
    const { hitChanceMultiplier, damageFlat, damageMult } =
      getConditionEffectsOnAttacks({
        selfConditions: user.conditions,
        enemyConditions: target.conditions,
      });
    if (!this.canBeUsed)
      if (user.isStunned) {
        return {
          result: AttackUse.stunned,
          logString: `${toTitleCase(this.getNameReference(user))} was stunned!`,
        };
      } else {
        return {
          result: AttackUse.lowEnergy,
          logString: `${toTitleCase(
            this.getNameReference(user),
          )} passed (low energy)!`,
        };
      }
    if ("expendEnergy" in user) {
      // PlayerCharacter's do no not have energy (can freely use attacks) - minions and enemies do (usually)
      user.expendEnergy(this.energyCost);
    }

    const attemptResult = this.doesHit({
      target,
      conditionalHitChanceMultiplier: hitChanceMultiplier,
    });
    if (attemptResult == AttackUse.success) {
      // attack has hit, now we do the damage calculation
      const damagePreDR = this.baseDamage(user) * damageMult + damageFlat;
      const enemyDR = target.getDamageReduction();
      const damage = damagePreDR * (1 - enemyDR);
      const finalDamage = Math.round(damage * 4) / 4; // physical damage
      target.damageHealth({ damage: finalDamage, attackerId: user.id });
      target.damageSanity(this.flatSanityDamage);
      user.damageHealth({ damage: this.selfDamage, attackerId: target.id }); // we will need to check against self
      //check for thorns and traps on target
      const thornsIshDamage = getConditionDamageToAttacker(
        target.conditions,
      ).healthDamage;
      if (thornsIshDamage > 0) {
        user.damageHealth({ damage: thornsIshDamage, attackerId: target.id });
      }
      // create debuff loop
      const debuffNames: string[] = []; // only storing names, collecting for logBuilder
      let amountHealed = 0;
      this.debuffs.forEach((debuff) => {
        const roll = rollD20();
        if (roll * 5 >= 100 - debuff.chance * 100) {
          if (debuff.name == "lifesteal") {
            const heal = Math.round(damage * 0.5 * 4) / 4;
            amountHealed += user.restoreHealth(heal);
          } else {
            const newDebuff = createDebuff({
              debuffName: debuff.name,
              debuffChance: debuff.chance,
              enemyMaxHP:
                "nonConditionalMaxHealth" in target
                  ? target.nonConditionalMaxHealth
                  : target.healthMax,
              enemyMaxSanity:
                "nonConditionalMaxHealth" in target
                  ? target.nonConditionalMaxSanity
                  : target.sanityMax,
              primaryAttackDamage: damagePreDR,
              applierNameString: this.getNameReference(user),
              applierID: user.id,
            });
            if (newDebuff) {
              debuffNames.push(newDebuff.name);
              target.addCondition(newDebuff);
            }
          }
        }
      });
      const buffNames: string[] = []; // only storing names, collecting for logBuilder
      this.buffs.forEach((buff) => {
        const newBuff = createBuff({
          buffName: buff,
          attackPower: damagePreDR,
          maxHealth:
            "nonConditionalMaxHealth" in user
              ? user.nonConditionalMaxHealth
              : user.healthMax,
          maxSanity:
            "nonConditionalMaxHealth" in user
              ? user.nonConditionalMaxSanity
              : user.sanityMax,
          applierNameString: this.getNameReference(user),
          applierID: user.id,
        });
        if (newBuff) {
          buffNames.push(newBuff.name);
          user.addCondition(newBuff);
        }
      });
      let minionSpecies: string[] = [];
      if ("createMinion" in user) {
        this.summons.forEach((summon) => {
          const type = (user as PlayerCharacter | Enemy).createMinion(summon);
          minionSpecies.push(type);
        });
      }

      if ("birthdate" in user) {
        wait(1000).then(() => user.endTurn());
      }

      return {
        result: AttackUse.success,
        logString: this.logBuilder({
          result: attemptResult,
          targetName: this.getNameReference(target),
          user,
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
        user,
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

  private logBuilder({ result, targetName, user, ...props }: LogProps): string {
    const userString =
      "fullName" in user ? "You" : `The ${toTitleCase(user.creatureSpecies)}`;

    switch (result) {
      case AttackUse.miss:
        return `${userString} missed the attack against the ${toTitleCase(
          targetName,
        )}!`;

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
        )} on the ${toTitleCase(targetName)}.\n`;

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
          returnString += `  • The ${toTitleCase(
            targetName,
          )} was afflicted with: ${debuffNames.join(", ")}.\n`;
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

  private isPlayer(user: PlayerCharacter | Enemy | Minion) {
    return !("energy" in user);
  }

  /*
   * Returns a string to refer to the target or user with
   */
  private getNameReference(target: PlayerCharacter | Enemy | Minion) {
    if ("fullName" in target) {
      return target.fullName;
    }
    return target.creatureSpecies;
  }

  static fromJSON(json: any): Attack {
    if (!json.name) {
      throw new Error("Attack name is required");
    }

    return new Attack({
      name: json.name,
      energyCost: json.energyCost,
      hitChance: json.hitChance,
      targets: json.targets,
      damageMult: json.damageMult,
      flatHealthDamage: json.flatHealthDamage,
      selfDamage: json.selfDamage,
      flatSanityDamage: json.flatSanityDamage,
      buffs: json.buffs,
      debuffs: json.debuffs,
      summons: json.summons,
    });
  }
}

type AttackFailureLogProps = {
  result: AttackUse.block | AttackUse.miss;
  targetName: string;
  user: PlayerCharacter | Enemy | Minion;
};

type AttackSuccessLogProps = {
  result: AttackUse.success;
  targetName: string;
  user: PlayerCharacter | Enemy | Minion;
  healthDamage: number;
  sanityDamage: number;
  debuffNames: string[];
  buffNames: string[];
  minionSpecies: string[];
};

type LogProps = AttackSuccessLogProps | AttackFailureLogProps;
