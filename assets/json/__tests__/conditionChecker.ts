import conditions from "@/assets/json/conditions.json";
import enemyAttacks from "@/assets/json/enemyAttacks.json";
import fs from "fs";
const effectOptionsArray = [
  "stun",
  "silenced",
  "accuracy reduction",
  "accuracy increase",
  "sanity heal",
  "sanity damage",
  "sanityMax increase",
  "sanityMax decrease",
  "heal",
  "health damage",
  "healthMax increase",
  "healthMax decrease",
  "mana regen",
  "mana drain",
  "manaMax increase",
  "manaMax decrease",
  "armor increase",
  "armor decrease",
  "weaken",
  "strengthen",
  "destroy undead",
  "undead cower",
  "blur",
  "thorns",
  "trap",
  "revenge",
  "blood magic consumable",
  "execute",
  "stealth",
];

const checkBuffsDebuffs = () => {
  // Clear the missing_conditions.json file at start
  fs.writeFileSync("./condition_data/missing_conditions.json", "", "utf8");

  const missingConditionsMap = {};

  // Check each enemy attack for buffs and debuffs
  for (const attack of enemyAttacks) {
    const missingBuffs = [];
    const missingDebuffs = [];

    // Check buffs
    if (attack.buffNames && Array.isArray(attack.buffNames)) {
      for (const buff of attack.buffNames) {
        const found = conditions.find((condition) => condition.name === buff);
        if (!found) {
          missingBuffs.push(buff);
        }
      }
    }

    // Check debuffs
    if (attack.debuffNames && Array.isArray(attack.debuffNames)) {
      for (const debuff of attack.debuffNames) {
        const debuffName = typeof debuff === "string" ? debuff : debuff.name;
        const found = conditions.find(
          (condition) => condition.name === debuffName,
        );
        if (!found) {
          missingDebuffs.push(debuffName);
        }
      }
    }

    // Record missing conditions for this attack
    if (missingBuffs.length > 0 || missingDebuffs.length > 0) {
      missingConditionsMap[attack.name] = {
        buffs: missingBuffs,
        debuffs: missingDebuffs,
      };

      fs.appendFile(
        "./condition_data/missing_conditions.json",
        `Attack "${attack.name}" missing conditions: ${JSON.stringify({
          buffs: missingBuffs,
          debuffs: missingDebuffs,
        })}\n`,
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing to file", err);
          }
        },
      );
    }
  }

  // Write summary to file
  fs.writeFile(
    "./condition_data/missing_conditions_summary.json",
    JSON.stringify(missingConditionsMap, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing missing conditions summary file", err);
      } else {
        console.log("Missing conditions summary file successfully written");
      }
    },
  );
};

checkBuffsDebuffs();

const checkConditionEffects = () => {
  // Clear the condition_effects_check.json file at start
  fs.writeFileSync("./condition_data/condition_effects_check.json", "", "utf8");

  const invalidEffects = [];
  const effectUsageCount = {};

  // Initialize count for each effect option
  effectOptionsArray.forEach((effect) => {
    effectUsageCount[effect] = 0;
  });

  // Check each condition
  for (const condition of conditions) {
    if (condition.effect && Array.isArray(condition.effect)) {
      for (const effect of condition.effect) {
        // Check if effect is in EffectOptions
        if (!effectOptionsArray.includes(effect)) {
          invalidEffects.push({
            condition: condition.name,
            invalidEffect: effect,
          });

          fs.appendFile(
            "./condition_data/condition_effects_check.json",
            `Condition "${condition.name}" has invalid effect: "${effect}"\n`,
            "utf8",
            (err) => {
              if (err) {
                console.error("Error writing to file", err);
              }
            },
          );
        } else {
          // Increment usage count
          effectUsageCount[effect] = (effectUsageCount[effect] || 0) + 1;
        }
      }
    }
  }

  // Identify unused effect options
  const unusedEffects = effectOptionsArray.filter(
    (effect) => effectUsageCount[effect] === 0,
  );

  // Sort effects by usage count (descending)
  const sortedEffectUsage = Object.entries(effectUsageCount)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  // Write summary to file
  fs.writeFile(
    "./condition_data/condition_effects_summary.json",
    JSON.stringify(
      {
        invalidEffects: invalidEffects,
        unusedEffects: unusedEffects,
        effectUsageCount: sortedEffectUsage,
      },
      null,
      2,
    ),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing condition effects summary file", err);
      } else {
        console.log("Condition effects summary file successfully written");
      }
    },
  );
};

checkConditionEffects();
