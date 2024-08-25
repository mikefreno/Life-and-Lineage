import { Item, isStackable } from "./item";
import shops from "../assets/json/shops.json";
import artifacts from "../assets/json/items/artifacts.json";
import bodyArmor from "../assets/json/items/bodyArmor.json";
import mageBooks from "../assets/json/items/mageBooks.json";
import necroBooks from "../assets/json/items/necroBooks.json";
import paladinBooks from "../assets/json/items/paladinBooks.json";
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
import { action, makeObservable, observable } from "mobx";
import { Character } from "./character";
import { rollD20 } from "../utility/functions/roll";
import { getRandomName, toTitleCase } from "../utility/functions/misc/words";
import { generateBirthday } from "../utility/functions/misc/age";
import { ItemClassType } from "../utility/types";

interface ShopProps {
  baseGold: number;
  currentGold?: number;
  lastStockRefresh: Date;
  inventory?: Item[];
  shopKeeper: Character;
  archetype: string;
}

export class Shop {
  baseGold: number;
  currentGold: number;
  lastStockRefresh: string;
  inventory: Item[];
  shopKeeper: Character;
  readonly archetype: string;

  constructor({
    baseGold,
    currentGold,
    lastStockRefresh,
    inventory,
    shopKeeper,
    archetype,
  }: ShopProps) {
    this.baseGold = baseGold;
    this.currentGold = currentGold ?? baseGold;
    this.lastStockRefresh =
      lastStockRefresh.toISOString() ?? new Date().toISOString();
    this.inventory = inventory ?? [];
    this.archetype = archetype;
    this.shopKeeper = shopKeeper;
    makeObservable(this, {
      shopKeeper: observable,
      baseGold: observable,
      currentGold: observable,
      lastStockRefresh: observable,
      refreshInventory: action,
      buyItem: action,
      sellItem: action,
    });
  }

  public refreshInventory(playerClass: "mage" | "necromancer" | "paladin") {
    const shopObj = shops.find((shop) => shop.type == this.archetype);
    if (shopObj) {
      const newCount = getRandomInt(
        shopObj.itemQuantityRange.minimum,
        shopObj.itemQuantityRange.maximum,
      );
      this.inventory = generateInventory(newCount, shopObj.trades, playerClass);
      this.lastStockRefresh = new Date().toISOString();
      this.currentGold = this.baseGold;
    } else {
      throw new Error("Shop not found on refreshInventory()");
    }
  }

  private changeAffection(change: number) {
    this.shopKeeper.affection += Math.floor(change * 4) / 4;
  }

  public buyItem(item: Item, buyPrice: number) {
    if (Math.floor(buyPrice) <= this.currentGold) {
      this.inventory.push(item);
      this.currentGold -= Math.floor(buyPrice);
      this.changeAffection(buyPrice / 1000);
    }
  }

  public sellItem(item: Item, sellPrice: number) {
    const idx = this.inventory.findIndex((invItem) => invItem.equals(item));
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
      this.currentGold += Math.floor(sellPrice);
      this.changeAffection(sellPrice / 1000);
    }
  }

  static fromJSON(json: any): Shop {
    return new Shop({
      shopKeeper: Character.fromJSON(json.shopKeeper),
      baseGold: json.baseGold,
      currentGold: json.currentGold,
      lastStockRefresh: new Date(json.lastStockRefresh),
      inventory: json.inventory.map((item: any) => Item.fromJSON(item)),
      archetype: json.archetype,
    });
  }
}

//----------------------associated functions----------------------//
function getAnItemByType(
  type: ItemClassType,
  playerClass: "mage" | "paladin" | "necromancer",
): Item {
  if (type == "artifact") {
    const idx = getRandomInt(0, artifacts.length - 1);
    const itemObj = artifacts[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: null,
      stats: null,
      itemClass: type,
      stackable: isStackable(type),
      icon: itemObj.icon,
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
      stackable: isStackable(type),
      icon: itemObj.icon,
    });
  }
  if (type == "book") {
    let books;
    if (playerClass == "paladin") {
      books = paladinBooks;
    } else if (playerClass == "necromancer") {
      books = necroBooks;
    } else {
      books = mageBooks;
    }
    const idx = getRandomInt(0, books.length - 1);
    const itemObj = books[idx];
    return new Item({
      name: itemObj.name,
      baseValue: itemObj.baseValue,
      slot: null,
      stats: null,
      itemClass: type,
      stackable: isStackable(type),
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
      stackable: isStackable(type),
      icon: itemObj.icon,
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
      stackable: isStackable(type),
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
      stackable: isStackable(type),
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
      stackable: isStackable(type),
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
      stackable: isStackable(type),
      icon: itemObj.icon,
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
      stackable: isStackable(type),
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
      stackable: isStackable(type),
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
      stackable: isStackable(type),
      icon: itemObj.icon,
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
      stackable: isStackable(type),
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
      stackable: isStackable(type),
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
      stackable: isStackable(type),
      icon: itemObj.icon,
    });
  } else {
    throw new Error(`Invalid type passed to getAnItemByType(), ${type}`);
  }
}

export function generateInventory(
  inventoryCount: number,
  trades: string[],
  playerClass: "mage" | "necromancer" | "paladin",
) {
  let items: Item[] = [];
  for (let i = 0; i < inventoryCount; i++) {
    const type = trades[
      Math.floor(Math.random() * trades.length)
    ] as ItemClassType;
    items.push(getAnItemByType(type, playerClass));
  }
  return items;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createShops(playerClass: "mage" | "paladin" | "necromancer") {
  let createdShops: Shop[] = [];
  shops.forEach((shop) => {
    //want to favor likelihood of male shopkeepers slightly
    const itemCount = getRandomInt(
      shop.itemQuantityRange.minimum,
      shop.itemQuantityRange.maximum,
    );
    const newShop = new Shop({
      shopKeeper: generateShopKeeper(shop.type),
      baseGold: shop.baseGold,
      lastStockRefresh: new Date(),
      archetype: shop.type,
      inventory: generateInventory(itemCount, shop.trades, playerClass),
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
    deathdate: null,
    job: job,
  });
  return newChar;
}
