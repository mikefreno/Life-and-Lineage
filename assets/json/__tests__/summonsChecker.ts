import rangerSpells from "@/assets/json/rangerSpells.json";
import necroSpells from "@/assets/json/necroSpells.json";
import summons from "@/assets/json/summons.json";
import enemyAttacks from "@/assets/json/enemyAttacks.json";
import fs from "fs";

const checkSummons = () => {
  // Clear the missing_summons.json file at start
  fs.writeFileSync("./summons_data/missing_summons.json", "", "utf8");

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
            "missing_summons.json",
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
            "./summons_data/missing_summons.json",
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
        "./summons_data/missing_summons.json",
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
