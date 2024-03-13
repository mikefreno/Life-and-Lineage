import { ConditionBase } from "../types";
import conditions from "../../assets/json/conditions.json";
import { Condition } from "../../classes/conditions";
import { PlayerCharacter } from "../../classes/character";
import sanityDebuffs from "../../assets/json/sanityDebuffs.json";
import { rollD20 } from "./roll";

interface createDebuffDeps {
  debuffName: string;
  debuffChance: number;
  enemyMaxHP: number;
  enemyMaxSanity?: number | null;
  primaryAttackDamage: number;
  applierNameString: string;
}
export function createDebuff({
  debuffName,
  debuffChance,
  enemyMaxHP,
  enemyMaxSanity = 50,
  primaryAttackDamage,
  applierNameString,
}: createDebuffDeps) {
  const roll = rollD20();
  if (roll * 5 >= 100 - debuffChance * 100) {
    const debuffObj = conditions.find(
      (condition) => condition.name == debuffName,
    ) as ConditionBase;
    if (debuffObj) {
      let healthDamage = 0;
      if (
        debuffObj.effect.includes("health damage") &&
        debuffObj.effectAmount
      ) {
        healthDamage = debuffObj.effectAmount;
        if (debuffObj.effectStyle == "multiplier") {
          healthDamage *= primaryAttackDamage;
        } else if (debuffObj.effectStyle == "percentage") {
          healthDamage *= enemyMaxHP;
        }
      }
      let sanityDamage = 0;
      if (
        debuffObj.effect.includes("sanity damage") &&
        debuffObj.effectAmount
      ) {
        sanityDamage = debuffObj.effectAmount;
        if (debuffObj.effectStyle == "multiplier") {
          sanityDamage *= primaryAttackDamage;
        } else if (debuffObj.effectStyle == "percentage") {
          sanityDamage *= enemyMaxSanity ?? 50;
        }
      }
      const debuff = new Condition({
        name: debuffObj.name,
        style: "debuff",
        turns: debuffObj.turns,
        effect: debuffObj.effect,
        healthDamage: healthDamage > 0 ? healthDamage : null,
        sanityDamage: sanityDamage > 0 ? sanityDamage : null,
        effectStyle:
          debuffObj.effectStyle != "percentage" ? debuffObj.effectStyle : null,
        effectMagnitude: debuffObj.effectAmount,
        placedby: applierNameString,
        icon: debuffObj.icon,
      });
      return debuff;
    } else {
      throw new Error("Failed to find debuff in createDebuff()");
    }
  }
}

interface createBuffDeps {
  buffName: string;
  buffChance: number;
  attackPower: number;
  maxHealth: number;
  maxSanity: number | null;
  armor: number;
  applierNameString: string;
}

export function createBuff({
  buffName,
  buffChance,
  attackPower,
  maxHealth,
  maxSanity,
  applierNameString,
}: createBuffDeps) {
  const roll = rollD20();
  if (roll * 5 >= 100 - buffChance * 100) {
    const buffObj = conditions.find(
      (condition) => condition.name == buffName,
    ) as ConditionBase;
    if (buffObj) {
      let heal = 0;
      if (buffObj.effect.includes("heal") && buffObj.effectAmount) {
        heal = buffObj.effectAmount;
        if (buffObj.effectStyle == "multiplier") {
          heal *= attackPower;
        } else if (buffObj.effectStyle == "percentage") {
          heal *= maxHealth;
        }
      }
      let sanityHeal = 0;
      if (
        buffObj.effect.includes("sanity heal") &&
        buffObj.effectAmount &&
        maxSanity
      ) {
        heal = buffObj.effectAmount;
        if (buffObj.effectStyle == "multiplier") {
          sanityHeal *= attackPower;
        } else if (buffObj.effectStyle == "percentage") {
          sanityHeal *= maxSanity;
        }
      }
      const debuff = new Condition({
        name: buffObj.name,
        style: "debuff",
        turns: buffObj.turns,
        effect: buffObj.effect,
        healthDamage: heal > 0 ? heal * -1 : null,
        sanityDamage: sanityHeal > 0 ? sanityHeal * -1 : null,
        effectStyle:
          buffObj.effectStyle != "percentage" ? buffObj.effectStyle : null,
        effectMagnitude: buffObj.effectAmount,
        placedby: applierNameString,
        icon: buffObj.icon,
      });
      return debuff;
    } else {
      throw new Error("Failed to find buff in createBuff()");
    }
  }
}

export function lowSanityDebuffGenerator(playerState: PlayerCharacter) {
  if (playerState && playerState.sanity < 0) {
    const roll = rollD20();
    if (roll >= 16) {
      const debuffObj = sanityDebuffs[
        Math.floor(Math.random() * sanityDebuffs.length)
      ] as ConditionBase;
      let healthDamage = 0;
      let sanityDamage = 0;
      if (
        debuffObj.effect.includes("health damage") &&
        debuffObj.effectAmount
      ) {
        if (debuffObj.effectStyle == "flat") {
          healthDamage = debuffObj.effectAmount;
        } else {
          healthDamage =
            debuffObj.effectAmount * playerState.getNonBuffedMaxHealth();
        }
      }

      const debuff = new Condition({
        name: debuffObj.name,
        style: "debuff",
        turns: debuffObj.turns,
        effect: debuffObj.effect,
        effectStyle:
          debuffObj.effectStyle != "percentage" ? debuffObj.effectStyle : null,
        effectMagnitude:
          healthDamage > 0 || sanityDamage > 0 ? null : debuffObj.effectAmount,
        healthDamage: healthDamage > 0 ? healthDamage : null,
        sanityDamage: sanityDamage > 0 ? sanityDamage : null,
        placedby: "low sanity",
        icon: debuffObj.icon,
      });
      playerState.addCondition(debuff);
    }
  }
}
interface getConditionEffectsOnAttacksProps {
  selfConditions: Condition[];
  enemyConditions: Condition[];
  beingType?: string;
}
export function getConditionEffectsOnAttacks({
  selfConditions,
  enemyConditions,
  beingType,
}: getConditionEffectsOnAttacksProps) {
  let hitChanceMultiplier = 1;
  let damageMult = 1;
  let damageFlat = 0;
  selfConditions.forEach((condition) => {
    if (
      condition.effect.includes("accuracy reduction") &&
      condition.effectMagnitude
    ) {
      hitChanceMultiplier *= 1 - condition.effectMagnitude;
    }
    if (condition.effect.includes("strengthen") && condition.effectMagnitude) {
      if (condition.effectStyle == "flat") {
        damageFlat -= condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        damageMult *= 1 + condition.effectMagnitude;
      }
    } else if (
      condition.effect.includes("weaken") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        damageFlat += condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        damageMult *= 1 - condition.effectMagnitude;
      }
    }
    if (condition.name === "undead cower" && beingType === "undead") {
      hitChanceMultiplier *= 0.5;
      damageMult *= 0.5;
    }
  });
  enemyConditions.forEach((condition) => {
    if (condition.effect.includes("blur")) {
      hitChanceMultiplier *= condition.effectMagnitude ?? 1;
    }
  });
  return {
    hitChanceMultiplier: hitChanceMultiplier,
    damageMult: damageMult,
    damageFlat: damageFlat,
  };
}

export function getConditionEffectsOnDefenses(suppliedConditions: Condition[]) {
  let armorMult = 1;
  let armorFlat = 0;
  let healthMult = 1;
  let healthFlat = 0;
  let sanityFlat = 0;
  let sanityMult = 1;
  suppliedConditions.forEach((condition) => {
    if (
      condition.effect.includes("armor increase") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        armorFlat += condition.effectMagnitude;
      } else if (
        condition.effectStyle == "multiplier" ||
        condition.effectStyle == "percentage"
      ) {
        armorMult *= 1 + condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("armor decrease") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        armorFlat -= condition.effectMagnitude;
      } else if (
        condition.effectStyle == "multiplier" ||
        condition.effectStyle == "percentage"
      ) {
        armorMult *= 1 - condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("healthMax increase") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        healthFlat += condition.effectMagnitude;
      } else if (
        condition.effectStyle == "multiplier" ||
        condition.effectStyle == "percentage"
      ) {
        healthMult *= 1 + condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("healthMax decrease") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        healthFlat -= condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        healthMult *= 1 - condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("sanityMax increase") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        sanityFlat += condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        sanityMult *= 1 + condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("sanityMax decrease") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        sanityFlat -= condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        sanityMult *= 1 - condition.effectMagnitude;
      }
    }
  });
  return {
    armorMult: armorMult,
    armorFlat: armorFlat,
    healthMult: healthMult,
    healthFlat: healthFlat,
    sanityMult: sanityMult,
    sanityFlat: sanityFlat,
  };
}

export function getConditionEffectsOnMisc(suppliedConditions: Condition[]) {
  let stunned = false;
  let manaRegenFlat = 0;
  let manaRegenMult = 1;
  let manaMaxFlat = 0;
  let manaMaxMult = 1;
  suppliedConditions.forEach((condition) => {
    if (condition.effect.includes("turn skip") && stunned == false) {
      stunned = true;
    }
    if (condition.effect.includes("mana regen") && condition.effectMagnitude) {
      if (condition.effectStyle == "flat") {
        manaRegenFlat += condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        manaRegenMult *= 1 + condition.effectMagnitude;
      }
    }
    if (condition.effect.includes("mana drain") && condition.effectMagnitude) {
      if (condition.effectStyle == "flat") {
        manaRegenFlat -= condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        manaRegenMult *= 1 - condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("manaMax increase") &&
      condition.effectMagnitude
    ) {
      if (condition.effectStyle == "flat") {
        manaMaxFlat += condition.effectMagnitude;
      } else if (condition.effectStyle == "multiplier") {
        manaMaxMult *= 1 + condition.effectMagnitude;
      }
    }
    if (
      condition.effect.includes("manaMax decrease") &&
      condition.effectMagnitude
    ) {
      {
        if (condition.effectStyle == "flat") {
          manaMaxFlat -= condition.effectMagnitude;
        } else if (condition.effectStyle == "multiplier") {
          manaMaxMult *= 1 - condition.effectMagnitude;
        }
      }
    }
  });
  return {
    isStunned: stunned,
    manaRegenFlat: manaRegenFlat,
    manaRegenMult: manaRegenMult,
    manaMaxFlat: manaMaxFlat,
    manaMaxMult: manaMaxMult,
  };
}
