import enemies from "@/assets/json/enemy.json";
import bosses from "@/assets/json/bosses.json";
import enemyAttacks from "@/assets/json/enemyAttacks.json";
import fs from "fs";

const checkAttacks = () => {
  // Clear the missing_attacks.json file at start
  fs.writeFileSync("./enemy_data/missing_attacks.txt", "", "utf8");

  const missingAttacksMap = {
    enemies: {},
    bosses: {},
  };

  // Check enemy attacks
  for (const enemy of enemies) {
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
  }

  // Check boss attacks
  for (const boss of bosses) {
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
  }

  // Write summary to file
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
};

checkAttacks();

const checkEnemyData = () => {
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
    "resistanceTable",
    "damageTable",
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

  // Check boss attacks and fields (bosses might have a different structure)
  for (const boss of bosses) {
    // Check for missing attacks
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

    // For bosses, we'll check a subset of fields as they might have a different structure
    const bossRequiredFields = ["name", "beingType", "attackStrings", "sprite"];

    const missingFields = [];
    for (const field of bossRequiredFields) {
      if (boss[field] === undefined) {
        missingFields.push(field);
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
    beingTypes: {},
    averageHealth: 0,
    averageGoldDrop: 0,
    attackDistribution: {},
  };

  // Calculate statistics
  let totalHealth = 0;
  let totalGoldMin = 0;
  let totalGoldMax = 0;
  let healthCount = 0;
  let goldCount = 0;

  for (const enemy of enemies) {
    // Count being types
    stats.beingTypes[enemy.beingType] =
      (stats.beingTypes[enemy.beingType] || 0) + 1;

    // Calculate average health
    if (enemy.healthRange) {
      totalHealth +=
        (enemy.healthRange.minimum + enemy.healthRange.maximum) / 2;
      healthCount++;
    }

    // Calculate average gold drop
    if (enemy.goldDropRange) {
      totalGoldMin += enemy.goldDropRange.minimum;
      totalGoldMax += enemy.goldDropRange.maximum;
      goldCount++;
    }

    // Count attack distribution
    if (enemy.attackStrings && Array.isArray(enemy.attackStrings)) {
      for (const attack of enemy.attackStrings) {
        stats.attackDistribution[attack] =
          (stats.attackDistribution[attack] || 0) + 1;
      }
    }
  }

  if (healthCount > 0) {
    stats.averageHealth = totalHealth / healthCount;
  }

  if (goldCount > 0) {
    stats.averageGoldDrop = {
      minimum: totalGoldMin / goldCount,
      maximum: totalGoldMax / goldCount,
    };
  }

  fs.writeFile(
    "./enemy_data/enemy_stats.json",
    JSON.stringify(stats, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing enemy stats file", err);
      } else {
        console.log("Enemy stats file successfully written");
      }
    },
  );
};

checkEnemyData();
