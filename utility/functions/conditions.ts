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
      if (debuffObj.effect.length > 1) {
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
            let localHealthDmg = debuffObj.effectAmount[index];
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
            let localSanityDmg = debuffObj.effectAmount[index];
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
          effectMagnitude: debuffObj.effectAmount ?? [0],
          placedby: applierNameString,
          icon: debuffObj.icon,
          simple: false,
        });
        return debuff;
      } else {
        // simple condition
        let healthDamage = 0;
        if (
          debuffObj.effect[0] == "health damage" &&
          debuffObj.effectAmount &&
          debuffObj.effectStyle
        ) {
          healthDamage = debuffObj.effectAmount[0];
          if (debuffObj.effectStyle[0] == "multiplier") {
            healthDamage *= primaryAttackDamage;
          } else if (debuffObj.effectStyle[0] == "percentage") {
            healthDamage *= enemyMaxHP;
          }
        }
        let sanityDamage = 0;
        if (
          debuffObj.effect.includes("sanity damage") &&
          debuffObj.effectAmount &&
          debuffObj.effectStyle
        ) {
          sanityDamage = debuffObj.effectAmount[0];
          if (debuffObj.effectStyle[0] == "multiplier") {
            sanityDamage *= primaryAttackDamage;
          } else if (debuffObj.effectStyle[0] == "percentage") {
            sanityDamage *= enemyMaxSanity ?? 50;
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
