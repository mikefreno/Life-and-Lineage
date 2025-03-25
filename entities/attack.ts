import { AnimationOptions } from "@/utility/enemyHelpers";
import {
  AttackUse,
  DamageType,
  Element,
  ItemClassType,
  MasteryLevel,
  parseDamageTypeObject,
  PlayerAnimationSet,
  StringToElement,
  StringToMastery,
} from "@/utility/types";
import { Character, PlayerCharacter } from "./character";
import { Condition } from "@/entities/conditions";
import {
  createBuff,
  createDebuff,
  getConditionDamageToAttacker,
  getConditionEffectsOnAttacks,
} from "@/utility/functions/conditions";
import { Creature, Enemy } from "@/entities/creatures";
import { rollD20, statRounding } from "@/utility/functions/misc";
import { action, computed, makeObservable, observable } from "mobx";
import { Being } from "@/entities/being";
import { useStyles } from "@/hooks/styles";
import AttackDetails from "@/components/AttackDetails";

interface AttackOption {
  name: string;
  manaCost?: number;
  baseHitChance?: number;
  targets?: "single" | "dual" | "area"; // area hits all, dual hits two, single one
  damageTable: { [key: string]: number | undefined };
  selfDamageTable?: { [key: string]: number | undefined };
  sanityDamage?: number;
  hitsPerTurn?: number;
  buffNames?: string[];
  debuffNames?: { name: string; chance: number }[];
  summonNames?: string[];
  rangerPetName?: string;
  maxTurnsActive?: number;
  remainingTurnsActive?: number;
  heldActiveTargets?: Being[] | null;
  isActive?: boolean;
  maxUses?: number;
  user: Character | Creature;
  animation?: PlayerAnimationSet | AnimationOptions | null;
  element?: Element;
  proficiencyNeeded?: string | null;
  usesWeapon?: string;
}

export type PerTargetUse =
  | {
      result: AttackUse.success;
      damages?: {
        physical: number;
        fire: number;
        cold: number;
        lightning: number;
        poison: number;
        holy: number;
        magic: number;
        raw: number;
        total: number;
        sanity: number;
      };
      debuffs?: Condition[];
      healed?: number;
    }
  | {
      result:
        | AttackUse.block
        | AttackUse.miss
        | AttackUse.stunned
        | AttackUse.lowMana;
    };

export class Attack {
  readonly name: string;

  readonly manaCost: number;

  readonly targets: "single" | "dual" | "area";

  readonly baseHitChance: number;

  readonly damageTable: { [key in DamageType]?: number } | null;

  readonly selfDamageTable: { [key in DamageType]?: number } | null;

  readonly sanityDamage: number;

  readonly hitsPerTurn: number;

  readonly buffNames: string[] | null;
  readonly debuffNames: { name: string; chance: number }[] | null;
  readonly summonNames: string[] | null;
  readonly rangerPetName: string | null;

  readonly maxTurnsActive: number; // number of turns where the attack will be reactivated (default:1) -  TODO: implement this handling
  remainingTurnsActive: number | null;
  isActive: boolean;
  heldActiveTargets: Being[] | null;

  remainingUses: number | null; // mainly for enemies, attacks / heals that have limited uses (balance)

  readonly animation: PlayerAnimationSet | AnimationOptions | null;

  user: Character | Creature; // used to limit uses, mainly by enemies

  readonly element: Element | null; // null for physical
  readonly proficiencyNeeded: MasteryLevel | null;
  readonly usesWeapon: string | null;

  constructor({
    name,
    manaCost,
    baseHitChance,
    targets,
    damageTable,
    selfDamageTable,
    sanityDamage,
    hitsPerTurn,
    buffNames,
    debuffNames,
    summonNames,
    rangerPetName,
    maxTurnsActive,
    remainingTurnsActive,
    isActive,
    heldActiveTargets,
    maxUses,
    animation,
    user,
    element,
    proficiencyNeeded,
    usesWeapon,
  }: AttackOption) {
    this.name = name;
    this.manaCost = manaCost ?? 0;
    this.targets = targets ?? "single";
    this.baseHitChance = baseHitChance ?? 1.0;
    this.damageTable = damageTable ? parseDamageTypeObject(damageTable) : null;
    this.selfDamageTable = selfDamageTable
      ? parseDamageTypeObject(selfDamageTable)
      : null;
    this.sanityDamage = sanityDamage ?? 0;
    this.hitsPerTurn = hitsPerTurn ?? 1;
    this.buffNames = buffNames ?? null;
    this.debuffNames = debuffNames ?? null;
    this.summonNames = summonNames ?? null;
    this.rangerPetName = rangerPetName ?? null;
    this.maxTurnsActive = maxTurnsActive ?? 1;
    this.remainingTurnsActive = remainingTurnsActive ?? null;
    this.isActive = isActive ?? false;
    this.remainingUses = maxUses ?? null;
    this.heldActiveTargets = heldActiveTargets ?? null;
    this.animation = animation ?? null;
    this.user = user;
    this.element = element ? StringToElement[element] : null;
    this.usesWeapon = usesWeapon ?? null;

    this.proficiencyNeeded = proficiencyNeeded
      ? StringToMastery[proficiencyNeeded]
      : null;

    makeObservable(this, {
      remainingUses: observable,

      remainingTurnsActive: observable,
      heldActiveTargets: observable,

      buffs: computed,
      debuffs: action,

      damage: action,

      displayDamage: computed,
      selfDamage: computed,

      canBeUsed: computed,
      userHasRequiredWeapon: computed,

      use: action,
    });
  }

  get buffs(): Condition[] | null {
    if (!this.buffNames) return null;
    const created: Condition[] = [];
    this.buffNames.forEach((name) => {
      const newBuff = createBuff({
        buffName: name,
        attackPower: Math.max(this.user.attackPower, this.user.magicPower),
        maxHealth: this.user.nonConditionalMaxHealth,
        maxSanity: this.user.nonConditionalMaxSanity,
        applierNameString: this.user.nameReference,
        applierID: this.user.id,
      });
      if (newBuff) {
        created.push(newBuff);
      } else {
        throw new Error(`buff creation failure on ${this.name}`);
      }
    });
    return created;
  }

  /**
   * This methods purpose is for what is possible, the method `rollDebuffs` actually goes about rolling for the debuffs and returning them
   * @param target - The target of the attack, which can be a Character | Creature (Being)
   */
  public debuffs({ target }: { target: Being }):
    | {
        debuff?: Condition;
        chance: number;
        perHitHeal?: number;
      }[]
    | null {
    if (!this.debuffNames) return null;

    const { damageFlat, damageMult } = getConditionEffectsOnAttacks({
      selfConditions: this.user.conditions,
      enemyConditions: target.conditions,
    });

    const perHitDamage =
      this.user.calculateAttackDamage(
        this.damageTable,
        this.element != null,
        target,
      ).cumulativeDamage *
        damageMult +
      damageFlat;

    const created: {
      debuff?: Condition;
      chance: number;
      perHitHeal?: number;
    }[] = [];

    this.debuffNames.map(({ name, chance }) => {
      if (name == "lifesteal") {
        const healPerHit = perHitDamage * 0.5;
        created.push({ perHitHeal: healPerHit, chance });
      } else {
        const built = createDebuff({
          debuffName: name,
          enemyMaxHP: target.nonConditionalMaxHealth,
          enemyMaxSanity: target.nonConditionalMaxSanity,
          primaryAttackDamage:
            this.user.calculateAttackDamage(
              this.damageTable,
              this.element != null,
              target,
            ).cumulativeDamage *
              damageMult +
            damageFlat,
          applierNameString: this.user.nameReference,
          applierID: this.user.id,
        });
        created.push({ debuff: built, chance });
      }
    });
    return created;
  }

  get displayDamage() {
    return this.user.calculateAttackDamage(
      this.damageTable,
      this.element != null,
    );
  }

  get selfDamage() {
    return this.user.calculateAttackDamage(
      this.selfDamageTable,
      this.element != null,
      this.user,
    );
  }

  public damage(target: Being) {
    return this.user.calculateAttackDamage(
      this.damageTable,
      this.element != null,
      target,
    );
  }

  private rollDebuffs({
    target,
    actualizedHits,
  }: {
    target: Being;
    actualizedHits: number;
  }): { debuffs: Condition[]; amountHealed: number } | null {
    if (!this.debuffs) return null;

    const debuffs: Condition[] = [];
    let amountHealed = 0;
    this.debuffs({ target })?.forEach((debuff) => {
      if (rollD20() > 20 - debuff.chance * 20) {
        if (debuff.debuff) {
          debuffs.push(debuff.debuff);
        } else if (debuff.perHitHeal) {
          amountHealed = debuff.perHitHeal * actualizedHits;
        }
      }
    });
    return { debuffs, amountHealed };
  }

  get canBeUsed(): { val: true } | { val: false; reason: string } {
    if (this.user.isStunned) {
      return { val: false, reason: "Stunned" };
    }
    if (this.user.isSilenced && this.element !== null) {
      return { val: false, reason: "Silenced" };
    }
    if (this.isActive) {
      return { val: false, reason: "Active" };
    }
    if (this.remainingUses !== null && this.remainingUses == 0) {
      return { val: false, reason: "No uses" };
    }
    if (this.usesWeapon && !this.userHasRequiredWeapon) {
      return { val: false, reason: `Needs ${this.usesWeapon}` };
    }
    if (this.user.currentMana < this.manaCost) {
      return { val: false, reason: "Low Mana" };
    }
    if (this.user instanceof PlayerCharacter) {
      if (
        this.proficiencyNeeded &&
        this.element &&
        this.user.currentMasteryLevel(this.element) < this.proficiencyNeeded
      ) {
        return { val: false, reason: "Low Proficiency" };
      }
      if (!this.user.hasEnoughBloodOrbs(this)) {
        return { val: false, reason: "Low Orbs" };
      }
    }
    return { val: true };
  }

  get userHasRequiredWeapon() {
    return (
      !!this.usesWeapon &&
      this.user.equipment?.mainHand.itemClass === this.usesWeapon
    );
  }

  /*
   * Used for each target, based on this.targets, and what is passed to this.use, does the actual calculation for each target
   */
  private _internalUse(target: Being): PerTargetUse {
    const { hitChanceMultiplier } = getConditionEffectsOnAttacks({
      selfConditions: this.user.conditions,
      enemyConditions: target.conditions,
    });

    const hits: AttackUse[] = [];

    for (let i = 0; i < this.hitsPerTurn; i++) {
      const finalHitChance = this.baseHitChance * hitChanceMultiplier;
      if (Math.random() < finalHitChance) {
        if (Math.random() < target.dodgeChance / 100) {
          hits.push(AttackUse.miss);
          continue;
        }
        if (Math.random() < target.blockChance / 100) {
          hits.push(AttackUse.block);
          continue;
        }
        hits.push(AttackUse.success);
      } else {
        hits.push(AttackUse.miss);
      }
    }

    if (hits.includes(AttackUse.success)) {
      let actualizedHits = hits.filter((h) => h === AttackUse.success).length;

      if (
        this.user instanceof PlayerCharacter &&
        this.user.equipment?.mainHand.itemClass == ItemClassType.Bow
      ) {
        this.user.useArrow();
      }

      const thornsIshDamage = getConditionDamageToAttacker(
        target.conditions,
      ).healthDamage;

      if (thornsIshDamage > 0) {
        this.user.damageHealth({
          damage: thornsIshDamage,
          attackerId: target.id,
        });
      }

      const debuffRoll = this.rollDebuffs({ target, actualizedHits });

      const debuffs = debuffRoll?.debuffs ?? [];
      const amountHealed = debuffRoll?.amountHealed ?? 0;

      if (!!this.user.equipment?.mainHand.activePoison) {
        const effect = this.user.equipment.mainHand.consumePoison()!;
        if (effect instanceof Condition) {
          debuffs.push(effect);
        } else {
          // TODO: handle poison effects
        }
      }

      const damage = this.damage(target);

      return {
        result: AttackUse.success,
        damages: {
          physical: damage.damageMap[DamageType.PHYSICAL]
            ? damage.damageMap[DamageType.PHYSICAL] * actualizedHits
            : 0,
          fire: damage.damageMap[DamageType.FIRE]
            ? damage.damageMap[DamageType.FIRE] * actualizedHits
            : 0,
          cold: damage.damageMap[DamageType.COLD]
            ? damage.damageMap[DamageType.COLD] * actualizedHits
            : 0,
          lightning: damage.damageMap[DamageType.LIGHTNING]
            ? damage.damageMap[DamageType.LIGHTNING] * actualizedHits
            : 0,
          poison: damage.damageMap[DamageType.POISON]
            ? damage.damageMap[DamageType.POISON] * actualizedHits
            : 0,
          holy: damage.damageMap[DamageType.HOLY]
            ? damage.damageMap[DamageType.HOLY] * actualizedHits
            : 0,
          magic: damage.damageMap[DamageType.MAGIC]
            ? damage.damageMap[DamageType.MAGIC] * actualizedHits
            : 0,
          raw: damage.damageMap[DamageType.RAW]
            ? damage.damageMap[DamageType.RAW] * actualizedHits
            : 0,
          total: damage.cumulativeDamage,
          sanity: this.sanityDamage,
        },
        debuffs: debuffs,
        healed: amountHealed,
      };
    }

    return {
      result: hits.includes(AttackUse.block) ? AttackUse.block : AttackUse.miss,
    };
  }

  public use(targets: Being[]) {
    if (!this.canBeUsed.val) {
      // this shouldn't really ever be used(checked before use is called), here just in case
      throw new Error("used attack that was not valid... check before use!");
    }

    if (!this.isActive && this.manaCost) {
      this.user.useMana(this.manaCost);
    }

    let minionSpecies: string[] = [];

    if (this.user instanceof PlayerCharacter || this.user instanceof Enemy) {
      if (this.summonNames) {
        this.summonNames.forEach((summon) => {
          const type = (this.user as PlayerCharacter | Enemy).createMinion(
            summon,
          );
          minionSpecies.push(type);
        });
      }
      if (this.user instanceof PlayerCharacter) {
        if (this.rangerPetName) {
          const type = this.user.summonPet(this.rangerPetName);
          minionSpecies.push(type);
        }

        if (this.element) {
          this.user.gainProficiency(this);
        }
      }
    }

    const allTargetResult: {
      target: Being;
      use: PerTargetUse;
    }[] = [];

    for (const target of targets) {
      const use = this._internalUse(target);
      allTargetResult.push({ target, use });
    }

    //end check for multi-turn attacks
    if (this.isActive && this.remainingTurnsActive) {
      if (this.remainingTurnsActive <= 1) {
        this.isActive = false;
        this.remainingTurnsActive = null;
        this.heldActiveTargets = null;
      } else {
        this.remainingTurnsActive -= 1;
      }
    } else if (this.maxTurnsActive > 1) {
      this.isActive = true;
      this.remainingTurnsActive = this.maxTurnsActive - 1;
      this.heldActiveTargets = targets;
    }

    const log = this.buildLogString(allTargetResult, minionSpecies);

    return { targetResults: allTargetResult, buffs: this.buffs, log };
  }

  private buildLogString(
    targetResults: {
      target: Being;
      use: PerTargetUse;
    }[],
    minionSpecies: string[] = [],
  ): string {
    let returnString = `${this.user.nameReference} used ${this.name}.\n`;

    targetResults.forEach(({ target, use }) => {
      const targetName =
        target instanceof PlayerCharacter
          ? "You"
          : (target as Creature | Character).nameReference;

      if (use.result === AttackUse.success && use.damages) {
        returnString += `  • Dealt ${use.damages.total} total damage to ${targetName}:\n`;

        if (use.damages.physical > 0) {
          returnString += `    - ${use.damages.physical} physical damage\n`;
        }
        if (use.damages.fire > 0) {
          returnString += `    - ${use.damages.fire} fire damage\n`;
        }
        if (use.damages.cold > 0) {
          returnString += `    - ${use.damages.cold} cold damage\n`;
        }
        if (use.damages.lightning > 0) {
          returnString += `    - ${use.damages.lightning} lightning damage\n`;
        }
        if (use.damages.poison > 0) {
          returnString += `    - ${use.damages.poison} poison damage\n`;
        }
        if (use.damages.holy > 0) {
          returnString += `    - ${use.damages.holy} holy damage\n`;
        }
        if (use.damages.magic > 0) {
          returnString += `    - ${use.damages.magic} magic damage\n`;
        }
        if (use.damages.raw > 0) {
          returnString += `    - ${use.damages.raw} raw damage\n`;
        }

        if (use.damages.sanity > 0) {
          returnString += `    - Caused ${use.damages.sanity} sanity damage\n`;
        }

        if (use.debuffs?.length) {
          returnString += `    - Applied: ${use.debuffs
            .map((debuff) => debuff.name)
            .join(", ")}\n`;
        }

        if (use.healed) {
          returnString += `    - Healed for ${use.healed}\n`;
        }
      } else if (use.result === AttackUse.block) {
        returnString += `  • Attack was blocked by ${targetName}.\n`;
      } else {
        returnString += `  • Missed ${targetName}.\n`;
      }
    });

    const buffs = this.buffs;
    if (buffs && buffs.length > 0) {
      returnString += `  • Gained: ${buffs
        .map((buff) => buff.name)
        .join(", ")}.\n`;
    }

    if (minionSpecies.length > 0) {
      returnString += `  • Summoned: ${minionSpecies.join(", ")}.\n`;
    }

    const selfDamageResult = this.selfDamage;
    if (selfDamageResult.cumulativeDamage > 0) {
      returnString += `  • Took ${selfDamageResult.cumulativeDamage} self-damage.\n`;
    }

    return returnString.trim();
  }

  static fromJSON(json: any, user: Character | Creature): Attack {
    if (!json.name) {
      throw new Error("Attack name is required");
    }

    return new Attack({
      name: json.name,
      manaCost: json.manaCost,
      baseHitChance: json.baseHitChance,
      targets: json.targets,
      damageTable: json.damageTable || {},
      selfDamageTable: json.selfDamageTable || {},
      sanityDamage: json.sanityDamage,
      hitsPerTurn: json.hitsPerTurn,
      buffNames: json.buffNames,
      debuffNames: json.debuffNames,
      summonNames: json.summonNames,
      rangerPetName: json.rangerPetName,
      maxTurnsActive: json.maxTurnsActive,
      remainingTurnsActive: json.remainingTurnsActive,
      isActive: json.isActive,
      maxUses: json.maxUses,
      animation: json.animation,
      user: user,
      element: json.element,
      proficiencyNeeded: json.proficiencyNeeded,
      usesWeapon: json.usesWeapon,
    });
  }

  public AttackRender(styles: ReturnType<typeof useStyles>) {
    return AttackDetails({
      styles,
      attack: this,
      baseDamage: statRounding(this.displayDamage.cumulativeDamage),
    });
  }
}
