import dungeons from "@/assets/json/dungeons.json";
import enemies from "@/assets/json/enemy.json";
import bosses from "@/assets/json/bosses.json";
import fs from "fs";

const checkDungeon = () => {
  fs.writeFileSync("./dungeon_data/bad_boss_entries.txt", "", "utf8");
  const missingEnemyMap: Record<string, string[]> = {};
  const missingBossesMap: Record<string, string[]> = {};

  for (const dungeon of dungeons) {
    const missingEnemies: string[] = [];
    const missingBosses: string[] = [];
    for (const level of dungeon.levels) {
      // Check normal enemies
      for (const enc of level.normalEncounters) {
        enc.forEach((encEnemy) => {
          const found = enemies.find((enemy) => enemy.name === encEnemy.name);
          if (!found) {
            missingEnemies.push(encEnemy.name);
          }
        });
      }
      // Check bosses
      for (const enc of level.bossEncounter) {
        if (enc.name) {
          // Use '===' for comparison
          const found = bosses.find((boss) => boss.name === enc.name);
          if (!found) {
            missingBosses.push(enc.name);
          }
        } else {
          fs.appendFile(
            "./dungeon_data/bad_boss_entries.txt",
            `${dungeon.name}-${level.level}: ${JSON.stringify(enc)}\n`,
            "utf8",
            (err) => {
              if (err) {
                console.error("Error writing to file", err);
              } else {
                console.log("Bad boss entry appended");
              }
            },
          );
        }
      }
    }
    missingEnemyMap[dungeon.name] = missingEnemies;
    missingBossesMap[dungeon.name] = missingBosses;
  }

  fs.writeFile(
    "./dungeon_data/missing_dungeon_enemy.json",
    JSON.stringify(missingEnemyMap, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing missing enemies file", err);
      } else {
        console.log("Missing dungeon enemy file successfully written");
      }
    },
  );

  fs.writeFile(
    "./dungeon_data/missing_dungeon_bosses.json",
    JSON.stringify(missingBossesMap, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing missing bosses file", err);
      } else {
        console.log("Missing dungeon bosses file successfully written");
      }
    },
  );
};

checkDungeon();
