import rangerSpells from "@/assets/json/rangerSpells.json";
import necroSpells from "@/assets/json/necroSpells.json";
import summons from "@/assets/json/summons.json";
import enemyAttacks from "@/assets/json/enemyAttacks.json";
import fs from "fs";

const checkSummons = () => {
  // Clear the missing_summons.json file at start
  fs.writeFileSync("./summons_data/missing_summons.txt", "", "utf8");

  const missingSummonsMap = {
    ranger: [],
    necromancer: [],
  };

  const missingSummonAttacksMap = {};

  // Check ranger spells for summons
  for (const spell of rangerSpells) {
    if (spell.rangerPetName && Array.isArray(spell.rangerPetName)) {
      for (const summonName of spell.rangerPetName) {
        const found = summons.find((summon) => summon.name === summonName);
        if (!found) {
          missingSummonsMap.ranger.push({
            spell: spell.name,
            summon: summonName,
          });

          fs.appendFile(
            "./summons_data/missing_summons.txt",
            `Ranger spell "${spell.name}" summons non-existent creature: "${summonName}"\n`,
            "utf8",
            (err) => {
              if (err) {
                console.error("Error writing to file", err);
              }
            },
          );
        }
      }
    }
  }

  // Check necromancer spells for summons
  for (const spell of necroSpells) {
    if (spell.summonNames && Array.isArray(spell.summonNames)) {
      for (const summonName of spell.summonNames) {
        const found = summons.find((summon) => summon.name === summonName);
        if (!found) {
          missingSummonsMap.necromancer.push({
            spell: spell.name,
            summon: summonName,
          });

          fs.appendFile(
            "./summons_data/missing_summons.txt",
            `Necromancer spell "${spell.name}" summons non-existent creature: "${summonName}"\n`,
            "utf8",
            (err) => {
              if (err) {
                console.error("Error writing to file", err);
              }
            },
          );
        }
      }
    }
  }

  // Check all summons for attacks
  for (const summon of summons) {
    const missingAttacks = [];

    if (summon.attackStrings && Array.isArray(summon.attackStrings)) {
      for (const attackString of summon.attackStrings) {
        const found = enemyAttacks.find(
          (attack) => attack.name === attackString,
        );
        if (!found) {
          missingAttacks.push(attackString);
        }
      }
    }

    if (missingAttacks.length > 0) {
      missingSummonAttacksMap[summon.name] = missingAttacks;

      fs.appendFile(
        "./summons_data/missing_summons.txt",
        `Summon "${summon.name}" has missing attacks: ${JSON.stringify(
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

  // Check for summons that aren't referenced in any spell
  const unusedSummons = [];

  for (const summon of summons) {
    let found = false;

    // Check ranger spells
    for (const spell of rangerSpells) {
      if (spell.rangerPetName && spell.rangerPetName.includes(summon.name)) {
        found = true;
        break;
      }
    }

    // Check necromancer spells if not found in ranger spells
    if (!found) {
      for (const spell of necroSpells) {
        if (spell.summonNames && spell.summonNames.includes(summon.name)) {
          found = true;
          break;
        }
      }
    }

    if (!found) {
      unusedSummons.push(summon.name);
    }
  }

  // Write summary to file
  fs.writeFile(
    "./summons_data/summons_check_summary.json",
    JSON.stringify(
      {
        missingSummons: missingSummonsMap,
        missingSummonAttacks: missingSummonAttacksMap,
        unusedSummons: unusedSummons,
      },
      null,
      2,
    ),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing summons check summary file", err);
      } else {
        console.log("Summons check summary file successfully written");
      }
    },
  );
};

checkSummons();

const checkSummonsData = () => {
  // Clear the files at start
  fs.writeFileSync("./summons_data/missing_attacks.txt", "", "utf8");
  fs.writeFileSync("./summons_data/missing_fields.txt", "", "utf8");

  const missingAttacksMap = {};
  const missingFieldsMap = {};

  // Required fields for summons based on the example
  const requiredSummonFields = [
    "name",
    "beingType",
    "health",
    "resistanceTable",
    "damageTable",
    "mana",
    "attackStrings",
    "turns",
  ];

  // Required nested fields
  const nestedRequiredFields = {
    mana: ["maximum", "regen"],
  };

  // Check summons attacks and fields
  for (const summon of summons) {
    // Check for missing attacks
    const missingAttacks = [];
    if (summon.attackStrings && Array.isArray(summon.attackStrings)) {
      for (const attackString of summon.attackStrings) {
        const found = enemyAttacks.find(
          (attack) => attack.name === attackString,
        );
        if (!found) {
          missingAttacks.push(attackString);
        }
      }
    }

    if (missingAttacks.length > 0) {
      missingAttacksMap[summon.name] = missingAttacks;
      fs.appendFile(
        "./summons_data/missing_attacks.txt",
        `Summon "${summon.name}" missing attacks: ${JSON.stringify(
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
    for (const field of requiredSummonFields) {
      if (summon[field] === undefined) {
        missingFields.push(field);
      } else if (nestedRequiredFields[field]) {
        // Check nested fields
        for (const nestedField of nestedRequiredFields[field]) {
          if (summon[field][nestedField] === undefined) {
            missingFields.push(`${field}.${nestedField}`);
          }
        }
      }
    }

    if (missingFields.length > 0) {
      missingFieldsMap[summon.name] = missingFields;
      fs.appendFile(
        "./summons_data/missing_fields.txt",
        `Summon "${summon.name}" missing fields: ${JSON.stringify(
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
    "./summons_data/missing_attacks_summary.json",
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
    "./summons_data/missing_fields_summary.json",
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

  // Generate statistics about summons data
  const stats = {
    totalSummons: summons.length,
    summonsWithMissingAttacks: Object.keys(missingAttacksMap).length,
    summonsWithMissingFields: Object.keys(missingFieldsMap).length,
    beingTypes: {},
    averageHealth: 0,
    averageTurns: 0,
    resistanceTypes: {},
    damageTypes: {},
    attackDistribution: {},
  };

  // Calculate statistics
  let totalHealth = 0;
  let totalTurns = 0;

  for (const summon of summons) {
    // Count being types
    stats.beingTypes[summon.beingType] =
      (stats.beingTypes[summon.beingType] || 0) + 1;

    // Calculate average health
    if (summon.health) {
      totalHealth += summon.health;
    }

    // Calculate average turns
    if (summon.turns) {
      totalTurns += summon.turns;
    }

    // Count resistance types
    if (summon.resistanceTable) {
      for (const [resistType, value] of Object.entries(
        summon.resistanceTable,
      )) {
        stats.resistanceTypes[resistType] =
          (stats.resistanceTypes[resistType] || 0) + 1;
      }
    }

    // Count damage types
    if (summon.damageTable) {
      for (const [damageType, value] of Object.entries(summon.damageTable)) {
        stats.damageTypes[damageType] =
          (stats.damageTypes[damageType] || 0) + 1;
      }
    }

    // Count attack distribution
    if (summon.attackStrings && Array.isArray(summon.attackStrings)) {
      for (const attack of summon.attackStrings) {
        stats.attackDistribution[attack] =
          (stats.attackDistribution[attack] || 0) + 1;
      }
    }
  }

  if (summons.length > 0) {
    stats.averageHealth = totalHealth / summons.length;
    stats.averageTurns = totalTurns / summons.length;
  }

  fs.writeFile(
    "./summons_data/summons_stats.json",
    JSON.stringify(stats, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing summons stats file", err);
      } else {
        console.log("Summons stats file successfully written");
      }
    },
  );
};

checkSummonsData();
