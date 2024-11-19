import { Item, isStackable } from "./item";
import shops from "../assets/json/shops.json";
import greetings from "../assets/json/shopLines.json";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { Character, PlayerCharacter } from "./character";
import {
  getRandomName,
  toTitleCase,
  rollD20,
  getItemJSONMap,
} from "../utility/functions/misc";
import { ItemClassType, ShopkeeperPersonality } from "../utility/types";
import { RootStore } from "../stores/RootStore";
import { saveShop } from "../stores/ShopsStore";

interface ShopProps {
  baseGold: number;
  currentGold?: number;
  lastStockRefresh: Date;
  baseInventory?: Item[];
  shopKeeper: Character;
  archetype: string;
  shopKeeperPersonality: ShopkeeperPersonality;
  root: RootStore;
}
const MAX_AFFECTION = 100;

/**
 * At game start, all Shops are created, they will not be created again, in any sense. The `shopKeeper` like all `Character`'s
 * can die and this will be replaced. Base gold and archetype (e.g. armorer, weaponsmith) are never changed
 */
export class Shop {
  readonly baseGold: number;
  currentGold: number;
  lastStockRefresh: string;
  baseInventory: Item[];
  shopKeeper: Character;
  readonly archetype: string;
  shopKeeperPersonality: ShopkeeperPersonality;
  root: RootStore;

  constructor({
    baseGold,
    currentGold,
    lastStockRefresh,
    baseInventory,
    shopKeeper,
    archetype,
    shopKeeperPersonality,
    root,
  }: ShopProps) {
    this.baseGold = baseGold;
    this.currentGold = currentGold ?? baseGold;
    this.lastStockRefresh =
      lastStockRefresh.toISOString() ?? new Date().toISOString();
    this.baseInventory = baseInventory ?? [];
    this.archetype = archetype;
    this.shopKeeper = shopKeeper;
    this.shopKeeperPersonality = shopKeeperPersonality;
    this.root = root;

    makeObservable(this, {
      shopKeeper: observable,
      baseGold: observable,
      currentGold: observable,
      lastStockRefresh: observable,
      shopKeeperPersonality: observable,
      refreshInventory: action,
      buyItem: action,
      sellItem: action,
      deathCheck: action,
      createGreeting: computed,
    });

    reaction(
      () => [this.currentGold, this.shopKeeper.affection],
      () => {
        saveShop(this);
      },
    );
  }

  public deathCheck() {
    if (this.shopKeeper.deathdate) {
      const shopObj = shops.find((shop) => shop.type == this.archetype);
      if (!shopObj) throw new Error(`missing ${this.archetype} in json`);
      const randIdx = Math.floor(
        Math.random() * shopObj.possiblePersonalities.length,
      );
      const personality = shopObj.possiblePersonalities[randIdx];
      //want to favor likelihood of male shopkeepers slightly
      this.shopKeeper = generateShopKeeper(shopObj.type, this.root);
      this.shopKeeperPersonality = personality as ShopkeeperPersonality;
    }
  }

  public refreshInventory() {
    const shopObj = shops.find((shop) => shop.type == this.archetype);
    if (shopObj) {
      const newCount = getRandomInt(
        shopObj.itemQuantityRange.minimum,
        shopObj.itemQuantityRange.maximum,
      );
      this.baseInventory = generateInventory(
        newCount,
        shopObj.trades as ItemClassType[],
        this.root.playerState!,
      );
      this.lastStockRefresh = new Date().toISOString();
      this.currentGold = this.baseGold;
    } else {
      throw new Error("Shop not found on refreshInventory()");
    }
  }

  get createGreeting() {
    const playerFullName = this.root.playerState?.fullName || "";
    if (this.shopKeeper.affection > 90) {
      const options = greetings[this.shopKeeperPersonality]["very warm"];
      const randIdx = Math.floor(Math.random() * options.length);
      return options[randIdx].replaceAll("%p", playerFullName);
    }
    if (this.shopKeeper.affection > 75) {
      const options = greetings[this.shopKeeperPersonality].warm;
      const randIdx = Math.floor(Math.random() * options.length);
      return options[randIdx].replaceAll("%p", playerFullName);
    }
    if (this.shopKeeper.affection > 50) {
      const options = greetings[this.shopKeeperPersonality].positive;
      const randIdx = Math.floor(Math.random() * options.length);
      return options[randIdx].replaceAll("%p", playerFullName);
    }
    if (this.shopKeeper.affection > 25) {
      const options =
        greetings[this.shopKeeperPersonality]["slightly positive"];
      const randIdx = Math.floor(Math.random() * options.length);
      return options[randIdx].replaceAll("%p", playerFullName);
    }
    const options = greetings[this.shopKeeperPersonality].neutral;
    const randIdx = Math.floor(Math.random() * options.length);
    return options[randIdx].replaceAll("%p", playerFullName);
  }

  private changeAffection(change: number) {
    const currentAffection = this.shopKeeper.affection;

    if (change === 0) return;
    if (change > 0 && currentAffection >= MAX_AFFECTION) return;

    const growthFactor =
      1 - (Math.max(0, currentAffection) / MAX_AFFECTION) ** 1.5;
    const adjustedChange = Math.floor(change * growthFactor * 4) / 4;

    this.shopKeeper.updateAffection(adjustedChange);
  }

  public buyItem(itemOrItems: Item | Item[], buyPrice: number) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    const totalCost = items.length * Math.floor(buyPrice);

    if (totalCost <= this.currentGold) {
      items.forEach((item) => {
        this.baseInventory.push(item);
      });
      this.currentGold -= totalCost;

      const baseChange = (totalCost / 500) * items.length;
      const cappedChange = Math.min(baseChange, 20);
      this.changeAffection(cappedChange);
    } else {
      throw new Error("Not enough gold to complete the purchase");
    }
  }

  public sellItem(itemOrItems: Item | Item[], sellPrice: number) {
    const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
    let soldCount = 0;

    items.forEach((item) => {
      const idx = this.baseInventory.findIndex((invItem) =>
        invItem.equals(item),
      );
      if (idx !== -1) {
        this.baseInventory.splice(idx, 1);
        soldCount++;
      }
    });

    const totalEarned = Math.floor(sellPrice) * soldCount;
    this.currentGold += totalEarned;

    const baseChange = (sellPrice / 500) * soldCount;
    const cappedChange = Math.min(baseChange, 20);
    this.changeAffection(cappedChange);

    if (soldCount < items.length) {
      console.warn(
        `Only ${soldCount} out of ${items.length} items were found and sold.`,
      );
    }
  }

  get inventory() {
    const condensedInventory: { item: Item[] }[] = [];
    this.baseInventory.forEach((item) => {
      if (item.stackable) {
        let found = false;
        condensedInventory.forEach((entry) => {
          if (entry.item[0].name == item.name) {
            found = true;
            entry.item.push(item);
          }
        });
        if (!found) {
          condensedInventory.push({ item: [item] });
        }
      } else {
        condensedInventory.push({ item: [item] });
      }
    });
    return condensedInventory;
  }

  static fromJSON(json: any): Shop {
    const shop = new Shop({
      shopKeeper: Character.fromJSON(json.shopKeeper),
      baseGold: json.baseGold,
      currentGold: json.currentGold,
      lastStockRefresh: new Date(json.lastStockRefresh),
      archetype: json.archetype,
      shopKeeperPersonality: json.shopKeeperPersonality,
      baseInventory: json.baseInventory
        ? json.baseInventory.map((item: any) =>
            Item.fromJSON({ ...item, root: json.root }),
          )
        : [],
      root: json.root, //this is not actually stored
    });
    return shop;
  }
}

//----------------------associated functions----------------------//
function getAnItemByType(type: ItemClassType, player: PlayerCharacter): Item {
  const itemJSONMap = getItemJSONMap(player.playerClass);

  if (!(type in itemJSONMap)) {
    throw new Error(`Invalid type passed to getAnItemByType(): ${type}`);
  }

  const items = itemJSONMap[type];
  const idx = getRandomInt(0, items.length - 1);
  const itemObj = items[idx];

  return Item.fromJSON({
    ...itemObj,
    itemClass: type,
    stackable: isStackable(type as ItemClassType),
    root: player.root,
  });
}

export function generateInventory(
  inventoryCount: number,
  trades: ItemClassType[],
  player: PlayerCharacter,
) {
  let items: Item[] = [];
  for (let i = 0; i < inventoryCount; i++) {
    const type = trades[Math.floor(Math.random() * trades.length)];
    items.push(getAnItemByType(type, player));
  }
  return items;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateShopKeeper(archetype: string, root: RootStore) {
  const sex = rollD20() <= 12 ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = root.gameState?.timeStore.generateBirthDateInRange(25, 70);
  const job = toTitleCase(archetype);

  const newChar = new Character({
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate!,
    job: job,
    root,
  });
  return newChar;
}
