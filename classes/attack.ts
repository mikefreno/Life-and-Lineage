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
import AttackDetails from "../components/AttackDetails";

/**
 * Interface for the fields of an attack.
 * @property {string} name - The name of the attack.
 * @property {number} [energyCost=0] - The energy cost to perform the attack.
 * @property {number} [hitChance=1.0] - The base hit chance of the attack.
 * @property {"single" | "cleave" | "aoe"} [targets="single"] - The type of targets the attack can hit.
 * @property {number} [damageMult=0] - The damage multiplier of the attack.
 * @property {number} [flatHealthDamage=0] - The flat health damage of the attack.
 * @property {number} [selfDamage=0] - The damage dealt to the attacker.
 * @property {number} [flatSanityDamage=0] - The flat sanity damage of the attack.
 * @property {string[]} [buffs=[]] - The buffs applied by the attack.
 * @property {{ name: string; chance: number }[]} [debuffs=[]] - The debuffs applied by the attack.
 * @property {string[]} [summons=[]] - The minions summoned by the attack.
 * @property {number} [hits=1] - The number of hits the attack can perform.
 */
interface AttackFields {
  name: string;
  energyCost?: number;
  hitChance?: number;
  targets?: "single" | "cleave" | "aoe";
  damageMult?: number;
  flatHealthDamage?: number;
  selfDamage?: number;
  flatSanityDamage?: number;
  hits?: number;
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
  hits: number;
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
    hits = 1,
  }: AttackFields) {
    this.name = name;
    this.energyCost = energyCost;
    this.damageMult = damageMult;
    this.baseHitChance = hitChance;
    this.attackStyle = targets;
    this.flatHealthDamage = flatHealthDamage;
    this.selfDamage = selfDamage;
    this.flatSanityDamage = flatSanityDamage;
    this.hits = hits;
    this.buffs = buffs;
    this.debuffs = debuffs;
    this.summons = summons;
  }
  /**
   * Calculates the base damage of the attack based on the user's attack power and other modifiers.
   * @param user - The user of the attack, which can be a PlayerCharacter, Enemy, or Minion.
   * @returns The base damage of the attack.
   */
  public baseDamage(user: PlayerCharacter | Enemy | Minion) {
    if (this.damageMult == 0) {
      return 0;
    }
    return user.attackPower * this.damageMult + this.flatHealthDamage;
  }

  /**
   * Checks if the attack can be used based on the user's current state.
   * @param user - The user of the attack, which can be a PlayerCharacter, Enemy, or Minion.
   * @returns True if the attack can be used, false otherwise.
   */
  public canBeUsed(user: PlayerCharacter | Enemy | Minion) {
    if (user.isStunned) {
      return false;
    }
    if ("energy" in user && user.energy && user.energy < this.energyCost) {
      return false;
    }
    return true;
  }

  /**
   * Uses the attack against a target.
   * @param params - An object containing the user and target of the attack.
   * @param params.user - The user of the attack, which can be a PlayerCharacter, Enemy, or Minion.
   * @param params.target - The target of the attack, which can be an Enemy or PlayerCharacter.
   * @returns An object containing the result of the attack and a log string.
   */
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
    if (!this.canBeUsed(user)) {
      if (user.isStunned) {
        return {
          result: AttackUse.stunned,
          logString: `${toTitleCase(this.name)} was stunned!`,
        };
      } else {
        return {
          result: AttackUse.lowEnergy,
          logString: `${toTitleCase(this.name)} passed (low energy)!`,
        };
      }
    }

    // Expend energy if the user has energy (non-player character)
    if ("expendEnergy" in user) {
      user.expendEnergy(this.energyCost);
    }

    // Attempt each hit
    const hits: AttackUse[] = [];
    for (let i = 0; i < this.hits; i++) {
      const attemptResult = this.doesHit({
        target,
        conditionalHitChanceMultiplier: hitChanceMultiplier,
      });
      hits.push(attemptResult);
    }

    if (hits.includes(AttackUse.success)) {
      // Calculate total damage if any hit succeeds
      const { totalDamage, totalDamagePreDR } = hits.reduce(
        (acc, hitResult) => {
          if (hitResult === AttackUse.success) {
            const damagePreDR = this.baseDamage(user) * damageMult + damageFlat;
            const enemyDR = target.getDamageReduction();
            const damage = damagePreDR * (1 - enemyDR);
            return {
              totalDamage: acc.totalDamage + Math.round(damage * 4) / 4,
              totalDamagePreDR: acc.totalDamagePreDR + damagePreDR,
            };
          }
          return acc;
        },
        { totalDamage: 0, totalDamagePreDR: 0 },
      );

      target.damageHealth({ damage: totalDamage, attackerId: user.id });
      target.damageSanity(this.flatSanityDamage);
      user.damageHealth({ damage: this.selfDamage, attackerId: target.id });

      const thornsIshDamage = getConditionDamageToAttacker(
        target.conditions,
      ).healthDamage;
      if (thornsIshDamage > 0) {
        user.damageHealth({ damage: thornsIshDamage, attackerId: target.id });
      }

      const debuffNames: string[] = [];
      let amountHealed = 0;
      this.debuffs.forEach((debuff) => {
        const roll = rollD20();
        if (roll * 5 >= 100 - debuff.chance * 100) {
          if (debuff.name == "lifesteal") {
            const heal = Math.round(totalDamage * 0.5 * 4) / 4;
            amountHealed += user.restoreHealth(heal);
          } else {
            const newDebuff = createDebuff({
              debuffName: debuff.name,
              debuffChance: debuff.chance,
              enemyMaxHP:
                "nonConditionalMaxHealth" in target // done due to different attributes on different classes
                  ? target.nonConditionalMaxHealth
                  : target.healthMax,
              enemyMaxSanity:
                "nonConditionalMaxHealth" in target
                  ? target.nonConditionalMaxSanity
                  : target.sanityMax,
              primaryAttackDamage: totalDamagePreDR,
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

      const buffNames: string[] = [];
      this.buffs.forEach((buff) => {
        const newBuff = createBuff({
          buffName: buff,
          attackPower: totalDamagePreDR,
          maxHealth:
            "nonConditionalMaxHealth" in user // done due to different attributes on different classes
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

      // wait for animation timing for user (stats display).
      if ("birthdate" in user) {
        wait(1000).then(() => user.endTurn());
      }

      return {
        result: AttackUse.success,
        logString: this.logBuilder({
          result: AttackUse.success,
          targetName: this.getNameReference(target),
          user,
          healthDamage: totalDamage,
          sanityDamage: this.flatSanityDamage,
          debuffNames,
          buffNames,
          minionSpecies,
        }),
      };
    } else {
      return {
        result: AttackUse.miss,
        logString: `${toTitleCase(this.name)} missed!`,
      };
    }
  }

  /**
   * Determines if the attack hits the target based on the hit chance and target's block chance.
   * @param params - An object containing the target and the conditional hit chance multiplier.
   * @param params.target - The target of the attack.
   * @param params.conditionalHitChanceMultiplier - A multiplier that adjusts the base hit chance.
   * @returns The result of the hit attempt, which can be success, miss, or block.
   */
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

  /*
   * Returns a string to refer to the target or user with
   */
  private getNameReference(target: PlayerCharacter | Enemy | Minion) {
    if ("fullName" in target) {
      return target.fullName;
    }
    return target.creatureSpecies;
  }

  public AttackRender(user: PlayerCharacter | Enemy | Minion) {
    return AttackDetails({ attack: this, baseDamage: this.baseDamage(user) });
  }

  /**
   * Creates an Attack instance from a JSON object.
   * @param json - A JSON object containing attack properties.
   * @returns A new Attack instance.
   */
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
      hits: json.hits || 1, // Default to single hit if not specified
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
