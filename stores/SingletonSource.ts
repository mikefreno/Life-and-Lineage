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
import pvpRewards from "@/assets/json/pvpRewards.json";

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
  "pvpRewards",
  // Uncovered files
  "deathMessages",
  "names",
  "qualifications",
  "shopLines",
  "shops",
] as const;

export type JSONFileOptionsType = (typeof JSONFileOptions)[number];

// Create type mapping for JSON files
export type JSONFileTypeMap = {
  // Attack route files
  mageBooks: typeof mageBooks;
  mageSpells: typeof mageSpells;
  necroBooks: typeof necroBooks;
  necroSpells: typeof necroSpells;
  paladinBooks: typeof paladinBooks;
  paladinSpells: typeof paladinSpells;
  playerAttacks: typeof playerAttacks;
  rangerBooks: typeof rangerBooks;
  rangerSpells: typeof rangerSpells;
  summons: typeof summons;
  // Conditions route files
  conditions: typeof conditions;
  debilitations: typeof debilitations;
  sanityDebuffs: typeof sanityDebuffs;
  // Dungeon route files
  dungeons: typeof dungeons;
  specialEncounters: typeof specialEncounters;
  // Enemy route files
  bosses: typeof bosses;
  enemy: typeof enemy;
  enemyAttacks: typeof enemyAttacks;
  // Item route files
  arrows: typeof arrows;
  artifacts: typeof artifacts;
  bodyArmor: typeof bodyArmor;
  bows: typeof bows;
  foci: typeof foci;
  hats: typeof hats;
  helmets: typeof helmets;
  ingredients: typeof ingredients;
  junk: typeof junk;
  melee: typeof melee;
  poison: typeof poison;
  potions: typeof potions;
  robes: typeof robes;
  shields: typeof shields;
  staves: typeof staves;
  storyItems: typeof storyItems;
  wands: typeof wands;
  prefix: typeof prefix;
  suffix: typeof suffix;
  // Misc route files
  activities: typeof activities;
  healthOptions: typeof healthOptions;
  investments: typeof investments;
  jobs: typeof jobs;
  manaOptions: typeof manaOptions;
  otherOptions: typeof otherOptions;
  sanityOptions: typeof sanityOptions;
  pvpRewards: typeof pvpRewards;
  // Uncovered files
  deathMessages: typeof deathMessages;
  names: typeof names;
  qualifications: typeof qualifications;
  shopLines: typeof shopLines;
  shops: typeof shops;
};

// Standalone JSON service that doesn't depend on MobX or RootStore
class JSONService {
  private storage = new MMKV({ id: "json-service" });
  private jsonCache: Partial<JSONFileTypeMap> = {};
  private initialized = false;

  constructor() {
    // Initialize the cache with bundled data
    this.initializeCache();
  }

  // Initialize cache with bundled data
  private initializeCache(): void {
    for (const key of JSONFileOptions) {
      const originalData = this.getOriginalJson(key);
      this.jsonCache[key] = originalData;
      this.storage.set(`json_${key}`, JSON.stringify(originalData));
    }

    this.initialized = true;
  }

  // Synchronous read method - available immediately
  readJsonFileSync<T extends JSONFileOptionsType>(
    filename: T,
  ): JSONFileTypeMap[T] {
    if (!this.initialized) {
      console.warn("JSONService not fully initialized yet");
    }

    // First check in-memory cache for fastest access
    if (this.jsonCache[filename]) {
      return this.jsonCache[filename] as JSONFileTypeMap[T];
    }

    // Then check MMKV storage
    const storedData = this.storage.getString(`json_${filename}`);
    if (storedData) {
      try {
        const data = JSON.parse(storedData) as JSONFileTypeMap[T];
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
    return originalData as JSONFileTypeMap[T];
  }

  // Asynchronous read method (for completeness)
  async readJsonFile<T extends JSONFileOptionsType>(
    filename: T,
  ): Promise<JSONFileTypeMap[T]> {
    try {
      const path = this.getJsonPath(filename);
      const fileInfo = await FileSystem.getInfoAsync(path);

      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(path);
        const data = JSON.parse(content) as JSONFileTypeMap[T];

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
  getOriginalJson<T extends JSONFileOptionsType>(
    filename: T,
  ): JSONFileTypeMap[T] {
    // Map filename to the imported JSON
    const jsonMap: JSONFileTypeMap = {
      // Attack route files
      mageBooks,
      mageSpells,
      necroBooks,
      necroSpells,
      paladinBooks,
      paladinSpells,
      playerAttacks,
      rangerBooks,
      rangerSpells,
      summons,
      // Conditions route files
      conditions,
      debilitations,
      sanityDebuffs,
      // Dungeon route files
      dungeons,
      specialEncounters,
      // Enemy route files
      bosses,
      enemy,
      enemyAttacks,
      // Item route files
      arrows,
      artifacts,
      bodyArmor,
      bows,
      foci,
      hats,
      helmets,
      ingredients,
      junk,
      melee,
      poison,
      potions,
      robes,
      shields,
      staves,
      storyItems,
      wands,
      prefix,
      suffix,
      // Misc route files
      activities,
      healthOptions,
      investments,
      jobs,
      manaOptions,
      otherOptions,
      sanityOptions,
      pvpRewards,
      // Uncovered files
      deathMessages,
      names,
      qualifications,
      shopLines,
      shops,
    };

    return jsonMap[filename];
  }

  updateJsonData<T extends JSONFileOptionsType>(
    filename: T,
    data: JSONFileTypeMap[T],
  ): void {
    if (!data) return;

    try {
      this.jsonCache[filename] = data;
      this.storage.set(`json_${filename}`, JSON.stringify(data));

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
