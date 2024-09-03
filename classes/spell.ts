import { createBuff, createDebuff } from "../utility/functions/conditions";
import { rollD20 } from "../utility/functions/roll";
import { BeingType, Element, MasteryLevel } from "../utility/types";
import { PlayerCharacter } from "./character";
import { Enemy, Minion } from "./creatures";

interface SpellFields {
  name: string;
  player: PlayerCharacter;
  attackStyle?: "single" | "cleave" | "aoe";
  element: Element;
  proficiencyNeeded: MasteryLevel;
  manaCost: number;
  duration?: number;
  effects: {
    damage: number | null;
    buffs: string[] | null;
    debuffs:
      | {
          name: string;
          chance: number;
        }[]
      | null;
    summon?: string[] | undefined;
    selfDamage?: number | undefined;
    sanityDamage?: number | undefined;
  };
}

export class Spell {
  name: string;
  user: PlayerCharacter;
  attackStyle: "single" | "cleave" | "aoe"; // at time of writing, only implementing single target
  element: Element;
  proficiencyNeeded: MasteryLevel;
  duration: number;
  manaCost: number;
  private initDamage: number;
  selfDamage: number;
  flatSanityDamage: number;
  buffs: string[];
  debuffs: { name: string; chance: number }[];
  summons: string[];

  constructor({
    name,
    player,
    attackStyle,
    element,
    proficiencyNeeded,
    manaCost,
    duration,
    effects,
  }: SpellFields) {
    this.name = name;
    this.user = player;
    this.element = element;
    (this.attackStyle = attackStyle ?? "single"),
      (this.proficiencyNeeded = proficiencyNeeded);
    this.manaCost = manaCost;
    this.duration = duration ?? 1;
    this.initDamage = effects.damage ?? 0;
    this.selfDamage = effects.selfDamage ?? 0;
    this.flatSanityDamage = effects.sanityDamage ?? 0;
    this.buffs = effects.buffs ?? [];
    this.debuffs = effects.debuffs ?? [];
    this.summons = effects.summon ?? [];
  }

  get baseDamage() {
    return this.user.magicPower + this.initDamage;
  }

  get canBeUsed() {
    if (this.user.isStunned) {
      return false;
    }
    if (this.user.currentMana < this.manaCost) {
      return false;
    }
    if (
      (this.user.currentMasteryLevel(this.element) as MasteryLevel) <
      this.proficiencyNeeded
    ) {
      return false;
    }

    return true;
  }

  public use(target: Enemy | Minion) {
    if (!this.canBeUsed) return { result: "Cannot use" };

    const finalDamage = Math.round(this.baseDamage * 4) / 4; // physical damage
    target.damageHealth(finalDamage);
    target.damageSanity(this.flatSanityDamage);
    // create debuff loop
    const debuffNames: string[] = []; // only storing names, collecting for logBuilder
    let amountHealed = 0;
    this.debuffs.forEach((debuff) => {
      if (debuff.name == "lifesteal") {
        const roll = rollD20();
        if (roll * 5 >= 100 - debuff.chance * 100) {
          const heal = Math.round(this.baseDamage * 0.5 * 4) / 4;
          amountHealed += this.user.restoreHealth(heal);
        }
      } else {
        const newDebuff = createDebuff({
          debuffName: debuff.name,
          debuffChance: debuff.chance,
          enemyMaxHP: target.healthMax,
          enemyMaxSanity: target.sanityMax,
          primaryAttackDamage: this.baseDamage,
          applierNameString: this.user.fullName,
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
        buffName: buff,
        buffChance: 1,
        attackPower: this.baseDamage,
        maxHealth: this.user.nonConditionalMaxHealth,
        maxSanity: this.user.nonConditionalMaxSanity,
        applierNameString: this.user.fullName,
      });
      if (newBuff) {
        buffNames.push(newBuff.name);
        this.user.addCondition(newBuff);
      }
    });
    let minionBeingTypes: BeingType[] = [];
    this.summons.forEach((summon) => {
      const type = (this.user as PlayerCharacter | Enemy).createMinion(summon);
      minionBeingTypes.push(type);
    });
    this.user.gainProficiency(this);

    return {
      logString: this.logBuilder({
        targetName: target.beingType,
        healthDamage: finalDamage,
        sanityDamage: this.flatSanityDamage,
        debuffNames,
        buffNames,
        minionBeingTypes,
      }),
    };
  }

  private logBuilder({
    targetName,
    healthDamage,
    sanityDamage,
    debuffNames,
    buffNames,
    minionBeingTypes,
  }: LogProps): string {
    const userString = "You";
    const targetString = `the ${targetName}`;

    let returnString = `${userString} used ${this.name} on ${targetString}.\n`;

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
      returnString += `  • ${targetString} was afflicted with: ${debuffNames.join(
        ", ",
      )}.\n`;
    }

    // Buffs
    if (buffNames.length > 0) {
      returnString += `  • ${userString} gained: ${buffNames.join(", ")}.\n`;
    }

    // Summons
    if (minionBeingTypes.length > 0) {
      returnString += `  • ${userString} summoned: ${minionBeingTypes.join(
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

interface LogProps {
  targetName: string;
  healthDamage: number;
  sanityDamage: number;
  debuffNames: string[];
  buffNames: string[];
  minionBeingTypes: BeingType[];
}
