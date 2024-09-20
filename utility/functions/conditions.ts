import conditions from "../../assets/json/conditions.json";
import { Condition } from "../../classes/conditions";
import { PlayerCharacter } from "../../classes/character";
import sanityDebuffs from "../../assets/json/sanityDebuffs.json";
import { rollD20 } from "./roll";
import { ConditionObjectType } from "../types";

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
      (condition) => condition.name === debuffName,
    ) as ConditionObjectType;

    if (debuffObj) {
      let healthDamage: number[] = [];
      let sanityDamage: number[] = [];

      debuffObj.effect.forEach((eff, index) => {
        if (eff === "health damage" && debuffObj.effectAmount[index] !== null) {
          let localHealthDmg = debuffObj.effectAmount[index] as number;
          if (debuffObj.effectStyle[index] === "multiplier") {
            localHealthDmg *= primaryAttackDamage;
          } else if (debuffObj.effectStyle[index] === "percentage") {
            localHealthDmg *= enemyMaxHP;
          }
          healthDamage.push(localHealthDmg);
        } else {
          healthDamage.push(0);
        }

        if (eff === "sanity damage" && debuffObj.effectAmount[index] !== null) {
          let localSanityDmg = debuffObj.effectAmount[index] as number;
          if (debuffObj.effectStyle[index] === "multiplier") {
            localSanityDmg *= primaryAttackDamage;
          } else if (debuffObj.effectStyle[index] === "percentage") {
            localSanityDmg *= enemyMaxSanity ?? 0;
          }
          sanityDamage.push(localSanityDmg);
        } else {
          sanityDamage.push(0);
        }
      });

      const debuff = new Condition({
        name: debuffObj.name,
        style: "debuff",
        turns: debuffObj.turns,
        effect: debuffObj.effect,
        healthDamage: healthDamage,
        sanityDamage: sanityDamage,
        effectStyle: debuffObj.effectStyle,
        effectMagnitude: debuffObj.effectAmount,
        placedby: applierNameString,
        icon: debuffObj.icon,
        aura: debuffObj.aura,
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
  applierNameString: string;
}

export function createBuff({
  buffName,
  buffChance,
  attackPower,
  maxHealth,
  maxSanity = 50,
  applierNameString,
}: createBuffDeps) {
  const roll = rollD20();
  if (roll * 5 >= 100 - buffChance * 100) {
    const buffObj = conditions.find(
      (condition) => condition.name === buffName,
    ) as ConditionObjectType;

    if (buffObj) {
      let healthHeal: (number | null)[] = [];
      let sanityHeal: (number | null)[] = [];

      buffObj.effect.forEach((eff, index) => {
        if (eff === "heal" && buffObj.effectAmount[index] !== null) {
          let localHealthHeal = buffObj.effectAmount[index] as number;
          if (buffObj.effectStyle[index] === "multiplier") {
            localHealthHeal *= attackPower;
          } else if (buffObj.effectStyle[index] === "percentage") {
            localHealthHeal *= maxHealth;
          }
          healthHeal.push(localHealthHeal);
        } else {
          healthHeal.push(null);
        }

        if (eff === "sanity heal" && buffObj.effectAmount[index] !== null) {
          let localSanityHeal = buffObj.effectAmount[index] as number;
          if (buffObj.effectStyle[index] === "multiplier") {
            localSanityHeal *= attackPower;
          } else if (buffObj.effectStyle[index] === "percentage") {
            localSanityHeal *= maxSanity ?? 0;
          }
          sanityHeal.push(localSanityHeal);
        } else {
          sanityHeal.push(null);
        }
      });

      const buff = new Condition({
        name: buffObj.name,
        style: "buff",
        turns: buffObj.turns,
        trapSetupTime: buffObj.trapSetupTime,
        effect: buffObj.effect,
        healthDamage: healthHeal.map((heal) => (heal !== null ? -heal : 0)),
        sanityDamage: sanityHeal.map((heal) => (heal !== null ? -heal : 0)),
        effectStyle: buffObj.effectStyle,
        effectMagnitude: buffObj.effectAmount,
        placedby: applierNameString,
        icon: buffObj.icon,
        aura: buffObj.aura,
      });

      return buff;
    } else {
      throw new Error("Failed to find buff in createBuff()");
    }
  }
}

export function lowSanityDebuffGenerator(playerState: PlayerCharacter) {
  if (playerState && playerState.currentSanity < 0) {
    const roll = rollD20();
    if (roll >= 16) {
      const debuffObj = sanityDebuffs[
        Math.floor(Math.random() * sanityDebuffs.length)
      ] as ConditionObjectType;

      let healthDamage: number[] = [];
      let sanityDamage: number[] = [];

      debuffObj.effect.forEach((eff, index) => {
        if (eff === "health damage" && debuffObj.effectAmount[index] !== null) {
          let localHealthDmg = debuffObj.effectAmount[index] as number;
          if (
            debuffObj.effectStyle[index] === "multiplier" ||
            debuffObj.effectStyle[index] === "percentage"
          ) {
            localHealthDmg *= playerState.nonConditionalMaxHealth;
          }
          healthDamage.push(localHealthDmg);
        } else {
          healthDamage.push(0);
        }

        if (eff === "sanity damage" && debuffObj.effectAmount[index] !== null) {
          let localSanityDmg = debuffObj.effectAmount[index] as number;
          if (
            debuffObj.effectStyle[index] === "multiplier" ||
            debuffObj.effectStyle[index] === "percentage"
          ) {
            localSanityDmg *= playerState.nonConditionalMaxSanity;
          }
          sanityDamage.push(localSanityDmg);
        } else {
          sanityDamage.push(0);
        }
      });

      const debuff = new Condition({
        name: debuffObj.name,
        style: "debuff",
        turns: debuffObj.turns,
        effect: debuffObj.effect,
        healthDamage: healthDamage,
        sanityDamage: sanityDamage,
        effectStyle: debuffObj.effectStyle,
        effectMagnitude: debuffObj.effectAmount,
        placedby: "low sanity",
        icon: debuffObj.icon,
        aura: debuffObj.aura,
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
    condition.effect.forEach((effect, index) => {
      const effectMagnitude = condition.effectMagnitude[index];
      const effectStyle = condition.effectStyle[index];

      if (effect === "accuracy reduction" && effectMagnitude !== null) {
        hitChanceMultiplier *= 1 - effectMagnitude;
      }

      if (effect === "strengthen" && effectMagnitude !== null) {
        if (effectStyle === "flat") {
          damageFlat += effectMagnitude;
        } else if (effectStyle) {
          damageMult *= 1 + effectMagnitude;
        }
      } else if (effect === "weaken" && effectMagnitude) {
        if (effectStyle === "flat") {
          damageFlat -= effectMagnitude;
        } else if (effectStyle) {
          damageMult *= 1 - effectMagnitude;
        }
      }
    });

    if (condition.name === "undead cower" && beingType === "undead") {
      hitChanceMultiplier *= 0.5;
      damageMult *= 0.5;
    }
  });

  enemyConditions.forEach((condition) => {
    condition.effect.forEach((effect, index) => {
      const effectMagnitude = condition.effectMagnitude[index];

      if (effect === "blur" && effectMagnitude !== null) {
        hitChanceMultiplier *= effectMagnitude;
      }
    });
  });

  return { hitChanceMultiplier, damageMult, damageFlat };
}
/**
 * Get's damage that will hit the ATTACKER, these conditions exist on the DEFENDER
 */
export function getConditionDamageToAttacker(defenderConditions: Condition[]) {
  //at time of writing only health damage is a thing from these conditions
  let healthDamage = 0;
  defenderConditions.forEach((cond) => {
    if (
      cond.effect.includes("thorns") ||
      (cond.effect.includes("trap") && cond.trapSetupTime == 0)
    ) {
      healthDamage +=
        cond.effectMagnitude.reduce((acc, val) => (acc += val)) ?? 0;
      if (cond.effect.includes("trap")) {
        cond.destroyTrap();
      }
    }
  });
  return { healthDamage };
}

export function getConditionEffectsOnDefenses(suppliedConditions: Condition[]) {
  let armorMult = 1;
  let armorFlat = 0;
  let healthMult = 1;
  let healthFlat = 0;
  let sanityFlat = 0;
  let sanityMult = 1;

  suppliedConditions.forEach((condition) => {
    condition.effect.forEach((effect, index) => {
      const effectMagnitude = condition.effectMagnitude[index];
      const effectStyle = condition.effectStyle[index];

      if (effectMagnitude === null) return;

      switch (effect) {
        case "armor increase":
          if (effectStyle === "flat") {
            armorFlat += effectMagnitude;
          } else if (effectStyle) {
            armorMult *= 1 + effectMagnitude;
          }
          break;
        case "armor decrease":
          if (effectStyle === "flat") {
            armorFlat -= effectMagnitude;
          } else if (effectStyle) {
            armorMult *= 1 - effectMagnitude;
          }
          break;
        case "healthMax increase":
          if (effectStyle === "flat") {
            healthFlat += effectMagnitude;
          } else if (effectStyle) {
            healthMult *= 1 + effectMagnitude;
          }
          break;
        case "healthMax decrease":
          if (effectStyle === "flat") {
            healthFlat -= effectMagnitude;
          } else if (effectStyle) {
            healthMult *= 1 - effectMagnitude;
          }
          break;
        case "sanityMax increase":
          if (effectStyle === "flat") {
            sanityFlat += effectMagnitude;
          } else if (effectStyle) {
            sanityMult *= 1 + effectMagnitude;
          }
          break;
        case "sanityMax decrease":
          if (effectStyle === "flat") {
            sanityFlat -= effectMagnitude;
          } else if (effectStyle) {
            sanityMult *= 1 - effectMagnitude;
          }
          break;
      }
    });
  });

  return {
    armorMult,
    armorFlat,
    healthMult,
    healthFlat,
    sanityMult,
    sanityFlat,
  };
}

export function getConditionEffectsOnMisc(suppliedConditions: Condition[]) {
  let stunned = false;
  let manaRegenFlat = 0;
  let manaRegenMult = 1;
  let manaMaxFlat = 0;
  let manaMaxMult = 1;

  suppliedConditions.forEach((condition) => {
    condition.effect.forEach((effect, index) => {
      const effectMagnitude = condition.effectMagnitude[index];
      const effectStyle = condition.effectStyle[index];

      switch (effect) {
        case "stun":
          stunned = true;
          break;
        case "mana regen":
          if (effectStyle === "flat") {
            manaRegenFlat += effectMagnitude;
          } else if (effectStyle) {
            manaRegenMult *= 1 + effectMagnitude;
          }
          break;
        case "mana drain":
          if (effectStyle === "flat") {
            manaRegenFlat -= effectMagnitude;
          } else if (effectStyle) {
            manaRegenMult *= 1 - effectMagnitude;
          }
          break;
        case "manaMax increase":
          if (effectStyle === "flat") {
            manaMaxFlat += effectMagnitude;
          } else if (effectStyle) {
            manaMaxMult *= 1 + effectMagnitude;
          }
          break;
        case "manaMax decrease":
          if (effectStyle === "flat") {
            manaMaxFlat -= effectMagnitude;
          } else if (effectStyle) {
            manaMaxMult *= 1 - effectMagnitude;
          }
          break;
      }
    });
  });

  return {
    isStunned: stunned,
    manaRegenFlat,
    manaRegenMult,
    manaMaxFlat,
    manaMaxMult,
  };
}

export function getMagnitude(magnitude: (number | null)[]): number {
  const validMagnitudes = magnitude.filter(
    (value): value is number => value !== null,
  );
  return validMagnitudes.length > 0
    ? validMagnitudes.reduce((sum, value) => sum + value, 0) /
        validMagnitudes.length
    : 1;
}
