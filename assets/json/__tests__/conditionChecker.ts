import conditions from "@/assets/json/conditions.json";
import enemyAttacks from "@/assets/json/enemyAttacks.json";
import fs from "fs";

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
