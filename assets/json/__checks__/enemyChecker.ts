import enemies from "@/assets/json/enemy.json";
import bosses from "@/assets/json/bosses.json";
import enemyAttacks from "@/assets/json/enemyAttacks.json";
import fs from "fs";

const checkEnemyData = () => {
  // Create enemy_data directory if it doesn't exist
  if (!fs.existsSync("./enemy_data")) {
    fs.mkdirSync("./enemy_data");
  }

  // Clear the files at start
  fs.writeFileSync("./enemy_data/missing_attacks.txt", "", "utf8");
  fs.writeFileSync("./enemy_data/missing_fields.txt", "", "utf8");

  const missingAttacksMap = {
    enemies: {},
    bosses: {},
  };

  const missingFieldsMap = {
    enemies: {},
    bosses: {},
  };

  // Required fields for enemies based on the example
  const requiredEnemyFields = [
    "name",
    "beingType",
    "sanity",
    "sprite",
    "healthRange",
    "baseResistanceTable",
    "baseDamageTable",
    "mana",
    "attackStrings",
    "animationStrings",
    "drops",
    "goldDropRange",
  ];

  // Required nested fields
  const nestedRequiredFields = {
    healthRange: ["minimum", "maximum"],
    mana: ["maximum", "regen"],
    goldDropRange: ["minimum", "maximum"],
  };

  // Check enemy attacks and fields
  for (const enemy of enemies) {
    // Check for missing attacks
    const missingAttacks = [];
    if (enemy.attackStrings && Array.isArray(enemy.attackStrings)) {
      for (const attackString of enemy.attackStrings) {
        const found = enemyAttacks.find(
          (attack) => attack.name === attackString,
        );
        if (!found) {
          missingAttacks.push(attackString);
        }
      }
    }

    if (missingAttacks.length > 0) {
      missingAttacksMap.enemies[enemy.name] = missingAttacks;
      fs.appendFile(
        "./enemy_data/missing_attacks.txt",
        `Enemy "${enemy.name}" missing attacks: ${JSON.stringify(
          missingAttacks,
        )}\n`,
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing to file", err);
          }
        },
      );
    }

    // Check for missing fields
    const missingFields = [];
    for (const field of requiredEnemyFields) {
      if (enemy[field] === undefined) {
        missingFields.push(field);
      } else if (nestedRequiredFields[field]) {
        // Check nested fields
        for (const nestedField of nestedRequiredFields[field]) {
          if (enemy[field][nestedField] === undefined) {
            missingFields.push(`${field}.${nestedField}`);
          }
        }
      }
    }

    // Check if animationStrings has entries for all attackStrings
    if (enemy.attackStrings && enemy.animationStrings) {
      for (const attackString of enemy.attackStrings) {
        if (enemy.animationStrings[attackString] === undefined) {
          missingFields.push(`animationStrings.${attackString}`);
        }
      }
    }

    if (missingFields.length > 0) {
      missingFieldsMap.enemies[enemy.name] = missingFields;
      fs.appendFile(
        "./enemy_data/missing_fields.txt",
        `Enemy "${enemy.name}" missing fields: ${JSON.stringify(
          missingFields,
        )}\n`,
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing to file", err);
          }
        },
      );
    }
  }

  // Required fields for bosses
  const requiredBossFields = [
    "name",
    "beingType",
    "sprite",
    "health",
    "mana",
    "attackStrings",
    "animationStrings",
    "baseResistanceTable",
    "baseDamageTable",
    "drops",
    "goldDropRange",
  ];

  // Check boss attacks and fields
  for (const boss of bosses) {
    // Check for missing attacks in main boss
    const missingAttacks = [];
    if (boss.attackStrings && Array.isArray(boss.attackStrings)) {
      for (const attackString of boss.attackStrings) {
        const found = enemyAttacks.find(
          (attack) => attack.name === attackString,
        );
        if (!found) {
          missingAttacks.push(attackString);
        }
      }
    }

    // Check for missing attacks in phases
    if (boss.phases && Array.isArray(boss.phases)) {
      for (let i = 0; i < boss.phases.length; i++) {
        const phase = boss.phases[i];
        if (phase.attackStrings && Array.isArray(phase.attackStrings)) {
          for (const attackString of phase.attackStrings) {
            const found = enemyAttacks.find(
              (attack) => attack.name === attackString,
            );
            if (!found) {
              missingAttacks.push(`phase[${i}].${attackString}`);
            }
          }
        }
      }
    }

    if (missingAttacks.length > 0) {
      missingAttacksMap.bosses[boss.name] = missingAttacks;
      fs.appendFile(
        "./enemy_data/missing_attacks.txt",
        `Boss "${boss.name}" missing attacks: ${JSON.stringify(
          missingAttacks,
        )}\n`,
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing to file", err);
          }
        },
      );
    }

    // Check for missing fields in main boss
    const missingFields = [];
    for (const field of requiredBossFields) {
      if (boss[field] === undefined) {
        missingFields.push(field);
      } else if (nestedRequiredFields[field]) {
        // Check nested fields
        for (const nestedField of nestedRequiredFields[field]) {
          if (boss[field][nestedField] === undefined) {
            missingFields.push(`${field}.${nestedField}`);
          }
        }
      }
    }

    // Check if all attack strings have corresponding animation strings
    if (boss.attackStrings && boss.animationStrings) {
      for (const attackString of boss.attackStrings) {
        if (boss.animationStrings[attackString] === undefined) {
          missingFields.push(`animationStrings.${attackString}`);
        }
      }
    }

    // Check phases for required fields
    if (boss.phases && Array.isArray(boss.phases)) {
      for (let i = 0; i < boss.phases.length; i++) {
        const phase = boss.phases[i];
        const requiredPhaseFields = [
          "triggerHealth",
          "sprite",
          "baseResistanceTable",
          "baseDamageTable",
          "attackStrings",
          "animationStrings",
        ];

        for (const field of requiredPhaseFields) {
          if (phase[field] === undefined) {
            missingFields.push(`phases[${i}].${field}`);
          }
        }

        // Check if all phase attack strings have corresponding animation strings
        if (phase.attackStrings && phase.animationStrings) {
          for (const attackString of phase.attackStrings) {
            if (phase.animationStrings[attackString] === undefined) {
              missingFields.push(
                `phases[${i}].animationStrings.${attackString}`,
              );
            }
          }
        }
      }
    }

    if (missingFields.length > 0) {
      missingFieldsMap.bosses[boss.name] = missingFields;
      fs.appendFile(
        "./enemy_data/missing_fields.txt",
        `Boss "${boss.name}" missing fields: ${JSON.stringify(
          missingFields,
        )}\n`,
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing to file", err);
          }
        },
      );
    }
  }

  // Write summary files
  fs.writeFile(
    "./enemy_data/missing_attacks_summary.json",
    JSON.stringify(missingAttacksMap, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing missing attacks summary file", err);
      } else {
        console.log("Missing attacks summary file successfully written");
      }
    },
  );

  fs.writeFile(
    "./enemy_data/missing_fields_summary.json",
    JSON.stringify(missingFieldsMap, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing missing fields summary file", err);
      } else {
        console.log("Missing fields summary file successfully written");
      }
    },
  );

  // Generate statistics about enemy data
  const stats = {
    totalEnemies: enemies.length,
    totalBosses: bosses.length,
    enemiesWithMissingAttacks: Object.keys(missingAttacksMap.enemies).length,
    bossesWithMissingAttacks: Object.keys(missingAttacksMap.bosses).length,
    enemiesWithMissingFields: Object.keys(missingFieldsMap.enemies).length,
    bossesWithMissingFields: Object.keys(missingFieldsMap.bosses).length,
    beingTypes: {
      enemies: {},
      bosses: {},
    },
    damageTypes: {
      enemies: {},
      bosses: {},
    },
    resistanceTypes: {
      enemies: {},
      bosses: {},
    },
    averageEnemyHealth: 0,
    averageBossHealth: 0,
    averageGoldDrop: {
      enemies: {
        minimum: 0,
        maximum: 0,
      },
      bosses: {
        minimum: 0,
        maximum: 0,
      },
    },
    attackDistribution: {
      enemies: {},
      bosses: {},
    },
    bossesWithPhases: 0,
    averagePhases: 0,
  };

  // Calculate enemy statistics
  let totalEnemyHealth = 0;
  let totalEnemyGoldMin = 0;
  let totalEnemyGoldMax = 0;
  let enemyHealthCount = 0;
  let enemyGoldCount = 0;

  for (const enemy of enemies) {
    // Count being types
    stats.beingTypes.enemies[enemy.beingType] =
      (stats.beingTypes.enemies[enemy.beingType] || 0) + 1;

    // Calculate average health
    if (enemy.healthRange) {
      totalEnemyHealth +=
        (enemy.healthRange.minimum + enemy.healthRange.maximum) / 2;
      enemyHealthCount++;
    }

    // Calculate average gold drop
    if (enemy.goldDropRange) {
      totalEnemyGoldMin += enemy.goldDropRange.minimum;
      totalEnemyGoldMax += enemy.goldDropRange.maximum;
      enemyGoldCount++;
    }

    // Count damage types
    if (enemy.baseDamageTable) {
      for (const damageType in enemy.baseDamageTable) {
        stats.damageTypes.enemies[damageType] =
          (stats.damageTypes.enemies[damageType] || 0) + 1;
      }
    }

    // Count resistance types
    if (enemy.baseResistanceTable) {
      for (const resistType in enemy.baseResistanceTable) {
        stats.resistanceTypes.enemies[resistType] =
          (stats.resistanceTypes.enemies[resistType] || 0) + 1;
      }
    }

    // Count attack distribution
    if (enemy.attackStrings && Array.isArray(enemy.attackStrings)) {
      for (const attack of enemy.attackStrings) {
        stats.attackDistribution.enemies[attack] =
          (stats.attackDistribution.enemies[attack] || 0) + 1;
      }
    }
  }

  // Calculate boss statistics
  let totalBossHealth = 0;
  let totalBossGoldMin = 0;
  let totalBossGoldMax = 0;
  let bossHealthCount = 0;
  let bossGoldCount = 0;
  let totalPhases = 0;

  for (const boss of bosses) {
    // Count being types
    stats.beingTypes.bosses[boss.beingType] =
      (stats.beingTypes.bosses[boss.beingType] || 0) + 1;

    // Calculate average health
    if (boss.health) {
      totalBossHealth += boss.health;
      bossHealthCount++;
    }

    // Calculate average gold drop
    if (boss.goldDropRange) {
      totalBossGoldMin += boss.goldDropRange.minimum;
      totalBossGoldMax += boss.goldDropRange.maximum;
      bossGoldCount++;
    }

    // Count damage types
    if (boss.baseDamageTable) {
      for (const damageType in boss.baseDamageTable) {
        stats.damageTypes.bosses[damageType] =
          (stats.damageTypes.bosses[damageType] || 0) + 1;
      }
    }

    // Count resistance types
    if (boss.baseResistanceTable) {
      for (const resistType in boss.baseResistanceTable) {
        stats.resistanceTypes.bosses[resistType] =
          (stats.resistanceTypes.bosses[resistType] || 0) + 1;
      }
    }

    // Count attack distribution
    if (boss.attackStrings && Array.isArray(boss.attackStrings)) {
      for (const attack of boss.attackStrings) {
        stats.attackDistribution.bosses[attack] =
          (stats.attackDistribution.bosses[attack] || 0) + 1;
      }
    }

    // Count bosses with phases
    if (boss.phases && boss.phases.length > 0) {
      stats.bossesWithPhases++;
      totalPhases += boss.phases.length;
    }
  }

  if (enemyHealthCount > 0) {
    stats.averageEnemyHealth = totalEnemyHealth / enemyHealthCount;
  }

  if (enemyGoldCount > 0) {
    stats.averageGoldDrop.enemies = {
      minimum: totalEnemyGoldMin / enemyGoldCount,
      maximum: totalEnemyGoldMax / enemyGoldCount,
    };
  }

  if (bossHealthCount > 0) {
    stats.averageBossHealth = totalBossHealth / bossHealthCount;
  }

  if (bossGoldCount > 0) {
    stats.averageGoldDrop.bosses = {
      minimum: totalBossGoldMin / bossGoldCount,
      maximum: totalBossGoldMax / bossGoldCount,
    };
  }

  if (stats.bossesWithPhases > 0) {
    stats.averagePhases = totalPhases / stats.bossesWithPhases;
  }

  fs.writeFile(
    "./enemy_data/entity_stats.json",
    JSON.stringify(stats, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing entity stats file", err);
      } else {
        console.log("Entity stats file successfully written");
      }
    },
  );
};

checkEnemyData();
