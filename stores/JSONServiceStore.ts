import { makeAutoObservable, reaction } from "mobx";
import { RootStore } from "./RootStore";
import { API_BASE_URL } from "@/config/config";
import { jsonServiceStore, JSONFileOptionsType } from "./SingletonSource";
import { fetch } from "expo/fetch";

// API urls
const api_base = `${API_BASE_URL}/json_service`;
const attack_route = `${api_base}/attacks`;
const conditions_route = `${api_base}/conditions`;
const dungeon_route = `${api_base}/dungeons`;
const enemy_route = `${api_base}/enemies`;
const item_route = `${api_base}/items`;
const misc_route = `${api_base}/misc`;

// Interface for API responses
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

  constructor({ root }: { root: RootStore }) {
    this.root = root;
    makeAutoObservable(this);

    reaction(
      () => this.root.authStore.isConnected,
      (isConnected) => {
        if (isConnected) {
          this.runAll();
        }
      },
    );
  }

  // Proxy method to the service for synchronous access
  readJsonFileSync(filename: JSONFileOptionsType): any {
    return jsonServiceStore.readJsonFileSync(filename);
  }

  // Proxy method to the service for asynchronous access
  async readJsonFile(filename: JSONFileOptionsType): Promise<any> {
    return jsonServiceStore.readJsonFile(filename);
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

      if (data.mageBooks)
        jsonServiceStore.updateJsonData("mageBooks", data.mageBooks);
      if (data.mageSpells)
        jsonServiceStore.updateJsonData("mageSpells", data.mageSpells);
      if (data.necroBooks)
        jsonServiceStore.updateJsonData("necroBooks", data.necroBooks);
      if (data.necroSpells)
        jsonServiceStore.updateJsonData("necroSpells", data.necroSpells);
      if (data.paladinBooks)
        jsonServiceStore.updateJsonData("paladinBooks", data.paladinBooks);
      if (data.paladinSpells)
        jsonServiceStore.updateJsonData("paladinSpells", data.paladinSpells);
      if (data.playerAttacks)
        jsonServiceStore.updateJsonData("playerAttacks", data.playerAttacks);
      if (data.rangerBooks)
        jsonServiceStore.updateJsonData("rangerBooks", data.rangerBooks);
      if (data.rangerSpells)
        jsonServiceStore.updateJsonData("rangerSpells", data.rangerSpells);
      if (data.summons)
        jsonServiceStore.updateJsonData("summons", data.summons);

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

      if (data.conditions)
        jsonServiceStore.updateJsonData("conditions", data.conditions);
      if (data.debilitations)
        jsonServiceStore.updateJsonData("debilitations", data.debilitations);
      if (data.sanityDebuffs)
        jsonServiceStore.updateJsonData("sanityDebuffs", data.sanityDebuffs);

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

      if (data.dungeons)
        jsonServiceStore.updateJsonData("dungeons", data.dungeons);
      if (data.specialEncounters)
        jsonServiceStore.updateJsonData(
          "specialEncounters",
          data.specialEncounters,
        );

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

      if (data.bosses) jsonServiceStore.updateJsonData("bosses", data.bosses);
      if (data.enemy) jsonServiceStore.updateJsonData("enemy", data.enemy);
      if (data.enemyAttacks)
        jsonServiceStore.updateJsonData("enemyAttacks", data.enemyAttacks);

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

      if (data.arrows) jsonServiceStore.updateJsonData("arrows", data.arrows);
      if (data.artifacts)
        jsonServiceStore.updateJsonData("artifacts", data.artifacts);
      if (data.bodyArmor)
        jsonServiceStore.updateJsonData("bodyArmor", data.bodyArmor);
      if (data.bows) jsonServiceStore.updateJsonData("bows", data.bows);
      if (data.foci) jsonServiceStore.updateJsonData("foci", data.foci);
      if (data.hats) jsonServiceStore.updateJsonData("hats", data.hats);
      if (data.helmets)
        jsonServiceStore.updateJsonData("helmets", data.helmets);
      if (data.ingredients)
        jsonServiceStore.updateJsonData("ingredients", data.ingredients);
      if (data.junk) jsonServiceStore.updateJsonData("junk", data.junk);
      if (data.melee) jsonServiceStore.updateJsonData("melee", data.melee);
      if (data.poison) jsonServiceStore.updateJsonData("poison", data.poison);
      if (data.potions)
        jsonServiceStore.updateJsonData("potions", data.potions);
      if (data.robes) jsonServiceStore.updateJsonData("robes", data.robes);
      if (data.shields)
        jsonServiceStore.updateJsonData("shields", data.shields);
      if (data.staves) jsonServiceStore.updateJsonData("staves", data.staves);
      if (data.storyItems)
        jsonServiceStore.updateJsonData("storyItems", data.storyItems);
      if (data.wands) jsonServiceStore.updateJsonData("wands", data.wands);
      if (data.prefix) jsonServiceStore.updateJsonData("prefix", data.prefix);
      if (data.suffix) jsonServiceStore.updateJsonData("suffix", data.suffix);

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

      if (data.activities)
        jsonServiceStore.updateJsonData("activities", data.activities);
      if (data.healthOptions)
        jsonServiceStore.updateJsonData("healthOptions", data.healthOptions);
      if (data.investments)
        jsonServiceStore.updateJsonData("investments", data.investments);
      if (data.jobs) jsonServiceStore.updateJsonData("jobs", data.jobs);
      if (data.manaOptions)
        jsonServiceStore.updateJsonData("manaOptions", data.manaOptions);
      if (data.otherOptions)
        jsonServiceStore.updateJsonData("otherOptions", data.otherOptions);
      if (data.sanityOptions)
        jsonServiceStore.updateJsonData("sanityOptions", data.sanityOptions);
      if (data.pvpRewards)
        jsonServiceStore.updateJsonData("pvpRewards", data.pvpRewards);

      this.retrievedMisc = true;
    } catch (error) {
      console.error("Error updating misc files:", error);
    }
  }

  async updateUncoveredFile(
    filename: JSONFileOptionsType,
    newData: any,
  ): Promise<void> {
    jsonServiceStore.updateJsonData(filename, newData);
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
