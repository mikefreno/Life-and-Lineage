import fs from "fs";
import path from "path";

const FRENOME_JSON_DIR = path.resolve(
  __dirname,
  "../freno-me-ssr/src/lineage-json/",
);
const LINEAGE_JSON_DIR = path.resolve(__dirname, "./assets/json");

interface RouteMap {
  [key: string]: string[];
}

const routeStructure: RouteMap = {
  "attack-route": [
    "mageBooks.json",
    "mageSpells.json",
    "necroBooks.json",
    "necroSpells.json",
    "paladinBooks.json",
    "paladinSpells.json",
    "playerAttacks.json",
    "rangerBooks.json",
    "rangerSpells.json",
    "summons.json",
  ],
  "conditions-route": [
    "conditions.json",
    "debilitations.json",
    "sanityDebuffs.json",
  ],
  "dungeon-route": ["dungeons.json", "specialEncounters.json"],
  "enemy-route": ["bosses.json", "enemy.json", "enemyAttacks.json"],
  "item-route": [
    "arrows.json",
    "artifacts.json",
    "bodyArmor.json",
    "bows.json",
    "foci.json",
    "hats.json",
    "helmets.json",
    "ingredients.json",
    "junk.json",
    "melee.json",
    "poison.json",
    "potions.json",
    "prefix.json",
    "robes.json",
    "shields.json",
    "staves.json",
    "storyItems.json",
    "suffix.json",
    "wands.json",
  ],
  "misc-route": [
    "activities.json",
    "healthOptions.json",
    "investments.json",
    "jobs.json",
    "manaOptions.json",
    "otherOptions.json",
    "pvpRewards.json",
    "sanityOptions.json",
  ],
};

const subDirectories = ["items", "medicalOptions"];

function findSourceFile(filename: string): string | null {
  // Check root json directory
  let sourcePath = path.join(LINEAGE_JSON_DIR, filename);
  if (fs.existsSync(sourcePath)) {
    return sourcePath;
  }

  // Check subdirectories
  for (const subDir of subDirectories) {
    sourcePath = path.join(LINEAGE_JSON_DIR, subDir, filename);
    if (fs.existsSync(sourcePath)) {
      return sourcePath;
    }
  }

  return null;
}

function copyJsonFiles(): void {
  try {
    // Create base directory if it doesn't exist
    if (!fs.existsSync(FRENOME_JSON_DIR)) {
      fs.mkdirSync(FRENOME_JSON_DIR, { recursive: true });
    }

    // Process each route
    Object.entries(routeStructure).forEach(([route, files]) => {
      const routePath = path.join(FRENOME_JSON_DIR, route);

      // Create route directory if it doesn't exist
      if (!fs.existsSync(routePath)) {
        fs.mkdirSync(routePath, { recursive: true });
      }

      // Copy each file in the route
      files.forEach((file) => {
        const sourcePath = findSourceFile(file);
        const destPath = path.join(routePath, file);

        if (sourcePath) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copied: ${file} to ${route}`);
        } else {
          console.warn(`Source file not found: ${file}`);
        }
      });
    });

    console.log("File copy process completed");
  } catch (error) {
    console.error("Error copying files:", error);
    throw error;
  }
}

copyJsonFiles();
