import { createBuff, createDebuff } from "../utility/functions/conditions";
import { wait, toTitleCase, rollD20 } from "../utility/functions/misc";
import {
  DamageType,
  Element,
  MasteryLevel,
  PlayerAnimationSet,
  StringToDamageType,
  StringToElement,
  StringToMastery,
} from "../utility/types";
import { PlayerCharacter } from "./character";
import { type Condition } from "./conditions";
import { Enemy, Minion } from "./creatures";

interface SpellFields {
  name: string;
  attackStyle?: "single" | "dual" | "area";
  element: string;
  proficiencyNeeded: string | null;
  manaCost: number;
  duration?: number;
  usesWeapon?: string | null;
  effects: {
    damage: { [key: string]: number } | null;
    buffs: string[] | null;
    debuffs:
      | {
          name: string;
          chance: number;
        }[]
      | null;
    summon?: string[] | undefined;
    pet?: string;
    selfDamage?: { [key: string]: number } | null | undefined;
    sanityDamage?: number | undefined;
  };
  animation: PlayerAnimationSet;
}

/**
 * This class instantiates learned spells by the `PlayerCharacter` only.
 * An instance can be made with the constructor `new Spell({})`
 * This used to store a reference to the user `PlayerCharacter`. This was abandoned due to creating cyclical data
 * The heart of this class is the `use` method, no other method needed for use other than `canBeUsed` as a check in UI
 */
export class Spell {
  name: string;
  attackStyle: "single" | "dual" | "area";
  element: Element;
  usesWeapon: string | null;
  proficiencyNeeded: MasteryLevel | null;
  duration: number;
  manaCost: number;
  damageByType: { [key in DamageType]?: number };
  selfDamageByType: { [key in DamageType]?: number };
  flatSanityDamage: number;
  buffs: string[];
  debuffs: { name: string; chance: number }[];
  summons: string[];
  rangerPet: string | undefined;
  animation?: PlayerAnimationSet;

  constructor({
    name,
    attackStyle,
    element,
    proficiencyNeeded,
    manaCost,
    duration,
    effects,
    usesWeapon,
    animation,
  }: SpellFields) {
    this.name = name;
    this.element = StringToElement[element];
    this.usesWeapon = usesWeapon ?? null;
    this.attackStyle = attackStyle ?? "single";
    this.proficiencyNeeded = proficiencyNeeded
      ? StringToMastery[proficiencyNeeded]
      : null;
    this.manaCost = manaCost;
    this.duration = duration ?? 1;
    
    this.damageByType = {};
    this.selfDamageByType = {};
    
    if (effects.damage) {
      Object.entries(effects.damage).forEach(([key, value]) => {
        const damageType = StringToDamageType[key.toLowerCase()];
        if (damageType !== undefined && value !== undefined) {
          this.damageByType[damageType] = value;
        }else{
          throw new Error(`invalid damage type: ${key} on ${this.name}`)
        }
      });
    }
    
    if (effects.selfDamage) {
      Object.entries(effects.selfDamage).forEach(([key, value]) => {
    }
    
    this.flatSanityDamage = effects.sanityDamage ?? 0;
    this.buffs = effects.buffs ?? [];
    this.debuffs = effects.debuffs ?? [];
    this.summons = effects.summon ?? [];
    this.rangerPet = effects.pet;
    this.animation = animation;
  }
  
 get totalRawDamage(): number {
    return Object.values(this.damageByType).reduce((sum, damage) => sum + (damage || 0), 0);
  }

  get totalRawSelfDamage(): number {
    return Object.values(this.selfDamageByType).reduce((sum, damage) => sum + (damage || 0), 0);
  }

  public baseDamage(user: PlayerCharacter) {
    if (this.totalRawDamage > 0) {
      if (this.usesWeapon) {
        if (
          user.equipment.mainHand.itemClass === this.usesWeapon //title case aligns with ItemClassType
        ) {
          return this.totalRawDamage + user.magicPower + (user.totalDamage ?? 0);
        } else return 0;
      }
      return this.totalRawDamage + user.magicPower;
    } else return 0;
  }

  public userHasRequiredWeapon(user: PlayerCharacter) {
    return (
      this.usesWeapon && user.equipment.mainHand.itemClass === this.usesWeapon
    );
  }

  public canBeUsed(
    user: PlayerCharacter,
  ): { val: true } | { val: false; reason: string } {
    if (user.isStunned) {
      return { val: false, reason: "Stunned!" };
    }
    if (this.usesWeapon && !this.userHasRequiredWeapon(user)) {
      return {
        val: false,
        reason: `Requires: ${toTitleCase(this.usesWeapon)}`,
      };
    }
    if (user.currentMana < this.manaCost) {
      return { val: false, reason: "Low Mana" };
    }
    if (
      this.proficiencyNeeded &&
      (user.currentMasteryLevel(this.element) as MasteryLevel) <
        this.proficiencyNeeded
    ) {
      return { val: false, reason: "Low Proficiency" };
    }
    if (!user.hasEnoughBloodOrbs(this)) {
      return { val: false, reason: "Low Orbs" };
    }

    return { val: true };
  }

  public calcPostResistanceDamage({target, user, damageType}:{target: PlayerCharacter | Enemy | Minion, user: PlayerCharacter, damageType: DamageType}){
  }

  public use({
    targets,
    user,
  }: {
    targets: (PlayerCharacter | Enemy | Minion)[];
    user: PlayerCharacter;
  }): {
    logString: string;
    result: "success" | "failure";
    buffs?: Condition[];
    targetResults: {
      target: PlayerCharacter | Enemy | Minion;
      damage: number;
      sanityDamage: number;
      debuffs: Condition[];
      healed: number;
    }[];
  } {
    if (!this.canBeUsed(user).val) {
      return {
        logString: "The spell fizzles out",
        result: "failure",
        targetResults: [],
      };
    }

    let bloodMult = 1;
    if (this.buffs.includes("consume blood orb")) {
      bloodMult = user.removeBloodOrbs(this);
    }

    user.useMana(this.manaCost * bloodMult);

    const targetResults = targets.map((target) => {
      const finalDamage = Math.round(this.baseDamage(user) * 4) / 4;

      target.damageHealth({ damage: finalDamage, attackerId: user.id });
      target.damageSanity(this.flatSanityDamage);

      // Handle debuffs for this target
      const debuffs: Condition[] = [];
      let amountHealed = 0;

      this.debuffs.forEach((debuff) => {
        if (debuff.name == "lifesteal") {
          const roll = rollD20();
          if (roll * 5 >= 100 - debuff.chance * 100) {
            const heal = Math.round(this.baseDamage(user) * 0.5 * 4) / 4;
            amountHealed += user.restoreHealth(heal);
          }
        } else {
          const newDebuff = createDebuff({
            debuffName: debuff.name,
            enemyMaxHP: target.maxHealth,
            enemyMaxSanity: target.maxSanity,
            primaryAttackDamage: this.baseDamage(user),
            applierNameString: user.fullName,
            applierID: user.id,
          });

          if (newDebuff) {
            debuffs.push(newDebuff);
          }
        }
      });

      return {
        target,
        damage: finalDamage * bloodMult,
        sanityDamage: this.flatSanityDamage,
        debuffs,
        healed: amountHealed,
      };
    });

    // Handle buffs (only once for the caster)
    const buffs: Condition[] = [];
    this.buffs.forEach((buff) => {
      if (buff !== "consume blood orb") {
        const newBuff = createBuff({
          buffName: buff,
          attackPower: this.baseDamage(user),
          maxHealth: user.nonConditionalMaxHealth,
          maxSanity: user.nonConditionalMaxSanity,
          applierNameString: user.fullName,
          applierID: user.id,
        });
        if (newBuff) {
          buffs.push(newBuff);
        }
      }
    });

    let minionSpecies: string[] = [];
    this.summons.forEach((summon) => {
      const type = user.createMinion(summon);
      minionSpecies.push(type);
    });

    if (this.rangerPet) {
      const type = user.summonPet(this.rangerPet);
      minionSpecies.push(type);
    }

    user.gainProficiency(this);
    const selfDamageCalc = 
    user.damageHealth({
      damage: this.selfDamage * bloodMult,
      attackerId: user.id,
    });

    wait(1000).then(() => user.endTurn());

    return {
      result: "success",
      targetResults,
      buffs,
      logString: this.buildMultiTargetLog({
        targetResults,
        buffs,
        minionSpecies,
        user,
      }),
    };
  }

  private buildMultiTargetLog({
    targetResults,
    buffs,
    minionSpecies,
    user,
  }: {
    targetResults: Array<{
      target: PlayerCharacter | Enemy | Minion;
      damage: number;
      sanityDamage: number;
      debuffs: Condition[];
      healed: number;
    }>;
    buffs: Condition[];
    minionSpecies: string[];
    user: PlayerCharacter | Enemy | Minion;
  }): string {
    const userString =
      user instanceof PlayerCharacter
        ? "You"
        : `The ${toTitleCase(user.creatureSpecies)}`;
    let returnString = `${userString} used ${toTitleCase(this.name)}.\n`;

    targetResults.forEach((result) => {
      const targetString =
        result.target instanceof PlayerCharacter
          ? "you"
          : `the ${toTitleCase(result.target.creatureSpecies)}`;

      if (result.damage > 0) {
        returnString += `  • Dealt ${result.damage} damage to ${targetString}.\n`;
      }

      if (result.sanityDamage > 0) {
        returnString += `  • Caused ${result.sanityDamage} sanity damage to ${targetString}.\n`;
      }

      if (result.debuffs.map((debuff) => debuff.name).length > 0) {
        returnString += `  • ${toTitleCase(
          targetString,
        )} was afflicted with: ${result.debuffs
          .map((debuff) => debuff.name)
          .join(", ")}.\n`;
      }

      if (result.healed > 0) {
        returnString += `  • Healed for ${result.healed} from ${targetString}.\n`;
      }
    });

    if (buffs.length > 0) {
      returnString += `  • ${userString} gained: ${buffs
        .map((buff) => buff.name)
        .join(", ")}.\n`;
    }

    if (minionSpecies.length > 0) {
      returnString += `  • ${userString} summoned: ${toTitleCase(
        minionSpecies.join(", "),
      )}.\n`;
    }

    if (this.selfDamage > 0) {
      returnString += `  • ${userString} took ${this.selfDamage} self-damage.\n`;
    }

    return returnString.trim();
  }
}
