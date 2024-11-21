import {
  createBuff,
  createDebuff,
  getConditionDamageToAttacker,
  getConditionEffectsOnAttacks,
} from "../utility/functions/conditions";
import { toTitleCase, rollD20, wait } from "../utility/functions/misc";
import { PlayerCharacter } from "./character";
import { Enemy, Minion } from "./creatures";
import { AttackUse, ItemClassType } from "../utility/types";
import AttackDetails from "../components/AttackDetails";
import { Condition } from "./conditions";

/**
 * Interface for the fields of an attack.
 * @property {string} name - The name of the attack.
 * @property {number} [energyCost=0] - The energy cost to perform the attack.
 * @property {number} [hitChance=1.0] - The base hit chance of the attack.
 * @property {"single" | "dual" | "aoe"} [targets="single"] - The type of targets the attack can hit.
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
  targets?: "single" | "dual" | "aoe"; // aoe hits all, dual hits two, single one
  damageMult?: number;
  flatHealthDamage?: number;
  selfDamage?: number;
  flatSanityDamage?: number;
  hits?: number;
  buffs?: string[];
  debuffs?: { name: string; chance: number }[];
  summons?: string[];
  user: PlayerCharacter | Enemy | Minion;
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
  attackStyle: "single" | "dual" | "aoe"; // at time of writing, only implementing single target
  baseHitChance: number;
  damageMult: number;
  flatHealthDamage: number;
  selfDamage: number;
  flatSanityDamage: number;
  hits: number;
  buffStrings: string[];
  debuffStrings: { name: string; chance: number }[];
  summons: string[];
  user: PlayerCharacter | Enemy | Minion;

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
    user,
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
    this.buffStrings = buffs;
    this.debuffStrings = debuffs;
    this.summons = summons;
    this.user = user;
  }

  get buffs(): Condition[] {
    const created: Condition[] = [];
    this.buffStrings.forEach((buffString) => {
      const newBuff = createBuff({
        buffName: buffString,
        attackPower: this.user.attackPower,
        maxHealth:
          "nonConditionalMaxHealth" in this.user // done due to different attributes on different classes
            ? this.user.nonConditionalMaxHealth
            : this.user.baseHealth,
        maxSanity:
          "nonConditionalMaxHealth" in this.user
            ? this.user.nonConditionalMaxSanity
            : this.user.baseSanity,
        applierNameString: this.userNameReference,
        applierID: this.user.id,
      });
      if (newBuff) {
        created.push(newBuff);
      }
    });
    return created;
  }

  private addBuffs() {
    this.buffs.forEach((buff) => this.user.addCondition(buff));
  }

  /**
   * This is more complicated than buffs, due to this being dependent on both a dice roll and the target's stats.
   * @param target - The target of the attack, which can be a PlayerCharacter, Enemy, or Minion
   */
  public debuffs({ target }: { target: Enemy | PlayerCharacter | Minion }) {
    const { damageFlat, damageMult } = getConditionEffectsOnAttacks({
      selfConditions: this.user.conditions,
      enemyConditions: target.conditions,
    });
    const damagePreDR = this.baseDamage * damageMult + damageFlat;
    const enemyDR = target.getDamageReduction();
    const perHitDamage = damagePreDR * (1 - enemyDR);
    const created: {
      debuff?: Condition;
      chance: number;
      perHitHeal?: number;
    }[] = [];
    this.debuffStrings.forEach((debuffString) => {
      if (debuffString.name == "lifesteal") {
        const healPerHit = Math.round(perHitDamage * 0.5 * 4) / 4;
        created.push({ perHitHeal: healPerHit, chance: debuffString.chance });
      } else {
        const built = createDebuff({
          debuffName: debuffString.name,
          enemyMaxHP:
            "nonConditionalMaxHealth" in target // done due to different attributes on different classes
              ? target.nonConditionalMaxHealth
              : target.baseHealth,
          enemyMaxSanity:
            "nonConditionalMaxHealth" in target
              ? target.nonConditionalMaxSanity
              : target.baseSanity,
          primaryAttackDamage: this.baseDamage * damageMult + damageFlat,
          applierNameString: this.userNameReference,
          applierID: this.user.id,
        });
        created.push({ debuff: built, chance: debuffString.chance });
      }
    });
    return created;
  }

  private addDebuffs({
    target,
    actualizedHits,
  }: {
    target: Enemy | PlayerCharacter | Minion;
    actualizedHits: number;
  }) {
    const debuffNames: string[] = [];
    let amountHealed = 0;
    this.debuffs({ target }).forEach((debuff) => {
      if (rollD20() > 20 - debuff.chance * 20) {
        if (debuff.debuff) {
          debuffNames.push(debuff.debuff.name);
          target.addCondition(debuff.debuff);
        } else if (debuff.perHitHeal) {
          const healAmount = debuff.perHitHeal * actualizedHits;
          amountHealed += healAmount;

          if (!(this.user instanceof PlayerCharacter)) {
            wait(500).then(() => {
              this.user.restoreHealth(healAmount);
            });
          } else {
            this.user.restoreHealth(healAmount);
          }
        }
      }
    });
    return { debuffNames, amountHealed };
  }

  /**
   * Calculates the base damage of the attack based on the user's attack power and other modifiers.
   * @returns The base damage of the attack.
   */
  get baseDamage() {
    if (this.damageMult == 0) {
      return 0;
    }
    return this.user.attackPower * this.damageMult + this.flatHealthDamage;
  }

  public damageBasedOnWeapon(user: PlayerCharacter, weaponDamage: number) {
    if (this.damageMult == 0) {
      return 0;
    }
    return (
      user.totalStrength * 0.5 +
      weaponDamage * this.damageMult +
      this.flatHealthDamage
    );
  }

  /**
   * Checks if the attack can be used based on the user's current state.
   * @returns True if the attack can be used, false otherwise.
   */
  get canBeUsed() {
    if (this.user.isStunned) {
      return false;
    }
    if ("baseEnergy" in this.user && this.user.baseEnergy < this.energyCost) {
      return false;
    }
    return true;
  }

  /**
   * Uses the attack against a target.
   * @param target - The target of the attack, which can be an Enemy, PlayerCharacter or Minion.
   * @returns An object containing the result of the attack and a log string.
   */
  public use({ targets }: { targets: (Enemy | PlayerCharacter | Minion)[] }): {
    result: { target: string; result: AttackUse }[];
    logString: string;
  } {
    if (!this.canBeUsed) {
      if (this.user.isStunned) {
        return {
          result: targets.map(({ id }) => ({
            target: id,
            result: AttackUse.stunned,
          })),
          logString: `${toTitleCase(this.name)} was stunned!`,
        };
      } else {
        return {
          result: targets.map(({ id }) => ({
            target: id,
            result: AttackUse.lowEnergy,
          })),
          logString: `${toTitleCase(
            this.userNameReference,
          )} passed (low energy)!`,
        };
      }
    }

    // Expend energy if the user has energy (non-player character)
    if ("expendEnergy" in this.user) {
      this.user.expendEnergy(this.energyCost);
    }

    const targetResults = targets.map((target) => {
      const { hitChanceMultiplier, damageFlat, damageMult } =
        getConditionEffectsOnAttacks({
          selfConditions: this.user.conditions,
          enemyConditions: target.conditions,
        });

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
        let actualizedHits = 0;
        let { totalDamage } = hits.reduce(
          (acc, hitResult) => {
            if (hitResult === AttackUse.success) {
              actualizedHits++;
              const damagePreDR = this.baseDamage * damageMult + damageFlat;
              const enemyDR = target.getDamageReduction();
              const damage = damagePreDR * (1 - enemyDR);

              if (
                this.user instanceof PlayerCharacter &&
                this.user.equipment.mainHand.itemClass == ItemClassType.Bow
              ) {
                this.user.useArrow();
              }

              return {
                totalDamage: acc.totalDamage + Math.round(damage * 4) / 4,
              };
            }
            return acc;
          },
          { totalDamage: 0 },
        );

        // Handle poison effects
        let sanityDmg = this.flatSanityDamage;
        const debuffStrings: string[] = [];
        if (
          this.user instanceof PlayerCharacter &&
          !!this.user.equipment.mainHand.activePoison
        ) {
          const effect = this.user.equipment.mainHand.consumePoison()!;
          if (effect instanceof Condition) {
            target.addCondition(effect);
            debuffStrings.push(effect.name);
          } else {
            // ... handle poison effects
          }
        }

        target.damageHealth({ damage: totalDamage, attackerId: this.user.id });
        target.damageSanity(this.flatSanityDamage);

        const thornsIshDamage = getConditionDamageToAttacker(
          target.conditions,
        ).healthDamage;

        if (thornsIshDamage > 0) {
          this.user.damageHealth({
            damage: thornsIshDamage,
            attackerId: target.id,
          });
        }

        const { debuffNames, amountHealed } = this.addDebuffs({
          target,
          actualizedHits,
        });

        return {
          target,
          result: AttackUse.success,
          damage: totalDamage,
          sanityDamage: sanityDmg,
          debuffs: [...debuffStrings, ...debuffNames],
          healed: amountHealed,
        };
      }

      return {
        target,
        result: AttackUse.miss,
      };
    });

    // Apply buffs only once for the entire attack
    this.addBuffs();

    // Handle summons
    let minionSpecies: string[] = [];
    if ("createMinion" in this.user) {
      this.summons.forEach((summon) => {
        const type = (this.user as PlayerCharacter | Enemy).createMinion(
          summon,
        );
        minionSpecies.push(type);
      });
    }

    // Build combined log string
    const logString = this.buildMultiTargetLog({
      targetResults,
      buffNames: this.buffStrings,
      minionSpecies,
    });

    // wait for animation timing for user (stats display).
    if ("birthdate" in this.user) {
      wait(1000).then(() => (this.user as PlayerCharacter).endTurn());
    }

    return {
      result: targetResults.map(({ target, result }) => ({
        target: target.id,
        result,
      })),
      logString,
    };
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
    const roll = rollD20();
    if (roll >= rollToHit) {
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

  private buildMultiTargetLog({
    targetResults,
    buffNames,
    minionSpecies,
  }: {
    targetResults: Array<{
      target: Enemy | PlayerCharacter | Minion;
      result: AttackUse;
      damage?: number;
      sanityDamage?: number;
      debuffs?: string[];
      healed?: number;
    }>;
    buffNames: string[];
    minionSpecies: string[];
  }): string {
    let returnString = `${this.userNameReferenceForLog} used ${toTitleCase(
      this.name,
    )}.\n`;

    targetResults.forEach((result) => {
      const targetName = this.getTargetNameReference(result.target);

      if (result.result === AttackUse.success && result.damage) {
        returnString += `  • Dealt ${result.damage} damage to ${toTitleCase(
          targetName,
        )}.\n`;

        if (result.sanityDamage) {
          returnString += `    - Caused ${result.sanityDamage} sanity damage.\n`;
        }

        if (result.debuffs?.length) {
          returnString += `    - Applied: ${result.debuffs.join(", ")}.\n`;
        }

        if (result.healed) {
          returnString += `    - Healed for ${result.healed}.\n`;
        }
      } else {
        returnString += `  • Missed ${toTitleCase(targetName)}.\n`;
      }
    });

    if (buffNames.length > 0) {
      returnString += `  • Gained: ${buffNames.join(", ")}.\n`;
    }

    if (minionSpecies.length > 0) {
      returnString += `  • Summoned: ${minionSpecies.join(", ")}.\n`;
    }

    if (this.selfDamage > 0) {
      returnString += `  • Took ${this.selfDamage} self-damage.\n`;
    }

    return returnString.trim();
  }

  /*
   * Returns a string to refer to the target or user with
   */
  private getTargetNameReference(target: PlayerCharacter | Enemy | Minion) {
    if ("fullName" in target) {
      return "You";
    }
    return target.creatureSpecies;
  }

  get userNameReferenceForLog() {
    if ("fullName" in this.user) {
      return this.user.fullName;
    }
    return `The ${toTitleCase(this.user.creatureSpecies)}`;
  }

  get userNameReference() {
    if ("fullName" in this.user) {
      return this.user.fullName;
    }
    return `The ${toTitleCase(this.user.creatureSpecies)}`;
  }

  public AttackRender(weaponDamage?: number) {
    if (weaponDamage) {
      return AttackDetails({
        attack: this,
        baseDamage: this.damageBasedOnWeapon(
          this.user as PlayerCharacter,
          weaponDamage,
        ),
      });
    }
    return AttackDetails({ attack: this, baseDamage: this.baseDamage });
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
      user: json.user,
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
  healthDamage: number;
  sanityDamage: number;
  debuffNames: string[];
  buffNames: string[];
  minionSpecies: string[];
  amountHealed: number;
};

type LogProps = AttackSuccessLogProps | AttackFailureLogProps;
