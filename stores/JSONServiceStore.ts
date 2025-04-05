import * as FileSystem from "expo-file-system";
import { MMKV } from "react-native-mmkv";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore } from "./RootStore";
import { API_BASE_URL } from "@/config/config";

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

// API urls
const api_base = `${API_BASE_URL}/json_service`;
const attack_route = `${api_base}/attacks`;
const conditions_route = `${api_base}/conditions`;
const dungeon_route = `${api_base}/dungeons`;
const enemy_route = `${api_base}/enemies`;
const item_route = `${api_base}/items`;
const misc_route = `${api_base}/misc`;

// Define JSON file options as a constant array
const JSONFileOptions = [
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

// Define the type based on the array
type JSONFileOptionsType = (typeof JSONFileOptions)[number];

// Type for API responses
interface ApiResponse {
  ok: boolean;
  [key: string]: any;
}

export class JSONServiceStore {
  root: RootStore;
  retrievedAttacks = false;
  retrievedConditions = false;
  retrievedDungeons = false;
  retrievedEnemies = false;
  retrievedItems = false;
  retrievedMisc = false;

  private storage = new MMKV({ id: "json-service-store" });
  private jsonCache: Record<string, any> = {};
  private initialized = false;

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    makeAutoObservable(this);

    this.initializeCache();

    reaction(
      () => this.root.authStore.isConnected,
      (isConnected) => {
        if (isConnected) {
          this.runAll();
        }
      },
    );
  }

  private initializeCache(): void {
    for (const key of JSONFileOptions) {
      const originalData = this.getOriginalJson(key);
      this.jsonCache[key] = originalData;
      this.storage.set(`json_${key}`, JSON.stringify(originalData));
    }

    this.initialized = true;
    console.log("JSON cache initialized with bundled data");
  }

  async runAll(): Promise<void> {
    try {
      await Promise.all([
        this.getAndUpdateAttacks(),
        this.getAndUpdateConditions(),
        this.getAndUpdateDungeons(),
        this.getAndUpdateEnemies(),
        this.getAndUpdateItems(),
        this.getAndUpdateMisc(),
      ]);
      console.log("All JSON files updated");
    } catch (error) {
      console.error("Error updating JSON files:", error);
    }
  }

  async getAndUpdateAttacks(): Promise<void> {
    try {
      const res = await fetch(attack_route, { method: "GET" });
      if (!res.ok) return;

      const data = (await res.json()) as ApiResponse;
      if (!data.ok) return;

      await Promise.all([
        this.updateFileAndCache("mageBooks", data.mageBooks),
        this.updateFileAndCache("mageSpells", data.mageSpells),
        this.updateFileAndCache("necroBooks", data.necroBooks),
        this.updateFileAndCache("necroSpells", data.necroSpells),
        this.updateFileAndCache("paladinBooks", data.paladinBooks),
        this.updateFileAndCache("paladinSpells", data.paladinSpells),
        this.updateFileAndCache("playerAttacks", data.playerAttacks),
        this.updateFileAndCache("rangerBooks", data.rangerBooks),
        this.updateFileAndCache("rangerSpells", data.rangerSpells),
        this.updateFileAndCache("summons", data.summons),
      ]);

      this.retrievedAttacks = true;
    } catch (error) {
      console.error("Error updating attack files:", error);
    }
  }

  async getAndUpdateConditions(): Promise<void> {
    try {
      const res = await fetch(conditions_route, { method: "GET" });
      if (!res.ok) return;

      const data = (await res.json()) as ApiResponse;
      if (!data.ok) return;

      await Promise.all([
        this.updateFileAndCache("conditions", data.conditions),
        this.updateFileAndCache("debilitations", data.debilitations),
        this.updateFileAndCache("sanityDebuffs", data.sanityDebuffs),
      ]);

      this.retrievedConditions = true;
    } catch (error) {
      console.error("Error updating condition files:", error);
    }
  }

  async getAndUpdateDungeons(): Promise<void> {
    try {
      const res = await fetch(dungeon_route, { method: "GET" });
      if (!res.ok) return;

      const data = (await res.json()) as ApiResponse;
      if (!data.ok) return;

      await Promise.all([
        this.updateFileAndCache("dungeons", data.dungeons),
        this.updateFileAndCache("specialEncounters", data.specialEncounters),
      ]);

      this.retrievedDungeons = true;
    } catch (error) {
      console.error("Error updating dungeon files:", error);
    }
  }

  async getAndUpdateEnemies(): Promise<void> {
    try {
      const res = await fetch(enemy_route, { method: "GET" });
      if (!res.ok) return;

      const data = (await res.json()) as ApiResponse;
      if (!data.ok) return;

      await Promise.all([
        this.updateFileAndCache("bosses", data.bosses),
        this.updateFileAndCache("enemy", data.enemy),
        this.updateFileAndCache("enemyAttacks", data.enemyAttacks),
      ]);

      this.retrievedEnemies = true;
    } catch (error) {
      console.error("Error updating enemy files:", error);
    }
  }

  async getAndUpdateItems(): Promise<void> {
    try {
      const res = await fetch(item_route, { method: "GET" });
      if (!res.ok) return;

      const data = (await res.json()) as ApiResponse;
      if (!data.ok) return;

      await Promise.all([
        this.updateFileAndCache("arrows", data.arrows),
        this.updateFileAndCache("artifacts", data.artifacts),
        this.updateFileAndCache("bodyArmor", data.bodyArmor),
        this.updateFileAndCache("bows", data.bows),
        this.updateFileAndCache("foci", data.foci),
        this.updateFileAndCache("hats", data.hats),
        this.updateFileAndCache("helmets", data.helmets),
        this.updateFileAndCache("ingredients", data.ingredients),
        this.updateFileAndCache("junk", data.junk),
        this.updateFileAndCache("melee", data.melee),
        this.updateFileAndCache("poison", data.poison),
        this.updateFileAndCache("potions", data.potions),
        this.updateFileAndCache("robes", data.robes),
        this.updateFileAndCache("shields", data.shields),
        this.updateFileAndCache("staves", data.staves),
        this.updateFileAndCache("storyItems", data.storyItems),
        this.updateFileAndCache("wands", data.wands),
        this.updateFileAndCache("prefix", data.prefix),
        this.updateFileAndCache("suffix", data.suffix),
      ]);

      this.retrievedItems = true;
    } catch (error) {
      console.error("Error updating item files:", error);
    }
  }

  async getAndUpdateMisc(): Promise<void> {
    try {
      const res = await fetch(misc_route, { method: "GET" });
      if (!res.ok) return;

      const data = (await res.json()) as ApiResponse;
      if (!data.ok) return;

      await Promise.all([
        this.updateFileAndCache("activities", data.activities),
        this.updateFileAndCache("healthOptions", data.healthOptions),
        this.updateFileAndCache("investments", data.investments),
        this.updateFileAndCache("jobs", data.jobs),
        this.updateFileAndCache("manaOptions", data.manaOptions),
        this.updateFileAndCache("otherOptions", data.otherOptions),
        this.updateFileAndCache("sanityOptions", data.sanityOptions),
      ]);

      this.retrievedMisc = true;
    } catch (error) {
      console.error("Error updating misc files:", error);
    }
  }

  private async updateFileAndCache(
    filename: JSONFileOptionsType,
    data: any,
  ): Promise<void> {
    if (!data) return;

    try {
      const filePath = this.getJsonPath(filename);
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(data, null, 2),
      );

      // Update caches
      this.jsonCache[filename] = data;
      this.storage.set(`json_${filename}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error updating ${filename}:`, error);
    }
  }

  // Synchronous read method
  readJsonFileSync(filename: JSONFileOptionsType): any {
    if (!this.initialized) {
      console.warn("JSONServiceStore not fully initialized yet");
    }

    if (this.jsonCache[filename]) {
      return this.jsonCache[filename];
    }

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

    const originalData = this.getOriginalJson(filename);
    this.jsonCache[filename] = originalData; // Cache it
    this.storage.set(`json_${filename}`, JSON.stringify(originalData));
    return originalData;
  }

  async readJsonFile(filename: JSONFileOptionsType): Promise<any> {
    try {
      const path = this.getJsonPath(filename);
      const fileInfo = await FileSystem.getInfoAsync(path);

      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(path);
        const data = JSON.parse(content);

        this.jsonCache[filename] = data;
        this.storage.set(`json_${filename}`, JSON.stringify(data));

        return data;
      }

      return this.readJsonFileSync(filename);
    } catch (error) {
      console.error(`Error reading ${filename}.json:`, error);
      return this.readJsonFileSync(filename);
    }
  }

  getJsonPath(filename: string): string {
    return `${FileSystem.documentDirectory}${filename}.json`;
  }

  getOriginalJson(filename: JSONFileOptionsType): any {
    const jsonMap: Record<string, any> = {
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
      // Uncovered files
      deathMessages,
      names,
      qualifications,
      shopLines,
      shops,
    };

    return jsonMap[filename] || {};
  }

  async updateUncoveredFile(
    filename: JSONFileOptionsType,
    newData: any,
  ): Promise<void> {
    return this.updateFileAndCache(filename, newData);
  }

  get isAllDataRetrieved(): boolean {
    return (
      this.retrievedAttacks &&
      this.retrievedConditions &&
      this.retrievedDungeons &&
      this.retrievedEnemies &&
      this.retrievedItems &&
      this.retrievedMisc
    );
  }
}
