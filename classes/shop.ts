import { Item } from "./item";
import shops from "../assets/json/shops.json";

import artifacts from "../assets/json/items/artifacts.json";
import bodyArmor from "../assets/json/items/bodyArmor.json";
import books from "../assets/json/items/books.json";
import foci from "../assets/json/items/foci.json";
import hats from "../assets/json/items/hats.json";
import helmets from "../assets/json/items/helmets.json";
import ingredients from "../assets/json/items/ingredients.json";
import junk from "../assets/json/items/junk.json";
import poison from "../assets/json/items/poison.json";
import potions from "../assets/json/items/potions.json";
import robes from "../assets/json/items/robes.json";
import shields from "../assets/json/items/shields.json";
import wands from "../assets/json/items/wands.json";
import weapons from "../assets/json/items/weapons.json";

interface ShopProps {
  shopKeeperName: string;
  shopKeeperBirthDate: Date;
  shopKeeperSex: "male" | "female";
  affection?: number;
  personality: string;
  baseGold: number;
  currentGold?: number;
  lastStockRefresh: Date;
  inventory?: Item[];
  archetype: string;
}

export class Shop {
  readonly shopKeeperName: string;
  readonly shopKeeperBirthDate: Date;
  readonly shopKeeperSex: "male" | "female";
  private affection: number;
  private personality: string;
  private baseGold: number;
  private currentGold: number;
  private lastStockRefresh: Date;
  private inventory: Item[];
  readonly archetype: string;

  constructor({
    shopKeeperName,
    shopKeeperBirthDate,
    shopKeeperSex,
    affection,
    personality,
    baseGold,
    lastStockRefresh,
    inventory,
    archetype,
    currentGold,
  }: ShopProps) {
    this.shopKeeperName = shopKeeperName;
    this.shopKeeperBirthDate = shopKeeperBirthDate;
    this.shopKeeperSex = shopKeeperSex;
    this.affection = affection ?? 0;
    this.personality = personality;
    this.baseGold = baseGold;
    this.currentGold = currentGold ?? baseGold;
    this.lastStockRefresh = lastStockRefresh ?? new Date();
    this.inventory = inventory ?? [];
    this.archetype = archetype;
  }

  public getInventory() {
    return this.inventory;
  }

  public getLastRefresh() {
    return this.lastStockRefresh;
  }

  public refreshInventory() {
    const shopObj = shops.find((shop) => shop.type == this.archetype);
    if (shopObj) {
      const newCount = getRandomInt(
        shopObj.itemQuantityRange.minimum,
        shopObj.itemQuantityRange.maximum,
      );
      this.inventory = generateInventory(newCount, shopObj.trades);
      this.lastStockRefresh = new Date();
      this.currentGold = this.baseGold;
    } else {
      throw new Error("Shop not found on refreshInventory()");
    }
  }

  public buyItem(item: Item, buyPrice: number) {
    if (buyPrice <= this.currentGold) {
      this.inventory.push(item);
      this.currentGold -= buyPrice;
    }
  }

  public sellItem(item: Item, sellPrice: number) {
    const idx = this.inventory.findIndex((invItem) => invItem == item);
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
      this.currentGold += sellPrice;
    }
  }

  public getCurrentGold() {
    return this.currentGold;
  }

  public getAffection() {
    return this.affection;
  }

  public toJSON(): object {
    return {
      shopKeeperName: this.shopKeeperName,
      shopKeeperBirthDate: this.shopKeeperBirthDate.toISOString(),
      shopKeeperSex: this.shopKeeperSex,
      affection: this.affection,
      personality: this.personality,
      baseGold: this.baseGold,
      currentGold: this.currentGold,
      lastStockRefresh: this.lastStockRefresh.toISOString(),
      inventory: this.inventory.map((item) => item.toJSON()),
      archetype: this.archetype,
    };
  }

  static fromJSON(json: any): Shop {
    return new Shop({
      shopKeeperName: json.shopKeeperName,
      shopKeeperBirthDate: new Date(json.shopKeeperBirthDate),
      shopKeeperSex: json.shopKeeperSex,
      affection: json.affection,
      personality: json.personality,
      baseGold: json.baseGold,
      currentGold: json.currentGold,
      lastStockRefresh: new Date(json.lastStockRefresh),
      inventory: json.inventory.map((item: any) => Item.fromJSON(item)),
      archetype: json.archetype,
    });
  }
}

//----------------------associated functions----------------------//
function getAnItemByType(type: string): Item {
  if (type == "artifact") {
    const idx = getRandomInt(0, artifacts.length - 1);
    const itemObj = artifacts[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: null,
      stats: null,
      itemClass: type,
    });
  }
  if (type == "bodyArmor") {
    const idx = getRandomInt(0, bodyArmor.length - 1);
    const itemObj = bodyArmor[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: "body",
      stats: itemObj.stats,
      itemClass: type,
      icon: itemObj.icon,
    });
  }
  if (type == "book") {
    const idx = getRandomInt(0, books.length - 1);
    const itemObj = books[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: null,
      stats: null,
      itemClass: type,
      icon: itemObj.icon,
    });
  }
  if (type == "focus") {
    const idx = getRandomInt(0, foci.length - 1);
    const itemObj = foci[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: "off-hand",
      stats: null,
      itemClass: type,
    });
  }
  if (type == "hat") {
    const idx = getRandomInt(0, hats.length - 1);
    const itemObj = hats[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: "head",
      stats: itemObj.stats,
      itemClass: type,
      icon: itemObj.icon,
    });
  }
  if (type == "helmet") {
    const idx = getRandomInt(0, helmets.length - 1);
    const itemObj = helmets[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: "head",
      stats: itemObj.stats,
      itemClass: type,
      icon: itemObj.icon,
    });
  }
  if (type == "ingredient") {
    const idx = getRandomInt(0, ingredients.length - 1);
    const itemObj = ingredients[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: null,
      stats: null,
      itemClass: type,
      icon: itemObj.icon,
    });
  }
  if (type == "junk") {
    const idx = getRandomInt(0, junk.length - 1);
    const itemObj = junk[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: null,
      stats: null,
      itemClass: type,
    });
  }
  if (type == "poison") {
    const idx = getRandomInt(0, poison.length - 1);
    const itemObj = poison[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: null,
      stats: null,
      itemClass: type,
      icon: itemObj.icon,
    });
  }
  if (type == "potion") {
    const idx = getRandomInt(0, potions.length - 1);
    const itemObj = potions[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: null,
      stats: null,
      itemClass: type,
      icon: itemObj.icon,
    });
  }
  if (type == "robe") {
    const idx = getRandomInt(0, robes.length - 1);
    const itemObj = robes[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: "body",
      stats: itemObj.stats,
      itemClass: type,
    });
  }
  if (type == "shield") {
    const idx = getRandomInt(0, shields.length - 1);
    const itemObj = shields[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: "off-hand",
      stats: itemObj.stats,
      itemClass: type,
      icon: itemObj.icon,
    });
  }
  if (type == "wand") {
    const idx = getRandomInt(0, wands.length - 1);
    const itemObj = wands[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: "one-hand",
      stats: itemObj.stats,
      itemClass: type,
      icon: itemObj.icon,
    });
  }
  if (type == "weapon") {
    const idx = getRandomInt(0, weapons.length - 1);
    const itemObj = weapons[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: itemObj.slot as "one-hand" | "two-hand",
      stats: itemObj.stats,
      itemClass: type,
      icon: itemObj.icon,
    });
  } else {
    throw new Error(`Invalid type passed to getAnItemByType(), ${type}`);
  }
}

export function generateInventory(inventoryCount: number, trades: string[]) {
  let items: Item[] = [];
  for (let i = 0; i < inventoryCount; i++) {
    const type = trades[Math.floor(Math.random() * trades.length)];
    items.push(getAnItemByType(type));
  }
  return items;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
