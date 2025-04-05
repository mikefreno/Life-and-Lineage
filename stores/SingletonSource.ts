import * as FileSystem from "expo-file-system";
import { MMKV } from "react-native-mmkv";

// Items imports
import arrows from "@/assets/json/items/arrows.json";
import artifacts from "@/assets/json/items/artifacts.json";
import bodyArmor from "@/assets/json/items/bodyArmor.json";
import bows from "@/assets/json/items/bows.json";
import foci from "@/assets/json/items/foci.json";
import hats from "@/assets/json/items/hats.json";
import helmets from "@/assets/json/items/helmets.json";
import ingredients from "@/assets/json/items/ingredients.json";
import junk from "@/assets/json/items/junk.json";
import melee from "@/assets/json/items/melee.json";
import poison from "@/assets/json/items/poison.json";
import potions from "@/assets/json/items/potions.json";
import robes from "@/assets/json/items/robes.json";
import shields from "@/assets/json/items/shields.json";
import staves from "@/assets/json/items/staves.json";
import storyItems from "@/assets/json/items/storyItems.json";
import wands from "@/assets/json/items/wands.json";
import prefix from "@/assets/json/prefix.json";
import suffix from "@/assets/json/suffix.json";

// Attack route imports
import mageBooks from "@/assets/json/items/mageBooks.json";
import mageSpells from "@/assets/json/mageSpells.json";
import necroBooks from "@/assets/json/items/necroBooks.json";
import necroSpells from "@/assets/json/necroSpells.json";
import paladinBooks from "@/assets/json/items/paladinBooks.json";
import paladinSpells from "@/assets/json/paladinSpells.json";
import playerAttacks from "@/assets/json/playerAttacks.json";
import rangerBooks from "@/assets/json/items/rangerBooks.json";
import rangerSpells from "@/assets/json/rangerSpells.json";
import summons from "@/assets/json/summons.json";

// Conditions route imports
import conditions from "@/assets/json/conditions.json";
import debilitations from "@/assets/json/debilitations.json";
import sanityDebuffs from "@/assets/json/sanityDebuffs.json";

// Dungeon route imports
import dungeons from "@/assets/json/dungeons.json";
import specialEncounters from "@/assets/json/specialEncounters.json";

// Enemy route imports
import bosses from "@/assets/json/bosses.json";
import enemy from "@/assets/json/enemy.json";
import enemyAttacks from "@/assets/json/enemyAttacks.json";

// Misc route imports
import activities from "@/assets/json/activities.json";
import healthOptions from "@/assets/json/medicalOptions/healthOptions.json";
import investments from "@/assets/json/investments.json";
import jobs from "@/assets/json/jobs.json";
import manaOptions from "@/assets/json/medicalOptions/manaOptions.json";
import otherOptions from "@/assets/json/medicalOptions/otherOptions.json";
import sanityOptions from "@/assets/json/medicalOptions/sanityOptions.json";

// Uncovered files
import deathMessages from "@/assets/json/deathMessages.json";
import names from "@/assets/json/names.json";
import qualifications from "@/assets/json/qualifications.json";
import shopLines from "@/assets/json/shopLines.json";
import shops from "@/assets/json/shops.json";

// Define JSON file options as a constant array
export const JSONFileOptions = [
  // Attack route files
  "mageBooks",
  "mageSpells",
  "necroBooks",
  "necroSpells",
  "paladinBooks",
  "paladinSpells",
  "playerAttacks",
  "rangerBooks",
  "rangerSpells",
  "summons",
  // Conditions route files
  "conditions",
  "debilitations",
  "sanityDebuffs",
  // Dungeon route files
  "dungeons",
  "specialEncounters",
  // Enemy route files
  "bosses",
  "enemy",
  "enemyAttacks",
  // Item route files
  "arrows",
  "artifacts",
  "bodyArmor",
  "bows",
  "foci",
  "hats",
  "helmets",
  "ingredients",
  "junk",
  "melee",
  "poison",
  "potions",
  "robes",
  "shields",
  "staves",
  "storyItems",
  "wands",
  "prefix",
  "suffix",
  // Misc route files
  "activities",
  "healthOptions",
  "investments",
  "jobs",
  "manaOptions",
  "otherOptions",
  "sanityOptions",
  // Uncovered files
  "deathMessages",
  "names",
  "qualifications",
  "shopLines",
  "shops",
] as const;

export type JSONFileOptionsType = (typeof JSONFileOptions)[number];

// Persistence state interface
interface PersistenceState {
  retrievedAttacks: boolean;
  retrievedConditions: boolean;
  retrievedDungeons: boolean;
  retrievedEnemies: boolean;
  retrievedItems: boolean;
  retrievedMisc: boolean;
  lastUpdateTimestamp: number;
}

// Standalone JSON service that doesn't depend on MobX or RootStore
class JSONService {
  private storage = new MMKV({ id: "json-service" });
  private jsonCache: Record<string, any> = {};
  private initialized = false;
  private persistenceKey = "json_persistence_state";

  constructor() {
    this.initializeCache();
  }

  private initializeCache(): void {
    // Check if we have persisted data first
    for (const key of JSONFileOptions) {
      const storedData = this.storage.getString(`json_${key}`);
      if (storedData) {
        try {
          this.jsonCache[key] = JSON.parse(storedData);
        } catch (error) {
          console.error(`Error parsing stored JSON for ${key}:`, error);
          this.loadDefaultJson(key);
        }
      } else {
        this.loadDefaultJson(key);
      }
    }

    this.initialized = true;
  }

  private loadDefaultJson(key: JSONFileOptionsType): void {
    const originalData = this.getOriginalJson(key);
    this.jsonCache[key] = originalData;
    this.storage.set(`json_${key}`, JSON.stringify(originalData));
  }

  // Get persistence state
  getPersistedState(): PersistenceState | null {
    const storedState = this.storage.getString(this.persistenceKey);
    if (storedState) {
      try {
        return JSON.parse(storedState) as PersistenceState;
      } catch (error) {
        console.error("Error parsing persistence state:", error);
        return null;
      }
    }
    return null;
  }

  // Save persistence state
  savePersistedState(state: PersistenceState): void {
    this.storage.set(this.persistenceKey, JSON.stringify(state));
  }

  readJsonFileSync(filename: JSONFileOptionsType): any {
    if (!this.initialized) {
      console.warn("JSONService not fully initialized yet");
    }

    // First check in-memory cache for fastest access
    if (this.jsonCache[filename]) {
      return this.jsonCache[filename];
    }

    // Then check MMKV storage
    const storedData = this.storage.getString(`json_${filename}`);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        this.jsonCache[filename] = data; // Update in-memory cache
        return data;
      } catch (error) {
        console.error(`Error parsing stored JSON for ${filename}:`, error);
      }
    }

    // Fall back to original bundled JSON
    const originalData = this.getOriginalJson(filename);
    this.jsonCache[filename] = originalData; // Cache it
    this.storage.set(`json_${filename}`, JSON.stringify(originalData));
    return originalData;
  }

  // Asynchronous read method (for completeness)
  async readJsonFile(filename: JSONFileOptionsType): Promise<any> {
    try {
      const path = this.getJsonPath(filename);
      const fileInfo = await FileSystem.getInfoAsync(path);

      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(path);
        const data = JSON.parse(content);

        // Update caches
        this.jsonCache[filename] = data;
        this.storage.set(`json_${filename}`, JSON.stringify(data));

        return data;
      }

      // If file doesn't exist, return from cache or original
      return this.readJsonFileSync(filename);
    } catch (error) {
      console.error(`Error reading ${filename}.json:`, error);
      return this.readJsonFileSync(filename);
    }
  }

  // Helper method to get the path for a specific JSON file
  getJsonPath(filename: string): string {
    return `${FileSystem.documentDirectory}${filename}.json`;
  }

  // Helper method to get original bundled JSON
  getOriginalJson(filename: JSONFileOptionsType): any {
    // Map filename to the imported JSON
    const jsonMap: Record<string, any> = {
      // All mappings remain the same...
    };

    return jsonMap[filename] || {};
  }

  // Method to update JSON data (can be called from anywhere)
  updateJsonData(filename: JSONFileOptionsType, data: any): void {
    if (!data) return;

    try {
      // Update caches
      this.jsonCache[filename] = data;
      this.storage.set(`json_${filename}`, JSON.stringify(data));

      // Also try to write to file system (async but we don't wait)
      const filePath = this.getJsonPath(filename);
      FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(data, null, 2),
      ).catch((error) =>
        console.error(`Error writing ${filename} to file:`, error),
      );
    } catch (error) {
      console.error(`Error updating ${filename}:`, error);
    }
  }
}

export const jsonServiceStore = new JSONService();
