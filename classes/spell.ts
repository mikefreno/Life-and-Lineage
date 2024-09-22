import { createBuff, createDebuff } from "../utility/functions/conditions";
import { wait, toTitleCase, rollD20 } from "../utility/functions/misc";
import {
  Element,
  MasteryLevel,
  StringToElement,
  StringToMastery,
} from "../utility/types";
import { PlayerCharacter } from "./character";
import { Enemy, Minion } from "./creatures";

interface SpellFields {
  name: string;
  attackStyle?: "single" | "cleave" | "aoe";
  element: string;
  proficiencyNeeded: string;
  manaCost: number;
  duration?: number;
  usesWeapon?: string | null;
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
    pet?: string;
    selfDamage?: number | null | undefined;
    sanityDamage?: number | undefined;
  };
}

/**
 * This class instantiates learned spells by the `PlayerCharacter` only.
 * An instance can be made with the constructor `new Spell({})`
 * This used to store a reference to the user `PlayerCharacter`. This was abandoned due to creating cyclical data
 * The heart of this class is the `use` method, no other method needed for use other than `canBeUsed` as a check in UI
 */
export class Spell {
  name: string;
  attackStyle: "single" | "cleave" | "aoe"; //at time of writing, only implementing single target
  element: Element;
  usesWeapon: string | null;
  proficiencyNeeded: MasteryLevel;
  duration: number;
  manaCost: number;
  private initDamage: number;
  selfDamage: number;
  flatSanityDamage: number;
  buffs: string[];
  debuffs: { name: string; chance: number }[];
  summons: string[];
  rangerPet: string | undefined;

  constructor({
    name,
    attackStyle,
    element,
    proficiencyNeeded,
    manaCost,
    duration,
    effects,
    usesWeapon,
  }: SpellFields) {
    this.name = name;
    this.element = StringToElement[element];
    this.usesWeapon = usesWeapon ?? null;
    this.attackStyle = attackStyle ?? "single";
    this.proficiencyNeeded = StringToMastery[proficiencyNeeded];
    this.manaCost = manaCost;
    this.duration = duration ?? 1;
    this.initDamage = effects.damage ?? 0;
    this.selfDamage = effects.selfDamage ?? 0;
    this.flatSanityDamage = effects.sanityDamage ?? 0;
    this.buffs = effects.buffs ?? [];
    this.debuffs = effects.debuffs ?? [];
    this.summons = effects.summon ?? [];
    this.rangerPet = effects.pet;
  }

  public baseDamage(user: PlayerCharacter) {
    if (this.initDamage > 0) {
      if (this.usesWeapon) {
        if (
          user.equipment.mainHand.itemClass === this.usesWeapon //title case aligns with ItemClassType
        ) {
          return (
            this.initDamage +
            user.magicPower +
            user.equipmentStats.damage +
            user.attackPower
          );
        } else return 0;
      }
      return this.initDamage + user.magicPower;
    } else return 0;
  }
  public userHasRequiredWeapon(user: PlayerCharacter) {
    return (
      this.usesWeapon && user.equipment.mainHand.itemClass == this.usesWeapon
    );
  }

  public canBeUsed(user: PlayerCharacter) {
    if (user.isStunned) {
      return false;
    }
    if (!this.userHasRequiredWeapon) {
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
    if (!user.hasEnoughBloodOrbs(this)) {
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
      if (buff !== "consume blood orb") {
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
      }
    });
    if (this.buffs.includes("consume blood orb")) {
      user.removeBloodOrbs(this);
    }
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

    // we wait here for animation timings, the fade out of mana use cost
    wait(1000).then(() => user.endTurn());

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
