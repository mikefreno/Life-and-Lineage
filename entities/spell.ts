import { createBuff, createDebuff } from "../utility/functions/conditions";
import { wait, toTitleCase, rollD20 } from "../utility/functions/misc";
import {
  Element,
  MasteryLevel,
  PlayerAnimationSet,
  StringToElement,
  StringToMastery,
} from "../utility/types";
import { PlayerCharacter } from "./character";
import { Enemy, Minion } from "./creatures";

interface SpellFields {
  name: string;
  attackStyle?: "single" | "dual" | "aoe";
  element: string;
  proficiencyNeeded: string | null;
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
  attackStyle: "single" | "dual" | "aoe";
  element: Element;
  usesWeapon: string | null;
  proficiencyNeeded: MasteryLevel | null;
  duration: number;
  manaCost: number;
  private initDamage: number;
  selfDamage: number;
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
    this.initDamage = effects.damage ?? 0;
    this.selfDamage = effects.selfDamage ?? 0;
    this.flatSanityDamage = effects.sanityDamage ?? 0;
    this.buffs = effects.buffs ?? [];
    this.debuffs = effects.debuffs ?? [];
    this.summons = effects.summon ?? [];
    this.rangerPet = effects.pet;
    this.animation = animation;
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
            (user.totalDamage ?? 0) +
            user.attackPower
          );
        } else return 0;
      }
      return this.initDamage + user.magicPower;
    } else return 0;
  }

  public userHasRequiredWeapon(user: PlayerCharacter) {
    return (
      this.usesWeapon && user.equipment.mainHand.itemClass === this.usesWeapon
    );
  }

  public canBeUsed(user: PlayerCharacter) {
    if (__DEV__) {
      return true;
    }
    if (user.isStunned) {
      return false;
    }
    if (this.usesWeapon && !this.userHasRequiredWeapon(user)) {
      return false;
    }
    if (user.currentMana < this.manaCost) {
      return false;
    }
    if (
      this.proficiencyNeeded &&
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
    targets,
    user,
  }: {
    targets: (PlayerCharacter | Enemy | Minion)[];
    user: PlayerCharacter;
  }): { logString: string } {
    if (!this.canBeUsed(user)) {
      return { logString: "The spell fizzles out" };
    }

    user.useMana(this.manaCost);

    const targetResults = targets.map((target) => {
      const finalDamage = Math.round(this.baseDamage(user) * 4) / 4;
      target.damageHealth({ damage: finalDamage, attackerId: user.id });
      target.damageSanity(this.flatSanityDamage);

      // Handle debuffs for this target
      const debuffNames: string[] = [];
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
            debuffNames.push(newDebuff.name);
            target.addCondition(newDebuff);
          }
        }
      });

      return {
        target,
        damage: finalDamage,
        sanityDamage: this.flatSanityDamage,
        debuffNames,
        healed: amountHealed,
      };
    });

    // Handle buffs (only once for the caster)
    const buffNames: string[] = [];
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
          buffNames.push(newBuff.name);
          user.addCondition(newBuff);
        }
      }
    });

    if (this.buffs.includes("consume blood orb")) {
      user.removeBloodOrbs(this);
    }

    // Handle summons (only once)
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
    user.damageHealth({ damage: this.selfDamage, attackerId: user.id });

    wait(1000).then(() => user.endTurn());

    return {
      logString: this.buildMultiTargetLog({
        targetResults,
        buffNames,
        minionSpecies,
        user,
      }),
    };
  }

  private buildMultiTargetLog({
    targetResults,
    buffNames,
    minionSpecies,
    user,
  }: {
    targetResults: Array<{
      target: PlayerCharacter | Enemy | Minion;
      damage: number;
      sanityDamage: number;
      debuffNames: string[];
      healed: number;
    }>;
    buffNames: string[];
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

      if (result.debuffNames.length > 0) {
        returnString += `  • ${toTitleCase(
          targetString,
        )} was afflicted with: ${result.debuffNames.join(", ")}.\n`;
      }

      if (result.healed > 0) {
        returnString += `  • Healed for ${result.healed} from ${targetString}.\n`;
      }
    });

    if (buffNames.length > 0) {
      returnString += `  • ${userString} gained: ${buffNames.join(", ")}.\n`;
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
