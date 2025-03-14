import {
  createBuff,
  createDebuff,
  getConditionDamageToAttacker,
  getConditionEffectsOnAttacks,
} from "../utility/functions/conditions";
import { toTitleCase, rollD20, wait } from "../utility/functions/misc";
import { PlayerCharacter } from "./character";
import { Enemy, Minion } from "./creatures";
import {
  AttackUse,
  ItemClassType,
  Modifier,
  PlayerAnimationSet,
} from "../utility/types";
import AttackDetails from "../components/AttackDetails";
import { Condition } from "./conditions";
import { useStyles } from "../hooks/styles";

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
  uses?: number;
  user: PlayerCharacter | Enemy | Minion;
  animation?: PlayerAnimationSet;
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
  attackStyle: "single" | "dual" | "aoe";
  baseHitChance: number;
  damageMult: number;
  flatHealthDamage: number;
  selfDamage: number;
  flatSanityDamage: number;
  hits: number;
  buffStrings: string[];
  debuffStrings: { name: string; chance: number }[];
  summons: string[];
  uses: number | null; // mainly for enemies, attacks / heals that have limited uses (balance)
  user: PlayerCharacter | Enemy | Minion;
  animation: PlayerAnimationSet | undefined;

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
    uses,
    user,
    animation,
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
    this.uses = uses ?? null;
    this.buffStrings = buffs;
    this.debuffStrings = debuffs;
    this.summons = summons;
    this.user = user;
    this.animation = animation;
  }

  get buffs(): Condition[] {
    const created: Condition[] = [];
    this.buffStrings.forEach((buffString) => {
      const newBuff = createBuff({
        buffName: buffString,
        attackPower: this.damage().total,
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

  /**
   * This methods purpose is for what is possible, the method `rollDebuffs` actually goes about rolling for the debuffs and returning them
   * @param target - The target of the attack, which can be a PlayerCharacter, Enemy, or Minion
   */
  public debuffs({ target }: { target: Enemy | PlayerCharacter | Minion }) {
    const { damageFlat, damageMult } = getConditionEffectsOnAttacks({
      selfConditions: this.user.conditions,
      enemyConditions: target.conditions,
    });
    const perHitDamage = this.damage(target).total * damageMult + damageFlat;
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
          primaryAttackDamage: this.damage().total * damageMult + damageFlat,
          applierNameString: this.userNameReference,
          applierID: this.user.id,
        });
        created.push({ debuff: built, chance: debuffString.chance });
      }
    });
    return created;
  }

  private rollDebuffs({
    target,
    actualizedHits,
  }: {
    target: Enemy | PlayerCharacter | Minion;
    actualizedHits: number;
  }) {
    const debuffs: Condition[] = [];
    let amountHealed = 0;
    this.debuffs({ target }).forEach((debuff) => {
      if (rollD20() > 20 - debuff.chance * 20) {
        if (debuff.debuff) {
          debuffs.push(debuff.debuff);
          //runInAction(() => target.addCondition(debuff.debuff)); // move to combat hooks to adjust for timing
        } else if (debuff.perHitHeal) {
          const healAmount = debuff.perHitHeal * actualizedHits;
          amountHealed += healAmount;

          wait(500).then(() => {
            this.user.restoreHealth(healAmount);
          });
        }
      }
    });
    return { debuffs, amountHealed };
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
    result: {
      target: Enemy | PlayerCharacter | Minion;
      result: AttackUse;
      healed?: number;
      damages?: {
        physical: number;
        fire: number;
        cold: number;
        lightning: number;
        poison: number;
        total: number;
        sanity?: number;
      };
    }[];
    buffs?: Condition[];
    logString: string;
  } {
    if (!this.canBeUsed) {
      if (this.user.isStunned) {
        return {
          result: targets.map((target) => ({
            target,
            result: AttackUse.stunned,
          })),
          logString: `${toTitleCase(this.name)} was stunned!`,
        };
      } else {
        return {
          result: targets.map((target) => ({
            target,
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

    // everything applied to the target
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
        let actualizedHits = hits.filter((h) => h === AttackUse.success).length;
        const damages = this.damage(target);

        const totalDamageWithConditions =
          damages.total * damageMult + damageFlat;
        const finalDamage =
          Math.round(totalDamageWithConditions * actualizedHits * 4) / 4;

        if (
          this.user instanceof PlayerCharacter &&
          this.user.equipment.mainHand.itemClass == ItemClassType.Bow
        ) {
          this.user.useArrow();
        }

        let sanityDmg = this.flatSanityDamage;

        const thornsIshDamage = getConditionDamageToAttacker(
          target.conditions,
        ).healthDamage;

        if (thornsIshDamage > 0) {
          this.user.damageHealth({
            damage: thornsIshDamage,
            attackerId: target.id,
          });
        }

        const { debuffs, amountHealed } = this.rollDebuffs({
          target,
          actualizedHits,
        });

        if (
          this.user instanceof PlayerCharacter &&
          !!this.user.equipment.mainHand.activePoison
        ) {
          const effect = this.user.equipment.mainHand.consumePoison()!;
          if (effect instanceof Condition) {
            target.addCondition(effect);
            debuffs.push(effect);
          } else {
            // TODO: handle poison effects
          }
        }

        return {
          target,
          result: AttackUse.success,
          damages: {
            physical: Math.round(damages.physical * actualizedHits * 4) / 4,
            fire: Math.round(damages.fire * actualizedHits * 4) / 4,
            cold: Math.round(damages.cold * actualizedHits * 4) / 4,
            lightning: Math.round(damages.lightning * actualizedHits * 4) / 4,
            poison: Math.round(damages.poison * actualizedHits * 4) / 4,
            total: finalDamage,
            sanity: sanityDmg,
          },
          debuffs: debuffs,
          healed: amountHealed,
        };
      }

      return {
        target,
        result: AttackUse.miss,
      };
    });

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

    const buffs = this.buffs;
    // Build combined log string
    const logString = this.buildMultiTargetLog({
      targetResults,
      buffs,
      minionSpecies,
    });

    // wait for animation timing for user (stats display).
    if ("birthdate" in this.user) {
      wait(1000).then(() => (this.user as PlayerCharacter).endTurn());
    }

    return {
      result: targetResults.map(
        ({ target, result, damages, healed, debuffs }) => ({
          target,
          result,
          damages,
        }),
      ),
      buffs,
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
      if ("equipment" in target && (target.blockChance ?? 0) > 0) {
        const rollToPassBlock =
          20 - (target.equipmentStats.get(Modifier.BlockChance) ?? 0) * 20;
        if (rollToPassBlock < rollD20()) {
          return AttackUse.block;
        }
      }
      return AttackUse.success;
    }
    return AttackUse.miss;
  }

  private calculateDamageType(
    baseDamage: number,
    resistance: number = 0,
  ): number {
    if (this.damageMult === 0 && this.flatHealthDamage === 0) return 0;
    const damageBeforeResistance =
      baseDamage * this.damageMult + this.flatHealthDamage;
    return damageBeforeResistance * (1 - resistance / 100);
  }

  damage(target?: Enemy | PlayerCharacter | Minion): {
    physical: number;
    fire: number;
    cold: number;
    lightning: number;
    poison: number;
    total: number;
  } {
    const physical = this.calculateDamageType(
      this.user.totalPhysicalDamage,
      target?.getPhysicalDamageReduction(),
    );

    const fire = this.calculateDamageType(
      this.user.totalFireDamage,
      target?.fireResistance,
    );

    const cold = this.calculateDamageType(
      this.user.totalColdDamage,
      target?.coldResistance,
    );

    const lightning = this.calculateDamageType(
      this.user.totalLightningDamage,
      target?.lightningResistance,
    );

    const poison = this.calculateDamageType(
      this.user.totalPoisonDamage,
      target?.poisonResistance,
    );

    return {
      physical,
      fire,
      cold,
      lightning,
      poison,
      total: physical + fire + cold + lightning + poison,
    };
  }

  private buildMultiTargetLog({
    targetResults,
    buffs,
    minionSpecies,
  }: {
    targetResults: Array<{
      target: Enemy | PlayerCharacter | Minion;
      result: AttackUse;
      damages?: {
        physical: number;
        fire: number;
        cold: number;
        lightning: number;
        poison: number;
        total: number;
      };
      sanityDamage?: number;
      debuffs?: Condition[];
      healed?: number;
    }>;
    buffs: Condition[];
    minionSpecies: string[];
  }): string {
    let returnString = `${this.userNameReferenceForLog} used ${toTitleCase(
      this.name,
    )}.\n`;

    targetResults.forEach((result) => {
      const targetName = this.getTargetNameReference(result.target);

      if (result.result === AttackUse.success && result.damages) {
        returnString += `  • Dealt ${
          result.damages.total
        } total damage to ${toTitleCase(targetName)}:\n`;

        if (result.damages.physical > 0) {
          returnString += `    - ${result.damages.physical} physical damage\n`;
        }
        if (result.damages.fire > 0) {
          returnString += `    - ${result.damages.fire} fire damage\n`;
        }
        if (result.damages.cold > 0) {
          returnString += `    - ${result.damages.cold} cold damage\n`;
        }
        if (result.damages.lightning > 0) {
          returnString += `    - ${result.damages.lightning} lightning damage\n`;
        }
        if (result.damages.poison > 0) {
          returnString += `    - ${result.damages.poison} poison damage\n`;
        }

        if (result.sanityDamage) {
          returnString += `    - Caused ${result.sanityDamage} sanity damage\n`;
        }

        if (result.debuffs?.length) {
          returnString += `    - Applied: ${result.debuffs
            .map((debuff) => debuff.name)
            .join(", ")}\n`;
        }

        if (result.healed) {
          returnString += `    - Healed for ${result.healed}\n`;
        }
      } else {
        returnString += `  • Missed ${toTitleCase(targetName)}.\n`;
      }
    });

    if (buffs.length > 0) {
      returnString += `  • Gained: ${buffs
        .map((buff) => buff.name)
        .join(", ")}.\n`;
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

  public AttackRender(
    styles: ReturnType<typeof useStyles>,
    weaponDamage?: number,
  ) {
    if (weaponDamage) {
      return AttackDetails({
        styles,
        attack: this,
        baseDamage: this.damageBasedOnWeapon(
          this.user as PlayerCharacter,
          weaponDamage,
        ),
      });
    }
    return AttackDetails({
      styles,
      attack: this,
      baseDamage: this.damage().total,
    });
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
