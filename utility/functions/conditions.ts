import conditions from "../../assets/json/conditions.json";
import { Condition } from "../../classes/conditions";
import { PlayerCharacter } from "../../classes/character";
import sanityDebuffs from "../../assets/json/sanityDebuffs.json";
import { rollD20 } from "./roll";
import { effectOptions } from "../types";

type ConditionObjectBase = {
  name: string;
  style: "debuff" | "buff";
  turns: number;
  aura?: boolean;
  icon: string;
};

type SimpleConditionObject = ConditionObjectBase & {
  effect: effectOptions;
  effectStyle: "flat" | "multiplier" | "percentage" | null;
  effectAmount: number | null;
  healthDamage: number | null;
  sanityDamage: number | null;
};

type ComplexConditionObject = ConditionObjectBase & {
  effect: effectOptions[];
  effectStyle: ("flat" | "multiplier" | "percentage" | null)[] | null;
  effectAmount: (number | null)[];
  healthDamage: (number | null)[];
  sanityDamage: (number | null)[];
};

export type ConditionObjectType =
  | SimpleConditionObject
  | ComplexConditionObject;

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
    ) as ConditionObjectType;
    if (debuffObj) {
      if (Array.isArray(debuffObj.effect)) {
        // complex condition
        let healthDamage: (number | null)[] = [];
        let sanityDamage: (number | null)[] = [];
        let styles: ("flat" | "multiplier" | null)[] = [];
        debuffObj.effect.forEach((eff, index) => {
          if (
            eff === "health damage" &&
            debuffObj.effectAmount &&
            debuffObj.effectStyle
          ) {
            let localHealthDmg =
              (debuffObj.effectAmount as (number | null)[])[index] ?? 1;
            if (debuffObj.effectStyle[index] == "multiplier") {
              localHealthDmg *= primaryAttackDamage;
            } else if (debuffObj.effectStyle[index] == "percentage") {
              localHealthDmg *= enemyMaxHP;
            }
            healthDamage.push(localHealthDmg);
          } else {
            healthDamage.push(null);
          }
          if (
            eff === "sanity damage" &&
            debuffObj.effectAmount &&
            debuffObj.effectStyle
          ) {
            let localSanityDmg =
              (debuffObj.effectAmount as (number | null)[])[index] ?? 1;
            if (debuffObj.effectStyle[index] == "multiplier") {
              localSanityDmg *= primaryAttackDamage;
            } else if (debuffObj.effectStyle[index] == "percentage") {
              localSanityDmg *= enemyMaxSanity ?? 50;
            }
            sanityDamage.push(localSanityDmg);
          } else {
            sanityDamage.push(null);
          }
          styles.push(
            debuffObj.effectStyle &&
              debuffObj.effectStyle[index] &&
              debuffObj.effectStyle[index] !== "percentage"
              ? (debuffObj.effectStyle[index] as "multiplier" | "flat")
              : null,
          );
        });
        const debuff = new Condition({
          name: debuffObj.name,
          style: "debuff",
          turns: debuffObj.turns,
          effect: debuffObj.effect,
          healthDamage: healthDamage,
          sanityDamage: sanityDamage,
          effectStyle: styles,
          effectMagnitude: (debuffObj.effectAmount as (number | null)[]) ?? [0],
          placedby: applierNameString,
          icon: debuffObj.icon,
          simple: false,
        });
        return debuff;
      } else {
        // simple condition
        let healthDamage = 0;
        if (
          debuffObj.effect == "health damage" &&
          debuffObj.effectAmount &&
          debuffObj.effectStyle
        ) {
          healthDamage = (debuffObj.effectAmount as number | null) ?? 1;
          if (debuffObj.effectStyle == "multiplier") {
            healthDamage *= primaryAttackDamage;
          } else if (debuffObj.effectStyle == "percentage") {
            healthDamage *= enemyMaxHP;
          }
        }
        let sanityDamage = 0;
        if (
          debuffObj.effect.includes("sanity damage") &&
          debuffObj.effectAmount &&
          debuffObj.effectStyle
        ) {
          sanityDamage = (debuffObj.effectAmount as number | null) ?? 1;
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
            (debuffObj.effectStyle as "flat" | "multiplier" | "percentage") ==
            "percentage"
              ? null
              : (debuffObj.effectStyle as "flat" | "multiplier"),
          effectMagnitude: (debuffObj.effectAmount as number)
            ? (debuffObj.effectAmount as number)
            : null,
          placedby: applierNameString,
          icon: debuffObj.icon,
          simple: true,
        });
        return debuff;
      }
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
  maxSanity,
  applierNameString,
}: createBuffDeps) {
  const roll = rollD20();
  if (roll * 5 >= 100 - buffChance * 100) {
    const buffObj = conditions.find(
      (condition) => condition.name == buffName,
    ) as ConditionBase;
    if (buffObj) {
      if (buffObj.effect.length > 1) {
        // complex condition
        let healthHeal: (number | null)[] = [];
        let sanityHeal: (number | null)[] = [];
        let styles: ("flat" | "multiplier" | null)[] = [];
        buffObj.effect.forEach((eff, index) => {
          if (eff === "heal" && buffObj.effectAmount && buffObj.effectStyle) {
            let localHealthHeal = buffObj.effectAmount[index];
            if (buffObj.effectStyle[index] == "multiplier") {
              localHealthHeal *= attackPower;
            } else if (buffObj.effectStyle[index] == "percentage") {
              localHealthHeal *= maxHealth;
            }
            healthHeal.push(localHealthHeal);
          } else {
            healthHeal.push(null);
          }
          if (
            eff === "sanity heal" &&
            buffObj.effectAmount &&
            buffObj.effectStyle &&
            maxSanity
          ) {
            let localSanityHeal = buffObj.effectAmount[index];
            if (buffObj.effectStyle[index] == "multiplier") {
              localSanityHeal *= attackPower;
            } else if (buffObj.effectStyle[index] == "percentage") {
              localSanityHeal *= maxSanity;
            }
            sanityHeal.push(localSanityHeal);
          } else {
            sanityHeal.push(null);
          }
          styles.push(
            buffObj.effectStyle &&
              buffObj.effectStyle[index] &&
              buffObj.effectStyle[index] !== "percentage"
              ? (buffObj.effectStyle[index] as "multiplier" | "flat")
              : null,
          );
        });
        const buff = new Condition({
          name: buffObj.name,
          style: "buff",
          turns: buffObj.turns,
          effect: buffObj.effect,
          healthDamage: healthHeal.map((heal) => (heal ? heal * -1 : null)),
          sanityDamage: sanityHeal.map((heal) => (heal ? heal * -1 : null)),
          effectStyle: styles,
          effectMagnitude: buffObj.effectAmount ?? [0],
          placedby: applierNameString,
          icon: buffObj.icon,
          simple: false,
        });
        return buff;
      } else {
        // simple condition
        let healthHeal = 0;
        if (
          buffObj.effect[0] == "heal" &&
          buffObj.effectAmount &&
          buffObj.effectStyle
        ) {
          healthHeal = buffObj.effectAmount[0];
          if (buffObj.effectStyle[0] == "multiplier") {
            healthHeal *= attackPower;
          } else if (buffObj.effectStyle[0] == "percentage") {
            healthHeal *= maxHealth;
          }
        }
        let sanityHeal = 0;
        if (
          buffObj.effect.includes("sanity heal") &&
          buffObj.effectAmount &&
          buffObj.effectStyle &&
          maxSanity
        ) {
          sanityHeal = buffObj.effectAmount[0];
          if (buffObj.effectStyle[0] == "multiplier") {
            sanityHeal *= attackPower;
          } else if (buffObj.effectStyle[0] == "percentage") {
            sanityHeal *= maxSanity;
          }
        }
        const buff = new Condition({
          name: buffObj.name,
          style: "buff",
          turns: buffObj.turns,
          effect: buffObj.effect[0],
          healthDamage: healthHeal > 0 ? healthHeal * -1 : null,
          sanityDamage: sanityHeal > 0 ? sanityHeal * -1 : null,
          effectStyle:
            buffObj.effectStyle && buffObj.effectStyle[0] != "percentage"
              ? buffObj.effectStyle[0]
              : null,
          effectMagnitude: buffObj.effectAmount
            ? buffObj.effectAmount[0]
            : null,
          placedby: applierNameString,
          icon: buffObj.icon,
          simple: true,
        });
        return buff;
      }
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
      if (debuffObj.effect.length > 1) {
        // complex condition
        let healthDamage: (number | null)[] = [];
        let sanityDamage: (number | null)[] = [];
        let styles: ("flat" | "multiplier" | null)[] = [];
        debuffObj.effect.forEach((eff, index) => {
          if (
            eff == "health damage" &&
            debuffObj.effectAmount &&
            debuffObj.effectStyle
          ) {
            let localHealthDmg = debuffObj.effectAmount[index];
            if (debuffObj.effectStyle[index] == "flat") {
              localHealthDmg = debuffObj.effectAmount[index];
            } else {
              localHealthDmg =
                debuffObj.effectAmount[index] *
                playerState.getNonBuffedMaxHealth();
            }
            healthDamage.push(localHealthDmg);
          } else {
            healthDamage.push(null);
          }
          if (
            eff == "sanity damage" &&
            debuffObj.effectAmount &&
            debuffObj.effectStyle
          ) {
            let localSanityDmg = debuffObj.effectAmount[index];
            if (debuffObj.effectStyle[index] == "flat") {
              localSanityDmg = debuffObj.effectAmount[index];
            } else {
              localSanityDmg =
                debuffObj.effectAmount[index] *
                playerState.getNonBuffedMaxSanity();
            }
            sanityDamage.push(localSanityDmg);
          } else {
            sanityDamage.push(null);
          }
          styles.push(
            debuffObj.effectStyle &&
              debuffObj.effectStyle[index] &&
              debuffObj.effectStyle[index] !== "percentage"
              ? (debuffObj.effectStyle[index] as "multiplier" | "flat")
              : null,
          );
        });
        const debuff = new Condition({
          name: debuffObj.name,
          style: "debuff",
          turns: debuffObj.turns,
          effect: debuffObj.effect,
          healthDamage: healthDamage,
          sanityDamage: sanityDamage,
          effectStyle: styles,
          effectMagnitude: debuffObj.effectAmount ?? [0],
          placedby: "low sanity",
          icon: debuffObj.icon,
          simple: false,
        });
        playerState.addCondition(debuff);
      } else {
        // simple condition
        let healthDamage = 0;
        if (
          debuffObj.effect[0] == "health damage" &&
          debuffObj.effectAmount &&
          debuffObj.effectStyle
        ) {
          healthDamage = debuffObj.effectAmount[0];
          if (debuffObj.effectStyle[0] == "flat") {
            healthDamage = debuffObj.effectAmount[0];
          } else {
            healthDamage =
              debuffObj.effectAmount[0] * playerState.getNonBuffedMaxHealth();
          }
        }
        let sanityDamage = 0;
        if (
          debuffObj.effect.includes("sanity damage") &&
          debuffObj.effectAmount &&
          debuffObj.effectStyle
        ) {
          sanityDamage = debuffObj.effectAmount[0];
          if (debuffObj.effectStyle[0] == "flat") {
            sanityDamage = debuffObj.effectAmount[0];
          } else {
            sanityDamage =
              debuffObj.effectAmount[0] * playerState.getNonBuffedMaxSanity();
          }
        }
        const debuff = new Condition({
          name: debuffObj.name,
          style: "debuff",
          turns: debuffObj.turns,
          effect: debuffObj.effect[0],
          healthDamage: healthDamage > 0 ? healthDamage : null,
          sanityDamage: sanityDamage > 0 ? sanityDamage : null,
          effectStyle:
            debuffObj.effectStyle && debuffObj.effectStyle[0] != "percentage"
              ? debuffObj.effectStyle[0]
              : null,
          effectMagnitude: debuffObj.effectAmount
            ? debuffObj.effectAmount[0]
            : null,
          placedby: "low sanity",
          icon: debuffObj.icon,
          simple: true,
        });
        playerState.addCondition(debuff);
      }
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
    const effects = Array.isArray(condition.effect)
      ? condition.effect
      : [condition.effect];
    const effectMagnitudes = Array.isArray(condition.effectMagnitude)
      ? condition.effectMagnitude
      : [condition.effectMagnitude];
    const effectStyles = Array.isArray(condition.effectStyle)
      ? condition.effectStyle
      : [condition.effectStyle];

    effects.forEach((effect, index) => {
      const effectMagnitude = effectMagnitudes[index];
      const effectStyle = effectStyles[index];

      if (effect === "accuracy reduction" && effectMagnitude) {
        hitChanceMultiplier *= 1 - effectMagnitude;
      }

      if (effect === "strengthen" && effectMagnitude) {
        if (effectStyle === "flat") {
          damageFlat -= effectMagnitude;
        } else if (effectStyle === "multiplier") {
          damageMult *= 1 + effectMagnitude;
        }
      } else if (effect === "weaken" && effectMagnitude) {
        if (effectStyle === "flat") {
          damageFlat += effectMagnitude;
        } else if (effectStyle === "multiplier") {
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
    const effects = Array.isArray(condition.effect)
      ? condition.effect
      : [condition.effect];
    const effectMagnitudes = Array.isArray(condition.effectMagnitude)
      ? condition.effectMagnitude
      : [condition.effectMagnitude];

    effects.forEach((effect, index) => {
      const effectMagnitude = effectMagnitudes[index];

      if (effect === "blur") {
        hitChanceMultiplier *= effectMagnitude ?? 1;
      }
    });
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
    const effects = Array.isArray(condition.effect)
      ? condition.effect
      : [condition.effect];
    const effectMagnitudes = Array.isArray(condition.effectMagnitude)
      ? condition.effectMagnitude
      : [condition.effectMagnitude];
    const effectStyles = Array.isArray(condition.effectStyle)
      ? condition.effectStyle
      : [condition.effectStyle];

    effects.forEach((effect, index) => {
      const effectMagnitude = effectMagnitudes[index];
      const effectStyle = effectStyles[index];

      if (effect === "armor increase" && effectMagnitude) {
        if (effectStyle === "flat") {
          armorFlat += effectMagnitude;
        } else if (
          effectStyle === "multiplier" ||
          effectStyle === "percentage"
        ) {
          armorMult *= 1 + effectMagnitude;
        }
      }

      if (effect === "armor decrease" && effectMagnitude) {
        if (effectStyle === "flat") {
          armorFlat -= effectMagnitude;
        } else if (
          effectStyle === "multiplier" ||
          effectStyle === "percentage"
        ) {
          armorMult *= 1 - effectMagnitude;
        }
      }

      if (effect === "healthMax increase" && effectMagnitude) {
        if (effectStyle === "flat") {
          healthFlat += effectMagnitude;
        } else if (
          effectStyle === "multiplier" ||
          effectStyle === "percentage"
        ) {
          healthMult *= 1 + effectMagnitude;
        }
      }

      if (effect === "healthMax decrease" && effectMagnitude) {
        if (effectStyle === "flat") {
          healthFlat -= effectMagnitude;
        } else if (effectStyle === "multiplier") {
          healthMult *= 1 - effectMagnitude;
        }
      }

      if (effect === "sanityMax increase" && effectMagnitude) {
        if (effectStyle === "flat") {
          sanityFlat += effectMagnitude;
        } else if (effectStyle === "multiplier") {
          sanityMult *= 1 + effectMagnitude;
        }
      }

      if (effect === "sanityMax decrease" && effectMagnitude) {
        if (effectStyle === "flat") {
          sanityFlat -= effectMagnitude;
        } else if (effectStyle === "multiplier") {
          sanityMult *= 1 - effectMagnitude;
        }
      }
    });
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
    const effects = Array.isArray(condition.effect)
      ? condition.effect
      : [condition.effect];
    const effectMagnitudes = Array.isArray(condition.effectMagnitude)
      ? condition.effectMagnitude
      : [condition.effectMagnitude];
    const effectStyles = Array.isArray(condition.effectStyle)
      ? condition.effectStyle
      : [condition.effectStyle];

    effects.forEach((effect, index) => {
      const effectMagnitude = effectMagnitudes[index];
      const effectStyle = effectStyles[index];

      if (effect === "turn skip" && !stunned) {
        stunned = true;
      }

      if (effect === "mana regen" && effectMagnitude) {
        if (effectStyle === "flat") {
          manaRegenFlat += effectMagnitude;
        } else if (effectStyle === "multiplier") {
          manaRegenMult *= 1 + effectMagnitude;
        }
      }

      if (effect === "mana drain" && effectMagnitude) {
        if (effectStyle === "flat") {
          manaRegenFlat -= effectMagnitude;
        } else if (effectStyle === "multiplier") {
          manaRegenMult *= 1 - effectMagnitude;
        }
      }

      if (effect === "manaMax increase" && effectMagnitude) {
        if (effectStyle === "flat") {
          manaMaxFlat += effectMagnitude;
        } else if (effectStyle === "multiplier") {
          manaMaxMult *= 1 + effectMagnitude;
        }
      }

      if (effect === "manaMax decrease" && effectMagnitude) {
        if (effectStyle === "flat") {
          manaMaxFlat -= effectMagnitude;
        } else if (effectStyle === "multiplier") {
          manaMaxMult *= 1 - effectMagnitude;
        }
      }
    });
  });

  return {
    isStunned: stunned,
    manaRegenFlat: manaRegenFlat,
    manaRegenMult: manaRegenMult,
    manaMaxFlat: manaMaxFlat,
    manaMaxMult: manaMaxMult,
  };
}

export function getMagnitude(
  magnitude: number | (number | null)[] | null,
): number {
  if (Array.isArray(magnitude)) {
    let sum = 0;
    let count = 0;

    magnitude.forEach((value) => {
      if (typeof value === "number") {
        sum += value;
        count++;
      }
    });

    return count === 0 ? 1 : sum / count;
  }
  return magnitude ?? 1;
}
