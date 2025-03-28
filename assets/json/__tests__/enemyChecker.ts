import enemies from "@/assets/json/enemy.json";
import bosses from "@/assets/json/bosses.json";
import enemyAttacks from "@/assets/json/enemyAttacks.json";
import fs from "fs";

const checkAttacks = () => {
  // Clear the missing_attacks.json file at start
  fs.writeFileSync("./enemy_data/missing_attacks.json", "", "utf8");

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
        "./enemy_data/missing_attacks.json",
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
        "./enemy_data/missing_attacks.json",
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
