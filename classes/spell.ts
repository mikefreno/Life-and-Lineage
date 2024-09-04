import { createBuff, createDebuff } from "../utility/functions/conditions";
import { wait } from "../utility/functions/misc/wait";
import { toTitleCase } from "../utility/functions/misc/words";
import { rollD20 } from "../utility/functions/roll";
import { Element, MasteryLevel } from "../utility/types";
import { PlayerCharacter } from "./character";
import { Enemy, Minion } from "./creatures";

interface SpellFields {
  name: string;
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
    attackStyle,
    element,
    proficiencyNeeded,
    manaCost,
    duration,
    effects,
  }: SpellFields) {
    this.name = name;
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

  private baseDamage(user: PlayerCharacter) {
    if (this.initDamage > 0) {
      return this.initDamage + user.magicPower;
    } else return 0;
  }

  private canBeUsed(user: PlayerCharacter) {
    if (user.isStunned) {
      return false;
    }
    if (user.currentMana < this.manaCost) {
      return false;
    }
    if (
      (user.currentMasteryLevel(this.element) as MasteryLevel) <
      this.proficiencyNeeded
    ) {
      return false;
    }

    return true;
  }

  public use({
    target,
    user,
  }: {
    target: Enemy | Minion;
    user: PlayerCharacter;
  }): { logString: string } {
    if (!this.canBeUsed) {
      return { logString: "failure" };
    }
    user.useMana(this.manaCost);

    const finalDamage = Math.round(this.baseDamage(user) * 4) / 4; // physical damage
    target.damageHealth(finalDamage);
    target.damageSanity(this.flatSanityDamage);
    user.damageHealth(this.selfDamage);
    // create debuff loop
    const debuffNames: string[] = []; // only storing names, collecting for logBuilder
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
          debuffChance: debuff.chance,
          enemyMaxHP: target.healthMax,
          enemyMaxSanity: target.sanityMax,
          primaryAttackDamage: this.baseDamage(user),
          applierNameString: user.fullName,
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
        attackPower: this.baseDamage(user),
        maxHealth: user.nonConditionalMaxHealth,
        maxSanity: user.nonConditionalMaxSanity,
        applierNameString: user.fullName,
      });
      if (newBuff) {
        buffNames.push(newBuff.name);
        user.addCondition(newBuff);
      }
    });
    let minionSpecies: string[] = [];
    this.summons.forEach((summon) => {
      const type = (user as PlayerCharacter | Enemy).createMinion(summon);
      minionSpecies.push(type);
    });
    user.gainProficiency(this);

    wait(1000).then(() => user.regenMana());

    return {
      logString: this.logBuilder({
        targetName: target.creatureSpecies,
        healthDamage: finalDamage,
        sanityDamage: this.flatSanityDamage,
        debuffNames,
        buffNames,
        minionSpecies,
      }),
    };
  }

  private logBuilder({
    targetName,
    healthDamage,
    sanityDamage,
    debuffNames,
    buffNames,
    minionSpecies,
  }: LogProps): string {
    const userString = "You";
    const targetString = `the ${targetName}`;

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
      returnString += `  • ${targetString} was afflicted with: ${debuffNames.join(
        ", ",
      )}.\n`;
    }

    // Buffs
    if (buffNames.length > 0) {
      returnString += `  • ${userString} gained: ${buffNames.join(", ")}.\n`;
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

interface LogProps {
  targetName: string;
  healthDamage: number;
  sanityDamage: number;
  debuffNames: string[];
  buffNames: string[];
  minionSpecies: string[];
}
