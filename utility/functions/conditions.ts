import conditions from "../../assets/json/conditions.json";
import { Condition } from "../../entities/conditions";
import sanityDebuffs from "../../assets/json/sanityDebuffs.json";
import { ConditionObjectType, DamageType } from "../types";
import { PlayerCharacter } from "../../entities/character";

interface createDebuffDeps {
  debuffName: string;
  enemyMaxHP: number;
  enemyMaxSanity?: number | null;
  primaryAttackDamage: number;
  applierNameString: string;
  applierID: string;
}
export function createDebuff({
  debuffName,
  enemyMaxHP,
  enemyMaxSanity = 50,
  primaryAttackDamage,
  applierNameString,
  applierID,
}: createDebuffDeps) {
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
      placedbyID: applierID,
      icon: debuffObj.icon,
      aura: debuffObj.aura,
      on: null,
    });

    return debuff;
  } else {
    throw new Error(`Failed to find debuff: ${debuffName} in createDebuff()`);
  }
}

interface createBuffDeps {
  buffName: string;
  attackPower: number;
  maxHealth: number;
  maxSanity: number | null;
  applierNameString: string;
  applierID: string;
}

export function createBuff({
  buffName,
  attackPower,
  maxHealth,
  maxSanity = 50,
  applierNameString,
  applierID,
}: createBuffDeps) {
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
      placedbyID: applierID,
      icon: buffObj.icon,
      aura: buffObj.aura,
      on: null,
    });

    return buff;
  }
}

export function lowSanityDebuffGenerator(playerState: PlayerCharacter) {
  if (!playerState || playerState.currentSanity >= 0) return;

  const roll = rollD20();
  if (roll < 16) return;

  const debuffObj = sanityDebuffs[
    Math.floor(Math.random() * sanityDebuffs.length)
  ] as ConditionObjectType;

  // Pre-calculate multipliers
  const healthMultiplier = playerState.nonConditionalMaxHealth;
  const sanityMultiplier = playerState.nonConditionalMaxSanity;

  const { healthDamage, sanityDamage } = debuffObj.effect.reduce(
    (acc, effect, index) => {
      const amount = debuffObj.effectAmount[index];
      const style = debuffObj.effectStyle[index];
      const isMultiplier = style === "multiplier" || style === "percentage";

      if (effect === "health damage" && amount !== null) {
        acc.healthDamage.push(
          isMultiplier ? amount * healthMultiplier : amount,
        );
      } else {
        acc.healthDamage.push(0);
      }

      if (effect === "sanity damage" && amount !== null) {
        acc.sanityDamage.push(
          isMultiplier ? amount * sanityMultiplier : amount,
        );
      } else {
        acc.sanityDamage.push(0);
      }

      return acc;
    },
    { healthDamage: [] as number[], sanityDamage: [] as number[] },
  );

  const debuff = new Condition({
    name: debuffObj.name,
    style: "debuff",
    turns: debuffObj.turns,
    effect: debuffObj.effect,
    healthDamage,
    sanityDamage,
    effectStyle: debuffObj.effectStyle,
    effectMagnitude: debuffObj.effectAmount,
    placedby: "low sanity",
    icon: debuffObj.icon,
    aura: debuffObj.aura,
    placedbyID: "low sanity",
    on: null,
  });

  playerState.addCondition(debuff);
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
      (cond.effect.includes("trap") &&
        cond.trapSetupTime &&
        cond.trapSetupTime < 0)
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

export function getConditionEffectsOnResistances(
  suppliedConditions: Condition[],
) {
  const map = new Map<DamageType, { flat: number; mult: number }>();

  for (const condition of suppliedConditions) {
    condition.effect;
  }

  //TODO
  throw new Error("function not yet implemented");
}

export function getConditionEffectsOnMisc(suppliedConditions: Condition[]) {
  let stunned = false;
  let manaRegenFlat = 0;
  let manaRegenMult = 1;
  let healthRegenFlat = 0;
  let healthRegenMult = 1;
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
    healthRegenFlat,
    healthRegenMult,
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
function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}
