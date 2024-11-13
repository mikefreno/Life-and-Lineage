import { Item, isStackable } from "./item";
import shops from "../assets/json/shops.json";
import greetings from "../assets/json/shopLines.json";
import { action, makeObservable, observable, reaction } from "mobx";
import { Character, PlayerCharacter } from "./character";
import {
  getRandomName,
  toTitleCase,
  rollD20,
  getItemJSONMap,
  generateBirthday,
} from "../utility/functions/misc";
import { ItemClassType, ShopkeeperPersonality } from "../utility/types";
import { RootStore } from "../stores/RootStore";
import { storage } from "../utility/functions/storage";
import { stringify } from "flatted";
import { throttle } from "lodash";

interface ShopProps {
  baseGold: number;
  currentGold?: number;
  lastStockRefresh: Date;
  inventory?: Item[];
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
  inventory: Item[];
  shopKeeper: Character;
  readonly archetype: string;
  shopKeeperPersonality: ShopkeeperPersonality;
  root: RootStore;

  constructor({
    baseGold,
    currentGold,
    lastStockRefresh,
    inventory,
    shopKeeper,
    archetype,
    shopKeeperPersonality,
    root,
  }: ShopProps) {
    this.baseGold = baseGold;
    this.currentGold = currentGold ?? baseGold;
    this.lastStockRefresh =
      lastStockRefresh.toISOString() ?? new Date().toISOString();
    this.inventory = inventory ?? [];
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
      this.shopKeeper = generateShopKeeper(shopObj.type);
      this.shopKeeperPersonality = personality as ShopkeeperPersonality;
    }
  }

  public refreshInventory(player: PlayerCharacter) {
    const shopObj = shops.find((shop) => shop.type == this.archetype);
    if (shopObj) {
      const newCount = getRandomInt(
        shopObj.itemQuantityRange.minimum,
        shopObj.itemQuantityRange.maximum,
      );
      this.inventory = generateInventory(
        newCount,
        shopObj.trades as ItemClassType[],
        player,
      );
      this.lastStockRefresh = new Date().toISOString();
      this.currentGold = this.baseGold;
    } else {
      throw new Error("Shop not found on refreshInventory()");
    }
  }

  public createGreeting(playerFullName: string) {
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

  public setPlayerToInventory(player: PlayerCharacter) {
    this.inventory = this.inventory.map((item) => item.reinstatePlayer(player));
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
        this.inventory.push(item);
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
      const idx = this.inventory.findIndex((invItem) => invItem.equals(item));
      if (idx !== -1) {
        this.inventory.splice(idx, 1);
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

  public getInventory() {
    const condensedInventory: { item: Item[] }[] = [];
    this.inventory.forEach((item) => {
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

  forSave(): any {
    const clone = { ...this };
    clone.inventory = [];
    return clone;
  }

  static fromJSON(json: any): Shop {
    const shop = new Shop({
      shopKeeper: Character.fromJSON(json.shopKeeper),
      baseGold: json.baseGold,
      currentGold: json.currentGold,
      lastStockRefresh: new Date(json.lastStockRefresh),
      archetype: json.archetype,
      shopKeeperPersonality: json.shopKeeperPersonality,
      inventory: json.inventory
        ? json.inventory.map((item: any) => Item.fromJSON(item))
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
    player,
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

export function createShops(rootStore: RootStore) {
  let createdShops: Shop[] = [];
  shops.forEach((shop) => {
    const randIdx = Math.floor(
      Math.random() * shop.possiblePersonalities.length,
    );
    const personality = shop.possiblePersonalities[randIdx];
    //want to favor likelihood of male shopkeepers slightly
    const newShop = new Shop({
      shopKeeper: generateShopKeeper(shop.type),
      baseGold: shop.baseGold,
      lastStockRefresh: new Date(),
      archetype: shop.type,
      shopKeeperPersonality: personality as ShopkeeperPersonality,
      root: rootStore,
    });
    createdShops.push(newShop);
  });
  return createdShops;
}

export function generateShopKeeper(archetype: string) {
  const sex = rollD20() <= 12 ? "male" : "female";
  const name = getRandomName(sex);
  const birthdate = generateBirthday(25, 70);
  const job = toTitleCase(archetype);

  const newChar = new Character({
    sex: sex,
    firstName: name.firstName,
    lastName: name.lastName,
    birthdate: birthdate,
    job: job,
  });
  return newChar;
}

const _shopSave = async (shop: Shop | undefined) => {
  if (shop) {
    try {
      storage.set(`shop_${shop.archetype}`, stringify(shop));
    } catch (e) {
      console.log("Error in _playerSave:", e);
    }
  }
};

export const saveShop = throttle(_shopSave, 500);
